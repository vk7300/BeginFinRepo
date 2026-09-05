# BeginFin Phase One Audit Report

Here is a comprehensive breakdown of the platform's current state, calibrated for a solo student developer with zero budget. The findings are categorized and ranked by severity within each section.

## Security

1. **Unrestricted MCP and GenAI Endpoint Rate Limits**
   - **What's wrong:** The MCP endpoints (`/mcp`, `/teacher/mcp`, `/bradley`) bypass the global API rate limiter, allowing infinite unauthenticated requests.
   - **Where:** `server.ts` (lines 173-176) — Both
   - **Why it matters:** A bot could spam these routes and rack up massive Gemini API costs or crash your server, exhausting your zero-budget resources.
   - **Severity:** Critical
   - **Effort:** Small (under an hour)

2. **Hardcoded Admin Email Addresses in Rules and Server**
   - **What's wrong:** Admin privileges are tied directly to hardcoded email addresses in both the frontend server and backend Firestore rules.
   - **Where:** `firestore.rules` (lines 44-48), `server.ts` (lines 1102-1110) — Both
   - **Why it matters:** If an email is compromised, you cannot quickly revoke access without deploying new code and database rules, delaying incident response.
   - **Severity:** Medium
   - **Effort:** Small (under an hour)

3. **Potential IP Spoofing for Quiz Grading**
   - **What's wrong:** The server trusts the `X-Forwarded-For` proxy header for guest rate-limiting without validating if the proxy itself is legitimate.
   - **Where:** `server.ts` (line 74) — Both
   - **Why it matters:** An attacker could easily spoof their IP address to bypass the rate limiter and brute-force the quiz answer keys.
   - **Severity:** Medium
   - **Effort:** Small (under an hour)

4. **Prompt Injection Risk in Bradley Chatbot**
   - **What's wrong:** Raw user input is sent directly to the Gemini API with only a basic character length check.
   - **Where:** `server.ts` (line 622-625) — Both
   - **Why it matters:** A student could trick Bradley into ignoring its instructions, causing the BeginFin AI to generate harmful advice or inappropriate content.
   - **Severity:** Medium
   - **Effort:** Medium (an afternoon)

## Data and privacy

1. **Class Student Identification Strategy (Future Concern)**
   - **What's wrong:** Class records track an array of raw student UIDs, which teachers can fetch.
   - **Where:** `firestore.rules` (lines 120, 124) — Both
   - **Why it matters:** While currently anonymous, if future features expose more data tied to these UIDs, it could allow teachers to scrape unauthorized data.
   - **Severity:** Low
   - **Effort:** Medium (an afternoon)

## Legal

1. **AP® Trademark Attribution Missing**
   - **What's wrong:** The required College Board AP® trademark attribution is missing from the curriculum screens where the content is actually displayed.
   - **Where:** `components/CurriculumView.tsx`, `components/CurriculumModal.tsx` — Both
   - **Why it matters:** You risk violating the licensing agreement with the College Board, which could result in a cease-and-desist or loss of the license.
   - **Severity:** High
   - **Effort:** Small (under an hour)

2. **Inconsistent Age Requirement Messaging on Guest Join**
   - **What's wrong:** The Guest Mode flow doesn't appear to enforce the same strict 14+ click-through agreement as the standard sign-up flow.
   - **Where:** `components/GuestJoinModal.tsx`, `App.tsx` — Both
   - **Why it matters:** If tracking/local storage fires for a student under 14, it undermines your Privacy Policy stance and creates a privacy violation.
   - **Severity:** Medium
   - **Effort:** Small (under an hour)

3. **FERPA and COPPA Informational Notice**
   - **What's wrong:** You disclaim FERPA/COPPA, but offer teacher dashboards and Google Classroom sync.
   - **Where:** `components/PrivacyPolicy.tsx` — Both
   - **Why it matters:** If public schools adopt the tool via the teacher dashboard, they may assume it is FERPA compliant, creating friction later.
   - **Severity:** Low
   - **Effort:** Large (a weekend+)

## Mobile

1. **Widespread Use of Sub-14px/16px Text**
   - **What's wrong:** The codebase relies heavily on utility classes like `text-[10px]`, `text-[11px]`, and `text-xs` (12px) for UI elements, breaking the 16px mobile/14px desktop rule.
   - **Where:** `components/WelcomeScreen.tsx`, `components/Dashboard.tsx`, `components/AustinJobSimulator.tsx` — Mobile
   - **Why it matters:** The text is physically too small to read on a mobile phone without squinting, making the app highly inaccessible.
   - **Severity:** Critical
   - **Effort:** Large (a weekend+)

2. **Dense Interactive Simulators Cramping**
   - **What's wrong:** Interactive components like the Job Simulator and Credit Score Game use complex multi-column grids that cramp vertically on 320px/375px screens.
   - **Where:** `components/AustinJobSimulator.tsx`, `components/CreditScoreGame.tsx` — Mobile
   - **Why it matters:** Students on small phones won't be able to easily interact with the core educational tools.
   - **Severity:** High
   - **Effort:** Medium (an afternoon)

3. **Hover States Masking Critical Information**
   - **What's wrong:** Critical secondary information is hidden behind `group-hover:opacity-100` utility classes.
   - **Where:** `components/Dashboard.tsx` — Mobile
   - **Why it matters:** Hover doesn't exist on touchscreens, meaning mobile users can never see this information.
   - **Severity:** High
   - **Effort:** Small (under an hour)

## Desktop and laptop

1. **Lack of Ultrawide Max-Width Constraints**
   - **What's wrong:** Certain interior blocks inside views may stretch indefinitely on 1920px+ displays because they lack a `max-w-7xl` wrapper.
   - **Where:** `components/CurriculumView.tsx`, `components/Dashboard.tsx` — Desktop
   - **Why it matters:** Text lines extending beyond 90 characters become incredibly hard to read and break the clean bento grid layout.
   - **Severity:** Medium
   - **Effort:** Small (under an hour)

## Typography and text fitting

1. **Certificate View Brand Sizing**
   - **What's wrong:** The core BeginFin branding text on the certificate is set to a tiny `text-[12px]` on mobile breakpoints.
   - **Where:** `components/CertificateView.tsx` (line 412) — Both
   - **Why it matters:** Tiny branding on an official certificate makes the document look illegitimate.
   - **Severity:** High
   - **Effort:** Small (under an hour)

## Accessibility

1. **Undersized Touch Targets**
   - **What's wrong:** Buttons and badges use very small padding (e.g. `px-2 py-0.5`), creating touch targets far below the 44x44px minimum.
   - **Where:** `components/CompletionToast.tsx`, `components/Dashboard.tsx` — Both
   - **Why it matters:** Users with motor impairments or fat thumbs will struggle to accurately tap buttons.
   - **Severity:** High
   - **Effort:** Medium (an afternoon)

## Brandbook compliance

1. **Incorrect Typography Weight Specifications**
   - **What's wrong:** The codebase frequently uses `font-black` (900) and `font-extrabold` (800), which are not listed in the Brandbook's approved Inter weights (Light, Regular, Italicized, Bold).
   - **Where:** `src/index.css`, `components/WelcomeScreen.tsx` — Both
   - **Why it matters:** It dilutes the brand identity and makes the UI feel heavier and more cluttered than intended.
   - **Severity:** Medium
   - **Effort:** Medium (an afternoon)

## UX and design

1. **Guest Join Class Trap**
   - **What's wrong:** Unauthenticated users who click "Join Class" see a modal telling them to go sign in, but there is no link or button to actually take them to the sign-in page.
   - **Where:** `components/GuestJoinModal.tsx`, `components/Dashboard.tsx` — Both
   - **Why it matters:** It creates a frustrating dead end that forces users to figure out how to navigate back manually, causing drop-offs.
   - **Severity:** High
   - **Effort:** Small (under an hour)

## Code quality

1. **Local Storage Progress Desync on Shared Devices**
   - **What's wrong:** Guest mode progress automatically merges into an account upon login without asking for confirmation.
   - **Where:** `App.tsx` (lines 170-200) — Both
   - **Why it matters:** On shared Chromebooks in a classroom, student A's guest progress could accidentally merge into student B's account when they log in, corrupting their gradebook.
   - **Severity:** High
   - **Effort:** Medium (an afternoon)

2. **Massive Monolithic Component Files**
   - **What's wrong:** Core files like `App.tsx` and `server.ts` are over 1000 lines long, handling everything at once.
   - **Where:** `App.tsx`, `server.ts` — Both
   - **Why it matters:** Huge files increase your cognitive load, make bugs harder to find, and make future feature additions painful.
   - **Severity:** Medium
   - **Effort:** Large (a weekend+)

## Unnecessary features

1. **Client-Side PDF Rendering**
   - **What's wrong:** `ClassReportPDF.tsx` uses `jspdf` and `html2canvas` to render complex reports in the browser.
   - **Where:** `components/ClassReportPDF.tsx` — Both
   - **Why it matters:** Client-side PDF generation is notoriously brittle, slow, and often breaks formatting on different devices. Since you already use `ExcelJS` for gradebooks, a simple CSV/Excel export is enough and vastly easier to maintain.
   - **Severity:** Low
   - **Effort:** Medium (an afternoon)

---

## Blind Spots
- **Firebase Auth Configuration:** Cannot inspect Firebase console for MFA or password policy enforcement.
- **Environment Variables:** Cannot inspect `.env` to verify if production keys are overly broad. Need deployment environment access.
- **Hosting and Cloud Architecture:** Cannot inspect server deployment (e.g. Cloud Run, Vercel) networking/firewall rules.
- **Google Classroom Data Scope:** Cannot verify exactly what data payload is pulled from Google Classroom APIs for teachers.
- **Real-device rendering:** Cannot verify if the iOS Safari notch/home indicator covers fixed bottom bars or interactive elements.
- **Zoom Behavior:** Cannot visually inspect if zooming to 200% on desktop causes layout breakage in the dense simulators.

## Future Risks
- **In-Memory Rate Limiting:** The `quizGradingAttempts` map in `server.ts` is held in memory. If your backend scales horizontally across multiple servers as usage grows, this rate limiter will fail and cause memory leaks. You will need to move this to Redis or Firestore.
- **AP® Trademark Tagging:** If you build out the "AP Business with Personal Finance" curriculum, you will need a systemic data structure to tag specific modules as AP®-licensed vs. standard curriculum so the trademark is only applied where legally appropriate.
