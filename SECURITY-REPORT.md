# 🛡️ Sentinel Security Audit Report

This report documents security vulnerabilities identified during the codebase audit. **No application source code has been modified.**

---

## 🚨 CRITICAL: Hardcoded API Keys and Secrets

**File(s):**
- `firebase-applet-config.json` (lines 2-6)
- `server.ts` (lines 33, 37)

**Description:**
The codebase contains hardcoded, unencrypted secrets and API keys used for integrating with Firebase. These credentials are fully exposed in version control, making them accessible to any unauthorized individuals with repository access. This allows potential attackers to read from or write to the database and misuse the associated project quota.

**Impact:**
Full unauthorized access to the application's Firebase project, database, and potential exposure of user data or financial liability.

**Recommended Fix:**
Move all sensitive configuration details into environment variables (e.g., using `import.meta.env` or `process.env`). Create a `.env.example` to document required keys without checking in the actual secrets.

```typescript
// ✅ SAFE FIX: Read from environment variables
const adminApp = getApps().length === 0
  ? initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    })
  : getApps()[0];
```

---

## ⚠️ HIGH: Overly Permissive CORS Configuration

**File:** `server.ts` (lines 142-162)

**Description:**
The Express server sets up CORS with an explicit list of allowed origins. However, the `else` block of the `origin` handler invokes `callback(null, true)` as a fallback. Combined with `credentials: true`, this misconfiguration creates a wildcard-like behavior that allows cross-origin requests from *any* domain to carry session cookies and authentication headers.

**Impact:**
Attackers can host malicious websites that silently make authenticated requests to the API on behalf of visiting users, leading to severe Cross-Site Request Forgery (CSRF) or data exfiltration.

**Recommended Fix:**
Strictly enforce the allowed origins list. Reject requests from unknown origins by returning an error in the callback.

```typescript
// ✅ SAFE FIX: Reject unknown origins
origin: (origin, callback) => {
  if (!origin || allowedOriginsSet.has(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

---

## ⚠️ HIGH: Hardcoded Administrator Privileges

**File:** `server.ts` (lines 62-71)

**Description:**
Administrator email addresses are hardcoded directly into the application's source code in the `ADMIN_EMAILS` array.

**Impact:**
Any repository viewer can identify the application's top-level administrators, making them high-value targets for social engineering, phishing, or targeted credential stuffing attacks. Furthermore, changing administrator access requires a codebase redeployment.

**Recommended Fix:**
Manage administrator authorization via the database (e.g., a `role: 'admin'` field on the user record in Firestore) or exclusively through a comma-separated environment variable (which is partially implemented but overshadowed by the hardcoded array).

```typescript
// ✅ SAFE FIX: Rely on token claims or database lookups
let isAdmin = decodedToken.admin === true || decodedToken.role === 'admin';
```

---

## 🔒 MEDIUM: Missing Rate Limiting on Sensitive Endpoint

**File:** `server.ts` (lines 191 and 238)

**Description:**
The application uses `express-rate-limit` to protect `/api` routes (line 238). However, the `/api/upload-photo` POST route (line 191) is defined *before* the rate limiter middleware is applied to the `/api` path. In Express, middleware executes sequentially, meaning the photo upload endpoint completely bypasses the rate limiter.

**Impact:**
An attacker could repeatedly call the `/api/upload-photo` endpoint in a short period, potentially exhausting server resources, bandwidth, or disk space (Denial of Service).

**Recommended Fix:**
Move the rate limiter definition and application (`app.use("/api", limiter, ...);`) to precede all `/api/...` route handlers, or apply the limiter explicitly to individual high-risk routes.

```typescript
// ✅ SAFE FIX: Apply rate limiting explicitly
app.post('/api/upload-photo', limiter, async (req, res) => {
  // ...
});
```
