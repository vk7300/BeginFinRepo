const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  "allow read: if isOwner(userId) || isAdmin() || (isAuthenticated() && resource.data.get('teacherId', '') == request.auth.uid);",
  "allow read: if isOwner(userId) || isAdmin() || (isAuthenticated() && resource.data.teacherId == request.auth.uid);"
);

rules = rules.replace(
  "allow list: if isAuthenticated() && (resource.data.teacherId == request.auth.uid || (resource.data.studentIds is list && request.auth.uid in resource.data.studentIds));",
  "allow list: if isAuthenticated() && (resource.data.teacherId == request.auth.uid || request.auth.uid in resource.data.studentIds);"
);

rules = rules.replace(
  "allow get: if isAuthenticated() && (resource.data.teacherId == request.auth.uid || (resource.data.studentIds is list && request.auth.uid in resource.data.studentIds));",
  "allow get: if isAuthenticated() && (resource.data.teacherId == request.auth.uid || request.auth.uid in resource.data.studentIds);"
);

fs.writeFileSync('firestore.rules', rules);
