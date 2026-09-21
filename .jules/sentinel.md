## 2024-05-24 - Permissive CORS Policy for MCP Support
**Vulnerability:** Overly permissive CORS configuration in `server.ts` that includes a permissive fallback (`callback(null, true)`) allowing all external origins.
  **Learning:** This existed because the application architecture integrates with the Model Context Protocol (MCP), requiring broad access for various remote AI connectors and playgrounds that may not have predictable origins. This is a surprising security gap where intended functionality (universal MCP access) weakens standard API security boundaries.
**Detection:** Look for `Access-Control-Allow-Origin: *` or wildcard fallbacks in CORS middleware configurations, especially near paths related to third-party integrations or AI protocols (e.g., `/mcp`, `/api/mcp`).
