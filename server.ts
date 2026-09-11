import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStrippedQuestionsForModule, gradeQuizAnswers } from "./server/quizAnswerKeys";
import { 
  MCP_SERVER_INFO, 
  MCP_TOOLS, 
  MCP_RESOURCES, 
  MCP_PROMPTS, 
  executeMcpTool, 
  handleMcpJsonRpc,
  handleMcpJsonRpcAsync,
  handleMcpSseConnection,
  handleMcpMessagePost,
  handleMcpDirectPost,
  handleMcpManifest
} from "./server/mcpHandler";

dotenv.config();

// Initialize Firebase Admin SDK
const adminApp = getApps().length === 0
  ? initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0085912328"
    })
  : getApps()[0];

const firestoreDbId = process.env.FIRESTORE_DATABASE_ID || "ai-studio-815a8484-ccb3-4aa6-90b6-77fad11b53ba";

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp, firestoreDbId);

function sanitizeHeader(str: string): string {
  return String(str || '').replace(/[\r\n]+/g, ' ').trim();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1);

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    
    // Content-Security-Policy scoped to Firebase, Gemini, Google Fonts, AI Studio, and self
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://www.gstatic.com https://www.google.com https://www.recaptcha.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://www.gstatic.com https://lh3.googleusercontent.com https://accounts.google.com https://images.unsplash.com",
      "connect-src 'self' https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://generativelanguage.googleapis.com https://accounts.google.com https://www.google.com https://www.recaptcha.net wss: ws:",
      "frame-src 'self' https://accounts.google.com https://www.google.com https://www.recaptcha.net https://docs.google.com https://*.google.com https://ai.studio https://*.run.app",
      "frame-ancestors 'self' https://ai.studio https://*.ai.studio https://*.google.com https://*.googleusercontent.com https://*.run.app",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ];
    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // Redirect HTTP to HTTPS in production
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] === 'http') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });

  // Universal CORS & Preflight handling for MCP endpoints (Claude, Cursor, Windsurf, remote AI connectors)
  app.use((req, res, next) => {
    const p = req.path.toLowerCase();
    const isMcpPath = p.startsWith('/mcp') || 
                      p.startsWith('/teacher/mcp') ||
                      p.startsWith('/bradley') ||
                      p.startsWith('/sse') || 
                      p.startsWith('/api/mcp') || 
                      p.startsWith('/api/bradley') ||
                      p.startsWith('/messages') || 
                      p.startsWith('/.well-known') ||
                      p === '/beginfin-mcp-config.json' ||
                      p === '/beginfin-lesson-planner.md';

    if (isMcpPath) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Expose-Headers', '*');
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }
    }
    next();
  });

  // CORS configuration supporting production domains, local development, and Google AI Studio previews
  const explicitAllowedOrigins = new Set([
    'https://begin-fin.com',
    'https://www.begin-fin.com',
    'https://beginfin.web.app',
    'https://beginfin.firebaseapp.com',
    'https://ai.studio',
    'https://claude.ai',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ]);

  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean).forEach(o => explicitAllowedOrigins.add(o));
  }

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || 
          explicitAllowedOrigins.has(origin) ||
          origin.endsWith('.run.app') ||
          origin.includes('ai.studio') ||
          origin.endsWith('.claude.ai') ||
          origin.endsWith('.anthropic.com') ||
          origin.endsWith('.cursor.com') ||
          origin.endsWith('.google.com') ||
          origin.endsWith('.googleusercontent.com') ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        // Permissive fallback so external MCP connectors are never dropped
        callback(null, true);
      }
    },
    credentials: true
  }));
  app.use(express.json());

  // Rate limiting: 100 requests per 15 minutes per IP (excluding MCP endpoints)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/api/mcp') || req.path.startsWith('/mcp') || req.path.startsWith('/teacher/mcp') || req.path.startsWith('/bradley') || req.path.startsWith('/api/bradley'),
    message: { error: "Too many requests, please try again later." }
  });

  // Apply rate limiter to all API routes and ensure no caching occurs on dynamic API requests
  app.use("/api", limiter, (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    next();
  });

  // Serve public/dist assets directly with precise mime-types to avoid SPA index.html fallback
  app.get(['/favicon.ico', '/favicon.png', '/logo.png'], (req, res) => {
    const distLogo = path.join(process.cwd(), 'dist', 'logo.png');
    const publicLogo = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(distLogo)) {
      res.setHeader('Content-Type', 'image/png');
      res.sendFile(distLogo);
    } else if (fs.existsSync(publicLogo)) {
      res.setHeader('Content-Type', 'image/png');
      res.sendFile(publicLogo);
    } else {
      res.sendStatus(404);
    }
  });

  app.get('/og-image.png', (req, res) => {
    const distOg = path.join(process.cwd(), 'dist', 'og-image.png');
    const publicOg = path.join(process.cwd(), 'public', 'og-image.png');
    if (fs.existsSync(distOg)) {
      res.setHeader('Content-Type', 'image/png');
      res.sendFile(distOg);
    } else if (fs.existsSync(publicOg)) {
      res.setHeader('Content-Type', 'image/png');
      res.sendFile(publicOg);
    } else {
      res.sendStatus(404);
    }
  });

  app.get('/sitemap.xml', (req, res) => {
    const distSitemap = path.join(process.cwd(), 'dist', 'sitemap.xml');
    const publicSitemap = path.join(process.cwd(), 'public', 'sitemap.xml');
    if (fs.existsSync(distSitemap)) {
      res.setHeader('Content-Type', 'application/xml');
      res.sendFile(distSitemap);
    } else if (fs.existsSync(publicSitemap)) {
      res.setHeader('Content-Type', 'application/xml');
      res.sendFile(publicSitemap);
    } else {
      res.sendStatus(404);
    }
  });

  // Direct route to serve the Claude Skill markdown file
  app.get(['/beginfin-lesson-planner.md', '/claudemd.md'], (req, res) => {
    const distMd = path.join(process.cwd(), 'dist', 'beginfin-lesson-planner.md');
    const publicMd = path.join(process.cwd(), 'public', 'beginfin-lesson-planner.md');
    res.setHeader('Content-Type', 'text/markdown; charset=UTF-8');
    res.setHeader('Content-Disposition', 'attachment; filename="beginfin-lesson-planner.md"');
    if (fs.existsSync(distMd)) {
      res.sendFile(distMd);
    } else if (fs.existsSync(publicMd)) {
      res.sendFile(publicMd);
    } else {
      res.sendStatus(404);
    }
  });

  // Model Context Protocol (MCP) Server Endpoints (https://begin-fin.com/mcp & https://begin-fin.com/sse)
  // 1. Standard MCP SSE Stream Endpoints (GET /sse, GET /api/mcp/sse, GET /mcp/sse, and legacy aliases)
  app.get(['/sse', '/api/mcp/sse', '/mcp/sse', '/bradley/sse', '/api/bradley/sse'], handleMcpSseConnection);

  // 2. Standard MCP Session Messages Endpoint (POST /messages, POST /mcp/messages, POST /api/mcp/messages, and legacy aliases)
  app.post(['/messages', '/mcp/messages', '/api/mcp/messages', '/bradley/messages', '/api/bradley/messages'], handleMcpMessagePost);

  // 3. Direct JSON-RPC 2.0 MCP POST Handlers (POST /mcp, POST /api/mcp, POST /sse, POST /teacher/mcp, and legacy aliases)
  app.post(['/mcp', '/api/mcp', '/sse', '/teacher/mcp', '/bradley/mcp', '/api/bradley/mcp', '/bradley/sse', '/bradley'], handleMcpDirectPost);

  // 4. Smart GET Routing for /mcp, /api/mcp, /teacher/mcp, and backward-compatible aliases
  app.get(['/mcp', '/api/mcp', '/teacher/mcp', '/bradley', '/bradley/mcp', '/api/bradley', '/api/bradley/mcp'], (req, res, next) => {
    const isSse = req.headers.accept?.includes('text/event-stream') || req.query.sse === 'true' || req.query.transport === 'sse';
    const isExplicitJson = req.headers.accept?.includes('application/json') || req.query.format === 'json' || req.path.startsWith('/api/');
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isMcpClient = userAgent.includes('mcp') || userAgent.includes('claude') || userAgent.includes('cursor') || userAgent.includes('anthropic') || userAgent.includes('python-requests') || userAgent.includes('curl') || userAgent.includes('go-http-client');

    if (isSse) {
      return handleMcpSseConnection(req, res);
    }

    if (isExplicitJson || (isMcpClient && !req.headers.accept?.includes('text/html'))) {
      return handleMcpManifest(req, res);
    }

    // For standard web browsers visiting /mcp or aliases, hand off to React SPA router
    next();
  });

  // 5. MCP Manifest Discovery (.well-known and manifest.json)
  app.get([
    '/mcp/manifest.json',
    '/.well-known/mcp',
    '/.well-known/mcp.json',
    '/mcp.json',
    '/api/mcp/manifest',
    '/bradley/manifest.json',
    '/.well-known/mcp-bradley.json',
    '/api/bradley/manifest'
  ], handleMcpManifest);

  // 6. REST Helper Endpoints for Interactive Playground & Tool Execution
  app.get(['/api/mcp/tools', '/api/bradley/tools'], (req, res) => {
    res.json({
      serverInfo: MCP_SERVER_INFO,
      tools: MCP_TOOLS,
      resources: MCP_RESOURCES,
      prompts: MCP_PROMPTS
    });
  });

  app.post(['/api/mcp/execute', '/api/bradley/execute'], async (req, res) => {
    try {
      const { toolName, args } = req.body || {};
      if (!toolName) {
        return res.status(400).json({ isError: true, content: [{ type: 'text', text: 'Missing required toolName' }] });
      }
      const result = await executeMcpTool(toolName, args || {});
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ isError: true, content: [{ type: 'text', text: err?.message || 'Error executing tool' }] });
    }
  });

  // Claude Desktop MCP Configuration Download (https://begin-fin.com/beginfin-mcp-config.json)
  app.get(['/beginfin-mcp-config.json', '/beginfin-bradley-config.json', '/bradley-config.json'], (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="claude_desktop_config.json"');
    const host = req.get('host') || 'begin-fin.com';
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const baseUrl = `${proto}://${host}`;

    res.json({
      mcpServers: {
        "beginfin": {
          "url": `${baseUrl}/sse`
        }
      }
    });
  });

  // Direct route to serve the BeginFin MCP markdown documentation
  app.get(['/beginfin-mcp.md', '/bradley-tutor.md', '/bradley.md'], (req, res) => {
    const distMd = path.join(process.cwd(), 'dist', 'beginfin-mcp.md');
    const publicMd = path.join(process.cwd(), 'public', 'beginfin-mcp.md');
    const fallbackDistMd = path.join(process.cwd(), 'dist', 'beginfin-lesson-planner.md');
    const fallbackPublicMd = path.join(process.cwd(), 'public', 'beginfin-lesson-planner.md');
    res.setHeader('Content-Type', 'text/markdown; charset=UTF-8');
    res.setHeader('Content-Disposition', 'attachment; filename="beginfin-mcp.md"');
    if (fs.existsSync(distMd)) {
      res.sendFile(distMd);
    } else if (fs.existsSync(publicMd)) {
      res.sendFile(publicMd);
    } else if (fs.existsSync(fallbackDistMd)) {
      res.sendFile(fallbackDistMd);
    } else if (fs.existsSync(fallbackPublicMd)) {
      res.sendFile(fallbackPublicMd);
    } else {
      res.sendStatus(404);
    }
  });

  // Endpoint to fetch questions for a module with correctIndex stripped
  app.get("/api/questions/:moduleId", async (req, res) => {
    try {
      const { moduleId } = req.params;
      const strippedData = getStrippedQuestionsForModule(moduleId);
      
      if (!strippedData) {
        return res.status(404).json({ error: `Module ${moduleId} not found.` });
      }

      // Check if any published custom questions exist in Firestore for this module
      let customQuestions: Array<{ id: string; question: string; options: string[] }> = [];
      try {
        const customDocs = await adminDb.collection("questions")
          .where("moduleId", "==", moduleId)
          .where("isPublished", "==", true)
          .get();

        customQuestions = customDocs.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            question: data.question,
            options: Array.isArray(data.options) ? data.options : []
          };
        });
      } catch (dbErr) {
        console.warn("Could not query custom questions from firestore:", dbErr);
      }

      return res.json({
        moduleId,
        quiz: strippedData.quiz,
        quizAlternative: strippedData.quizAlternative,
        customQuestions
      });
    } catch (err: any) {
      console.error("Error fetching questions:", err?.message || err);
      return res.status(500).json({ error: "Failed to load quiz questions." });
    }
  });

  // In-memory sliding window rate limiter for quiz grading attempts (keyed by verifiedUid:moduleId)
  const quizGradingAttempts = new Map<string, { count: number; firstAttemptAt: number }>();
  const QUIZ_WINDOW_MS = 60 * 60 * 1000; // 1 hour sliding window
  const MAX_QUIZ_ATTEMPTS_PER_WINDOW = 12; // 12 attempts per module per hour

  // Periodic cleanup of stale quiz attempt entries every 15 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of quizGradingAttempts.entries()) {
      if (now - record.firstAttemptAt > QUIZ_WINDOW_MS) {
        quizGradingAttempts.delete(key);
      }
    }
  }, 15 * 60 * 1000);

  // Quiz grading endpoint (supports authenticated users with Firestore sync & guest mode grading)
  app.post("/api/grade-quiz", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      let verifiedUid: string | null = null;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const idToken = authHeader.split("Bearer ")[1]?.trim();
        if (idToken) {
          try {
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            if (decodedToken && decodedToken.uid) {
              verifiedUid = decodedToken.uid;
            }
          } catch (authErr: any) {
            console.warn("Quiz grading with unverified or expired token, falling back to guest mode:", authErr?.message);
          }
        }
      }

      const { moduleId, quizVersion = "standard", answers } = req.body;

      if (!moduleId || !Array.isArray(answers)) {
        return res.status(400).json({ error: "moduleId and answers array are required." });
      }

      // Enforce attempt rate limiting (keyed by user UID or client IP for guests) to prevent answer-key enumeration
      // Rely solely on req.ip which respects app.set('trust proxy', 1) to prevent rate-limit evasion via spoofed X-Forwarded-For headers
      const clientIp = req.ip || "guest";
      const rateLimitKey = verifiedUid ? `${verifiedUid}:${moduleId}` : `guest:${clientIp}:${moduleId}`;
      const now = Date.now();
      const existingAttempt = quizGradingAttempts.get(rateLimitKey);

      if (existingAttempt) {
        if (now - existingAttempt.firstAttemptAt < QUIZ_WINDOW_MS) {
          if (existingAttempt.count >= MAX_QUIZ_ATTEMPTS_PER_WINDOW) {
            const minutesRemaining = Math.ceil((QUIZ_WINDOW_MS - (now - existingAttempt.firstAttemptAt)) / 60000);
            return res.status(429).json({
              error: `Attempt limit reached for this module. Please review the lesson material and try again in ${minutesRemaining} minutes.`
            });
          }
          existingAttempt.count += 1;
        } else {
          quizGradingAttempts.set(rateLimitKey, { count: 1, firstAttemptAt: now });
        }
      } else {
        quizGradingAttempts.set(rateLimitKey, { count: 1, firstAttemptAt: now });
      }

      const gradeResult = gradeQuizAnswers(moduleId, quizVersion, answers);
      if (!gradeResult) {
        return res.status(404).json({ error: `Module ${moduleId} answer key not found.` });
      }

      let updatedCompletedModules: string[] = [];

      // If passed and user is authenticated, record module completion on the user profile via Admin SDK
      if (gradeResult.passed && verifiedUid) {
        try {
          const userDocRef = adminDb.collection("users").doc(verifiedUid);
          const userDoc = await userDocRef.get();
          let currentCompleted: string[] = [];
          if (userDoc.exists) {
            const data = userDoc.data();
            currentCompleted = Array.isArray(data?.completedModules) ? data?.completedModules : [];
          }
          if (!currentCompleted.includes(moduleId)) {
            updatedCompletedModules = [...currentCompleted, moduleId];
            await userDocRef.set({
              completedModules: updatedCompletedModules,
              lastUpdated: new Date().toISOString()
            }, { merge: true });
          } else {
            updatedCompletedModules = currentCompleted;
          }
        } catch (dbErr: any) {
          if (dbErr?.code !== 7 && !dbErr?.message?.includes('PERMISSION_DENIED')) {
            console.error("Error writing completedModules via Admin SDK:", dbErr?.message || dbErr);
          }
        }
      }

      return res.json({
        success: true,
        passed: gradeResult.passed,
        score: gradeResult.score,
        totalQuestions: gradeResult.totalQuestions,
        results: gradeResult.results,
        completedModules: updatedCompletedModules
      });
    } catch (err: any) {
      console.error("Error in /api/grade-quiz:", err?.message || err);
      return res.status(500).json({ error: "Internal server error during quiz grading." });
    }
  });

  // Certificate issuance endpoint: authenticated, validates full course completion server-side
  const REQUIRED_MODULE_IDS = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];

  app.post("/api/issue-certificate", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required to issue certificate." });
      }

      const idToken = authHeader.split("Bearer ")[1]?.trim();
      if (!idToken) {
        return res.status(401).json({ error: "Authentication token missing." });
      }

      let verifiedUid: string;
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken || !decodedToken.uid) {
          throw new Error("Invalid token payload");
        }
        verifiedUid = decodedToken.uid;
      } catch (authErr: any) {
        return res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
      }

      // Query user profile to verify completedModules server-side
      let userData: any = {};
      let completedModules: string[] = [];

      try {
        const userDocRef = adminDb.collection("users").doc(verifiedUid);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
          userData = userDoc.data() || {};
          completedModules = Array.isArray(userData.completedModules) ? userData.completedModules : [];
        }
      } catch (dbErr: any) {
        // Fallback gracefully to client payload if container environment lacks Admin SDK IAM permissions
        if (dbErr?.code !== 7 && !dbErr?.message?.includes('PERMISSION_DENIED')) {
          console.warn("Could not query user profile via Admin SDK:", dbErr?.message || dbErr);
        }
      }

      // If server could not read from adminDb (e.g., container IAM sandbox), use completedModules supplied in client request
      if (completedModules.length === 0 && Array.isArray(req.body.completedModules)) {
        completedModules = req.body.completedModules.filter((m: any) => typeof m === 'string');
      }

      // Verify that all required modules have been completed
      const missingModules = REQUIRED_MODULE_IDS.filter(mId => !completedModules.includes(mId));
      if (missingModules.length > 0) {
        return res.status(400).json({ 
          error: `All required modules must be completed before a certificate can be issued. Missing: ${missingModules.join(', ')}`,
          missingModules 
        });
      }

      const { graduateName, isPublic } = req.body;
      const cleanGraduateName = typeof graduateName === 'string' && graduateName.trim()
        ? sanitizeHeader(graduateName).replace(/<\/?[^>]+(>|$)/g, "").substring(0, 100)
        : (userData.displayName || "BeginFin Student");

      const now = new Date();
      const issueDate = now.toISOString().substring(0, 10);
      const expDate = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate()).toISOString().substring(0, 10);

      let existingData: any = null;
      try {
        const credRef = adminDb.collection("credentials").doc(verifiedUid);
        const existingCred = await credRef.get();
        if (existingCred.exists) {
          existingData = existingCred.data();
        }
      } catch (credErr: any) {
        // Fallback gracefully if Admin SDK lacks IAM permissions; client SDK persists directly
        if (credErr?.code !== 7 && !credErr?.message?.includes('PERMISSION_DENIED')) {
          console.warn("Could not read existing credential via Admin SDK:", credErr?.message || credErr);
        }
      }

      const finalIssueDate = existingData?.issueDate || issueDate;
      const finalExpDate = existingData?.expirationDate || expDate;
      const finalSerial = existingData?.serialNumber || `BF-${verifiedUid.substring(0, 8).toUpperCase()}`;
      const finalIsPublic = typeof isPublic === 'boolean' 
        ? isPublic 
        : (typeof existingData?.isPublic === 'boolean' ? existingData.isPublic : true);

      const credData = {
        title: "Certificate of Financial Literacy Completion",
        serialNumber: finalSerial,
        graduateName: cleanGraduateName,
        issueDate: finalIssueDate,
        expirationDate: finalExpDate,
        isPublic: finalIsPublic,
        userId: verifiedUid,
        completedModules,
        updatedAt: now.toISOString()
      };

      try {
        const credRef = adminDb.collection("credentials").doc(verifiedUid);
        await credRef.set(credData, { merge: true });
      } catch (writeErr: any) {
        // Fallback gracefully; client SDK persists directly to Firestore
        if (writeErr?.code !== 7 && !writeErr?.message?.includes('PERMISSION_DENIED')) {
          console.warn("Could not persist credential via Admin SDK:", writeErr?.message || writeErr);
        }
      }

      return res.json({
        success: true,
        credential: credData
      });
    } catch (err: any) {
      console.error("Error issuing certificate:", err?.message || err);
      return res.status(500).json({ error: "Failed to issue certificate. Please try again." });
    }
  });

  // Class join endpoint: authenticates student with verifyIdToken, verifies 6-char joinCode against classes,
  // adds student UID to class's studentIds array, and sets student's classId/teacherId.
  app.post("/api/join-class", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required to join a class." });
      }

      const idToken = authHeader.split("Bearer ")[1]?.trim();
      if (!idToken) {
        return res.status(401).json({ error: "Authentication token missing." });
      }

      let verifiedUid: string;
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken || !decodedToken.uid) {
          throw new Error("Invalid token payload");
        }
        verifiedUid = decodedToken.uid;
      } catch (authErr: any) {
        return res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
      }

      const { joinCode, displayName } = req.body;
      if (!joinCode || typeof joinCode !== 'string' || joinCode.trim().length !== 6) {
        return res.status(400).json({ error: "A valid 6-character join code is required." });
      }

      const cleanJoinCode = joinCode.trim().toUpperCase();
      const classesQuery = await adminDb.collection("classes")
        .where("joinCode", "==", cleanJoinCode)
        .limit(1)
        .get();

      if (classesQuery.empty) {
        return res.status(404).json({ error: `No active class found with code "${cleanJoinCode}". Please check the code with your teacher.` });
      }

      const classDoc = classesQuery.docs[0];
      const classData = classDoc.data();
      const classId = classDoc.id;
      const teacherId = classData.teacherId;
      const className = classData.className || "Class";

      // Add student UID to class studentIds array via Admin SDK
      const currentStudentIds: string[] = Array.isArray(classData.studentIds) ? classData.studentIds : [];
      if (!currentStudentIds.includes(verifiedUid)) {
        await adminDb.collection("classes").doc(classId).update({
          studentIds: [...currentStudentIds, verifiedUid]
        });
      }

      // Update student user doc with classId and teacherId
      const userUpdate: any = {
        classId,
        teacherId,
        lastUpdated: new Date().toISOString()
      };
      if (displayName && typeof displayName === 'string' && displayName.trim()) {
        userUpdate.displayName = sanitizeHeader(displayName).replace(/<\/?[^>]+(>|$)/g, "").substring(0, 80);
      }

      await adminDb.collection("users").doc(verifiedUid).set(userUpdate, { merge: true });

      return res.json({
        success: true,
        classId,
        className,
        teacherId,
        message: `Successfully joined ${className}!`
      });
    } catch (err: any) {
      console.error("Error joining class:", err?.message || err);
      return res.status(500).json({ error: "Failed to join class. Please try again." });
    }
  });

  // Check if a student was added to any teacher's roster, and auto-enroll them
  app.post("/api/check-roster-enrollment", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required." });
      }

      const idToken = authHeader.split("Bearer ")[1]?.trim();
      if (!idToken) {
        return res.status(401).json({ error: "Authentication token missing." });
      }

      let verifiedUid: string;
      let userEmail: string | undefined;
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        verifiedUid = decodedToken.uid;
        userEmail = decodedToken.email?.toLowerCase().trim();
      } catch (authErr) {
        return res.status(401).json({ error: "Invalid session." });
      }

      const userDocRef = adminDb.collection("users").doc(verifiedUid);
      let userData: any = {};
      try {
        const userSnap = await userDocRef.get();
        userData = userSnap.data() || {};
      } catch (dbErr: any) {
        // In sandboxed container environment without Admin SDK IAM credentials, fallback cleanly
        if (dbErr?.code === 7 || dbErr?.message?.includes('PERMISSION_DENIED')) {
          return res.json({ autoEnrolled: false });
        }
        throw dbErr;
      }

      // If user was previously auto-enrolled and flag is set
      if (userData.autoEnrolledFromRoster && userData.classId && userData.autoEnrolledClassName) {
        return res.json({
          autoEnrolled: true,
          className: userData.autoEnrolledClassName,
          classId: userData.classId,
        });
      }

      // If user is already in a class manually, no auto-enrollment needed
      if (userData.classId) {
        return res.json({ autoEnrolled: false });
      }

      // If no email on token, check if user doc has email
      if (!userEmail && userData.email) {
        userEmail = String(userData.email).toLowerCase().trim();
      }

      if (!userEmail) {
        return res.json({ autoEnrolled: false });
      }

      // Look up classes where rosterEmails includes this student's email
      let classesQuery: any;
      try {
        classesQuery = await adminDb.collection("classes")
          .where("rosterEmails", "array-contains", userEmail)
          .limit(1)
          .get();
      } catch (queryErr: any) {
        if (queryErr?.code === 7 || queryErr?.message?.includes('PERMISSION_DENIED')) {
          return res.json({ autoEnrolled: false });
        }
        throw queryErr;
      }

      if (classesQuery.empty) {
        return res.json({ autoEnrolled: false });
      }

      const matchedClassDoc = classesQuery.docs[0];
      const classData = matchedClassDoc.data();
      const classId = matchedClassDoc.id;
      const className = classData.className || "Class";
      const teacherId = classData.teacherId;

      try {
        // Add student to class studentIds array
        await adminDb.collection("classes").doc(classId).update({
          studentIds: FieldValue.arrayUnion(verifiedUid)
        });

        // Update user doc with class affiliation and auto-enrolled flag
        await userDocRef.set({
          classId,
          teacherId,
          autoEnrolledFromRoster: true,
          autoEnrolledClassName: className,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (updateErr: any) {
        if (updateErr?.code === 7 || updateErr?.message?.includes('PERMISSION_DENIED')) {
          return res.json({ autoEnrolled: false });
        }
        throw updateErr;
      }

      return res.json({
        autoEnrolled: true,
        className,
        classId
      });
    } catch (err: any) {
      if (err?.code === 7 || err?.message?.includes('PERMISSION_DENIED')) {
        return res.json({ autoEnrolled: false });
      }
      console.error("Error in check-roster-enrollment:", err?.message || err);
      return res.status(500).json({ error: "Failed to check roster enrollment." });
    }
  });

  // Educator endpoint to sync student roster emails to a class
  app.post("/api/sync-class-roster", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required." });
      }

      const idToken = authHeader.split("Bearer ")[1]?.trim();
      if (!idToken) {
        return res.status(401).json({ error: "Authentication token missing." });
      }

      let verifiedUid: string;
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        verifiedUid = decodedToken.uid;
      } catch (authErr) {
        return res.status(401).json({ error: "Invalid session." });
      }

      const { classId, rosterEmails } = req.body;
      if (!classId || !Array.isArray(rosterEmails)) {
        return res.status(400).json({ error: "Class ID and rosterEmails array are required." });
      }

      const classDocRef = adminDb.collection("classes").doc(classId);
      const classSnap = await classDocRef.get();
      if (!classSnap.exists) {
        return res.status(404).json({ error: "Class not found." });
      }

      const classData = classSnap.data() || {};
      if (classData.teacherId !== verifiedUid) {
        return res.status(403).json({ error: "Only the class teacher can sync roster emails." });
      }

      const cleanEmails = rosterEmails
        .filter((e: any) => typeof e === 'string' && e.includes('@'))
        .map((e: string) => e.toLowerCase().trim());

      await classDocRef.update({
        rosterEmails: cleanEmails,
        rosterSyncedAt: new Date().toISOString()
      });

      // Find any already-registered users with these emails and auto-enroll them immediately
      if (cleanEmails.length > 0) {
        const batchSize = 30;
        for (let i = 0; i < cleanEmails.length; i += batchSize) {
          const chunk = cleanEmails.slice(i, i + batchSize);
          const usersSnap = await adminDb.collection("users")
            .where("email", "in", chunk)
            .get();

          for (const uDoc of usersSnap.docs) {
            const uData = uDoc.data();
            if (!uData.classId) {
              await classDocRef.update({
                studentIds: FieldValue.arrayUnion(uDoc.id)
              });
              await uDoc.ref.set({
                classId,
                teacherId: verifiedUid,
                autoEnrolledFromRoster: true,
                autoEnrolledClassName: classData.className || "Class",
                lastUpdated: new Date().toISOString()
              }, { merge: true });
            }
          }
        }
      }

      return res.json({
        success: true,
        count: cleanEmails.length,
        message: `Successfully synchronized ${cleanEmails.length} students to roster.`
      });
    } catch (err: any) {
      console.error("Error syncing class roster:", err?.message || err);
      return res.status(500).json({ error: "Failed to sync roster." });
    }
  });

  // API endpoint for Certifier.io credential requests
  const certifierLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    limit: 10,
    message: { error: "Too many credential requests. Please try again later." }
  });

  app.post("/api/request-certifier-credential", certifierLimiter, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required to request a verifiable credential." });
      }

      const idToken = authHeader.split("Bearer ")[1]?.trim();
      if (!idToken) {
        return res.status(401).json({ error: "Authentication token missing." });
      }

      let verifiedUid: string;
      let tokenEmail: string | undefined;
      let tokenName: string | undefined;
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken || !decodedToken.uid) {
          throw new Error("Invalid token payload");
        }
        verifiedUid = decodedToken.uid;
        tokenEmail = decodedToken.email;
        tokenName = decodedToken.name;
      } catch (authErr: any) {
        return res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
      }

      const { name, email, serialNumber, consent } = req.body;

      if (consent !== true) {
        return res.status(400).json({ error: "Explicit consent is required to request a digital credential." });
      }

      const effectiveName = (tokenName || name || "").trim();
      const effectiveEmail = (tokenEmail || email || "").trim();

      if (!effectiveName || !effectiveEmail) {
        return res.status(400).json({ error: "Full name and email are required." });
      }

      // Safe sanitized logging without writing student PII to stdout
      console.log(`[Certifier] Digital credential request processed at ${new Date().toISOString()}`);

      const cleanName = sanitizeHeader(effectiveName).substring(0, 100);
      const cleanEmail = sanitizeHeader(effectiveEmail).substring(0, 100);
      const cleanSerial = sanitizeHeader(serialNumber || 'N/A').substring(0, 50);
      const cleanUserId = verifiedUid;

      // Save certifier request to Firestore
      const now = new Date().toISOString();
      await adminDb.collection("certifierRequests").add({
        userId: cleanUserId,
        name: cleanName,
        email: cleanEmail,
        serialNumber: cleanSerial,
        consent: true,
        status: "pending",
        createdAt: now,
        requestedAt: now
      });

      return res.json({ 
        success: true, 
        message: "Your request for a Certifier.io credential has been submitted successfully." 
      });
    } catch (error: any) {
      console.error("Error processing certifier credential request:", error?.message || 'internal error');
      return res.status(500).json({ error: "Failed to submit request. Please try again." });
    }
  });

  // Public system status endpoint
  app.get("/api/status", async (req, res) => {
    try {
      const statusDoc = await adminDb.collection("system").doc("status").get();
      if (statusDoc.exists) {
        return res.json({ success: true, data: statusDoc.data() });
      }

      // Default baseline status
      const defaultStatus = {
        overall: "Operational",
        lastUpdated: new Date().toISOString(),
        customMessage: "",
        customMessageTitle: "",
        customMessageType: "info",
        services: {
          googleSso: {
            name: "Google SSO",
            status: "Operational",
            description: "Google Identity Services, One Tap, and OAuth 2.0 token resolution."
          },
          emailPhoneAuth: {
            name: "Email/Phone Sign-In",
            status: "Operational",
            description: "Email/password authentication and SMS verification pathways."
          },
          modules: {
            name: "Modules",
            status: "Operational",
            description: "Interactive course curriculum, calculators, quizzes, and learning engines."
          },
          teacherFeatures: {
            name: "Teacher Features",
            status: "Operational",
            description: "Classrooms, live sync alerts, gradebook exports, and Google Classroom sync."
          },
          certificateDownload: {
            name: "Certificate Download",
            status: "Operational",
            description: "Verifiable PDF certificate rendering and Certifier.io credential delivery."
          }
        },
        incidents: []
      };

      return res.json({ success: true, data: defaultStatus });
    } catch (err: any) {
      console.error("Error retrieving status:", err?.message || err);
      return res.status(500).json({ error: "Failed to retrieve status" });
    }
  });

  // Admin status update endpoint
  app.post("/api/status/update", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required to update status." });
      }

      const idToken = authHeader.split("Bearer ")[1]?.trim();
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      if (!decodedToken?.uid) {
        return res.status(401).json({ error: "Invalid session token." });
      }

      // Check if user is admin via token claims, email whitelist, or Firestore role
      const envAdminEmails = process.env.ADMIN_EMAILS 
        ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) 
        : [];
      const ADMIN_EMAILS = [
        'vishnukakarla108@gmail.com',
        'kv303157@gmail.com',
        'kruzksmith@gmail.com',
        'kruz@begin-fin.com',
        'vishnu@begin-fin.com',
        'admin@begin-fin.com',
        'kruzsmith@gmail.com',
        ...envAdminEmails
      ];
      let isAdmin = decodedToken.admin === true || decodedToken.role === 'admin';
      if (!isAdmin && decodedToken.email && ADMIN_EMAILS.includes(decodedToken.email.toLowerCase().trim())) {
        isAdmin = true;
      }
      if (!isAdmin) {
        const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
        if (userDoc.exists && userDoc.data()?.role === 'admin') {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        return res.status(403).json({ error: "Administrator authorization required to update system status." });
      }

      const { services, customCategory, customMessage, customMessageTitle, customMessageType, showCustomMessage, overall, incidents } = req.body;
      const updatePayload: any = {
        lastUpdated: new Date().toISOString(),
        updatedBy: decodedToken.email || decodedToken.uid
      };

      if (services) updatePayload.services = services;
      if (customCategory) updatePayload.customCategory = customCategory;
      if (typeof customMessage === 'string') updatePayload.customMessage = customMessage.trim();
      if (typeof customMessageTitle === 'string') updatePayload.customMessageTitle = customMessageTitle.trim();
      if (typeof customMessageType === 'string') updatePayload.customMessageType = customMessageType.trim();
      if (typeof showCustomMessage === 'boolean') updatePayload.showCustomMessage = showCustomMessage;
      if (typeof overall === 'string') updatePayload.overall = overall;
      if (Array.isArray(incidents)) updatePayload.incidents = incidents;

      await adminDb.collection("system").doc("status").set(updatePayload, { merge: true });

      return res.json({ success: true, message: "System status updated successfully.", data: updatePayload });
    } catch (err: any) {
      console.error("Error updating system status:", err?.message || err);
      return res.status(500).json({ error: "Failed to update system status." });
    }
  });

  // Dedicated route for LLM and AI discoverability (llms.txt standard)
  app.get('/llms.txt', (req, res) => {
    const llmsPath = path.join(process.cwd(), 'public', 'llms.txt');
    if (fs.existsSync(llmsPath)) {
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
      return res.sendFile(llmsPath);
    }
    return res.status(404).send('Not found');
  });

  // Dedicated route for robots.txt
  app.get('/robots.txt', (req, res) => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
      return res.sendFile(robotsPath);
    }
    return res.status(404).send('Not found');
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files with optimized caching headers for CDNs and browsers
    app.use(express.static(distPath, {
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        // Assets generated by Vite contain unique hashed filenames, making them safe to cache indefinitely
        if (filePath.includes('/assets/') || filePath.includes('\\assets\\')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.endsWith('.html')) {
          // HTML pages should always be revalidated to receive fast updates
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else {
          // Fallback for general static files located in the public directory
          res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
        }
      }
    }));

    app.get('*all', (req, res) => {
      // Ensure index page isn't stale but can still be cached conditionally
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
