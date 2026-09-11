## 2024-03-24 - Rate Limiter IP Spoofing via trust proxy
**Vulnerability:** The application trusts the proxy (`app.set('trust proxy', 1)`) while simultaneously using `req.ip` as a rate limiting key to prevent brute-force attacks on the quiz grading endpoint. The developer left a comment stating this prevents evasion, but it actually enables it if the proxy is not strictly defined, as attackers can forge the `X-Forwarded-For` header.
  **Learning:** Relying on `req.ip` when `trust proxy` is loosely set allows attackers to spoof their IP address and bypass IP-based rate limiting entirely.
**Detection:** Look for `app.set('trust proxy', 1)` or similar loose proxy trust settings combined with the use of `req.ip` for security controls like rate limiting or brute-force prevention.
