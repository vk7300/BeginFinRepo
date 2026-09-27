# BeginFin Product Requirements Document (PRD)

## 1. Product Overview
**BeginFin** is a comprehensive, interactive financial literacy platform designed to provide distraction-free learning experiences. It offers curated curriculum modules, interactive tools, and verifiable certificates. The platform caters to both independent learners and traditional classroom settings, bridging the gap between personal financial education and structured teaching.

BeginFin leverages modern AI capabilities (via Model Context Protocol) and is deeply integrated into the Google Ecosystem to ensure a secure, scalable, and seamless user experience.

---

## 2. Target Audience & User Personas

### 2.1 Students (Learners)
*   **Profile:** High school students, young adults, or anyone seeking to improve their financial literacy.
*   **Goals:** Learn about taxes, credit, budgeting, and careers at their own pace; earn a certificate of completion.
*   **Key Needs:** Intuitive UI, interactive elements (simulators, quizzes), progress tracking, and easy onboarding without complex setups.

### 2.2 Teachers (Educators)
*   **Profile:** High school teachers, college professors, or community educators.
*   **Goals:** Manage classes, track student progress, sync rosters, and monitor classroom engagement in real-time.
*   **Key Needs:** Dashboard for analytics, ability to see notifications (e.g., when a student finishes a unit or exits fullscreen mode), and tools to sync with existing school systems (e.g., Google Classroom).

### 2.3 Administrators
*   **Profile:** BeginFin platform managers and founders.
*   **Goals:** Monitor system status, manage content, oversee security, and troubleshoot issues.
*   **Key Needs:** Admin dashboard, status reporting, secure content management tools.

---

## 3. Core Functional Requirements (Features)

### 3.1 Authentication & Identity (Google & Firebase)
*   **Google Single Sign-On (SSO):** Primary authentication method using Firebase Auth and Google Identity Services (One Tap).
*   **Email & Password:** Alternative login method with email verification workflows.
*   **Phone Verification:** SMS-based login (US/Canada restricted) using Firebase Auth and Recaptcha.
*   **Guest Mode:** Allows users to start learning immediately, with progress saved locally until they create an account.
*   **Role Management:** Users can seamlessly switch between 'Student' and 'Teacher' modes.

### 3.2 Student Learning Experience
*   **Interactive Modules:** A structured curriculum (Units 1 through 9) covering financial topics.
*   **Module Navigation:** Content delivery followed by knowledge-check quizzes.
*   **Progress Tracking:** The system tracks completed modules and saves progress to the user's profile.
*   **Certificates:** Upon completing required modules, students can generate a verifiable PDF certificate. Integrates with Certifier.io for digital credential requests.
*   **Tools & Simulators:**
    *   *Credit Score Game:* Interactive simulation to understand credit building.
    *   *Salary Simulator (Austin Job Simulator):* Explores career paths and income.
    *   *Tax Roadmap:* A visual guide to understanding the US Tax system (includes necessary legal disclaimers).

### 3.3 Teacher Classroom Management
*   **Teacher Dashboard:** A dedicated view for educators to manage their classes.
*   **Roster Syncing:** Ability to import students via email or Google Classroom integration.
*   **Join Codes:** 6-character codes for students to join specific classes manually.
*   **Real-time Alerts:** Teachers receive in-app notifications when students complete modules, finish the course, or exit full-screen mode during focused sessions.
*   **Student View Toggle:** Teachers can enter "Student Mode" to experience the curriculum exactly as their students do.

### 3.4 AI Integration & Model Context Protocol (MCP)
*   **MCP Server Capabilities:** BeginFin acts as an MCP server, exposing its data and tools to external AI clients (like Claude, Cursor, or a custom "Bradley" tutor).
*   **Interactive AI Tutor (Bradley):** Integration points for AI to assist students with financial concepts, referencing the BeginFin curriculum.

### 3.5 Administrator Tools
*   **System Status:** A public-facing and admin-editable system status page tracking the health of services (SSO, Modules, Certificates).
*   **Content Management (CRUD QMS):** Internal tools for administrators to manage quiz questions and course data.
*   **Security:** strict admin verification using Firebase Admin SDK and custom claims to restrict access to sensitive endpoints (like photo uploads and status updates).

---

## 4. Architecture & Google Ecosystem Integration

BeginFin is built on a modern, decoupled architecture heavily reliant on the Google Cloud platform for backend services.

### 4.1 Frontend Architecture
*   **Framework:** React (Single Page Application) built with Vite.
*   **Styling:** Tailwind CSS for utility-first styling.
*   **Animations:** Framer Motion for fluid, engaging UI transitions.
*   **Icons:** Lucide React.
*   **State Management:** React hooks and Firebase snapshot listeners for real-time data sync.

### 4.2 Backend Architecture
*   **Server:** Express.js running on Node.js (managed via `server.ts`).
*   **API Design:** RESTful endpoints for secure operations (quiz grading, certificate issuance, photo uploads) and JSON-RPC for MCP server interactions.
*   **Rate Limiting:** IP-based and user-based rate limiting on sensitive endpoints (e.g., quiz submissions, API requests) to prevent abuse.

### 4.3 Google Ecosystem & Firebase Integration
*   **Firebase Authentication:** Handles all user identity management (Google SSO, Email/Password, Phone OTP, Password Resets).
*   **Cloud Firestore (Database):** NoSQL database used for storing:
    *   `users`: Profiles, roles, class affiliations, and module progress.
    *   `classes`: Class metadata, teacher IDs, student rosters, and real-time alerts.
    *   `credentials`: Certificate metadata.
    *   `system`: Platform status and health.
*   **Firebase Admin SDK:** Used on the Express backend for secure, server-side verification of user tokens, database mutations, and administrative tasks.
*   **Google Workspace / Classroom Integration:** Logic exists to extract access tokens from Google Auth to sync rosters and interact with Google Classroom APIs.
*   **Google AI Studio / GenAI:** The backend utilizes `@google/genai` packages, indicating integration with Google's generative models for course content enhancement or tutoring features.

---

## 5. UI/UX & Brand Guidelines

### 5.1 Design Principles
*   **Minimalism & Distraction-Free:** The UI favors clean spaces, avoiding clutter to maintain focus on the educational content.
*   **Layout:** Widespread use of "Bento grids" (rounded, compartmentalized cards) for organizing information dashboards and module selection.
*   **Typography:** Strictly uses the **Inter** typeface for high legibility and a modern aesthetic.

### 5.2 Color Palette
*   **Glacial White (#F4F8FA):** Primary background color for a clean, expansive feel.
*   **BeginFin Iris Pulse (#7F7FFA):** Primary brand accent color used for primary buttons, active states, and focus rings.
*   **Slate Gray (#3C3C3C / tailwind slate scale):** Used for primary text, secondary text, and subtle borders.
*   **Semantic Colors:** Emerald/Green for success (Teacher mode, completions), Rose/Red for warnings (Tax disclaimers, errors), Amber/Yellow for alerts.

### 5.3 Copywriting & Tone
*   **Human-First:** Language must be concise, conversational, and accessible.
*   **Student-Centric:** Avoid stiff, institutional, or transactional terms. Use terms like "learner" and "tools" rather than "customer" or "solutions."
*   **Clarity:** Instructions and error messages must be plain-spoken and helpful, suitable for a first-year CS student or a high school learner to understand.

---

## 6. Non-Functional Requirements

*   **Security:**
    *   Strict Content Security Policy (CSP) headers.
    *   Backend verification of Firebase ID tokens for all authenticated API routes.
    *   Strict file validation and magic-byte checking for image uploads.
    *   Rate limiting to prevent DDoS or brute-force attacks on quizzes and authentication endpoints.
*   **Performance:**
    *   Client-side routing for instantaneous page transitions.
    *   Caching headers applied to static assets.
    *   Long-polling optimizations for Firestore to ensure stability in sandboxed environments.
*   **Accessibility:**
    *   "Skip to main content" links for keyboard navigation.
    *   Clear focus states on interactive elements.
    *   ARIA labels and semantic HTML structures.
*   **Responsiveness:** Mobile-first approach using Tailwind's responsive breakpoints. The dashboard features a collapsible side menu/bottom navigation for smaller screens.