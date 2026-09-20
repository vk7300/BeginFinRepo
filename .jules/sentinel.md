## Sentinel's Journal

CRITICAL LEARNINGS ONLY.

## 2024-05-18 - Missing Authentication in System Status Endpoint and MCP
**Vulnerability:** The GET endpoint `/api/status` does not require authentication and leaks system operational status. The POST `/api/mcp/execute` endpoint executes arbitrary tools without authentication.
  **Learning:** All endpoints that expose internal state or perform actions need to be correctly authorized based on their intended audience.
**Detection:** Searching for unauthenticated `app.get` and `app.post` handlers.
