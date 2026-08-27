const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  '// Ensure the module does not have a quiz before allowing direct completion',
  `const userDoc = await adminDb.collection('users').doc(uid).get();\n      const userData = userDoc.data();\n      if (userData?.completedModules?.includes(moduleId)) {\n        return res.json({ success: true, message: "Already completed." });\n      }\n\n      // Ensure the module does not have a quiz before allowing direct completion`
);
fs.writeFileSync('server.ts', code);
