const fs = require('fs');
let code = fs.readFileSync('components/CertificateView.tsx', 'utf8');

const apiCallSrc = `
      try {
        const idToken = await (window as any).firebaseAuthTokenPromise();
        await fetch('/api/issue-certificate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${idToken}\`
          },
          body: JSON.stringify({ graduateName: userName, isPublic: isPublicVerification })
        });
      } catch (err) {
        console.error("Failed to sync credential", err);
      }
`;

// Replace the syncCredential logic
code = code.replace(/const credRef = doc\(db, 'credentials', userId\);\n\s*await setDoc\(credRef, \{[\s\S]*?\}, \{ merge: true \}\);/g, apiCallSrc);

fs.writeFileSync('components/CertificateView.tsx', code);
