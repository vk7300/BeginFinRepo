# Sentinel Security Audit Report

## Executive Summary
A comprehensive security audit of the BeginFin codebase was conducted to identify critical and high-priority vulnerabilities.
The audit revealed several issues including a hardcoded API key, potential unauthorized file uploads, and missing authentication and authorization on specific API endpoints.
Please note that in accordance with the rules of engagement, **this report details the findings and provides remediation advice without modifying the application source code**.

---

## Findings

### 1. 🚨 CRITICAL: Hardcoded Firebase API Key
**Location:** `firebase-applet-config.json` (Line 4)
**Description:** The Firebase configuration file contains a hardcoded API key. Exposing API keys in source control can lead to unauthorized access to the Firebase project, potentially resulting in data breaches, quota exhaustion, and financial loss.
**Impact:** Attackers can extract this key and misuse it to interact with the Firebase project directly, bypassing the application's intended logic.
**Recommended Fix:** Remove the hardcoded key from the JSON file and load it from environment variables instead.
```json
// ❌ BAD: Hardcoded secret in firebase-applet-config.json
{
  "apiKey": "AIzaSy..."
}

// ✅ GOOD: Load from environment variable in initialization code
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY
};
```

### 2. ⚠️ HIGH: Missing Authentication on MCP Execute Endpoint
**Location:** `server.ts` (Line 431)
**Description:** The `POST /api/mcp/execute` and `/api/bradley/execute` endpoints do not verify any authentication tokens before executing tools via the `executeMcpTool` function.
**Impact:** Any user or bot can execute these MCP tools, potentially leading to abuse of underlying services (e.g. AI models), denial of service through rapid enumeration, or exposing internal logic/data that is otherwise restricted.
**Recommended Fix:** Implement the `verifyIdToken` logic (similar to other authenticated endpoints) or use an authentication middleware before processing the request.
```typescript
// ✅ GOOD: Add authentication check before execution
app.post(['/api/mcp/execute', '/api/bradley/execute'], async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const idToken = authHeader.split("Bearer ")[1]?.trim();
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Process request...
```

### 3. ⚠️ HIGH: Missing Authentication on Public Endpoints
**Location:** `server.ts`
- `GET /api/status` (Line 1156)
- `GET /api/questions/:moduleId` (Line 483)
**Description:** These endpoints expose system status data and custom questions without requiring an authentication token.
**Impact:** While some data may be intended to be public, exposing internal custom questions or detailed system status information can provide attackers with reconnaissance data or access to proprietary educational materials.
**Recommended Fix:** Evaluate whether these endpoints should be entirely public. If they contain sensitive data (like custom questions from `adminDb`), add an authentication check. For system status, consider returning less detailed information for unauthenticated users, or protect the endpoint entirely.

### 4. 🔒 MEDIUM: Potential Incomplete File Type Validation
**Location:** `server.ts` (Line 247 - `/api/upload-photo`)
**Description:** The photo upload endpoint relies on checking the `dataUrl` prefix with a regular expression and validating magic bytes (`0xFF 0xD8 0xFF` for JPEG, `0x89 0x50 0x4E 0x47` for PNG). However, these checks might still allow a maliciously crafted file to bypass validation if it has the correct magic bytes prepended to malicious payloads (e.g., polyglots).
**Impact:** Could allow uploading files that browsers or other services misinterpret as executable scripts or other harmful formats. However, the strict filename whitelisting (`ALLOWED_TARGET_NAMES`) mitigates this risk significantly by preventing arbitrary file creation.
**Recommended Fix:** In addition to magic byte checks, process the image buffer using a robust image manipulation library (like `sharp`) to re-encode the image. This strips out any potentially malicious metadata or polyglot payloads.
```typescript
// ✅ GOOD: Re-encode image to strip malicious payloads
import sharp from 'sharp';

// Inside the upload handler, after magic byte checks:
let safeBuffer;
if (isJpeg) {
  safeBuffer = await sharp(buffer).jpeg().toBuffer();
} else if (isPng) {
  safeBuffer = await sharp(buffer).png().toBuffer();
}
// Then write safeBuffer to disk
```

---
**Note:** This PR contains an audit report only. No application code has been modified.
