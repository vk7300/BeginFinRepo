# BeginFin Security Audit Report

## 🚨 CRITICAL VULNERABILITIES

### 1. Hardcoded API Keys
**File:** `firebase.ts` (Line 12) & `firebase-applet-config.json` (Line 4)
**Vulnerability:** Hardcoded API Keys
**Description:** The Firebase API key (`AIzaSyD3y-RoyekI6NJx7ztI0v5tFNN5sRl196o`) is hardcoded directly into the application source code and configuration files. Exposing API keys in version control can lead to unauthorized access to the Firebase project, potential data breaches, or resource abuse.
**Impact:** Attackers could extract the API key and interact directly with the Firebase backend, potentially bypassing client-side controls.
**Recommended Fix:**
Remove the hardcoded API key from the source code and configuration files. Rely exclusively on environment variables for sensitive configuration.

```typescript
// ✅ GOOD: Use environment variables, do not fallback to hardcoded secrets
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // No hardcoded fallback
  // ...
};
```

## ⚠️ HIGH VULNERABILITIES

### 2. Authorization Bypass in Certificate Issuance
**File:** `server.ts` (Lines 720-722)
**Vulnerability:** Authorization Bypass / Insecure Direct Object Reference (IDOR) equivalent
**Description:** In the `/api/issue-certificate` endpoint, if the server-side database lookup for `completedModules` fails or returns an empty array, the application blindly trusts the `completedModules` array provided by the client in the request body. This allows any authenticated user to intercept the request, inject the required `completedModules` list, and bypass the actual completion requirements to falsely issue a certificate.
**Impact:** A malicious user could fraudulently issue themselves a "Certificate of Financial Literacy Completion" without completing any coursework.
**Recommended Fix:**
Never trust client-supplied state for authorization decisions. The server must be the source of truth for course completion.

```typescript
// ✅ GOOD: Fail securely if server-side data cannot be verified
if (completedModules.length === 0) {
  // Do NOT fallback to req.body.completedModules
  return res.status(403).json({
    error: "Course completion data could not be verified on the server."
  });
}
```

### 3. Overly Permissive CORS Configuration
**File:** `server.ts` (Lines 197-210)
**Vulnerability:** Insecure CORS Configuration
**Description:** The CORS configuration uses a permissive fallback that dynamically mirrors any requesting origin (via `callback(null, true)`) while simultaneously allowing credentials (`credentials: true`). This effectively neutralizes the Same-Origin Policy, allowing any malicious website visited by an authenticated user to make cross-origin requests and perform actions on their behalf.
**Impact:** This is a severe Cross-Site Request Forgery (CSRF) risk, as any external domain can access sensitive endpoints while passing the user's cookies/credentials.
**Recommended Fix:**
Enforce strict origin validation. Only allow requests from explicitly trusted domains, especially when `credentials: true` is enabled.

```typescript
// ✅ GOOD: Strict origin validation
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || explicitAllowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS')); // Deny unknown origins
    }
  },
  credentials: true
}));
```
