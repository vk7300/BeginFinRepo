# Security Audit Report

## CRITICAL Findings

### 1. Hardcoded API Key

**Severity:** CRITICAL
**File:** `firebase-applet-config.json`
**Location:** Line 4

**Description:**
A hardcoded Firebase API Key (`apiKey`) is present in the `firebase-applet-config.json` file. Committing secrets directly into the codebase exposes them to unauthorized access, potentially leading to unauthorized operations against the Firebase project.

**Remediation:**
Remove the hardcoded API key from the configuration file and load it dynamically using environment variables.

**Recommended Safe Code Snippet:**
```json
{
  "projectId": "gen-lang-client-0085912328",
  "appId": "1:910198173440:web:30ed7190c3423b87988de5",
  "apiKey": "REMOVED_FOR_SECURITY",
  "authDomain": "gen-lang-client-0085912328.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-815a8484-ccb3-4aa6-90b6-77fad11b53ba",
  "storageBucket": "gen-lang-client-0085912328.firebasestorage.app",
  "messagingSenderId": "910198173440",
  "measurementId": "",
  "recaptchaSiteKey": ""
}
```

```typescript
// Example of loading from environment variables (e.g., in firebase.ts)
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
```

---

### 2. Authorization Bypass in Certificate Issuance

**Severity:** CRITICAL
**File:** `server.ts`
**Location:** Lines 720-721

**Description:**
The `/api/issue-certificate` endpoint contains an insecure graceful fallback mechanism. If the server fails to query a user's profile or if the `completedModules` array is empty, it blindly trusts and uses the `completedModules` array provided by the client in `req.body.completedModules`. This allows a malicious user to forge a request containing an array of all required modules, bypassing the server-side verification of course completion and inappropriately receiving a valid certificate.

**Remediation:**
Remove the fallback logic that relies on client-provided data for authorization. The server must be the single source of truth for course completion status. If the server cannot verify the completion status, the request should be denied.

**Recommended Safe Code Snippet:**
```typescript
// Replace lines 720-722 with strict server-side validation
if (completedModules.length === 0) {
    // If the server cannot verify completion, deny the request.
    // Do NOT fallback to req.body.completedModules
    return res.status(403).json({
        error: "Server could not verify course completion status. Please ensure all modules are completed."
    });
}

// Proceed with verification using the server-retrieved completedModules array
```

---

## HIGH Findings

### 3. Overly Permissive CORS Configuration

**Severity:** HIGH
**File:** `server.ts`
**Location:** Lines 220-221, 224

**Description:**
The Express application configures CORS using a custom `origin` function. While it checks against a list of allowed origins, it includes a "permissive fallback" (`callback(null, true);`) that essentially allows any origin to connect. This is combined with `credentials: true` (Line 224). Allowing `credentials: true` with a wildcard or dynamically echoing any requested origin is highly insecure, as it permits cross-origin requests to include sensitive credentials (like cookies or authorization headers) from any site, enabling Cross-Site Request Forgery (CSRF) and data theft.

**Remediation:**
Remove the permissive fallback. Ensure that the CORS `origin` function strictly validates against a known list of trusted domains. If the origin is not in the trusted list, the request should be rejected.

**Recommended Safe Code Snippet:**
```typescript
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (explicitAllowedOrigins.has(origin) ||
        origin.endsWith('.run.app') ||
        origin.includes('ai.studio') ||
        origin.endsWith('.claude.ai') ||
        origin.endsWith('.anthropic.com') ||
        origin.endsWith('.cursor.com') ||
        origin.endsWith('.google.com') ||
        origin.endsWith('.googleusercontent.com') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // STRICT FAILURE: Do not allow unknown origins
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
```
