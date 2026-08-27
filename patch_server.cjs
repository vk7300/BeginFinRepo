const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Move limiter up before the routes.
const limiterDef = `
  // Rate limiting: 100 requests per 15 minutes per IP
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
  });

  // Apply rate limiter to all API routes and ensure no caching occurs on dynamic API requests
  app.use("/api", limiter, (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    next();
  });
`;

// Remove it from the bottom
code = code.replace(/\n\s*\/\/ Rate limiting: 100 requests per 15 minutes per IP[\s\S]*?next\(\);\n  }\);\n/, '');

// Insert it above the first endpoint
code = code.replace('  // API endpoint to get questions without correctIndex', limiterDef + '\n  // API endpoint to get questions without correctIndex');

// 2. Fix grade-quiz
code = code.replace(
  /results\[doc\.id\] = \{\n\s*correct: isCorrect,\n\s*correctIndex: qData\.correctIndex\n\s*\};\n/g,
  'results[doc.id] = { correct: isCorrect };\n'
);

code = code.replace(
  /if \(passed\) \{\n\s*\/\/ Automatically add to completedModules\n\s*await adminDb\.collection\('users'\)\.doc\(uid\)\.update\(\{\n\s*completedModules: FieldValue\.arrayUnion\(moduleId\)\n\s*\}\);\n\s*\}/g,
  `if (passed) {
        // Automatically add to completedModules
        await adminDb.collection('users').doc(uid).update({
          completedModules: FieldValue.arrayUnion(moduleId)
        });
      }` // It actually doesn't add correctIndex anymore.
);

// 3. Add issue-certificate endpoint
const issueCertificateEndpoint = `
  // API endpoint to issue a certificate securely
  app.post("/api/issue-certificate", requireAuth, async (req, res) => {
    try {
      const { graduateName } = req.body;
      const uid = (req as any).user.uid;
      
      const userDoc = await adminDb.collection('users').doc(uid).get();
      const userData = userDoc.data();
      
      if (!userData || !userData.completedModules || userData.completedModules.length < 8) {
        return res.status(403).json({ error: "All 8 modules must be completed to earn a certificate." });
      }
      
      const now = new Date();
      const issueDate = now.toISOString().substring(0, 10);
      const expDate = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate()).toISOString().substring(0, 10);
      const finalName = (graduateName || "BeginFin Student").substring(0, 80);

      // Save user's name if they typed one
      if (graduateName) {
        await adminDb.collection('users').doc(uid).set({
          displayName: finalName,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }

      const credRef = adminDb.collection('credentials').doc(uid);
      const credentialData = {
        title: "Certificate of Financial Literacy Completion",
        serialNumber: \`BF-\${uid.substring(0, 8).toUpperCase()}\`,
        graduateName: finalName,
        issueDate,
        expirationDate: expDate,
        userId: uid,
        modulesCompleted: userData.completedModules.length,
        issuedAt: new Date().toISOString()
      };

      await credRef.set(credentialData);
      
      return res.json({ success: true, credential: credentialData });
    } catch (error) {
      console.error("Error issuing certificate:", error);
      return res.status(500).json({ error: "Failed to issue certificate" });
    }
  });
`;

code = code.replace('  // API endpoint to join a class', issueCertificateEndpoint + '\n  // API endpoint to join a class');

fs.writeFileSync('server.ts', code);
