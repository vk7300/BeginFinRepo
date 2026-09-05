# Sentinel Codebase Learnings

- Firestore Rules: The `firestore.rules` file contains a strong default-deny baseline. It checks for specific fields, handles `isAdmin` logic using both token claims and hardcoded emails (e.g. `vishnukakarla108@gmail.com`).
- Admin Hardcoded emails in rules: `vishnukakarla108@gmail.com`, `kv303157@gmail.com`, `kruzksmith@gmail.com`.
- Rate Limiting: Built-in `express-rate-limit` in `server.ts` handles 100 requests / 15 mins for standard `/api` routes (except MCP endpoints which are skipped). Also, custom daily rate-limiting (5 messages) is implemented via firestore counter for Bradley AI chat `MAX_DAILY_MESSAGES`.
- MCP Endpoints are intentionally exempted from the Express rate limiter in `server.ts`, which might lead to unauthenticated heavy requests to LLM APIs if abused.
- In-memory rate limiting is implemented for quiz grading (`quizGradingAttempts`), protecting against answer-key brute-forcing.
- API Keys: `GEMINI_API_KEY` is referenced from `process.env`. There are no hardcoded API keys detected in the repo that are active.
- Bradley AI uses `MAX_DAILY_MESSAGES` to limit interactions per authenticated user, preventing excessive API usage.
