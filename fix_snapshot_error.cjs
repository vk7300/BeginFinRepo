const fs = require('fs');
let code = fs.readFileSync('components/TeacherDashboard.tsx', 'utf8');

const regex = /return onSnapshot\(q, \(snapshot\) => \{\s*const classAlerts = snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \} as AlertData\)\);\s*setAlerts\(prev => \(\{ \.\.\.prev, \[cls\.id\]: classAlerts \}\)\);\s*\}\);/;

const replacement = `return onSnapshot(q, (snapshot) => {
        const classAlerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlertData));
        setAlerts(prev => ({ ...prev, [cls.id]: classAlerts }));
      }, (err) => {
        // Ignore permission-denied errors that occur when a class is deleted while the listener is still active
        if (!err.message.includes('insufficient permissions')) {
          console.error('TeacherDashboard Alerts Snapshot Error:', err);
        }
      });`;

code = code.replace(regex, replacement);
fs.writeFileSync('components/TeacherDashboard.tsx', code);
