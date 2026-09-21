# Security Audit Report

## 🚨 CRITICAL: Hardcoded API Key
**Location:** `firebase-applet-config.json` (Line 4)
**Description:** A hardcoded Firebase API Key (`AIzaSyD...`) was found in the configuration file. Hardcoding secrets in source code or static configuration files exposes them to anyone with access to the repository, potentially leading to unauthorized access to the Firebase project and associated resources.
**Impact:** Unauthorized access to the Firebase project, potential data breaches, unauthorized data manipulation, and quota exhaustion leading to denial of service or unexpected billing charges.

**Remediation:**
Store sensitive keys in environment variables and inject them at build or runtime.

**Recommended Fix (Example):**
Remove the hardcoded key from `firebase-applet-config.json`:
```json
{
  "projectId": "gen-lang-client-0085912328",
  "appId": "1:910198173440:web:30ed7190c3423b87988de5",
  "apiKey": "",
  "authDomain": "gen-lang-client-0085912328.firebaseapp.com",
  ...
}
```
Ensure the application securely reads the key from the environment, as already demonstrated in `firebase.ts`:
```typescript
// ✅ GOOD: Reading from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  // ...
};
```

---

## ⚠️ HIGH: Permissive CORS Configuration
**Location:** `server.ts` (Lines 195-207)
**Description:** The CORS configuration for the Express server includes a permissive fallback (`callback(null, true)`) for any origin not explicitly allowed in the `explicitAllowedOrigins` set or matching specific domain patterns. This effectively negates the restrictions intended by the explicit list, allowing any website to make cross-origin requests to the API.
**Impact:** Cross-Origin Resource Sharing (CORS) is a security mechanism that prevents malicious websites from making requests to an API on behalf of a user. A permissive CORS policy can lead to Cross-Site Request Forgery (CSRF) or unauthorized data access if session cookies or credentials are automatically included in requests from arbitrary domains.

**Remediation:**
Remove the permissive fallback and strictly enforce the allowed origins. If dynamic origins need to be supported (e.g., for specific MCP clients), they should be validated against a strict, predefined pattern or list, rather than allowing everything by default.

**Recommended Fix (Example):**
Update the CORS configuration in `server.ts` to reject unauthorized origins:
```typescript
  app.use(cors({
    origin: (origin, callback) => {
      // ✅ GOOD: Strict origin validation
      if (!origin ||
          explicitAllowedOrigins.has(origin) ||
          origin.endsWith('.run.app') ||
          origin.includes('ai.studio') ||
          origin.endsWith('.claude.ai') ||
          origin.endsWith('.anthropic.com') ||
          origin.endsWith('.cursor.com') ||
          origin.endsWith('.google.com') ||
          origin.endsWith('.googleusercontent.com') ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        // ❌ BAD: Permissive fallback was here
        // callback(null, true);

        // ✅ GOOD: Reject unauthorized origins
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
```