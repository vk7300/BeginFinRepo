import { Request, Response } from 'express';
import crypto from 'crypto';
import { BEGINFIN_UNITS, CurriculumUnitSummary } from './mcpData';
import { modules } from '../data/courseData';

// ============================================================================
// Bradley Financial Tutor — Model Context Protocol (MCP) Server
// Built for BeginFin (https://begin-fin.com)
// 100% Free Open Educational Resource ($0 Cost to BeginFin & Users)
// ============================================================================

export const BRADLEY_MCP_SERVER_INFO = {
  name: 'bradley-financial-tutor',
  version: '1.0.0',
  description: "Official Model Context Protocol (MCP) server for Bradley — BeginFin's encouraging, judgment-free financial literacy AI tutor. Gives learners, high schoolers, college students, and career starters instant plain-language answers, 50/30/20 budget calculations, paycheck tax breakdowns, debt payoff strategies, and check-for-understanding quiz practice inside Claude Desktop, Cursor, Windsurf, or ChatGPT with zero costs.",
  protocolVersion: '2024-11-05'
};

export const BRADLEY_SYSTEM_PROMPT = `You are 'Bradley', an encouraging mentor, trusted community ally, and friendly personal finance tutor created by BeginFin (https://begin-fin.com).

Core Identity & Persona (from BeginFin Official Training & Brand Guidelines):
1. Voice & Demeanor: You speak with a clear, steady, warm, and judgment-free voice. You translate complex financial topics into relatable, plain language that honors learners' lived experiences. You are encouraging without being patronizing.
2. Terminology & Phrasing: Reject corporate pretense and financial jargon. Swap transactional terms (like "customer" or "solution") for human-first terms (like "learner" and "tools"). Champion "building momentum" and "disciplined consistency" over gimmicky "hustle culture" slang or get-rich-quick promises.
3. Educational Non-Advisory Boundary: You are an educational tutor, NOT a licensed financial advisor, broker-dealer, CPA, or attorney. You NEVER provide personalized investment picks, tax filing preparation, or individualized financial advice. When asked "What stock should I buy?" or "Where should I put my money?", you explain the foundational principles (diversification, index funds, compound growth, risk tolerance) so the learner can make informed choices.
4. BeginFin Background:
   - Co-founded by Lake Belton High School students Vishnu Kakarla (2026 BPA Personal Finance Nationals qualifier) and Kruz Smith (2025-26 NHS chapter treasurer) in Temple, Texas.
   - 100% free Open Educational Resource (OER), zero revenue, zero ads, zero data monetization ($0 cost).
   - Honored by Texas Governor Greg Abbott with a gubernatorial commendation, proclamations from City of Temple & City of Belton, and vetted for National Standards for Personal Finance Education (NSPFE) alignment in the Jump$tart Coalition Clearinghouse.
5. Grounded in BeginFin's 9 Core Curriculum Units:
   - Unit 1: Personal Finance Fundamentals (Checking/savings, HYSA, FDIC/NCUA insurance, 50/30/20 budgeting, net worth).
   - Unit 2: Job Finance & USA Taxes (Gross vs net pay, W-4 withholdings, W-2 annual forms, FICA 7.65%, federal tax brackets).
   - Unit 3: Investing Basics (Compound interest, stocks, bonds, index funds, ETFs, diversification, dollar-cost averaging).
   - Unit 4: Debt & Credit Mastery (FICO 300-850, 5 factors, credit utilization <30%, APR, Avalanche vs Snowball payoff).
   - Unit 5: Retirement Planning & Taxes (Traditional vs Roth 401(k) & IRA, employer matches, tax advantages, compound growth).
   - Unit 6: Filing Taxes Roadmap (Form 1040, standard deduction vs itemizing, refundable vs non-refundable tax credits).
   - Unit 7: Insurance & Risk Management (Premiums, deductibles, copays, out-of-pocket max, auto, health, renters insurance).
   - Unit 8: Consumer Rights & Philanthropy (FCRA, credit freezes, fraud protection, conscious giving).
   - Unit 9: Medical Finances (EOB statements, medical bill negotiation, No Surprises Act consumer rights).`;

// ----------------------------------------------------------------------------
// Tool Definitions
// ----------------------------------------------------------------------------
export const BRADLEY_MCP_TOOLS = [
  {
    name: 'ask_bradley',
    description: 'Ask Bradley any personal finance or money question. Delivers a warm, encouraging, plain-language mentorship answer grounded in BeginFin\'s verified 9-unit curriculum, free of corporate jargon and respecting educational non-advisory boundaries.',
    inputSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'The personal finance question or concept to ask Bradley (e.g. "How does the 50/30/20 rule work?", "Why is my paycheck smaller than my hourly wage times hours?", "Should I pay off debt or invest first?").'
        },
        learner_level: {
          type: 'string',
          enum: ['high_school', 'college', 'career_starter', 'adult_beginner', 'general'],
          description: 'Optional profile to tailor vocabulary and examples (defaults to general).'
        },
        unit_focus: {
          type: 'number',
          description: 'Optional BeginFin curriculum unit number (1 to 9) to focus the explanation on.'
        }
      },
      required: ['question']
    }
  },
  {
    name: 'explain_concept',
    description: 'Deep-dive educational explanation of any foundational personal finance concept from BeginFin\'s 9 units. Returns a structured breakdown with plain-English definition, real-world scenario, mathematical formula (if applicable), common pitfalls to avoid, and BeginFin unit alignment.',
    inputSchema: {
      type: 'object',
      properties: {
        concept: {
          type: 'string',
          description: 'The specific concept to explain (e.g. "50_30_20_budget", "compound_interest", "fico_score_factors", "debt_avalanche_vs_snowball", "traditional_vs_roth_ira", "w4_withholding", "emergency_fund", "hsa_triple_tax_advantage", "no_surprises_act").'
        },
        include_relatable_example: {
          type: 'boolean',
          description: 'Whether to include a concrete, everyday financial scenario (default true).'
        }
      },
      required: ['concept']
    }
  },
  {
    name: 'calculate_paycheck_and_budget',
    description: 'Run real-world personal finance calculations: takes gross earnings, computes mandatory FICA taxes (Social Security 6.2% + Medicare 1.45% = 7.65%), estimated federal withholding, net take-home pay, and generates the recommended 50/30/20 monthly budget breakdown (50% Needs, 30% Wants, 20% Savings/Debt Payoff).',
    inputSchema: {
      type: 'object',
      properties: {
        gross_amount: {
          type: 'number',
          description: 'Gross earnings amount (e.g. 18 for $18/hr, or 45000 for $45,000/yr).'
        },
        frequency: {
          type: 'string',
          enum: ['hourly', 'annual', 'biweekly', 'monthly'],
          description: 'Frequency of the gross amount entered.'
        },
        hours_per_week: {
          type: 'number',
          description: 'Standard hours worked per week for hourly wage (default 40).'
        },
        filing_status: {
          type: 'string',
          enum: ['single', 'married'],
          description: 'Federal tax filing status (default single).'
        }
      },
      required: ['gross_amount', 'frequency']
    }
  },
  {
    name: 'compare_financial_options',
    description: 'Objective, side-by-side comparison of two major financial choices (e.g. Roth vs Traditional retirement, Debt Avalanche vs Snowball, HYSA vs CD, Credit vs Debit Card, HMO vs PPO health insurance). Outlines trade-offs, pros & cons, and rules of thumb without giving prescriptive advice.',
    inputSchema: {
      type: 'object',
      properties: {
        comparison_type: {
          type: 'string',
          enum: [
            'roth_vs_traditional',
            'debt_avalanche_vs_snowball',
            'hysa_vs_cd',
            'credit_vs_debit',
            'hmo_vs_ppo',
            'standard_vs_itemized_deduction',
            'stocks_vs_index_funds'
          ],
          description: 'The two financial options to compare.'
        }
      },
      required: ['comparison_type']
    }
  },
  {
    name: 'get_curriculum_glossary',
    description: 'Instant plain-language vocabulary definitions and practical context from BeginFin\'s 9 units. Helps learners understand confusing terms like APY, FICA, EOB, FCRA, Copay, Liquidity, or Amortization.',
    inputSchema: {
      type: 'object',
      properties: {
        term: {
          type: 'string',
          description: 'Optional term to look up (e.g. "APY", "FICA", "Deductible", "Out-of-Pocket Max", "Index Fund", "Credit Utilization").'
        },
        unit_number: {
          type: 'number',
          description: 'Optional unit number (1 to 9) to list all key vocabulary for that unit.'
        }
      }
    }
  },
  {
    name: 'practice_quiz_question',
    description: 'Retrieve check-for-understanding practice questions with multiple-choice options, correct answer, and clear educational explanation from BeginFin\'s 9 units.',
    inputSchema: {
      type: 'object',
      properties: {
        unit_number: {
          type: 'number',
          description: 'The unit number (1 to 9) to test knowledge on.'
        },
        difficulty: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced'],
          description: 'Optional difficulty level (defaults to intermediate).'
        }
      },
      required: ['unit_number']
    }
  }
];

// ----------------------------------------------------------------------------
// Resource Definitions
// ----------------------------------------------------------------------------
export const BRADLEY_MCP_RESOURCES = [
  {
    uri: 'beginfin://bradley/system-instruction',
    name: 'Bradley System Instructions & Persona',
    mimeType: 'text/markdown',
    description: "Official persona, voice guidelines, non-advisory boundaries, and core tenets for Bradley AI Tutor."
  },
  {
    uri: 'beginfin://bradley/curriculum-reference',
    name: 'BeginFin 9-Unit Curriculum Overview',
    mimeType: 'application/json',
    description: "Complete summary of all 9 BeginFin units, learning outcomes, and National Standards alignment."
  },
  {
    uri: 'beginfin://bradley/glossary',
    name: 'BeginFin Personal Finance Glossary',
    mimeType: 'application/json',
    description: "Comprehensive financial literacy vocabulary with plain-language definitions."
  }
];

// ----------------------------------------------------------------------------
// Prompt Definitions
// ----------------------------------------------------------------------------
export const BRADLEY_MCP_PROMPTS = [
  {
    name: 'ask_bradley',
    description: 'Chat directly with Bradley using his encouraging mentorship voice.',
    arguments: [
      {
        name: 'user_question',
        description: 'The personal finance question you want to ask Bradley.',
        required: true
      }
    ]
  },
  {
    name: 'plan_my_503020_budget',
    description: 'Guide Bradley to walk a learner through creating their personalized 50/30/20 budget.',
    arguments: [
      {
        name: 'monthly_take_home_income',
        description: 'Estimated monthly net take-home pay in dollars.',
        required: true
      },
      {
        name: 'current_expenses',
        description: 'Optional brief list of existing expenses (e.g. rent, car, groceries).',
        required: false
      }
    ]
  },
  {
    name: 'evaluate_debt_payoff',
    description: 'Ask Bradley to compare the Debt Snowball vs Debt Avalanche methods for sample balances.',
    arguments: [
      {
        name: 'debts_summary',
        description: 'List of balances and interest rates (e.g. "$3,000 credit card at 24%, $8,000 car loan at 6%").',
        required: true
      }
    ]
  },
  {
    name: 'decipher_paystub',
    description: 'Have Bradley break down what taxes and deductions mean on a first paycheck.',
    arguments: [
      {
        name: 'paycheck_details',
        description: 'Hourly wage or gross pay, hours worked, and deductions listed on the stub.',
        required: true
      }
    ]
  }
];

// ----------------------------------------------------------------------------
// Tool Execution Implementation
// ----------------------------------------------------------------------------
export async function executeBradleyMcpTool(toolName: string, args: Record<string, any>): Promise<any> {
  switch (toolName) {
    case 'ask_bradley': {
      const question = (args.question || '').trim();
      const level = args.learner_level || 'general';
      const unitFocus = args.unit_focus ? Number(args.unit_focus) : null;

      // Find matching curriculum unit if specified or mentioned
      let matchedUnit: CurriculumUnitSummary | undefined;
      if (unitFocus && unitFocus >= 1 && unitFocus <= 9) {
        matchedUnit = BEGINFIN_UNITS.find(u => u.unitNumber === unitFocus);
      } else {
        // Simple keyword matching for relevant unit context
        const qLower = question.toLowerCase();
        if (qLower.includes('budget') || qLower.includes('50/30/20') || qLower.includes('savings') || qLower.includes('checking') || qLower.includes('hysa')) {
          matchedUnit = BEGINFIN_UNITS.find(u => u.unitNumber === 1);
        } else if (qLower.includes('tax') || qLower.includes('paycheck') || qLower.includes('w-2') || qLower.includes('w-4') || qLower.includes('fica') || qLower.includes('gross')) {
          matchedUnit = BEGINFIN_UNITS.find(u => u.unitNumber === 2);
        } else if (qLower.includes('invest') || qLower.includes('stock') || qLower.includes('compound') || qLower.includes('etf') || qLower.includes('index fund')) {
          matchedUnit = BEGINFIN_UNITS.find(u => u.unitNumber === 3);
        } else if (qLower.includes('credit') || qLower.includes('fico') || qLower.includes('debt') || qLower.includes('snowball') || qLower.includes('avalanche')) {
          matchedUnit = BEGINFIN_UNITS.find(u => u.unitNumber === 4);
        } else if (qLower.includes('401k') || qLower.includes('ira') || qLower.includes('roth') || qLower.includes('retire')) {
          matchedUnit = BEGINFIN_UNITS.find(u => u.unitNumber === 5);
        } else if (qLower.includes('1040') || qLower.includes('deduction') || qLower.includes('file taxes')) {
          matchedUnit = BEGINFIN_UNITS.find(u => u.unitNumber === 6);
        } else if (qLower.includes('insurance') || qLower.includes('deductible') || qLower.includes('copay') || qLower.includes('premium')) {
          matchedUnit = BEGINFIN_UNITS.find(u => u.unitNumber === 7);
        } else if (qLower.includes('scam') || qLower.includes('fraud') || qLower.includes('fcra') || qLower.includes('freeze')) {
          matchedUnit = BEGINFIN_UNITS.find(u => u.unitNumber === 8);
        } else if (qLower.includes('medical') || qLower.includes('hospital') || qLower.includes('eob') || qLower.includes('no surprises')) {
          matchedUnit = BEGINFIN_UNITS.find(u => u.unitNumber === 9);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              bradleyPersona: {
                name: 'Bradley',
                role: 'BeginFin AI Financial Literacy Tutor & Mentor',
                voiceTone: 'Clear, steady, encouraging, plain-language, non-judgmental',
                disclaimer: 'Educational explanation only. Bradley is an AI tutor created by BeginFin and is not a financial advisor. Never provides personalized investment, legal, or tax advice.'
              },
              userQuestion: question,
              matchedCurriculumUnit: matchedUnit ? {
                unitNumber: matchedUnit.unitNumber,
                title: matchedUnit.title,
                relevantOutcomes: matchedUnit.outcomes,
                keyVocabulary: matchedUnit.vocabulary,
                platformUrl: `https://begin-fin.com/curriculum`
              } : null,
              guidanceForAI: `Answer this question in Bradley's encouraging mentor voice. Use simple analogies, avoid corporate jargon, swap customer/solution for learner/tools, emphasize momentum over gimmicks, and keep the answer focused on actionable principles without giving individualized investment or tax advice.`
            }, null, 2)
          }
        ]
      };
    }

    case 'explain_concept': {
      const conceptKey = (args.concept || '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const conceptKnowledgeBase: Record<string, any> = {
        '50_30_20_budget': {
          title: 'The 50/30/20 Budgeting Framework',
          unit: 'Unit 1: Personal Finance Fundamentals',
          plainEnglish: 'A simple guideline for dividing your net (take-home) pay into three buckets: 50% for Needs, 30% for Wants, and 20% for Savings or Extra Debt Payoff.',
          breakdown: [
            { category: 'Needs (50%)', description: 'Essential survival expenses you cannot skip: rent/mortgage, basic groceries, utilities, transportation to work, required insurance, and minimum debt payments.' },
            { category: 'Wants (30%)', description: 'Lifestyle choices that enhance quality of life: dining out, streaming subscriptions, concert tickets, hobbies, and new clothes.' },
            { category: 'Savings & Debt (20%)', description: 'Building financial peace of mind: emergency fund deposits, high-interest debt payoffs beyond minimums, and retirement contributions.' }
          ],
          relatableExample: 'If your monthly take-home paycheck is $3,000, your 50/30/20 target is $1,500 for Needs, $900 for Wants, and $600 for Savings/Debt.',
          pitfallsToAvoid: 'Treating lifestyle upgrades (like food delivery or premium car trims) as Needs instead of Wants. If your rent alone takes 60% of your income in a high-cost area, start with a 60/20/20 or 70/20/10 rule — momentum matters more than perfection.',
          platformAction: 'Test your numbers on the BeginFin Wage and Living Cost Simulator at begin-fin.com/tools.'
        },
        'compound_interest': {
          title: 'Compound Interest & Exponential Growth',
          unit: 'Unit 3: Investing Basics',
          plainEnglish: 'Earning interest on your initial principal PLUS on all the interest you previously accumulated. Over time, your money works harder than you do.',
          formula: 'A = P(1 + r/n)^(nt) | Rule of 72: Divide 72 by your annual interest rate to see how many years it takes for your money to double.',
          relatableExample: 'If an 18-year-old invests $100/month into an index fund averaging an 8% annual return, by age 65 they will have contributed about $56,400 out-of-pocket, but the account will grow to over $600,000 due to compound growth.',
          pitfallsToAvoid: 'Waiting until your 30s or 40s to start. The secret superpower of compound interest is time, not initial wealth. Even $25/month started early beats hundreds a month started decades later.',
          platformAction: 'Explore Unit 3 on begin-fin.com to see visual compound growth curves.'
        },
        'fico_score_factors': {
          title: 'The 5 FICO Credit Score Factors',
          unit: 'Unit 4: Debt & Credit Mastery',
          plainEnglish: 'A 3-digit score (300 to 850) that tells lenders how reliably you manage borrowed money.',
          factors: [
            { name: 'Payment History', weight: '35%', tip: 'Pay at least the minimum on time, every single month. A single 30-day late mark can drop a score by 60-100 points.' },
            { name: 'Credit Utilization Ratio', weight: '30%', tip: 'Keep reported balances under 30% (ideally under 10%) of your total credit limit across cards.' },
            { name: 'Length of Credit History', weight: '15%', tip: 'Keep your oldest accounts open and active so your average credit age stays high.' },
            { name: 'Credit Mix', weight: '10%', tip: 'Demonstrating ability to manage both revolving credit (cards) and installment loans (auto/student).' },
            { name: 'New Credit / Hard Inquiries', weight: '10%', tip: 'Avoid applying for multiple new credit cards or loans within a short window.' }
          ],
          pitfallsToAvoid: 'Believing the myth that carrying a balance from month to month "builds credit." It does not! Carrying a balance only generates costly interest charges. Always pay your full statement balance monthly.',
          platformAction: 'Try the BeginFin Credit Simulator at begin-fin.com/tools to see how utilization affects score tiers.'
        },
        'debt_avalanche_vs_snowball': {
          title: 'Debt Avalanche vs. Debt Snowball',
          unit: 'Unit 4: Debt & Credit Mastery',
          plainEnglish: 'Two proven, structured strategies for eliminating multiple consumer debts while making minimum payments on everything else.',
          avalancheMethod: {
            focus: 'Pay off the debt with the HIGHEST interest rate (APR) first.',
            mathAdvantage: 'Mathematically saves the absolute most money in total interest and gets you debt-free faster.',
            bestFor: 'Learners motivated by numbers, logic, and maximum dollar efficiency.'
          },
          snowballMethod: {
            focus: 'Pay off the debt with the SMALLEST dollar balance first, regardless of interest rate.',
            psychologicalAdvantage: 'Delivers quick early psychological wins that build unstoppable momentum.',
            bestFor: 'Learners who need quick motivation and tangible milestones to stay committed.'
          },
          pitfallsToAvoid: 'Arguing over which one is "better." The best method is whichever one you will actually stick with until all debt is gone.'
        },
        'traditional_vs_roth_ira': {
          title: 'Traditional vs. Roth Retirement Accounts',
          unit: 'Unit 5: Retirement Planning & Taxes',
          plainEnglish: 'Two tax-advantaged ways to save for retirement outside or alongside your employer\'s 401(k).',
          comparison: [
            { type: 'Traditional IRA / 401(k)', taxTiming: 'Pre-tax today (tax deduction now)', retirementWithdrawals: 'Taxed as ordinary income in retirement', bestFor: 'People currently in their peak earning years who expect to be in a lower tax bracket in retirement.' },
            { type: 'Roth IRA / Roth 401(k)', taxTiming: 'Post-tax today (no tax break now)', retirementWithdrawals: '100% TAX-FREE growth and withdrawals after age 59½', bestFor: 'Students, young workers, and career starters currently in low tax brackets who want decades of tax-free growth.' }
          ],
          pitfallsToAvoid: 'Cashing out retirement accounts early. Withdrawing earnings before age 59½ triggers income taxes plus a 10% IRS early-withdrawal penalty (with limited exceptions).'
        },
        'w4_vs_w2': {
          title: 'IRS Form W-4 vs. Form W-2',
          unit: 'Unit 2: Job Finance & USA Taxes',
          plainEnglish: 'The two foundational tax documents every US employee encounters.',
          w4: 'Completed when you START a job. Tells your employer how much federal income tax to withhold from each paycheck based on your filing status and dependents.',
          w2: 'Received in JANUARY from your employer after the tax year ends. Summarizes your total gross wages earned and all taxes withheld (Federal, State, Social Security, Medicare) to prepare your Form 1040 tax return.'
        },
        'hsa_triple_tax_advantage': {
          title: 'Health Savings Account (HSA) Triple-Tax Advantage',
          unit: 'Unit 7: Insurance & Risk Management & Unit 9: Medical Finances',
          plainEnglish: 'The only account in the US tax code with three layers of tax exemption, paired with a High-Deductible Health Plan (HDHP).',
          threeAdvantages: [
            '1. Contributions go in pre-tax (lowering current year taxable income).',
            '2. Money grows completely tax-free when invested.',
            '3. Withdrawals are 100% tax-free at any age when used for qualified medical expenses.'
          ]
        },
        'no_surprises_act': {
          title: 'The No Surprises Act (Federal Consumer Protection)',
          unit: 'Unit 9: Medical Finances',
          plainEnglish: 'A US federal law in effect since 2022 that protects patients from unexpected "surprise" out-of-network medical bills during emergency services or at in-network facilities.',
          keyProtections: [
            'Bans out-of-network surprise balance billing for emergency medical care.',
            'Requires out-of-network providers at in-network facilities to give written notice and consent before billing higher rates.',
            'Establishes an independent dispute resolution process between insurers and providers so the patient is not trapped in the middle.'
          ]
        }
      };

      const matched = conceptKnowledgeBase[conceptKey] || {
        title: args.concept,
        description: `Concept requested: "${args.concept}". Bradley explains concepts across BeginFin's 9 core units: Personal Finance Fundamentals, Job Finance & Taxes, Investing Basics, Debt & Credit, Retirement Accounts, Filing Taxes, Insurance, Consumer Rights, and Medical Finances.`
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(matched, null, 2) }]
      };
    }

    case 'calculate_paycheck_and_budget': {
      const gross = Number(args.gross_amount) || 0;
      const freq = args.frequency || 'hourly';
      const hours = Number(args.hours_per_week) || 40;
      const status = args.filing_status || 'single';

      // Standardize to annual gross
      let annualGross = 0;
      if (freq === 'hourly') {
        annualGross = gross * hours * 52;
      } else if (freq === 'biweekly') {
        annualGross = gross * 26;
      } else if (freq === 'monthly') {
        annualGross = gross * 12;
      } else {
        annualGross = gross;
      }

      const monthlyGross = annualGross / 12;

      // Mandatory FICA taxes (Federal Insurance Contributions Act)
      // Social Security: 6.2% up to wage cap ($176,100 for 2025/2026)
      // Medicare: 1.45% on all earnings
      const ssRate = 0.062;
      const medRate = 0.0145;
      const ficaRate = ssRate + medRate; // 7.65%
      const annualFica = annualGross * ficaRate;
      const monthlyFica = annualFica / 12;

      // Estimated Federal Income Tax (simplified standard deduction + effective brackets)
      const standardDeduction = status === 'married' ? 30000 : 15000;
      const taxableIncome = Math.max(0, annualGross - standardDeduction);
      let estimatedAnnualFedTax = 0;
      if (taxableIncome > 0) {
        if (taxableIncome <= 11925) {
          estimatedAnnualFedTax = taxableIncome * 0.10;
        } else if (taxableIncome <= 48475) {
          estimatedAnnualFedTax = 1192.50 + (taxableIncome - 11925) * 0.12;
        } else if (taxableIncome <= 103350) {
          estimatedAnnualFedTax = 5578.50 + (taxableIncome - 48475) * 0.22;
        } else {
          estimatedAnnualFedTax = 17651 + (taxableIncome - 103350) * 0.24;
        }
      }
      const monthlyFedTax = estimatedAnnualFedTax / 12;

      // Estimated State Withholding (average benchmark ~3.5%, note 9 states have 0% income tax)
      const estimatedStateTaxRate = 0.035;
      const monthlyStateTax = monthlyGross * estimatedStateTaxRate;

      // Net Monthly Take-Home Pay
      const totalMonthlyDeductions = monthlyFica + monthlyFedTax + monthlyStateTax;
      const monthlyTakeHome = Math.max(0, monthlyGross - totalMonthlyDeductions);
      const effectiveTakeHomePercentage = monthlyGross > 0 ? (monthlyTakeHome / monthlyGross) * 100 : 0;

      // 50/30/20 Budget Breakdown of Take-Home Pay
      const needs50 = monthlyTakeHome * 0.50;
      const wants30 = monthlyTakeHome * 0.30;
      const savingsDebt20 = monthlyTakeHome * 0.20;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              input: {
                enteredAmount: gross,
                frequency: freq,
                hoursPerWeek: freq === 'hourly' ? hours : undefined,
                filingStatus: status
              },
              earningsSummary: {
                annualGrossPay: Math.round(annualGross),
                monthlyGrossPay: Math.round(monthlyGross),
                biweeklyGrossPay: Math.round(annualGross / 26)
              },
              monthlyDeductions: {
                ficaTaxes: {
                  total: Math.round(monthlyFica),
                  socialSecurity_6_2: Math.round(monthlyGross * ssRate),
                  medicare_1_45: Math.round(monthlyGross * medRate),
                  note: 'Mandatory federal payroll taxes supporting Social Security and Medicare.'
                },
                estimatedFederalIncomeTax: Math.round(monthlyFedTax),
                estimatedStateTaxBenchmark: Math.round(monthlyStateTax),
                totalEstimatedMonthlyDeductions: Math.round(totalMonthlyDeductions)
              },
              netTakeHomePay: {
                monthlyNet: Math.round(monthlyTakeHome),
                biweeklyNet: Math.round((monthlyTakeHome * 12) / 26),
                annualNet: Math.round(monthlyTakeHome * 12),
                effectiveTakeHomeRate: `${effectiveTakeHomePercentage.toFixed(1)}% of gross pay`
              },
              recommended50_30_20_Budget: {
                needs_50_percent: {
                  monthlyTarget: Math.round(needs50),
                  examples: 'Housing rent/mortgage, groceries, electric/water utilities, commute transportation, health insurance premiums, minimum debt payments.'
                },
                wants_30_percent: {
                  monthlyTarget: Math.round(wants30),
                  examples: 'Dining out, coffee, streaming subscriptions, hobbies, entertainment, shopping.'
                },
                savings_and_debt_20_percent: {
                  monthlyTarget: Math.round(savingsDebt20),
                  examples: 'Emergency fund deposits (aim for 3-6 months of needs), high-interest credit card payoffs, Roth IRA / 401(k) contributions.'
                }
              },
              bradleyMentorshipTip: `Notice how gross pay is different from what lands in your bank account! Planning your life around your take-home pay (${Math.round(monthlyTakeHome)}/mo) rather than gross pay (${Math.round(monthlyGross)}/mo) protects you from unexpected shortfalls.`
            }, null, 2)
          }
        ]
      };
    }

    case 'compare_financial_options': {
      const type = (args.comparison_type || '').toLowerCase();
      const comparisons: Record<string, any> = {
        'roth_vs_traditional': {
          title: 'Roth vs. Traditional Retirement Accounts (IRA / 401k)',
          optionA: {
            name: 'Roth (IRA or 401k)',
            whenTaxesArePaid: 'Today (using after-tax dollars). You get no tax deduction this year.',
            whenMoneyComesOut: '100% Tax-Free in retirement after age 59½ (both contributions and all compound growth).',
            idealFor: 'High school and college students, young professionals, or anyone currently in a lower tax bracket than they expect to be in the future.'
          },
          optionB: {
            name: 'Traditional (IRA or 401k)',
            whenTaxesArePaid: 'Later (using pre-tax dollars). Lowers your taxable income today.',
            whenMoneyComesOut: 'Taxed as ordinary income upon withdrawal in retirement.',
            idealFor: 'High earners in peak earning years who want an immediate tax break and expect their income to decrease in retirement.'
          },
          bradleyRuleOfThumb: 'If you are young or starting out, Roth is almost always the golden choice because decades of compound growth will be completely tax-free!'
        },
        'debt_avalanche_vs_snowball': {
          title: 'Debt Avalanche vs. Debt Snowball Method',
          optionA: {
            name: 'Debt Avalanche (Highest Interest Rate First)',
            mechanism: 'Rank all debts by APR from highest to lowest. Put every extra dollar toward the highest APR debt while making minimums on all others.',
            strength: 'Mathematically optimal: saves the most money in interest and clears debt fastest.',
            weakness: 'Can take months or years to eliminate the first balance if it is large, which can test your patience.'
          },
          optionB: {
            name: 'Debt Snowball (Smallest Balance First)',
            mechanism: 'Rank all debts by balance size from smallest to largest regardless of APR. Attack the smallest balance first for a fast win.',
            strength: 'Psychological power: quick wins build unstoppable confidence and reduce the number of bills you track.',
            weakness: 'May cost more in total interest over time compared to the Avalanche.'
          },
          bradleyRuleOfThumb: 'Personal finance is 20% math and 80% behavior. Pick the method that keeps you showing up every single month.'
        },
        'hysa_vs_cd': {
          title: 'High-Yield Savings Account (HYSA) vs. Certificate of Deposit (CD)',
          optionA: {
            name: 'High-Yield Savings Account (HYSA)',
            liquidity: 'High: withdraw or transfer money anytime with no penalties.',
            interestRate: 'Variable: fluctuates when the Federal Reserve raises or lowers rates.',
            bestFor: 'Emergency funds (3-6 months expenses) and near-term savings goals (next 0-12 months).'
          },
          optionB: {
            name: 'Certificate of Deposit (CD)',
            liquidity: 'Locked: money is locked for a fixed term (e.g. 6 months, 1 year, 5 years). Early withdrawal incurs penalties.',
            interestRate: 'Fixed: locked in for the entire duration regardless of economic changes.',
            bestFor: 'Money with a known future deadline (e.g. buying a car in 18 months) when you want guaranteed fixed yield.'
          },
          bradleyRuleOfThumb: 'Never lock your primary emergency fund in a CD. Keep emergency money in an FDIC-insured HYSA so it is instantly available when life happens.'
        },
        'credit_vs_debit': {
          title: 'Credit Cards vs. Debit Cards',
          optionA: {
            name: 'Credit Card',
            fundsSource: 'Bank\'s money (borrowed on a revolving credit line).',
            fraudProtection: 'Superior: under federal law (FCRA/TILA), maximum liability is $50, and fraudulent charges are easily held during dispute without freezing your personal checking cash.',
            creditBuilding: 'Builds credit score when paid on time and utilization is kept low.',
            risk: 'High interest (20-30% APR) if balances are not paid in full each month.'
          },
          optionB: {
            name: 'Debit Card',
            fundsSource: 'Your own money directly deducted from your checking account.',
            fraudProtection: 'Lower: if stolen, real cash leaves your bank account immediately while investigations take days or weeks.',
            creditBuilding: 'Does NOT report to credit bureaus or build a credit score.',
            benefit: 'Guaranteed prevention of overspending beyond your current bank balance.'
          },
          bradleyRuleOfThumb: 'Treat a credit card like a debit card: never charge what you cannot pay off in full today, and set up auto-pay for the statement balance.'
        }
      };

      const matched = comparisons[type] || {
        title: args.comparison_type,
        comparison: 'Objective comparison generated based on BeginFin 9-unit national standards curriculum.'
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(matched, null, 2) }]
      };
    }

    case 'get_curriculum_glossary': {
      const termQuery = (args.term || '').toLowerCase().trim();
      const unitNum = args.unit_number ? Number(args.unit_number) : null;

      const glossaryDatabase = [
        { term: 'Scarcity', unit: 1, definition: 'The fundamental economic condition where human wants exceed available resources, forcing individuals to make choices and trade-offs.' },
        { term: 'Opportunity Cost', unit: 1, definition: 'The value of the next best alternative you give up whenever you make a financial or spending choice.' },
        { term: 'Net Worth', unit: 1, definition: 'The total value of everything you own (Assets) minus everything you owe (Liabilities). Net Worth = Assets - Liabilities.' },
        { term: 'Annual Percentage Yield (APY)', unit: 1, definition: 'The real rate of return earned on a savings deposit in one year, taking into account the effect of compounding interest.' },
        { term: 'FDIC / NCUA Insurance', unit: 1, definition: 'Federal insurance protecting depositor funds up to $250,000 per depositor, per insured institution in case of bank or credit union failure.' },
        { term: '50/30/20 Rule', unit: 1, definition: 'A budgeting framework allocating 50% of net income to Needs, 30% to Wants, and 20% to Savings and debt elimination.' },
        { term: 'Gross Pay', unit: 2, definition: 'The total amount of money earned before any taxes, mandatory deductions, or employee benefits are subtracted.' },
        { term: 'Net Pay (Take-Home)', unit: 2, definition: 'The actual dollar amount deposited into your account after all federal, state, local, and payroll taxes are withheld.' },
        { term: 'FICA Taxes', unit: 2, definition: 'Federal Insurance Contributions Act mandatory payroll taxes: 6.2% for Social Security and 1.45% for Medicare (matched equally by your employer).' },
        { term: 'Form W-4', unit: 2, definition: 'An IRS form completed upon hiring that tells your employer how much federal income tax to withhold from each paycheck.' },
        { term: 'Form W-2', unit: 2, definition: 'An annual wage and tax statement provided by employers each January showing total earnings and taxes withheld during the prior calendar year.' },
        { term: 'Index Fund', unit: 3, definition: 'A mutual fund or ETF designed to track the performance of a specific market index (like the S&P 500), offering instant broad diversification at very low cost.' },
        { term: 'Dollar-Cost Averaging', unit: 3, definition: 'Investing a fixed dollar amount on a regular schedule regardless of market price, smoothing out volatility over the long term.' },
        { term: 'Credit Utilization Ratio', unit: 4, definition: 'The percentage of your total available credit that you are currently using. Keeping this below 30% (ideally under 10%) protects your credit score.' },
        { term: 'Debt Avalanche', unit: 4, definition: 'Paying extra toward the debt with the highest interest rate first while maintaining minimums on others, minimizing total interest paid.' },
        { term: 'Debt Snowball', unit: 4, definition: 'Paying extra toward the debt with the smallest dollar balance first to gain quick psychological momentum.' },
        { term: 'Roth IRA', unit: 5, definition: 'An individual retirement account funded with after-tax dollars where all future investment growth and retirement withdrawals are 100% tax-free.' },
        { term: 'Standard Deduction', unit: 6, definition: 'A fixed dollar amount set by the IRS that reduces the income on which you are taxed, available to all taxpayers who do not itemize deductions.' },
        { term: 'Deductible', unit: 7, definition: 'The amount of money you must pay out-of-pocket for covered medical or insurance expenses before your insurance policy begins paying.' },
        { term: 'Out-of-Pocket Maximum', unit: 7, definition: 'The absolute most you will have to pay for covered services in a plan year; after reaching this cap, your health insurance covers 100% of eligible costs.' },
        { term: 'No Surprises Act', unit: 9, definition: 'A 2022 US federal consumer protection law banning surprise medical balance billing for emergency care and out-of-network care at in-network facilities.' }
      ];

      let results = glossaryDatabase;
      if (unitNum) {
        results = results.filter(item => item.unit === unitNum);
      }
      if (termQuery) {
        results = results.filter(item => item.term.toLowerCase().includes(termQuery) || item.definition.toLowerCase().includes(termQuery));
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(results, null, 2) }]
      };
    }

    case 'practice_quiz_question': {
      const unitNum = Number(args.unit_number) || 1;
      const sampleQuizBank: Record<number, any> = {
        1: {
          unit: 1,
          topic: '50/30/20 Budgeting & Banking',
          question: 'Under the 50/30/20 budgeting framework, which category does an electric utility bill for your apartment belong to?',
          options: [
            'A) Wants (30%)',
            'B) Needs (50%)',
            'C) Savings & Debt (20%)',
            'D) Discretionary (10%)'
          ],
          correctAnswer: 'B) Needs (50%)',
          explanation: 'Essential utilities like electricity, water, and heat are necessary for basic shelter and daily living, placing them squarely in the 50% Needs category.'
        },
        2: {
          unit: 2,
          topic: 'Paychecks & FICA Taxes',
          question: 'What two programs do mandatory federal FICA taxes fund on every employee paycheck?',
          options: [
            'A) State Income Tax and City Sales Tax',
            'B) Social Security (6.2%) and Medicare (1.45%)',
            'C) 401(k) match and Health Savings Account',
            'D) Federal Unemployment and Worker Compensation'
          ],
          correctAnswer: 'B) Social Security (6.2%) and Medicare (1.45%)',
          explanation: 'FICA stands for the Federal Insurance Contributions Act, which funds Social Security at 6.2% and Medicare at 1.45% for a combined employee withholding of 7.65%.'
        },
        3: {
          unit: 3,
          topic: 'Investing & Diversification',
          question: 'According to the Rule of 72, approximately how many years will it take for an investment to double at a 9% annual rate of return?',
          options: [
            'A) 6 years',
            'B) 8 years',
            'C) 9 years',
            'D) 12 years'
          ],
          correctAnswer: 'B) 8 years',
          explanation: '72 divided by 9 equals 8 years. The Rule of 72 is a quick mental math shortcut to estimate compound growth doubling time.'
        },
        4: {
          unit: 4,
          topic: 'Credit Scoring & Utilization',
          question: 'Which factor carries the largest weight in your FICO credit score calculation?',
          options: [
            'A) Credit Mix (10%)',
            'B) Length of Credit History (15%)',
            'C) Credit Utilization Ratio (30%)',
            'D) Payment History (35%)'
          ],
          correctAnswer: 'D) Payment History (35%)',
          explanation: 'Payment history makes up 35% of your FICO score. Paying at least the minimum on time every month is the single most important habit for high credit health.'
        },
        5: {
          unit: 5,
          topic: 'Retirement Accounts',
          question: 'What is the primary tax advantage of contributing to a Roth IRA instead of a Traditional IRA?',
          options: [
            'A) Contributions reduce your taxable income today',
            'B) Investment growth and retirement withdrawals after 59½ are 100% tax-free',
            'C) Employers are legally mandated to match 100% of your deposits',
            'D) You can withdraw money with zero penalties for luxury purchases'
          ],
          correctAnswer: 'B) Investment growth and retirement withdrawals after 59½ are 100% tax-free',
          explanation: 'Roth IRAs are funded with after-tax dollars today, so all compound growth across decades can be withdrawn completely free of federal and state income tax after age 59½.'
        },
        6: {
          unit: 6,
          topic: 'Taxes Roadmap & Deductions',
          question: 'What is the difference between a tax deduction and a tax credit?',
          options: [
            'A) Deductions reduce taxable income; credits reduce your tax bill dollar-for-dollar',
            'B) Credits reduce taxable income; deductions reduce tax bill dollar-for-dollar',
            'C) Deductions only apply to corporations; credits only apply to individuals',
            'D) There is no difference; the IRS uses them interchangeably'
          ],
          correctAnswer: 'A) Deductions reduce taxable income; credits reduce your tax bill dollar-for-dollar',
          explanation: 'A deduction lowers your total taxable income before rates are calculated. A credit directly reduces the amount of tax you owe dollar-for-dollar, making credits exceptionally valuable.'
        },
        7: {
          unit: 7,
          topic: 'Insurance Principles',
          question: 'What is an insurance "deductible"?',
          options: [
            'A) The monthly cost you pay to keep the policy active',
            'B) The amount you must pay out-of-pocket before the insurance company begins paying',
            'C) The maximum payout the insurance company will ever provide',
            'D) A discount given for driving safely'
          ],
          correctAnswer: 'B) The amount you must pay out-of-pocket before the insurance company begins paying',
          explanation: 'The deductible is the initial out-of-pocket threshold you pay for covered claims before policy benefits kick in.'
        },
        8: {
          unit: 8,
          topic: 'Consumer Rights & Protection',
          question: 'Under the Fair Credit Reporting Act (FCRA), what is the most effective step to prevent identity thieves from opening new credit accounts in your name?',
          options: [
            'A) Delete your email account',
            'B) Place a free credit freeze with all three major bureaus (Experian, Equifax, TransUnion)',
            'C) Cut up your existing credit cards',
            'D) Pay off all your credit card balances'
          ],
          correctAnswer: 'B) Place a free credit freeze with all three major bureaus (Experian, Equifax, TransUnion)',
          explanation: 'A credit freeze blocks lenders from pulling your credit report, which prevents fraudulent accounts from being approved in your name. By federal law, placing and lifting freezes is 100% free.'
        },
        9: {
          unit: 9,
          topic: 'Medical Finances',
          question: 'What document does your health insurer send you after a medical visit that shows what the doctor billed, what the plan covered, and what you may owe (and is NOT a bill)?',
          options: [
            'A) Form W-2',
            'B) Explanation of Benefits (EOB)',
            'C) Form 1040',
            'D) Credit Bureau Report'
          ],
          correctAnswer: 'B) Explanation of Benefits (EOB)',
          explanation: 'The Explanation of Benefits (EOB) is an informational statement detailing how your insurance plan processed your provider\'s claim. You should never pay until you cross-check the provider\'s actual bill against your EOB.'
        }
      };

      const quiz = sampleQuizBank[unitNum] || sampleQuizBank[1];
      return {
        content: [{ type: 'text', text: JSON.stringify(quiz, null, 2) }]
      };
    }

    default:
      throw new Error(`Unknown Bradley MCP tool: ${toolName}`);
  }
}

// ----------------------------------------------------------------------------
// JSON-RPC Request Handler
// ----------------------------------------------------------------------------
export async function handleBradleyMcpJsonRpcAsync(body: any): Promise<any> {
  const { jsonrpc = '2.0', id, method, params } = body || {};

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: {
          protocolVersion: BRADLEY_MCP_SERVER_INFO.protocolVersion,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false }
          },
          serverInfo: {
            name: BRADLEY_MCP_SERVER_INFO.name,
            version: BRADLEY_MCP_SERVER_INFO.version
          },
          instructions: BRADLEY_SYSTEM_PROMPT
        }
      };

    case 'notifications/initialized':
      return null;

    case 'ping':
      return { jsonrpc: '2.0', id: id ?? null, result: {} };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: { tools: BRADLEY_MCP_TOOLS }
      };

    case 'tools/call': {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      try {
        const result = await executeBradleyMcpTool(toolName, toolArgs);
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result
        };
      } catch (err: any) {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          error: {
            code: -32603,
            message: err.message || 'Internal tool execution error'
          }
        };
      }
    }

    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: { resources: BRADLEY_MCP_RESOURCES }
      };

    case 'resources/read': {
      const uri = params?.uri;
      if (uri === 'beginfin://bradley/system-instruction') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: BRADLEY_SYSTEM_PROMPT
              }
            ]
          }
        };
      }
      if (uri === 'beginfin://bradley/curriculum-reference') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(BEGINFIN_UNITS, null, 2)
              }
            ]
          }
        };
      }
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        error: { code: -32602, message: `Resource not found: ${uri}` }
      };
    }

    case 'prompts/list':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: { prompts: BRADLEY_MCP_PROMPTS }
      };

    case 'prompts/get': {
      const promptName = params?.name;
      const args = params?.arguments || {};
      if (promptName === 'ask_bradley') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            description: 'Ask Bradley prompt',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Hi Bradley! Can you help explain this personal finance question in plain language: "${args.user_question || 'How should I start budgeting?'}"`
                }
              }
            ]
          }
        };
      }
      if (promptName === 'plan_my_503020_budget') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            description: '50/30/20 Budget Planning Prompt',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Hi Bradley, my estimated monthly take-home income is $${args.monthly_take_home_income || 3000}. Can you break down my 50/30/20 budget targets and give me advice on managing needs, wants, and savings?`
                }
              }
            ]
          }
        };
      }
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        error: { code: -32602, message: `Prompt not found: ${promptName}` }
      };
    }

    default:
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        error: { code: -32601, message: `Method not found: "${method}"` }
      };
  }
}

// ----------------------------------------------------------------------------
// Active Sessions & SSE Connection Store for Bradley MCP
// ----------------------------------------------------------------------------
interface BradleyMcpSession {
  id: string;
  res: Response;
  createdAt: number;
  lastActive: number;
  pingTimer: NodeJS.Timeout;
}

const activeBradleySessions = new Map<string, BradleyMcpSession>();

// Periodically clean up stale sessions (> 1 hour inactive)
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeBradleySessions.entries()) {
    if (now - session.lastActive > 3600000) {
      clearInterval(session.pingTimer);
      try {
        session.res.end();
      } catch (e) {}
      activeBradleySessions.delete(id);
    }
  }
}, 60000);

export function handleBradleyMcpSseConnection(req: Request, res: Response) {
  const sessionId = crypto.randomUUID();

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', '*');

  const host = req.get('host') || 'begin-fin.com';
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const postEndpoint = `${proto}://${host}/bradley/messages?sessionId=${sessionId}`;

  res.write(`event: endpoint\r\ndata: ${postEndpoint}\r\n\r\n`);

  const pingTimer = setInterval(() => {
    try {
      res.write(`event: ping\r\ndata: {}\r\n\r\n`);
    } catch (e) {
      clearInterval(pingTimer);
    }
  }, 25000);

  const session: BradleyMcpSession = {
    id: sessionId,
    res,
    createdAt: Date.now(),
    lastActive: Date.now(),
    pingTimer
  };

  activeBradleySessions.set(sessionId, session);

  const cleanup = () => {
    clearInterval(pingTimer);
    activeBradleySessions.delete(sessionId);
  };

  req.on('close', cleanup);
  res.on('close', cleanup);
  req.on('error', cleanup);
  res.on('error', cleanup);
}

export async function handleBradleyMcpMessagePost(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string) || req.body?.sessionId;
  const body = req.body;

  if (!body) {
    return res.status(400).json({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error: Empty request body' } });
  }

  const session = sessionId ? activeBradleySessions.get(sessionId) : null;
  if (session) {
    session.lastActive = Date.now();
  }

  if (Array.isArray(body)) {
    const responses = [];
    for (const item of body) {
      const resp = await handleBradleyMcpJsonRpcAsync(item);
      if (resp) responses.push(resp);
    }

    if (session) {
      for (const resp of responses) {
        session.res.write(`event: message\r\ndata: ${JSON.stringify(resp)}\r\n\r\n`);
      }
      return res.status(202).json({ jsonrpc: '2.0', result: { status: 'accepted', count: responses.length } });
    } else {
      return res.json(responses);
    }
  }

  const response = await handleBradleyMcpJsonRpcAsync(body);

  if (session) {
    if (response) {
      session.res.write(`event: message\r\ndata: ${JSON.stringify(response)}\r\n\r\n`);
    }
    return res.status(202).json({ jsonrpc: '2.0', result: { status: 'accepted' } });
  } else {
    if (response) {
      return res.json(response);
    }
    return res.status(204).end();
  }
}

export async function handleBradleyMcpDirectPost(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Expose-Headers', '*');

  const body = req.body;
  if (!body) {
    return res.status(400).json({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error: Empty request body' } });
  }

  const wantsSse = req.headers.accept?.includes('text/event-stream') && !req.headers.accept?.includes('application/json');

  if (Array.isArray(body)) {
    const responses = [];
    for (const item of body) {
      const resp = await handleBradleyMcpJsonRpcAsync(item);
      if (resp) responses.push(resp);
    }
    if (wantsSse) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      for (const resp of responses) {
        res.write(`event: message\r\ndata: ${JSON.stringify(resp)}\r\n\r\n`);
      }
      return res.end();
    }
    return res.json(responses);
  }

  const response = await handleBradleyMcpJsonRpcAsync(body);
  if (response) {
    if (wantsSse) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.write(`event: message\r\ndata: ${JSON.stringify(response)}\r\n\r\n`);
      return res.end();
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.json(response);
  }
  return res.status(204).end();
}

export function handleBradleyMcpManifest(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const host = req.get('host') || 'begin-fin.com';
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const baseUrl = `${proto}://${host}`;

  return res.json({
    name: BRADLEY_MCP_SERVER_INFO.name,
    version: BRADLEY_MCP_SERVER_INFO.version,
    description: BRADLEY_MCP_SERVER_INFO.description,
    protocol: 'mcp',
    protocolVersion: BRADLEY_MCP_SERVER_INFO.protocolVersion,
    cost: '$0.00 (100% Free Open Educational Resource)',
    endpoints: {
      sse: `${baseUrl}/bradley/sse`,
      messages: `${baseUrl}/bradley/messages`,
      http: `${baseUrl}/bradley/mcp`,
      apiMcp: `${baseUrl}/api/bradley/mcp`
    },
    tools: BRADLEY_MCP_TOOLS,
    resources: BRADLEY_MCP_RESOURCES,
    prompts: BRADLEY_MCP_PROMPTS,
    claudeDesktopConfig: {
      mcpServers: {
        "beginfin-bradley": {
          "url": `${baseUrl}/bradley/sse`
        }
      }
    }
  });
}
