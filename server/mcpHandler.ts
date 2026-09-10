import { Request, Response } from 'express';
import crypto from 'crypto';
import { 
  BEGINFIN_UNITS, 
  BEGINFIN_ACTIVITIES, 
  PACING_SEQUENCES,
  BRAND_BOOK_DATA,
  INTERACTIVE_TOOLS_DATA,
  CurriculumUnitSummary,
  ActivityDefinition 
} from './mcpData';
import { modules } from '../data/courseData';

// ============================================================================
// BeginFin All-Purpose Model Context Protocol (MCP) Server
// Combining Student Personal Finance Tutoring & Educator Curriculum Planning
// 100% Free Open Educational Resource ($0 Cost to BeginFin & Users)
// ============================================================================

export const MCP_SERVER_INFO = {
  name: 'beginfin-mcp',
  version: '2.0.0',
  protocolVersion: '2024-11-05',
  description: "Official All-Purpose Model Context Protocol (MCP) server for BeginFin (https://begin-fin.com). Combines Bradley personal finance tutoring, real-time paycheck tax and 50/30/20 budget calculations, interactive quizzes, and standards-aligned classroom lesson planning for students, educators, and AI assistants. 100% Free Open Educational Resource ($0 Cost).",
  homepage: 'https://begin-fin.com/mcp',
  documentation: 'https://begin-fin.com/mcp'
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
// Unified MCP Tools (All Student & Educator Capabilities Combined)
// ----------------------------------------------------------------------------
export const MCP_TOOLS = [
  // --- Student & Personal Finance Tools ---
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
  },

  // --- Educator & Curriculum Planning Tools ---
  {
    name: 'get_curriculum',
    description: 'Get the complete BeginFin 9-unit personal finance curriculum overview, learning outcomes, and national standards alignment.',
    inputSchema: {
      type: 'object',
      properties: {
        language: {
          type: 'string',
          enum: ['en', 'es', 'zh', 'vi'],
          description: 'Language for unit titles and summaries. Defaults to "en".'
        }
      }
    }
  },
  {
    name: 'get_unit_details',
    description: 'Get detailed information for a specific BeginFin unit (1-9), including full text content, specific student learning outcomes, essential vocabulary, key concepts, and corresponding BeginFin platform actions on begin-fin.com.',
    inputSchema: {
      type: 'object',
      properties: {
        unit_id: {
          type: 'string',
          description: 'Unit identifier (e.g. "1", "2", "m1", "m2" or topic name like "budgeting", "taxes", "investing", "credit", "retirement", "filing", "insurance", "consumer_rights", "medical")'
        }
      },
      required: ['unit_id']
    }
  },
  {
    name: 'generate_lesson_plan',
    description: 'Generate a classroom-ready personal finance lesson plan grounded in the BeginFin curriculum, paired with a concrete BeginFin platform action, real-world hook, hands-on activity, check for understanding, and pacing.',
    inputSchema: {
      type: 'object',
      properties: {
        topic_or_unit: {
          type: 'string',
          description: 'Unit number (1-9) or personal finance topic (e.g., "Unit 4", "credit cards", "50/30/20 budget", "W-4 form")'
        },
        duration_minutes: {
          type: 'number',
          description: 'Class duration in minutes (e.g. 45, 60, 90). Default 45.'
        },
        grade_level: {
          type: 'string',
          description: 'Target audience (e.g. "High School (9-12)", "Early College", "Middle School Intro"). Default "High School".'
        },
        activity_type: {
          type: 'string',
          enum: ['simulation', 'game', 'debate', 'calculation', 'reflection', 'any'],
          description: 'Preferred classroom activity style. Default "any".'
        },
        custom_context: {
          type: 'string',
          description: 'Optional specific classroom scenario, local context, student background, or school scheduling notes.'
        }
      },
      required: ['topic_or_unit']
    }
  },
  {
    name: 'suggest_activities',
    description: 'Get classroom activities (simulations, games, debates, calculations, reflections) from the BeginFin Activity Library tailored to specific units or topics.',
    inputSchema: {
      type: 'object',
      properties: {
        unit_id: {
          type: 'string',
          description: 'Optional unit ID (1-9 or m1-m9) to filter activities.'
        },
        category: {
          type: 'string',
          enum: ['all', 'simulation', 'game', 'debate', 'calculation', 'reflection'],
          description: 'Category of activity. Default "all".'
        }
      }
    }
  },
  {
    name: 'get_interactive_tools',
    description: 'Get details on the BeginFin Wage and Living Cost Simulator (https://begin-fin.com/tools), which calculates take-home pay, federal/state taxes, FICA withholdings, and balances real-world living expenses.',
    inputSchema: {
      type: 'object',
      properties: {
        tool_id: {
          type: 'string',
          description: 'Optional identifier (e.g. "wage-living-cost-simulator").'
        }
      }
    }
  },
  {
    name: 'get_pacing_guide',
    description: 'Get a structured multi-week curriculum pacing guide tailored to specific teacher goals (e.g., full semester certification, first-job readiness, tax season preparation, credit readiness, or investing focus).',
    inputSchema: {
      type: 'object',
      properties: {
        goal: {
          type: 'string',
          enum: ['full_certification', 'first_job', 'tax_season', 'credit_readiness', 'investing_forward'],
          description: 'The curriculum sequencing goal.'
        },
        timeframe: {
          type: 'string',
          enum: ['semester', 'quarter', 'bootcamp_2week', 'year_long'],
          description: 'Course duration.'
        }
      }
    }
  },
  {
    name: 'get_standards_alignment',
    description: 'Get National Standards for Personal Finance Education (NSPFE) and Jump$tart Coalition standard mappings for BeginFin.',
    inputSchema: {
      type: 'object',
      properties: {
        standard_type: {
          type: 'string',
          enum: ['all', 'nspfe', 'jumpstart']
        }
      }
    }
  },
  {
    name: 'get_teacher_dashboard_guide',
    description: 'Get practical step-by-step guidance on using the BeginFin teacher dashboard at begin-fin.com (creating classrooms, Google Classroom sync, tracking student progress, issuing certs).',
    inputSchema: {
      type: 'object',
      properties: {
        feature: {
          type: 'string',
          enum: ['all', 'class_creation', 'google_classroom_sync', 'progress_tracking', 'certifications']
        }
      }
    }
  },
  {
    name: 'get_brand_info',
    description: 'Get official BeginFin Brand Book guidelines, including mission, vision, core values, founding story (Vishnu Kakarla & Kruz Smith), brand voice, terminology rules, recognitions (Texas Governor commendation, City of Temple/Belton proclamations), and color palette.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          enum: ['all', 'story', 'mission_values', 'voice_tone', 'visual_identity', 'recognitions', 'privacy'],
          description: 'Specific brand topic to retrieve. Defaults to "all".'
        }
      }
    }
  }
];

// ----------------------------------------------------------------------------
// Unified MCP Resources
// ----------------------------------------------------------------------------
export const MCP_RESOURCES = [
  {
    uri: 'beginfin://curriculum/all',
    name: 'BeginFin Complete Curriculum',
    description: 'Overview of all 9 BeginFin personal finance units with descriptions and outcomes',
    mimeType: 'text/markdown'
  },
  {
    uri: 'beginfin://activities/library',
    name: 'BeginFin Activity Library',
    description: 'Comprehensive classroom activities library including simulations, games, and debates',
    mimeType: 'text/markdown'
  },
  {
    uri: 'beginfin://tools/interactive',
    name: 'BeginFin Wage and Living Cost Simulator',
    description: 'Documentation for the BeginFin Wage and Living Cost Simulator at begin-fin.com/tools',
    mimeType: 'text/markdown'
  },
  {
    uri: 'beginfin://brand/guidelines',
    name: 'BeginFin Brand Book & Voice Guidelines',
    description: 'Official mission, vision, core values, brand voice, terminology rules, and founders story',
    mimeType: 'text/markdown'
  },
  {
    uri: 'beginfin://pacing/guides',
    name: 'BeginFin Pacing Sequences',
    description: 'Goal-based semester, quarter, and boot camp pacing guides',
    mimeType: 'text/markdown'
  },
  {
    uri: 'beginfin://standards/nspfe',
    name: 'NSPFE National Standards Alignment',
    description: 'Mapping of BeginFin units to the National Standards for Personal Finance Education',
    mimeType: 'text/markdown'
  },
  {
    uri: 'beginfin://docs/skill-prompt',
    name: 'BeginFin System Prompt & Pedagogical Instructions',
    description: 'Complete system guidelines and pedagogical rules for BeginFin AI assistants',
    mimeType: 'text/markdown'
  },
  {
    uri: 'beginfin://bradley/system-instruction',
    name: 'Bradley System Instructions & Persona',
    mimeType: 'text/markdown',
    description: "Official persona, voice guidelines, non-advisory boundaries, and core tenets for Bradley AI Tutor."
  },
  {
    uri: 'beginfin://bradley/curriculum-reference',
    name: 'BeginFin 9-Unit Curriculum Reference',
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
// Unified MCP Prompts
// ----------------------------------------------------------------------------
export const MCP_PROMPTS = [
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
  },
  {
    name: 'plan_lesson',
    description: 'Generate an interactive, classroom-ready personal finance lesson plan for high school or college students.',
    arguments: [
      { name: 'topic_or_unit', description: 'Unit number (1-9) or topic name (e.g. "Unit 4", "credit cards", "budgeting")', required: true },
      { name: 'duration_minutes', description: 'Duration of the class period in minutes (e.g. 45, 60, 90)', required: false },
      { name: 'activity_type', description: 'Preferred activity style (simulation, game, debate, calculation, reflection)', required: false }
    ]
  },
  {
    name: 'pacing_semester',
    description: 'Create a customized semester or quarter pacing sequence for a personal finance course.',
    arguments: [
      { name: 'goal', description: 'Primary goal: full_certification, first_job, tax_season, credit_readiness, investing_forward', required: true },
      { name: 'weeks', description: 'Number of weeks available (e.g. 4, 9, 18)', required: false }
    ]
  },
  {
    name: 'differentiate_activity',
    description: 'Generate scaffolding and extension modifications for a specific BeginFin activity or topic.',
    arguments: [
      { name: 'unit_id', description: 'Unit identifier (1-9 or m1-m9)', required: true },
      { name: 'learning_need', description: 'Specific learning modification required (e.g. ESL support, advanced math, time crunch)', required: false }
    ]
  }
];

function resolveUnit(unitInput: string | number | undefined): CurriculumUnitSummary | null {
  if (!unitInput) return null;
  const str = String(unitInput).toLowerCase().trim();
  
  // Try matching by id (m1..m9)
  const byId = BEGINFIN_UNITS.find(u => u.id === str);
  if (byId) return byId;

  // Try matching by number (1..9)
  const num = parseInt(str.replace(/[^0-9]/g, ''), 10);
  if (!isNaN(num) && num >= 1 && num <= 9) {
    const byNum = BEGINFIN_UNITS.find(u => u.unitNumber === num);
    if (byNum) return byNum;
  }

  // Try matching by topic keywords
  if (str.includes('budget') || str.includes('50/30/20') || str.includes('bank') || str.includes('scarcity') || str.includes('net worth')) {
    return BEGINFIN_UNITS[0]; // Unit 1
  }
  if (str.includes('paycheck') || str.includes('w-2') || str.includes('w-4') || str.includes('fica') || str.includes('gross') || str.includes('job')) {
    return BEGINFIN_UNITS[1]; // Unit 2
  }
  if (str.includes('invest') || str.includes('stock') || str.includes('bond') || str.includes('etf') || str.includes('compound') || str.includes('index')) {
    return BEGINFIN_UNITS[2]; // Unit 3
  }
  if (str.includes('credit') || str.includes('debt') || str.includes('fico') || str.includes('avalanche') || str.includes('snowball') || str.includes('apr')) {
    return BEGINFIN_UNITS[3]; // Unit 4
  }
  if (str.includes('retire') || str.includes('401k') || str.includes('ira') || str.includes('roth') || str.includes('match')) {
    return BEGINFIN_UNITS[4]; // Unit 5
  }
  if (str.includes('filing') || str.includes('1040') || str.includes('tax roadmap') || str.includes('vita') || str.includes('deduction')) {
    return BEGINFIN_UNITS[5]; // Unit 6
  }
  if (str.includes('insurance') || str.includes('risk') || str.includes('emergency') || str.includes('deductible') || str.includes('premium')) {
    return BEGINFIN_UNITS[6]; // Unit 7
  }
  if (str.includes('consumer') || str.includes('fcra') || str.includes('freeze') || str.includes('phishing') || str.includes('charit') || str.includes('philanth')) {
    return BEGINFIN_UNITS[7]; // Unit 8
  }
  if (str.includes('medic') || str.includes('health') || str.includes('eob') || str.includes('no surprises') || str.includes('hsa') || str.includes('hospital')) {
    return BEGINFIN_UNITS[8]; // Unit 9
  }

  return null;
}

// ----------------------------------------------------------------------------
// Unified Tool Execution Handler
// ----------------------------------------------------------------------------
export async function executeMcpTool(name: string, args: Record<string, any> = {}): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    switch (name) {
      // --- Student & Personal Finance Tools ---
      case 'ask_bradley': {
        const question = (args.question || '').trim();
        const unitFocus = args.unit_focus ? Number(args.unit_focus) : null;

        let matchedUnit: CurriculumUnitSummary | undefined;
        if (unitFocus && unitFocus >= 1 && unitFocus <= 9) {
          matchedUnit = BEGINFIN_UNITS.find(u => u.unitNumber === unitFocus);
        } else {
          matchedUnit = resolveUnit(question) || undefined;
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

        const ssRate = 0.062;
        const medRate = 0.0145;
        const ficaRate = ssRate + medRate; // 7.65%
        const annualFica = annualGross * ficaRate;
        const monthlyFica = annualFica / 12;

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

        const estimatedStateTaxRate = 0.035;
        const monthlyStateTax = monthlyGross * estimatedStateTaxRate;

        const totalMonthlyDeductions = monthlyFica + monthlyFedTax + monthlyStateTax;
        const monthlyTakeHome = Math.max(0, monthlyGross - totalMonthlyDeductions);
        const effectiveTakeHomePercentage = monthlyGross > 0 ? (monthlyTakeHome / monthlyGross) * 100 : 0;

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

      // --- Educator & Curriculum Planning Tools ---
      case 'get_curriculum': {
        const lines: string[] = [
          `# BeginFin Personal Finance Curriculum (National Standards / NSPFE Aligned)\n`,
          `BeginFin is a 100% free, open-source personal finance education platform designed for high school and early college learners. It features 9 comprehensive units, interactive browser simulators, and a built-in teacher dashboard at https://begin-fin.com.\n`,
          `## Units Overview:\n`
        ];

        BEGINFIN_UNITS.forEach(u => {
          lines.push(`### Unit ${u.unitNumber}: ${u.title}`);
          lines.push(`${u.description}`);
          lines.push(`**Key Learning Outcomes:**`);
          u.outcomes.forEach(o => lines.push(`- ${o}`));
          lines.push(`**Platform Action on begin-fin.com:** ${u.platformAction}\n`);
        });

        lines.push(`\n**Certification:** Completing all 9 units qualifies students for the downloadable BeginFin Certificate and verified digital badge.`);

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'get_unit_details': {
        const unit = resolveUnit(args.unit_id);
        if (!unit) {
          return {
            content: [{ type: 'text', text: `Unit "${args.unit_id}" not found. Please provide a unit number 1 through 9 or a topic name (e.g., 'budgeting', 'taxes', 'credit', 'investing').` }],
            isError: true
          };
        }

        const rawMod = modules.find(m => m.id === unit.id);
        const textContent = rawMod?.translations?.en?.content || '';

        const lines: string[] = [
          `# Unit ${unit.unitNumber}: ${unit.title}`,
          `**Description:** ${unit.description}`,
          `**Suggested Duration:** ${unit.suggestedDurationMinutes} minutes`,
          `**National Standards:** ${unit.standardCodes.join(', ')}\n`,
          `## Specific Student Learning Outcomes (Students will be able to):`,
          ...unit.outcomes.map(o => `- ${o}`),
          `\n## Essential Vocabulary:`,
          ...unit.vocabulary.map(v => `- **${v}**`),
          `\n## Concrete BeginFin Platform Action (What to do on begin-fin.com):`,
          `> ${unit.platformAction}`,
          `\n## Core Lesson Content Reference:`,
          textContent.replace(/\*\*/g, '').trim(),
          `\n## Check for Understanding Quiz Questions:`,
          ...(rawMod?.translations?.en?.quiz || []).map((q, i) => `${i + 1}. **${q.question}**\n   Options: ${q.options.join(' | ')}`)
        ];

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'generate_lesson_plan': {
        const topicOrUnit = args.topic_or_unit || 'budgeting';
        const unit = resolveUnit(topicOrUnit) || BEGINFIN_UNITS[0];
        const duration = Number(args.duration_minutes) || 45;
        const gradeLevel = args.grade_level || 'High School (9-12)';
        const activityType = args.activity_type || 'any';

        // Select suitable activity
        let matchingActivity = BEGINFIN_ACTIVITIES.find(a => 
          a.unitNumber === unit.unitNumber && 
          (activityType === 'any' || a.category === activityType)
        );
        if (!matchingActivity) {
          matchingActivity = BEGINFIN_ACTIVITIES.find(a => a.unitNumber === unit.unitNumber) || BEGINFIN_ACTIVITIES[0];
        }

        // Compute pacing segments based on duration
        const hookTime = Math.round(duration * 0.15); // ~7 mins on 45m
        const directTime = Math.round(duration * 0.30); // ~15 mins on 45m
        const activeTime = Math.round(duration * 0.40); // ~18 mins on 45m
        const debriefTime = duration - hookTime - directTime - activeTime; // ~5 mins

        const plan: string[] = [
          `# Classroom Lesson Plan: ${unit.title}`,
          `**Grade Level:** ${gradeLevel} | **Duration:** ${duration} minutes | **Unit:** Unit ${unit.unitNumber}`,
          `**Curriculum Framework:** National Standards for Personal Finance Education (NSPFE: ${unit.standardCodes.join(', ')})`,
          `**Platform Integration:** begin-fin.com (100% Free Open Educational Resource)\n`,
          `## 1. Student Learning Objectives`,
          `By the end of this lesson, students will be able to:`,
          ...unit.outcomes.slice(0, 3).map(o => `- ${o}`),
          `- Apply these concepts directly using the BeginFin learning portal.`,
          `\n## 2. Essential Vocabulary`,
          ...unit.vocabulary.map(v => `- **${v}**`),
          `\n## 3. Lesson Sequence & Pacing Guide (${duration} Minutes Total)\n`,
          `### Phase 1: Real-World Hook (${hookTime} mins)`,
          `- **Teacher Action:** Prompt students with an authentic dilemma: *"Imagine your first job pays $18/hour for 40 hours. Why isn't your bi-weekly paycheck $1,440?"* or *"If you had to pay rent tomorrow in Austin vs. Cleveland, what happens to your grocery budget?"*`,
          `- **Student Action:** Think-Pair-Share with a desk partner for 2 minutes, logging initial guesses.`,
          `\n### Phase 2: Direct Instruction & Concept Modeling (${directTime} mins)`,
          `- **Key Principles to Cover:** ${unit.description}`,
          `- Walk through the foundational formulas and definitions on the whiteboard.`,
          `- Showcase the lesson on BeginFin: display Unit ${unit.unitNumber} on the classroom screen.`,
          `\n### Phase 3: Collaborative Hands-On Activity (${activeTime} mins)`,
          `- **Activity Title:** ${matchingActivity.title} (${matchingActivity.category.toUpperCase()})`,
          `- **Description:** ${matchingActivity.description}`,
          `- **Step-by-Step Instructions:**`,
          ...matchingActivity.stepByStep.map(s => `  1. ${s}`),
          `\n### Phase 4: BeginFin Platform Action (Student Independent Practice)`,
          `> Have students log into **begin-fin.com/app** or open Guest Mode.`,
          `> Direct them to: **${unit.platformAction}**`,
          `> Students complete the interactive checkpoints and review the 4-question mastery quiz.`,
          `\n### Phase 5: Formative Check for Understanding & Exit Ticket (${debriefTime} mins)`,
          `- **Sample Check Question:** *${unit.vocabulary[0] || 'Key term'}: How would you explain this in your own words to a friend starting their first job?*`,
          `- Exit Ticket: Students write 1 "Need" vs 1 "Want" or calculate one scenario before leaving.`
        ];

        return {
          content: [{ type: 'text', text: plan.join('\n') }]
        };
      }

      case 'suggest_activities': {
        let list = BEGINFIN_ACTIVITIES;
        if (args.unit_id) {
          const u = resolveUnit(args.unit_id);
          if (u) {
            list = list.filter(a => a.unitNumber === u.unitNumber);
          }
        }
        if (args.category && args.category !== 'all') {
          list = list.filter(a => a.category === args.category);
        }

        const lines: string[] = [
          `# BeginFin Classroom Activities (${list.length} available)\n`
        ];

        list.forEach(a => {
          lines.push(`### [Unit ${a.unitNumber}] ${a.title} (${a.category})`);
          lines.push(`- **Estimated Time:** ${a.durationMinutes} minutes`);
          lines.push(`- **Materials:** ${a.materialsNeeded.join(', ')}`);
          lines.push(`- **Description:** ${a.description}`);
          lines.push(`- **Classroom Steps:**`);
          a.stepByStep.forEach(s => lines.push(`  * ${s}`));
          lines.push('');
        });

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'get_interactive_tools': {
        const lines: string[] = [
          `# BeginFin Interactive Simulators & Tools (https://begin-fin.com/tools)\n`
        ];

        INTERACTIVE_TOOLS_DATA.forEach(tool => {
          lines.push(`### ${tool.name}`);
          lines.push(`- **URL:** ${tool.url}`);
          lines.push(`- **Unit Alignment:** ${tool.unitAlignment}`);
          lines.push(`- **Educational Objective:** ${tool.educationalObjective}`);
          lines.push(`- **Description:** ${tool.description}\n`);
        });

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'get_pacing_guide': {
        const goalKey = (args.goal || 'full_certification') as keyof typeof PACING_SEQUENCES;
        const guide = PACING_SEQUENCES[goalKey] || PACING_SEQUENCES.full_certification;

        const lines: string[] = [
          `# BeginFin Curriculum Pacing Guide: ${guide.title}`,
          `**Recommended Timeframe:** ${guide.recommendedWeeks} weeks`,
          `**Description:** ${guide.description}\n`,
          `## Sequence of Units:`,
          ...guide.sequence.map((unitId, idx) => `- **Week ${idx + 1}:** Unit ${unitId.toUpperCase()}`),
          `\n**Teacher Dashboard Milestone:** ${guide.teacherDashboardMilestone}`,
          `\n**Culminating Project:** Students log into begin-fin.com, pass all unit quizzes with 100% completion, and generate their official BeginFin Personal Finance Certificate.`
        ];

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'get_standards_alignment': {
        const lines: string[] = [
          `# National Standards for Personal Finance Education (NSPFE) & Jump$tart Alignment\n`,
          `BeginFin is vetted and indexed in the **Jump$tart Coalition Clearinghouse** for Personal Finance Education and maps to the 6 core standard domains:\n`,
          `1. **Earning Income:** Unit 2 (Job Finance & USA Taxes), Unit 6 (Filing Taxes Roadmap)`,
          `2. **Spending:** Unit 1 (Personal Finance Fundamentals, 50/30/20 Budgeting), Unit 8 (Consumer Rights)`,
          `3. **Saving:** Unit 1 (Banking, HYSA, FDIC/NCUA Insurance, Compound Growth)`,
          `4. **Investing:** Unit 3 (Investing Basics, Index Funds, ETFs, Dollar-Cost Averaging), Unit 5 (Retirement Accounts 401k/IRA)`,
          `5. **Managing Credit:** Unit 4 (Debt & Credit Mastery, FICO Score, Avalanche vs Snowball)`,
          `6. **Managing Risk:** Unit 7 (Insurance & Risk Management), Unit 9 (Medical Finances & No Surprises Act)\n`,
          `Every unit includes measurable student performance outcomes, essential vocabulary, and interactive browser verification.`
        ];

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'get_teacher_dashboard_guide': {
        const lines: string[] = [
          `# BeginFin Teacher Dashboard Guide (begin-fin.com/app)\n`,
          `Teachers have access to a completely free, ad-free classroom portal:\n`,
          `### 1. Classroom Setup & Join Codes`,
          `- Sign in as a Teacher at begin-fin.com.`,
          `- Click 'Create Classroom' to generate an instant 6-character classroom invite code (e.g. \`FIN-101\`).`,
          `- Students enter this code in their dashboard to automatically link to your gradebook.\n`,
          `### 2. Google Classroom Integration`,
          `- One-click synchronization: import existing student rosters, schedule BeginFin assignments, and publish course links directly to Google Classroom streams.\n`,
          `### 3. Student Progress & Mastery Tracking`,
          `- Real-time student progress dashboard showing percentage completion across Units 1-9.`,
          `- View quiz scores, check-for-understanding attempts, and completion timestamps.`,
          `- Export roster grades as a CSV spreadsheet.\n`,
          `### 4. Certification & Verifiable Badges`,
          `- When students complete the 9 units, teachers can batch-verify student certificates or allow students to download their personalized PDF certificates directly.`
        ];

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'get_brand_info': {
        const topic = args.topic || 'all';
        const lines: string[] = [
          `# BeginFin Brand Book & Identity Guidelines\n`,
          `**Founders:** Vishnu Kakarla & Kruz Smith (Lake Belton High School, Temple, Texas)`,
          `**Status:** ${BRAND_BOOK_DATA.entityStatus}`,
          `**Mission:** ${BRAND_BOOK_DATA.mission}`,
          `**Vision:** ${BRAND_BOOK_DATA.vision}\n`,
          `### Core Values:`,
          ...BRAND_BOOK_DATA.coreValues.map(v => `- **${v.title}:** ${v.description}`),
          `\n### Brand Voice & Persona:`,
          `- **Voice:** ${BRAND_BOOK_DATA.brandPersona.voice}`,
          `- **Phrasing Directives:**`,
          ...BRAND_BOOK_DATA.brandPersona.phrasingRules.map(r => `  * ${r}`),
          `\n### Official Taglines:`,
          ...BRAND_BOOK_DATA.brandPersona.taglines.map(t => `  * "${t}"`),
          `\n### Color Palette:`,
          `- **BeginFin Iris Pulse:** #7F7FFA (Primary brand purple-blue)`,
          `- **BeginFin Slate Gray:** #3C3C3C (High-contrast typography)`,
          `- **BeginFin Glacial White:** #F4F8FA (Clean background canvas)`,
          `\n### Civic Recognition:`,
          `- Gubernatorial Commendation from Texas Governor Greg Abbott`,
          `- Official Mayoral Proclamations from the City of Temple and City of Belton, Texas`,
          `- Jump$tart Coalition Clearinghouse verified listing`
        ];

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: "${name}". Available tools: ${MCP_TOOLS.map(t => t.name).join(', ')}` }],
          isError: true
        };
    }
  } catch (err: any) {
    return {
      content: [{ type: 'text', text: `Error executing tool "${name}": ${err?.message || String(err)}` }],
      isError: true
    };
  }
}

// ----------------------------------------------------------------------------
// JSON-RPC 2.0 Async Request Router
// ----------------------------------------------------------------------------
export async function handleMcpJsonRpcAsync(body: any): Promise<any> {
  const { jsonrpc = '2.0', id, method, params } = body || {};

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: {
          protocolVersion: MCP_SERVER_INFO.protocolVersion,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false }
          },
          serverInfo: {
            name: MCP_SERVER_INFO.name,
            version: MCP_SERVER_INFO.version
          },
          instructions: `You are connected to the BeginFin Model Context Protocol (MCP) server. BeginFin is an open educational resource providing personal finance education, interactive calculators, Bradley AI tutoring, and curriculum lesson planning tools.`
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
        result: { tools: MCP_TOOLS }
      };

    case 'tools/call': {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      const toolResult = await executeMcpTool(toolName, toolArgs);
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: toolResult
      };
    }

    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: { resources: MCP_RESOURCES }
      };

    case 'resources/read': {
      const uri = params?.uri;
      if (uri === 'beginfin://curriculum/all') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: BEGINFIN_UNITS.map(u => `## Unit ${u.unitNumber}: ${u.title}\n${u.description}\nOutcomes:\n${u.outcomes.map(o => `- ${o}`).join('\n')}\nPlatform Action: ${u.platformAction}`).join('\n\n')
              }
            ]
          }
        };
      }
      if (uri === 'beginfin://activities/library') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: BEGINFIN_ACTIVITIES.map(a => `[Unit ${a.unitNumber}] ${a.title} (${a.category})\n${a.description}\nSteps:\n${a.stepByStep.join('\n')}`).join('\n\n')
              }
            ]
          }
        };
      }
      if (uri === 'beginfin://pacing/guides') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: JSON.stringify(PACING_SEQUENCES, null, 2)
              }
            ]
          }
        };
      }
      if (uri === 'beginfin://tools/interactive') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: INTERACTIVE_TOOLS_DATA.map(t => `# ${t.name}\n- URL: ${t.url}\n- Unit: ${t.unitAlignment}\n- Objective: ${t.educationalObjective}\n- Description: ${t.description}`).join('\n\n')
              }
            ]
          }
        };
      }
      if (uri === 'beginfin://brand/guidelines') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: `# BeginFin Brand Book Guidelines\n\n**Founders:** Vishnu Kakarla & Kruz Smith (Lake Belton HS)\n**Status:** ${BRAND_BOOK_DATA.entityStatus}\n**Mission:** ${BRAND_BOOK_DATA.mission}\n**Vision:** ${BRAND_BOOK_DATA.vision}\n\n**Core Values:**\n${BRAND_BOOK_DATA.coreValues.map(v => `- ${v.title}: ${v.description}`).join('\n')}\n\n**Voice & Phrasing:**\n- Voice: ${BRAND_BOOK_DATA.brandPersona.voice}\n${BRAND_BOOK_DATA.brandPersona.phrasingRules.map(r => `- Rule: ${r}`).join('\n')}\n\n**Taglines:**\n${BRAND_BOOK_DATA.brandPersona.taglines.map(t => `- "${t}"`).join('\n')}\n\n**Palette:**\n- Iris Pulse: #7F7FFA\n- Slate Gray: #3C3C3C\n- Glacial White: #F4F8FA\n\n**Privacy:**\n${BRAND_BOOK_DATA.privacyNotice}`
              }
            ]
          }
        };
      }
      if (uri === 'beginfin://standards/nspfe') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: `# NSPFE National Standards Alignment\n\nBeginFin is vetted by the Jump$tart Coalition Clearinghouse and aligned with the National Standards for Personal Finance Education across Spending, Saving, Credit, Investing, Risk, and Earning.`
              }
            ]
          }
        };
      }
      if (uri === 'beginfin://docs/skill-prompt') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: `# BeginFin AI Pedagogical Prompt & System Instructions\n\nAlways act as an encouraging mentor and trusted community ally. Never sound corporate or academic. Speak with a clear, steady, judgment-free voice. Replace transactional words with "learner" and "tools". Ground all lesson plans in Units 1-9 and BeginFin interactive simulators.`
              }
            ]
          }
        };
      }
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
      if (uri === 'beginfin://bradley/glossary') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(BEGINFIN_UNITS.flatMap(u => u.vocabulary.map(v => ({ term: v, unit: u.unitNumber }))), null, 2)
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
        result: {
          prompts: MCP_PROMPTS
        }
      };

    case 'prompts/get': {
      const promptName = params?.name;
      const args = params?.arguments || {};
      if (promptName === 'ask_bradley') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            description: 'Chat directly with Bradley',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: args.user_question || 'Hi Bradley, how should I get started with budgeting my money?'
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
            description: 'Personalized 50/30/20 Budget Setup with Bradley',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Hi Bradley, my estimated monthly take-home pay is $${args.monthly_take_home_income || '2,500'}. Can you help me break down my 50% Needs, 30% Wants, and 20% Savings targets? ${args.current_expenses ? `Here are my current expenses: ${args.current_expenses}` : ''}`
                }
              }
            ]
          }
        };
      }
      if (promptName === 'evaluate_debt_payoff') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            description: 'Debt Avalanche vs Snowball Comparison with Bradley',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Hi Bradley, can you evaluate the best debt payoff strategy for these debts: ${args.debts_summary || '$2,500 credit card at 22% APR, $5,000 auto loan at 5% APR'}? Compare the Debt Avalanche vs Debt Snowball methods for me.`
                }
              }
            ]
          }
        };
      }
      if (promptName === 'decipher_paystub') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            description: 'Paycheck Paystub Breakdown with Bradley',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Hi Bradley, here are details from my paycheck: ${args.paycheck_details || '$18/hour, 40 hours worked'}. Can you explain where each deduction goes (FICA, federal withholding, state tax) and why my take-home pay is what it is?`
                }
              }
            ]
          }
        };
      }
      if (promptName === 'plan_lesson') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            description: 'BeginFin Lesson Planning Prompt',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Please plan a ${args.duration_minutes || 45}-minute interactive personal finance lesson on "${args.topic_or_unit || 'budgeting'}" using the BeginFin curriculum. Include a concrete hook, hands-on activity, check for understanding, and the exact action to take on begin-fin.com.`
                }
              }
            ]
          }
        };
      }
      if (promptName === 'pacing_semester') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            description: 'Custom Semester Pacing Guide',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Create a ${args.weeks || 18}-week personal finance pacing sequence for a high school course with the goal of "${args.goal || 'full_certification'}" using BeginFin.`
                }
              }
            ]
          }
        };
      }
      if (promptName === 'differentiate_activity') {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            description: 'Activity Scaffolding & Differentiation',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `How can I differentiate the classroom activity for Unit ${args.unit_id || 1} for students with learning need: "${args.learning_need || 'ESL support and simplified math'}"?`
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

export function handleMcpJsonRpc(body: any): any {
  const { jsonrpc = '2.0', id, method } = body || {};
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: id ?? null,
      result: {
        protocolVersion: MCP_SERVER_INFO.protocolVersion,
        capabilities: {
          tools: { listChanged: false },
          resources: { subscribe: false, listChanged: false },
          prompts: { listChanged: false }
        },
        serverInfo: {
          name: MCP_SERVER_INFO.name,
          version: MCP_SERVER_INFO.version
        },
        instructions: `You are connected to the BeginFin Model Context Protocol (MCP) server.`
      }
    };
  }
  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id: id ?? null, result: { tools: MCP_TOOLS } };
  }
  if (method === 'ping') {
    return { jsonrpc: '2.0', id: id ?? null, result: {} };
  }
  return null;
}

// -------------------------------------------------------------
// Active Session Store for Standard SSE MCP Transport
// -------------------------------------------------------------
interface McpSession {
  id: string;
  res: Response;
  createdAt: number;
  lastActive: number;
  pingTimer: NodeJS.Timeout;
}

const activeSessions = new Map<string, McpSession>();

// Periodically clean up stale sessions (> 1 hour inactive)
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeSessions.entries()) {
    if (now - session.lastActive > 3600000) {
      clearInterval(session.pingTimer);
      try {
        session.res.end();
      } catch (e) {}
      activeSessions.delete(id);
    }
  }
}, 60000);

export function handleMcpSseConnection(req: Request, res: Response) {
  const sessionId = crypto.randomUUID();

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');
  res.setHeader('X-Accel-Buffering', 'no');

  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }

  const host = req.get('host') || 'begin-fin.com';
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const baseUrl = `${proto}://${host}`;

  const messageEndpoint = `${baseUrl}/messages?sessionId=${sessionId}`;

  res.write(`event: endpoint\r\ndata: ${messageEndpoint}\r\n\r\n`);

  const pingTimer = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (e) {
      clearInterval(pingTimer);
    }
  }, 25000);

  const session: McpSession = {
    id: sessionId,
    res,
    createdAt: Date.now(),
    lastActive: Date.now(),
    pingTimer
  };
  activeSessions.set(sessionId, session);

  req.on('close', () => {
    clearInterval(pingTimer);
    activeSessions.delete(sessionId);
  });
}

export async function handleMcpMessagePost(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Expose-Headers', '*');

  const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);
  const session = sessionId ? activeSessions.get(sessionId) : undefined;

  if (session) {
    session.lastActive = Date.now();
  }

  const body = req.body;
  if (!body) {
    return res.status(400).json({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error: Empty request body' } });
  }

  if (Array.isArray(body)) {
    const responses = [];
    for (const item of body) {
      const resp = await handleMcpJsonRpcAsync(item);
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

  const response = await handleMcpJsonRpcAsync(body);

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

export async function handleMcpDirectPost(req: Request, res: Response) {
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
      const resp = await handleMcpJsonRpcAsync(item);
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

  const response = await handleMcpJsonRpcAsync(body);
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

export function handleMcpManifest(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const host = req.get('host') || 'begin-fin.com';
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const baseUrl = `${proto}://${host}`;

  return res.json({
    name: MCP_SERVER_INFO.name,
    version: MCP_SERVER_INFO.version,
    description: MCP_SERVER_INFO.description,
    protocol: 'mcp',
    protocolVersion: MCP_SERVER_INFO.protocolVersion,
    cost: '$0.00 (100% Free Open Educational Resource)',
    endpoints: {
      sse: `${baseUrl}/sse`,
      messages: `${baseUrl}/messages`,
      http: `${baseUrl}/mcp`,
      apiMcp: `${baseUrl}/api/mcp`
    },
    tools: MCP_TOOLS,
    resources: MCP_RESOURCES,
    prompts: MCP_PROMPTS,
    claudeDesktopConfig: {
      mcpServers: {
        "beginfin": {
          "url": `${baseUrl}/sse`
        }
      }
    }
  });
}
