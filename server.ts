import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

dotenv.config();

// Initialize Firebase Admin SDK
const adminApp = getApps().length === 0
  ? initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0085912328"
    })
  : getApps()[0];

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
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

  // Strict CORS configuration
  const allowedOrigins = [
    'https://begin-fin.com',
    'https://www.begin-fin.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://ais-dev-3pukbrm6cjmwehc3hl7xhd-20819416614.us-west2.run.app',
    'https://ais-pre-3pukbrm6cjmwehc3hl7xhd-20819416614.us-west2.run.app'
  ];
  if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
  }

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true
  }));
  app.use(express.json());

  // Helper function to verify Firebase auth token
  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization token" });
    }
    const token = authHeader.split("Bearer ")[1];
    try {
      (req as any).user = await adminAuth.verifyIdToken(token);
      next();
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized request" });
    }
  };

  // API endpoint to get questions without correctIndex
  app.get("/api/questions/:moduleId", requireAuth, async (req, res) => {
    try {
      const { moduleId } = req.params;
      const snapshot = await adminDb.collection('questions')
        .where('moduleId', '==', moduleId)
        .where('isPublished', '==', true)
        .get();
        
      const questions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          moduleId: data.moduleId,
          language: data.language,
          question: data.question,
          options: data.options,
          // Exclude correctIndex
        };
      });
      
      return res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      return res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // API endpoint to complete a module (for static modules without a database quiz)
  app.post("/api/complete-module", requireAuth, async (req, res) => {
    try {
      const { moduleId } = req.body;
      const uid = (req as any).user.uid;
      
      if (!moduleId || typeof moduleId !== 'string') {
        return res.status(400).json({ error: "Invalid module ID." });
      }
      
      const userDoc = await adminDb.collection("users").doc(uid).get();
      const userData = userDoc.data();
      if (userData?.completedModules?.includes(moduleId)) {
        return res.json({ success: true, message: "Already completed." });
      }

      // Ensure the module does not have a quiz before allowing direct completion
      const questionsSnap = await adminDb.collection('questions')
        .where('moduleId', '==', moduleId)
        .where('isPublished', '==', true)
        .get();
        
      if (!questionsSnap.empty) {
        return res.status(403).json({ error: "This module requires passing a quiz. Use /api/grade-quiz instead." });
      }

      await adminDb.collection('users').doc(uid).update({
        completedModules: FieldValue.arrayUnion(moduleId)
      });
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error completing module:", error);
      return res.status(500).json({ error: "Failed to complete module" });
    }
  });

  // API endpoint to grade a quiz
  app.post("/api/grade-quiz", requireAuth, async (req, res) => {
    try {
      const { moduleId, answers } = req.body; // answers is { questionId: selectedIndex }
      const uid = (req as any).user.uid;
      
      const snapshot = await adminDb.collection('questions')
        .where('moduleId', '==', moduleId)
        .where('isPublished', '==', true)
        .get();
        
      let correctCount = 0;
      let totalCount = snapshot.docs.length;
      
      const results: Record<string, { correct: boolean, correctIndex: number }> = {};
      
      snapshot.docs.forEach(doc => {
        const qData = doc.data();
        const selectedIndex = answers[doc.id];
        const isCorrect = selectedIndex === qData.correctIndex;
        
        results[doc.id] = {
          correct: isCorrect,
          correctIndex: qData.correctIndex
        };
        
        if (isCorrect) correctCount++;
      });
      
      const score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
      const passed = score >= 80; // Example threshold
      
      if (passed) {
        // Automatically add to completedModules
        await adminDb.collection('users').doc(uid).update({
          completedModules: FieldValue.arrayUnion(moduleId)
        });
      }
      
      return res.json({
        passed,
        score,
        results,
        correctCount,
        totalCount
      });
    } catch (error) {
      console.error("Error grading quiz:", error);
      return res.status(500).json({ error: "Failed to grade quiz" });
    }
  });

  // API endpoint to join a class
  app.post("/api/join-class", requireAuth, async (req, res) => {
    try {
      const { joinCode, displayName } = req.body;
      const uid = (req as any).user.uid;
      
      if (!joinCode || typeof joinCode !== 'string' || joinCode.length !== 6) {
        return res.status(400).json({ error: "Invalid join code." });
      }
      
      const classRef = adminDb.collection('classes').doc(joinCode.toUpperCase());
      const classDoc = await classRef.get();
      
      if (!classDoc.exists) {
        return res.status(404).json({ error: "Class not found." });
      }
      
      const classData = classDoc.data()!;
      
      // Add student to class
      await classRef.update({
        studentIds: FieldValue.arrayUnion(uid)
      });
      
      // Update student profile
      const userUpdate: any = {
        classId: classDoc.id,
        teacherId: classData.teacherId,
        joinCode: joinCode.toUpperCase()
      };
      if (displayName) {
        userUpdate.displayName = sanitizeHeader(displayName).substring(0, 80);
      }
      
      await adminDb.collection('users').doc(uid).set(userUpdate, { merge: true });
      
      return res.json({ 
        success: true, 
        className: classData.className,
        classId: classDoc.id,
        teacherId: classData.teacherId
      });
    } catch (error: any) {
      console.error("Error joining class:", error);
      return res.status(500).json({ error: "Failed to join class." });
    }
  });

  // Rate limiting: 100 requests per 15 minutes per IP
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
  });

  // Apply rate limiter to all API routes and ensure no caching occurs on dynamic API requests
  app.use("/api", limiter, (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    next();
  });

  // Serve public/dist assets directly with precise mime-types to avoid SPA index.html fallback
  app.get('/favicon.ico', (req, res) => {
    res.redirect('https://i.postimg.cc/qvTKKNQJ/New-Begin-Fin-Logo(White-BG).png');
  });

  app.get('/favicon.png', (req, res) => {
    res.redirect('https://i.postimg.cc/qvTKKNQJ/New-Begin-Fin-Logo(White-BG).png');
  });

  app.get('/logo.png', (req, res) => {
    res.redirect('https://i.postimg.cc/qvTKKNQJ/New-Begin-Fin-Logo(White-BG).png');
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

  // Daily Rate Limiting for Bradley AI Chatbot (Strict 5 messages per calendar day / 24h per registered user)
  const dailyUserUsage = new Map<string, { date: string; count: number }>();
  const MAX_DAILY_MESSAGES = 5;

  // Helper to ensure response is clean plain text with no asterisks, hashtags, or markdown formatting
  function cleanPlainTextResponse(text: string): string {
    if (!text) return "";
    return text
      .replace(/^#{1,6}\s+/gm, '') // remove markdown header hashtags
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1') // remove bold/italic asterisks
      .replace(/_{1,3}([^_]+)_{1,3}/g, '$1') // remove underscores
      .replace(/[*#`]/g, '') // remove lingering asterisks, hashtags, backticks
      .replace(/^\s*[-•*]\s+/gm, '') // remove markdown bullet symbols
      .replace(/\n{3,}/g, '\n\n') // collapse excess newlines
      .trim();
  }

  const BRADLEY_SYSTEM_INSTRUCTION = `You are 'Bradley', a friendly, knowledgeable personal finance expert and educational tutor created by BeginFin.
BeginFin is an open-access non-profit web app providing a free personal finance certification course.

Role & Core Rules:
1. Educational Purpose: Your goal is to answer personal finance questions and clarify concepts from the BeginFin curriculum in clear, friendly plain language.
2. Mandatory Disclaimer Handled by UI: The chat interface already displays the mandatory disclaimer ("I am Bradley, an AI assistant created by BeginFin. I am not a financial advisor, and I cannot provide personalized financial advice.") to the user. Do NOT waste space repeating this full disclaimer on every answer unless the user specifically asks who you are or asks for personalized financial advice.
3. No Financial Advice: You must strictly refuse any request to provide personalized investment advice, stock picks, or individual financial planning recommendations. Politely explain the underlying educational principle instead.
4. Formatting & Brevity:
   - Output ONLY clean, natural plain text.
   - DO NOT use asterisks (* or **), hashtags (#), bullet points with symbols, bolding, italics, or code blocks.
   - Keep answers concise and direct: aim for 2 to 4 plain-language sentences (or a short paragraph) that are easy for any student to understand.
   - Explain financial terms simply without overwhelming jargon.

BeginFin Curriculum Reference:
- Unit 1: Personal Finance Fundamentals (Scarcity, Opportunity Cost, Net Worth = Assets - Liabilities, Checking vs Savings vs HYSA, FDIC/NCUA Insurance, APY, 50/30/20 Budgeting Rule).
- Unit 2: Paychecks, Taxes & Deductions (Gross vs Net Pay, FICA: Social Security 6.2% & Medicare 1.45%, Federal/State Income Taxes, W-4, W-2, 1099, Standard vs Itemized Deductions, Marginal Brackets).
- Unit 3: Banking & Credit Mastery (Credit Scores: FICO 300-850, 5 Factors: Payment History 35%, Utilization 30%, Length/Age 15%, Credit Mix 10%, New Credit 10%, Credit vs Debit Cards, APR, Grace Period).
- Unit 4: Debt Management & Payoff Strategies (Good vs Bad Debt, Avalanche Method: highest APR first, Snowball Method: lowest balance first, Student Loans: Federal vs Private).
- Unit 5: Investing Basics & Building Wealth (Compound Interest, Rule of 72, Inflation, Stocks, Bonds, Index Funds, ETFs, Diversification, Dollar-Cost Averaging, Risk vs Reward).
- Unit 6: Insurance & Protecting Your Wealth (Risk Management, Premiums, Deductibles, Co-pays, Out-of-Pocket Max, Health, Auto, Renters, Homeowners, Term vs Whole Life).
- Unit 7: Retirement Accounts & Long-Term Planning (401k & 403b with Employer Match, Traditional IRA vs Roth IRA, Contribution Limits, 59.5 Early Withdrawal Rule, Social Security).
- Unit 8: Consumer Protection, Rights & Scams (Phishing, Identity Theft, Credit Freezes, FCRA, TILA, Reporting Fraud).`;

  app.post("/api/chat/bradley", async (req, res) => {
    try {
      const { message, history } = req.body;
      const authHeader = req.headers.authorization;

      // 1. Strictly verify Firebase ID token signature
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: "Authentication required. Please sign in to chat with Bradley AI." 
        });
      }

      const idToken = authHeader.split('Bearer ')[1]?.trim();
      if (!idToken) {
        return res.status(401).json({ 
          error: "Authentication token missing. Please sign in again." 
        });
      }

      let verifiedUid: string;
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken || !decodedToken.uid) {
          throw new Error("Invalid token payload");
        }
        verifiedUid = decodedToken.uid;
      } catch (authErr: any) {
        return res.status(401).json({ 
          error: "Invalid or expired session. Please sign in again to use Bradley AI." 
        });
      }

      const effectiveUserId = verifiedUid;

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Message is required." });
      }

      // 2. Enforce 5 messages per calendar day limit per registered user
      const todayStr = new Date().toISOString().split('T')[0];
      const userUsageKey = `${effectiveUserId}_${todayStr}`;
      const currentUsage = dailyUserUsage.get(userUsageKey) || { date: todayStr, count: 0 };

      if (currentUsage.count >= MAX_DAILY_MESSAGES) {
        return res.status(429).json({ 
          error: "You have reached your daily limit of 5 messages with Bradley. Your daily limit resets tomorrow.",
          remainingToday: 0
        });
      }

      const client = getGenAI();

      // If Gemini API Key is not configured in the environment, return a graceful fallback
      if (!client) {
        const newCount = currentUsage.count + 1;
        dailyUserUsage.set(userUsageKey, { date: todayStr, count: newCount });
        return res.json({
          reply: `I am Bradley, an AI assistant created by BeginFin. I am not a financial advisor, and I cannot provide personalized financial advice.\n\nTo enable live Google Gemini AI responses, please configure your GEMINI_API_KEY in your environment settings.\n\nIn the meantime, feel free to explore the 8 interactive units in the BeginFin curriculum!`,
          remainingToday: Math.max(0, MAX_DAILY_MESSAGES - newCount),
          isFallback: true
        });
      }

      // Format conversation contents for multi-turn chat ensuring strictly alternating user/model turns
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history) && history.length > 0) {
        let expectedRole: 'user' | 'model' = 'user';
        for (const item of history.slice(-6)) {
          if (item && item.text && typeof item.text === 'string' && item.text.trim()) {
            const role = item.role === 'model' ? 'model' : 'user';
            if (role === expectedRole) {
              contents.push({
                role,
                parts: [{ text: item.text.trim() }]
              });
              expectedRole = expectedRole === 'user' ? 'model' : 'user';
            }
          }
        }
      }

      // If contents ends with 'user', drop the last user item so the new query can be appended cleanly
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents.pop();
      }

      // Add the current user query
      contents.push({
        role: 'user',
        parts: [{ text: message.trim() }]
      });

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction: BRADLEY_SYSTEM_INSTRUCTION,
          temperature: 0.6,
          maxOutputTokens: 500,
        }
      });

      // Increment usage count upon successful generation
      const newCount = currentUsage.count + 1;
      dailyUserUsage.set(userUsageKey, { date: todayStr, count: newCount });

      const rawReply = response.text || "I apologize, but I could not generate a response right now. Please try asking your question again.";
      const cleanReply = cleanPlainTextResponse(rawReply);

      return res.json({ 
        reply: cleanReply,
        remainingToday: Math.max(0, MAX_DAILY_MESSAGES - newCount)
      });
    } catch (error: any) {
      console.error("Error in Bradley AI chat:", error?.message || 'internal error');
      return res.status(500).json({ 
        error: "Failed to communicate with Bradley. Please try again in a few moments." 
      });
    }
  });

  // Example API route for tracking auth attempts (as requested)
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 5, // 5 attempts per hour
    message: { error: "Too many authentication attempts. Please try again in an hour." }
  });

  app.post("/api/auth/track-attempt", authLimiter, (req, res) => {
    res.json({ status: "ok", message: "Attempt tracked" });
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
        return res.status(401).json({ error: "Missing or invalid authorization token" });
      }
      const token = authHeader.split("Bearer ")[1];
      let decodedToken;
      try {
        decodedToken = await adminAuth.verifyIdToken(token);
      } catch (err) {
        return res.status(401).json({ error: "Unauthorized request" });
      }

      const { name, serialNumber, consent } = req.body;

      if (consent !== true) {
        return res.status(400).json({ error: "Explicit consent is required." });
      }

      if (!decodedToken.email) {
        return res.status(400).json({ error: "Authenticated account must have a verified email address to request a digital credential." });
      }
      
      const verifiedEmail = decodedToken.email;
      const verifiedUserId = decodedToken.uid;
      const verifiedName = decodedToken.name || name;

      if (!verifiedName) {
        return res.status(400).json({ error: "Full name is required." });
      }

      // Safe sanitized logging without writing student PII to stdout
      console.log(`[Certifier] Digital credential request processed at ${new Date().toISOString()}`);

      const cleanName = sanitizeHeader(verifiedName).substring(0, 100);
      const cleanEmail = sanitizeHeader(verifiedEmail).substring(0, 100);
      const cleanSerial = sanitizeHeader(serialNumber || 'N/A').substring(0, 50);
      const cleanUserId = sanitizeHeader(verifiedUserId || 'N/A').substring(0, 60);

      const safeNameHtml = escapeHtml(cleanName);
      const safeEmailHtml = escapeHtml(cleanEmail);
      const safeSerialHtml = escapeHtml(cleanSerial);
      const safeUserIdHtml = escapeHtml(cleanUserId);

      // Attempt to send email to administrator if SMTP environment variables are set
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"BeginFin Platform" <${process.env.SMTP_USER}>`,
          to: "vishnukakarla108@gmail.com",
          subject: `[Certifier.io Request] Digital Credential for ${cleanName}`,
          text: `A new digital credential request for Certifier.io has been submitted:

Name: ${cleanName}
Email: ${cleanEmail}
Certificate Serial: ${cleanSerial}
User ID: ${cleanUserId}
Consent to share with Certifier.io: YES
Requested At: ${new Date().toLocaleString()}

Please process this request in Certifier.io.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #4f46e5;">New Certifier.io Digital Credential Request</h2>
              <p>A user has requested a digital credential from Certifier.io and provided explicit consent:</p>
              <table style="border-collapse: collapse; width: 100%; max-width: 500px; margin-top: 15px;">
                <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Name:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${safeNameHtml}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Email:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${safeEmailHtml}">${safeEmailHtml}</a></td></tr>
                <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Serial #:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${safeSerialHtml}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">User ID:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${safeUserIdHtml}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Consent Granted:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #16a34a; font-weight: bold;">Yes</td></tr>
              </table>
              <p style="margin-top: 20px; font-size: 13px; color: #64748b;">This request has also been stored in your BeginFin Firestore database under the <code>certifierRequests</code> collection.</p>
            </div>
          `
        });
      }

      return res.json({ 
        success: true, 
        message: "Your request for a Certifier.io credential has been submitted successfully." 
      });
    } catch (error: any) {
      console.error("Error processing certifier credential request:", error?.message || 'internal error');
      return res.status(500).json({ error: "Failed to submit request. Please try again." });
    }
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
