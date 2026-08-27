const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

// For users
rules = rules.replace(
  /allow read: if isOwner\(userId\) \|\| isAdmin\(\) \|\| \(isAuthenticated\(\) && resource\.data\.teacherId == request\.auth\.uid\);/g,
  `allow get: if isOwner(userId) || isAdmin() || (isAuthenticated() && resource.data.teacherId == request.auth.uid);
      allow list: if isOwner(userId) || isAdmin();
      allow list: if isAuthenticated() && resource.data.teacherId == request.auth.uid;`
);

// For classes
rules = rules.replace(
  /allow get: if isAuthenticated\(\) && \(resource\.data\.teacherId == request\.auth\.uid \|\| \('studentIds' in resource\.data && request\.auth\.uid in resource\.data\.studentIds\)\);\n\s*allow list: if isAuthenticated\(\) && \(resource\.data\.teacherId == request\.auth\.uid \|\| \('studentIds' in resource\.data && request\.auth\.uid in resource\.data\.studentIds\)\);/g,
  `allow get: if isAuthenticated() && (resource.data.teacherId == request.auth.uid || ('studentIds' in resource.data && request.auth.uid in resource.data.studentIds));
      allow list: if isAuthenticated() && resource.data.teacherId == request.auth.uid;
      allow list: if isAuthenticated() && 'studentIds' in resource.data && request.auth.uid in resource.data.studentIds;`
);

fs.writeFileSync('firestore.rules', rules);
