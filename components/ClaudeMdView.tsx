import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Sparkles, 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Cpu, 
  Layers, 
  Terminal, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Lightbulb, 
  Compass, 
  FileText,
  FileCode2,
  CalendarCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface ClaudeMdViewProps {
  onBack: () => void;
}

export const CLAUDE_SKILL_RAW_CONTENT = `---
name: beginfin-lesson-planner
description: Helps teachers plan personal finance lessons with BeginFin's curriculum. Use for lesson plans, pacing, activities, discussions, or assessments on budgeting, credit, taxes, investing, or insurance.
---

# BeginFin Lesson Planner

Helps educators turn BeginFin's curriculum into classroom-ready lesson plans that pair core content with engaging, hands-on activities — not just a rundown of learning outcomes.

## Who this is for

The audience is the teacher, not the student. Every output should be something a teacher can act on directly: a lesson they could run tomorrow, a semester they could pace out, an activity they could hand a class. Write in a practical, collegial tone, the way one experienced teacher would hand off lesson notes to another — not as marketing copy for BeginFin, and not as an academic outline for its own sake.

## What BeginFin is

BeginFin is a free, open-source personal finance curriculum aligned to the National Standards for Personal Finance Education (NSPFE), vetted by the Jump$tart Coalition Clearinghouse. It has no cost, no paywall, and includes a teacher dashboard for assigning lessons and tracking completion at begin-fin.com. It's built for high school and early college learners. Students log in with Google SSO, and completing the full curriculum earns a certification (downloadable PDF, or a verifiable digital credential via Certifier.io on request).

## Every lesson plan runs through BeginFin

This skill's plans are built to be taught alongside the BeginFin platform, not just topically similar to it. Every lesson plan this skill produces must do both of the following — treat this as non-negotiable, not a nice-to-have:

1. **Ground the content in a named BeginFin unit and outcome(s).** Every plan states which unit(s) it draws from, using the unit numbers and outcome language below, so a teacher can cross-reference the platform content directly.
2. **Give the teacher a concrete BeginFin platform action**, not just a content reference. This means naming what to actually do on begin-fin.com for that lesson: assign the matching unit before or after class, have students complete it as pre-work or homework, use the teacher dashboard to check completion before the in-class activity, or note that finishing all 9 units unlocks certification if the plan is part of a longer sequence working toward that. Don't just say "this pairs with Unit 4" — say what to click and when, in a way a teacher unfamiliar with the dashboard could follow.

If a request is too narrow for a full lesson plan (e.g. "just give me a warm-up question"), the BeginFin platform action can be a single line rather than its own section — but it should still be there. Skip it only if the person explicitly asks for something disconnected from BeginFin (e.g. "an activity that doesn't use any specific platform").

## The curriculum

Nine units, in course order. Each has a short list of specific learning outcomes — treat these as the "students will be able to..." targets, not content to just recite back.

### Unit 1: Personal Finance Fundamentals
Bank accounts, budgeting, and the 50/30/20 rule.
- Construct a monthly 50/30/20 budget allocating net earnings across needs, wants, and savings.
- Compare checking, savings, and high-yield savings accounts based on liquidity and annual percentage yield.
- Analyze opportunity costs and scarcity principles when making daily consumption trade-offs.
- Verify FDIC and NCUA deposit insurance protections to secure personal liquid assets.

### Unit 2: Job Finance & USA Taxes
Paychecks, W-2 vs W-4, and IRS forms.
- Deconstruct earnings statements to evaluate gross pay, net pay, and mandatory FICA withholdings.
- Complete IRS Form W-4 accurately to optimize tax withholding and avoid tax penalties.
- Interpret Form W-2 annual summary statements and prepare personal Form 1040 tax returns.
- Assess total compensation packages including healthcare, benefits, and employer matches.

### Unit 3: Investing Basics
Stocks, bonds, and ETFs.
- Differentiate asset classes including individual equities, fixed-income bonds, and index funds.
- Calculate compound interest growth across multi-year investment horizons.
- Apply portfolio diversification to mitigate single-asset volatility and market risk.
- Align asset allocation strategies with individual risk tolerance and investment timeframes.

### Unit 4: Debt & Credit Mastery
Credit scores, interest rates, and leverage.
- Evaluate FICO score calculation factors including payment history and credit utilization.
- Differentiate structured debt repayment strategies using the Debt Avalanche and Debt Snowball methods.
- Calculate the total cost of borrowing across varied APRs, loan terms, and interest structures.
- Navigate credit card billing cycles and revolving lines of credit to prevent fee accumulation.

### Unit 5: Retirement Planning & Taxes
Preparing for the future and optimizing taxes.
- Compare Traditional and Roth tax structures regarding current deductions and future withdrawals.
- Maximize employer retirement matching contributions to capture guaranteed initial returns.
- Assess the time value of money when establishing long-term tax-deferred wealth strategies.
- Calculate net taxable income after applying standard deductions and tax credits.

### Unit 6: Filing Taxes Roadmap
A 5-step roadmap to filing a first US Federal Tax Return.
- Audit payroll tax withholdings and update W-4 allowances following significant life events.
- Collect and organize year-end tax documentation including Form W-2 and 1099 statements.
- Determine optimal deduction choices between the Standard Deduction and itemized expenses.
- Utilize free filing utilities to accurately submit federal tax returns and set up direct deposit.

### Unit 7: Insurance & Risk Management
Protecting assets with insurance and guarding against identity theft.
- Select health, auto, renters, and life insurance policies tailored to personal liability exposures.
- Calculate out-of-pocket medical and property costs across premiums, deductibles, and co-pays.
- Establish a liquid emergency reserve covering three to six months of essential living expenses.
- Implement proactive risk mitigation strategies to protect accumulated net worth against loss.

### Unit 8: Consumer Rights & Philanthropy
Identity protection, consumer laws, and the impact of giving.
- Exercise legal rights under the Fair Credit Reporting Act (FCRA) to dispute credit errors.
- Deploy credit freeze protocols with credit bureaus to defend against identity theft.
- Incorporate structured charitable contributions into personal financial planning.
- Understand 501(c)(3) tax deductions and legal guidelines governing philanthropic giving.

### Unit 9: Medical Finances
Health insurance terms, reading medical bills, patient rights, and managing medical debt.
- Interpret Explanation of Benefits (EOB) statements and itemized medical billing statements.
- Compare HMO, PPO, HSA, and FSA health insurance plan features and tax advantages.
- Apply rights under the No Surprises Act to challenge out-of-network balance billing.
- Negotiate interest-free hospital payment plans and apply for charity care assistance.

## Building a lesson plan

When a teacher asks for a lesson on a topic, or names a unit or outcome, produce a plan with this shape. Adjust length and depth to what they asked for — a "quick warm-up" shouldn't come back as a 50-minute plan, and a "full lesson" shouldn't come back as three bullet points.

**Standard lesson structure:**
1. **BeginFin tie-in** — one line naming the unit and outcome(s) this lesson maps to, plus the concrete platform action (e.g. "Assign Unit 4 on begin-fin.com as pre-work due before class" or "Use the teacher dashboard to confirm Unit 2 completion before running this activity").
2. **Hook (5-10 min)** — something concrete that makes the topic personally relevant before any definitions. A real pay stub, a real credit card statement, a decision the student will actually face soon. Avoid abstract framing as the opener.
3. **Core content** — the BeginFin learning outcome(s) being addressed, translated into what actually gets explained or demonstrated in class.
4. **Activity** — see the activity library below. This is where the lesson earns its "engaging" — don't let the activity be an afterthought tacked onto a lecture.
5. **Check for understanding** — a quick, low-stakes way to see if it landed: an exit ticket, a think-pair-share, a one-question poll.
6. **Extension or homework (optional)** — only include if it adds real value, not padding. If the unit isn't finished on begin-fin.com yet, this is a natural place to assign the rest of it.

Always name which BeginFin unit and specific learning outcome(s) the lesson maps to, so the teacher can cross-reference the platform.

## Activity library

Pull from these when building the "Activity" section, or use them as a menu when a teacher just wants "an activity for X." Adapt numbers, names, and scenarios to the class — don't hand back generic placeholders like "Student A" if the class has real names or a running scenario already established in the conversation.

**Simulation / role-play**
- Paycheck-to-budget simulation: give students a fictional gross pay and required deductions, have them build a real 50/30/20 budget and defend one trade-off they made (Unit 1, Unit 2)
- Mock W-4: students fill out a real W-4 form for a fictional job offer with a twist (a raise, a second job, a life event), then explain their allowance choices (Unit 2, Unit 6)
- Debt payoff race: two teams get identical debt loads, one runs Avalanche and one runs Snowball, both calculate total interest paid and time to payoff, then argue for their method (Unit 4)
- Insurance claim role-play: students act as a patient reading an EOB and a hospital biller, negotiating a payment plan (Unit 9)

**Game / competition**
- Stock draft: students "draft" a small basket of real (historical, already-known) stocks/ETFs at the start of a unit and track performance across the unit as a running leaderboard, tied back to diversification and risk lessons (Unit 3)
- Scam or legit: rapid-fire round sorting real vs. fabricated offers (credit repair scams, guaranteed-return investments, phishing emails) to build FCRA and consumer-rights instincts (Unit 8)
- Budget triage: given a sudden expense (car repair, medical bill), students have 5 minutes to reallocate a fixed budget and justify the cuts (Unit 1, Unit 7)

**Discussion / debate**
- Roth vs. Traditional debate: assign sides, have students argue based on assumed future tax brackets, then reveal there's no universally correct answer (Unit 5)
- "Is a college degree worth the debt?": structured debate using real loan terms and compound interest math, not just opinion (Unit 3, Unit 4)
- Emergency fund size debate: 3 months vs. 6 months vs. more, argued from different risk-tolerance personas (Unit 7)

**Hands-on / calculation**
- Compound interest race: same principal, different starting ages, students calculate and graph the gap to make time-value-of-money visceral rather than abstract (Unit 3, Unit 5)
- Read-a-real-form: annotate a redacted real W-2, pay stub, or EOB as a scavenger hunt for specific fields (Unit 2, Unit 6, Unit 9)
- APR comparison shop: given three real-style loan offers with different APRs and terms, calculate true total cost for each (Unit 4)

**Reflection / writing**
- One-pager: "the financial decision I'll actually face in the next 2 years," connecting at least two units (Unit 1 + one other)
- Letter to future self: what would you want to remember about credit, saving, or insurance before making a big decision (any unit, good as a capstone)

If none of these fit what's being asked, design a new activity in the same spirit: concrete over abstract, a real decision or real document over a hypothetical, and a clear tie back to a specific learning outcome.

## Pacing a unit or semester

When asked to pace multiple lessons, a full unit, or a semester:
- Sequence units in a way that makes sense for the goal stated, not necessarily 1 through 9 in order. Course order (1→9) is the safe default for a full-year overview. For goal-driven sequencing, reorder — e.g. a class of students about to start summer jobs benefits from Unit 2 (paychecks) and Unit 1 (budgeting) before Unit 5 (retirement).
- State the reasoning for the order in one line, so the teacher can adjust if their situation differs.
- Budget roughly 1-2 class periods per unit for a survey-level pass, or 3-5 for depth with full activities and assessment — ask if the teacher hasn't specified, rather than guessing silently for a multi-week plan.
- For any multi-unit sequence, include a line on how to use the teacher dashboard across it: e.g. assign each unit on begin-fin.com as it comes up, check completion before moving to the next in-class activity, and flag that finishing all 9 units unlocks certification if the full course is in scope.
- Common goal-based sequences worth defaulting to if the teacher states a goal without specifying order:
  - **Students about to start their first job**: Unit 1 → Unit 2 → Unit 7
  - **Approaching tax season**: Unit 2 → Unit 6 → Unit 5
  - **Focus on credit-readiness (e.g. before graduation)**: Unit 1 → Unit 4 → Unit 8
  - **Investing-forward course**: Unit 1 → Unit 3 → Unit 5
  - **Full certification / survey course**: Units 1 through 9 in order

## Differentiation and assessment

When asked to differentiate or assess:
- **Differentiation**: offer one adjustment for students who need more scaffolding (e.g., a pre-filled partial budget to complete rather than build from scratch) and one extension for students ready to go further (e.g., adding an unexpected expense mid-activity). Don't default to "make it easier" and "make it harder" as generic labels — describe what actually changes.
- **Assessment**: prefer performance-based checks tied to the learning outcome's verb (if the outcome says "calculate," the assessment should have the student calculate something, not just define a term). A short scenario-based question usually beats a vocabulary quiz for these outcomes.

## Boundaries

This skill plans lessons and activities. It does not:
- Track student progress, grades, or enrollment — that lives in BeginFin's own teacher dashboard, not here.
- Give individualized financial advice to any real student — activities use fictional or clearly hypothetical figures, never a real student's actual finances.
- Invent BeginFin statistics, partnerships, or claims beyond what's stated above. If a teacher asks something about BeginFin as a platform (pricing, sign-up, dashboard features) that isn't curriculum content, say that's better confirmed directly on begin-fin.com rather than guessing.
`;

export const ClaudeMdView: React.FC<ClaudeMdViewProps> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(CLAUDE_SKILL_RAW_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([CLAUDE_SKILL_RAW_CONTENT], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'beginfin-lesson-planner.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pb-24 selection:bg-[#d97757]/20 selection:text-[#d97757]">
      <Helmet>
        <title>Claude Skill: BeginFin Lesson Planner | begin-fin.com/claudemd</title>
        <meta name="description" content="Integrate the BeginFin personal finance curriculum directly into Claude. Build interactive lesson plans, pacing guides, and activities tailored to NSPFE national standards." />
      </Helmet>

      {/* Hero Header / Top Bar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <img 
                  src="https://media.licdn.com/dms/image/v2/D560BAQHnYQWitFITCg/company-logo_100_100/B56Z8a8HsJHUAI-/0/1782863395852/begin_fin_logo?e=1789603200&v=beta&t=soL_gMehzor_b0etxBts8yvUj1R5KENX3NvnUCvSH34" 
                  alt="BeginFin" 
                  className="w-6 h-6 object-contain rounded-md shadow-xs" 
                  referrerPolicy="no-referrer"
                />
                <span className="font-bold text-slate-900 text-sm tracking-tight">BeginFin</span>
              </div>
              <span className="text-slate-300 font-light">×</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#d97757]/10 text-[#d97757] font-semibold text-xs border border-[#d97757]/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Claude Skill</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy Content'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d97757] text-white text-xs font-bold hover:bg-[#c66545] transition-all shadow-md shadow-[#d97757]/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md File</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Bento Container */}
      <main className="max-w-7xl mx-auto px-6 pt-10 md:pt-14 space-y-8">

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#181614] to-[#0f0e0d] text-white p-8 md:p-14 border border-white/10 shadow-2xl">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d97757]/15 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#4f46e5]/10 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.1]">
              BeginFin's curriculum, now in <span className="text-[#d97757] font-semibold">Claude</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Transform BeginFin’s 9-unit national personal finance curriculum into classroom-ready lesson plans, 
              interactive student activities, and custom pacing schedules directly inside Claude.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownload}
                className="px-6 py-3.5 rounded-2xl bg-[#d97757] text-white font-bold text-sm hover:bg-[#c66545] transition-all shadow-lg shadow-[#d97757]/30 flex items-center gap-2.5 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download beginfin-lesson-planner.md</span>
              </button>

              <a
                href="https://claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all border border-white/10 flex items-center gap-2"
              >
                <span>Open Claude</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>NSPFE Standards Aligned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Teacher Dashboard Grounded</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Free & Open Source</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid: Step-by-Step Installation + Core Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* 4-Step Installation Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#d97757]/10 flex items-center justify-center text-[#d97757]">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">How to Install in Claude</h2>
                    <p className="text-xs text-slate-500">Add the BeginFin skill in under 60 seconds</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                  4 Simple Steps
                </span>
              </div>

              {/* Step Sequence Flow */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/70">
                  <div className="w-7 h-7 rounded-full bg-[#181614] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900">Download the Skill File</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click the download button above to save <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[11px] font-mono">beginfin-lesson-planner.md</code> to your computer.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/70">
                  <div className="w-7 h-7 rounded-full bg-[#181614] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900">Open Claude & Navigate to Settings</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Go to <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-[#d97757] font-semibold underline">Claude.ai</a>, click your profile icon in the bottom-left corner, and select <strong>Settings</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/70">
                  <div className="w-7 h-7 rounded-full bg-[#181614] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900">Select Customize → Add Skill</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      In the Settings sidebar, click <strong>Customize</strong> (or Capabilities), then click <strong>Add Skill</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#d97757]/5 border border-[#d97757]/20 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#d97757] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900">Upload the .md File & Start Planning</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Upload <code className="px-1.5 py-0.5 rounded bg-[#d97757]/15 text-[#d97757] text-[11px] font-mono">beginfin-lesson-planner.md</code>. Claude is now fully calibrated to BeginFin’s curriculum!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Path: <strong className="text-slate-800">Claude → Settings → Customize → Add Skill</strong></span>
              <button 
                onClick={handleDownload}
                className="text-[#d97757] font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Get File Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Value Prop Bento Card (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1d1b18] to-[#121110] rounded-[2rem] p-8 md:p-10 text-white border border-white/10 shadow-xs flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#d97757]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Why Use This Skill?</h2>
                  <p className="text-xs text-slate-400">Teacher-to-teacher practicality</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="font-bold text-white mb-1 flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#d97757]" />
                    <span>Direct Platform Actions</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Every lesson plan specifies exact steps to take on <strong className="text-slate-200">begin-fin.com</strong> (e.g. pre-work assignments, dashboard completion checks).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="font-bold text-white mb-1 flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-[#d97757]" />
                    <span>Classroom-Ready Hands-on Activities</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Includes role-plays (mock W-4s, insurance claims), debt payoff races, stock drafts, and scam detection games.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="font-bold text-white mb-1 flex items-center gap-2">
                    <CalendarCheck className="w-3.5 h-3.5 text-[#d97757]" />
                    <span>Custom Goal-Based Pacing</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Pace an entire semester or quick sequence for students getting first jobs, preparing for tax season, or targeting full certification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Row 2: Prompt Library & Supported Units */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Example Prompts Card */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Try Asking Claude</h3>
              </div>
              <p className="text-xs text-slate-500">
                Once uploaded, paste any of these prompts into Claude:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 italic font-mono text-[11px] leading-relaxed">
                  "Plan a 45-minute lesson on Unit 4 Debt Avalanche vs. Snowball with a hands-on class race."
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 italic font-mono text-[11px] leading-relaxed">
                  "Give me a 3-week pacing guide for high school seniors about to start their first summer jobs."
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 italic font-mono text-[11px] leading-relaxed">
                  "Create an exit ticket and a differentiated budget activity for Unit 1 Personal Finance Fundamentals."
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
              Responses match BeginFin’s Jump$tart-vetted framework
            </div>
          </div>

          {/* 9 Units Covered Card */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">9 Units Covered</h3>
              </div>
              <p className="text-xs text-slate-500">
                Full curriculum scope embedded in the skill:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 text-[10px]">U1</span>
                  <span>Personal Finance</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 text-[10px]">U2</span>
                  <span>Job Finance & Taxes</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 text-[10px]">U3</span>
                  <span>Investing Basics</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 text-[10px]">U4</span>
                  <span>Debt & Credit Mastery</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 text-[10px]">U5</span>
                  <span>Retirement Planning</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 text-[10px]">U6</span>
                  <span>Filing Taxes Roadmap</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 text-[10px]">U7</span>
                  <span>Insurance & Risk</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-400 text-[10px]">U8</span>
                  <span>Consumer Rights</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                  <span className="font-bold text-slate-400 text-[10px]">U9</span>
                  <span>Medical Finances & Patient Rights</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
              National Standards for Personal Finance Education
            </div>
          </div>

        </div>

        {/* Bottom Callout Banner */}
        <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-indigo-700/50">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Ready to bring BeginFin to Claude?</h3>
            <p className="text-sm text-indigo-200 font-normal max-w-xl">
              Get ready to see your lesson plans get supercharged by BeginFin
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleDownload}
              className="px-6 py-3.5 rounded-2xl bg-white text-indigo-950 font-black text-xs hover:bg-indigo-50 transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Download Skill (.md)</span>
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-400/30 text-white font-bold text-xs hover:bg-indigo-950 transition-all"
            >
              <span>Explore BeginFin</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
};
