const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  /allow get: if isAuthenticated\(\) && \(resource\.data\.teacherId == request\.auth\.uid \|\| \('studentIds' in resource\.data && request\.auth\.uid in resource\.data\.studentIds\)\);/g,
  "allow get: if isAuthenticated() && (resource.data.teacherId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.classId == classId);"
);

rules = rules.replace(
  /allow list: if isAuthenticated\(\) && 'studentIds' in resource\.data && request\.auth\.uid in resource\.data\.studentIds;/g,
  ""
);

fs.writeFileSync('firestore.rules', rules);
