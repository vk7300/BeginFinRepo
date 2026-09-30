# Security Audit Report

## 🚨 CRITICAL: File Overwrite Vulnerability in `/api/upload-photo`

**Location:** `server.ts` (Lines 248-306)

**Description:**
The `/api/upload-photo` endpoint strictly requires admin authorization and validates the file is an image using magic bytes. However, it specifically *allows* overwriting static application assets via a whitelist:

```typescript
const ALLOWED_TARGET_NAMES = new Set(['0S1A6490.jpg', 'vishnuandkruz.png', 'vishnuandkruz2.jpg', 'vishnuandkruz3.jpg', 'founders.jpg']);
```

While it only allows specific filenames, this endpoint allows authenticated admins to overwrite existing critical application images in the `public` and `dist` directories with arbitrary image data.

**Impact:**
A compromised admin account or a malicious administrator could replace legitimate founder photos or core assets with inappropriate content. While restricted to specific filenames, allowing unrestricted content replacement of static assets via a runtime API is a significant security and integrity risk.

**Recommended Fix:**
Asset modification should be handled via the CI/CD pipeline and code repository, not a runtime API. If runtime image uploads are necessary, store them in a dedicated upload directory (or cloud storage like Firebase Storage) and do not allow overwriting static application files.

## 🚨 CRITICAL: Hardcoded API Keys and Secrets

**Location:** `firebase.ts` (Lines 10-16) and `firebase-applet-config.json`

**Description:**
The Firebase API Key (`AIzaSyD...`) and other Firebase configuration details (Project ID, App ID, etc.) are hardcoded directly in `firebase.ts` as fallback values and in `firebase-applet-config.json`. These files are committed to the repository, meaning the keys are exposed to anyone with access to the source code.

**Impact:**
While Firebase API keys for web clients are generally meant to be public to interact with Firebase services, hardcoding them in source code is a bad practice. If the database rules (`firestore.rules`) are misconfigured, attackers could use these exposed keys to bypass frontend restrictions and read/write sensitive student data directly.

**Recommended Fix:**
Remove all hardcoded keys from the source code and configuration files. Rely strictly on environment variables (`.env`).

```typescript
// ✅ GOOD: Rely solely on environment variables
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
};
```

## ⚠️ HIGH: Rate Limiter Bypass via `X-Forwarded-For` Spoofing

**Location:** `server.ts` (Lines 590-599, 124, 307-314)

**Description:**
The application uses `express-rate-limit` and custom rate-limiting logic (e.g., in `/api/grade-quiz`). The guest rate limit key generation relies on `req.ip`. Because the application is configured with `app.set('trust proxy', 1)`, Express trusts the `X-Forwarded-For` header to determine `req.ip`.

**Impact:**
If the application is not deployed behind a proxy that explicitly overwrites or strips client-provided `X-Forwarded-For` headers, an attacker can trivially spoof this header. This allows them to change their apparent IP address on every request, completely bypassing the rate limits. For the quiz endpoint, this means an attacker could brute-force answers or cause memory exhaustion by filling the `quizGradingAttempts` map with fake IP entries.

**Recommended Fix:**
Ensure that `trust proxy` is only enabled if the application is strictly behind a trusted reverse proxy that securely sets the `X-Forwarded-For` header. If deployed in an environment where client headers aren't sanitized, reconsider the proxy trust setting or use a more robust identification method that doesn't rely solely on headers for unauthenticated users.

## ⚠️ HIGH: Missing Input Sanitization in `/api/status/update` (XSS Risk)

**Location:** `server.ts` (Lines 1209-1237)

**Description:**
The `/api/status/update` endpoint allows administrators to update the system status. While it verifies admin authorization, it does not sanitize the `customMessage`, `customMessageTitle`, or `services` inputs before saving them to the database. These values are likely rendered directly on the frontend for all users viewing the status.

**Impact:**
If an administrator's account is compromised, or if a malicious admin decides to act, they could inject arbitrary HTML/JavaScript into the status message. When users visit the status page, the malicious script would execute in their browser (Stored Cross-Site Scripting - XSS), potentially leading to session hijacking or defacement.

**Recommended Fix:**
Sanitize all text inputs in the status update payload before saving them to the database, using the existing `sanitizeText` function.

```typescript
// ✅ GOOD: Sanitize inputs before saving
if (typeof customMessage === 'string') updatePayload.customMessage = sanitizeText(customMessage.trim(), 500);
if (typeof customMessageTitle === 'string') updatePayload.customMessageTitle = sanitizeText(customMessageTitle.trim(), 100);
```

## 🔒 MEDIUM: Overly Permissive CORS Configuration

**Location:** `server.ts` (Lines 205-225)

**Description:**
The CORS configuration contains a highly permissive fallback within its origin check logic:

```typescript
    origin: (origin, callback) => {
      if (!origin || /*... whitelist ...*/) {
        callback(null, true);
      } else {
        // Permissive fallback so external MCP connectors are never dropped
        callback(null, true);
      }
    },
    credentials: true
```

**Impact:**
Because the `else` block also calls `callback(null, true)` and `credentials: true` is set, any origin is allowed to make requests with credentials. This entirely defeats the purpose of CORS and makes the application vulnerable to cross-origin attacks where a malicious site could make authenticated requests to this server on behalf of a user. Note: Some browsers may reject `Access-Control-Allow-Origin: *` when `credentials: true` is used, but dynamically reflecting the origin (which this code effectively does) bypasses that protection.

**Recommended Fix:**
Do not dynamically accept all origins when credentials are allowed. Strictly enforce the whitelist. If external connectors are needed, their origins must be explicitly allowed or a separate, non-credentialed endpoint should be used for them.

```typescript
// ✅ GOOD: Enforce whitelist
      if (!origin || explicitAllowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
```
