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

export const MCP_SERVER_INFO = {
  name: 'beginfin-lesson-planner',
  version: '1.1.0',
  protocolVersion: '2024-11-05',
  description: "Live Model Context Protocol (MCP) server for BeginFin — a 100% free, student-led open educational resource aligned to the National Standards for Personal Finance Education (NSPFE). Empowers educators and AI agents with 9 comprehensive units, interactive simulators, lesson planning tools, and official brand guidelines.",
  homepage: 'https://begin-fin.com/mcp',
  documentation: 'https://begin-fin.com/mcp'
};

export const MCP_TOOLS = [
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
    name: 'BeginFin Lesson Planner System Instructions',
    description: 'Complete system guidelines and pedagogical rules for teacher-facing AI assistants',
    mimeType: 'text/markdown'
  }
];

export const MCP_PROMPTS = [
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

export async function executeMcpTool(name: string, args: Record<string, any> = {}): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  try {
    switch (name) {
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
        const unit = resolveUnit(args.topic_or_unit) || BEGINFIN_UNITS[0];
        const duration = Number(args.duration_minutes) || 45;
        const gradeLevel = args.grade_level || 'High School (Grades 9-12)';
        const actType = args.activity_type || 'any';
        const context = args.custom_context ? `\n**Classroom Context / Notes:** ${args.custom_context}\n` : '';

        // Find relevant activity
        let activity = BEGINFIN_ACTIVITIES.find(a => a.unitId === unit.id);
        if (actType !== 'any') {
          const matchingType = BEGINFIN_ACTIVITIES.find(a => a.unitId === unit.id && a.category === actType);
          if (matchingType) activity = matchingType;
        }
        if (!activity) {
          activity = BEGINFIN_ACTIVITIES[0];
        }

        const hookTime = Math.min(10, Math.round(duration * 0.15));
        const contentTime = Math.round(duration * 0.35);
        const activityTime = Math.round(duration * 0.35);
        const exitTime = duration - hookTime - contentTime - activityTime;

        const plan: string[] = [
          `# Classroom Lesson Plan: ${unit.title}`,
          `**Grade Level:** ${gradeLevel} | **Duration:** ${duration} minutes | **Target Unit:** BeginFin Unit ${unit.unitNumber}`,
          context,
          `## 1. BeginFin Tie-In & Platform Action`,
          `- **Curriculum Mapping:** Aligned to **BeginFin Unit ${unit.unitNumber}: ${unit.title}**`,
          `- **Primary Learning Outcome:** ${unit.outcomes[0]}`,
          `- **Concrete Teacher Action on begin-fin.com:** ${unit.platformAction}`,
          `- **Student Pre-Work/Homework:** Have students log into https://begin-fin.com with Google SSO and complete Unit ${unit.unitNumber} interactive reading and 4-question check before class.\n`,
          `## 2. Real-World Hook (${hookTime} mins)`,
          `Start class with a high-stakes, concrete scenario before introducing formal terminology:`,
          `*Scenario:* Distribute a real redacted document or decision scenario (e.g. "You just landed your first job at $22/hour and earned $880 this week. When you check your direct deposit, you only see $675 in your account. Where did the other $205 go?")`,
          `*Think-Pair-Share:* Have students discuss with a partner for 2 minutes what happened to the missing funds before introducing Gross vs. Net pay.\n`,
          `## 3. Core Direct Instruction (${contentTime} mins)`,
          `Explain the key principles using the BeginFin curriculum framework:`,
          ...unit.outcomes.slice(0, 3).map((o, idx) => `  ${idx + 1}. **Concept:** ${o}`),
          `\n**Key Vocabulary Covered:** ${unit.vocabulary.slice(0, 4).join(', ')}\n`,
          `## 4. Hands-On Classroom Activity (${activityTime} mins)`,
          `### **${activity.title}** (${activity.category.toUpperCase()})`,
          `**Objective:** ${activity.description}`,
          `**Materials Needed:** ${activity.materialsNeeded.join(', ')}`,
          `\n**Step-by-Step Instructions:**`,
          ...activity.stepByStep.map((s, idx) => `  ${idx + 1}. ${s}`),
          `\n**Differentiation:**`,
          `- *Scaffolding (For learners needing extra support):* ${activity.differentiation.scaffolding}`,
          `- *Extension (For fast finishers / honors):* ${activity.differentiation.extension}\n`,
          `## 5. Check for Understanding & Exit Ticket (${exitTime} mins)`,
          `Have each student submit a 1-sentence exit response or digital poll:`,
          `*Exit Ticket Prompt:* "Explain one trade-off you had to make in today's activity, and how it impacts your net worth or monthly cash flow."\n`,
          `## 6. Next Steps & Teacher Dashboard Check`,
          `- Open the BeginFin Teacher Dashboard at https://begin-fin.com/app to view your class roster and verify 100% quiz completion on Unit ${unit.unitNumber}.`,
          `- If pacing towards full semester completion, note that passing all 9 units enables the student's official Certificate of Financial Literacy.`
        ];

        return {
          content: [{ type: 'text', text: plan.join('\n') }]
        };
      }

      case 'suggest_activities': {
        const filterUnit = args.unit_id ? resolveUnit(args.unit_id) : null;
        const category = args.category || 'all';

        let list = BEGINFIN_ACTIVITIES;
        if (filterUnit) {
          list = list.filter(a => a.unitId === filterUnit.id);
        }
        if (category !== 'all') {
          list = list.filter(a => a.category === category);
        }

        if (list.length === 0) {
          list = BEGINFIN_ACTIVITIES;
        }

        const lines: string[] = [
          `# BeginFin Classroom Activity Library\n`,
          `All activities are designed for hands-on student engagement and pair directly with BeginFin learning modules.\n`
        ];

        list.forEach(act => {
          lines.push(`### [Unit ${act.unitNumber}] ${act.title}`);
          lines.push(`- **Category:** ${act.category.toUpperCase()} | **Duration:** ${act.durationMinutes} mins`);
          lines.push(`- **Overview:** ${act.description}`);
          lines.push(`- **Materials:** ${act.materialsNeeded.join(', ')}`);
          lines.push(`- **BeginFin Link:** ${act.beginFinConnection}`);
          lines.push(`- **Scaffolding:** ${act.differentiation.scaffolding}`);
          lines.push(`- **Extension:** ${act.differentiation.extension}\n`);
        });

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'get_pacing_guide': {
        const goalKey = (args.goal || 'full_certification') as keyof typeof PACING_SEQUENCES;
        const pacing = PACING_SEQUENCES[goalKey] || PACING_SEQUENCES.full_certification;
        const timeframe = args.timeframe || 'semester';

        const lines: string[] = [
          `# BeginFin Curriculum Pacing Guide: ${pacing.title}`,
          `**Target Timeframe:** ${timeframe.toUpperCase()} | **Total Units:** ${pacing.sequence.length}`,
          `\n**Overview:** ${pacing.description}\n`,
          `## Sequence Roadmap:\n`
        ];

        pacing.sequence.forEach((unitId, idx) => {
          const u = BEGINFIN_UNITS.find(unit => unit.id === unitId);
          if (u) {
            lines.push(`### Week / Milestone ${idx + 1}: Unit ${u.unitNumber} — ${u.title}`);
            lines.push(`- **Core Focus:** ${u.description}`);
            lines.push(`- **Target Learning Outcome:** ${u.outcomes[0]}`);
            lines.push(`- **Teacher Dashboard Action:** ${u.platformAction}\n`);
          }
        });

        lines.push(`## Teacher Dashboard Milestone Integration:`);
        lines.push(`> ${pacing.teacherDashboardMilestone}`);
        lines.push(`\n**Pacing Tip:** For survey courses, budget 1-2 class periods per unit. For deep-dive experiential courses with full simulations, budget 3-4 class periods per unit.`);

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'get_standards_alignment': {
        const lines: string[] = [
          `# National Standards Alignment Matrix (NSPFE & Jump$tart Coalition)`,
          `BeginFin is vetted by the Jump$tart Coalition Clearinghouse and strictly aligned to the National Standards for Personal Finance Education (NSPFE).\n`,
          `| Unit # | Unit Title | NSPFE Standard Domain | Specific Standard Codes |`,
          `|---|---|---|---|`,
          `| 1 | Personal Finance Fundamentals | Spending & Saving | NSPFE-Spending-1, NSPFE-Saving-1, NSPFE-Saving-2 |`,
          `| 2 | Job Finance & USA Taxes | Earning Income | NSPFE-Earning-1, NSPFE-Earning-2, NSPFE-Earning-3 |`,
          `| 3 | Investing Basics | Investing | NSPFE-Investing-1, NSPFE-Investing-2, NSPFE-Investing-3 |`,
          `| 4 | Debt & Credit Mastery | Managing Credit | NSPFE-Credit-1, NSPFE-Credit-2, NSPFE-Credit-3 |`,
          `| 5 | Retirement Planning & Taxes | Saving & Investing | NSPFE-Saving-3, NSPFE-Investing-4 |`,
          `| 6 | Filing Taxes Roadmap | Earning & Spending | NSPFE-Earning-3, NSPFE-Spending-2 |`,
          `| 7 | Insurance & Risk Management | Managing Risk | NSPFE-Risk-1, NSPFE-Risk-2, NSPFE-Risk-3 |`,
          `| 8 | Consumer Rights & Philanthropy | Spending & Credit | NSPFE-Spending-3, NSPFE-Credit-4 |`,
          `| 9 | Medical Finances | Risk & Spending | NSPFE-Risk-2, NSPFE-Spending-2 |`,
          `\n**Full Compliance:** Completing all 9 units satisfies graduation requirements for states mandating standalone personal finance education.`
        ];

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'get_interactive_tools': {
        const toolId = args.tool_id ? String(args.tool_id).toLowerCase().trim() : null;
        let list = INTERACTIVE_TOOLS_DATA;
        if (toolId) {
          const match = list.filter(t => t.id === toolId || t.id.includes(toolId) || t.name.toLowerCase().includes(toolId));
          if (match.length > 0) list = match;
        }

        const lines: string[] = [
          `# BeginFin Interactive Financial Simulators & Tools (https://begin-fin.com/tools)\n`,
          `BeginFin provides a suite of 100% free, interactive browser simulators that transform abstract financial concepts into experiential learning:\n`
        ];

        list.forEach(t => {
          lines.push(`### ${t.name}`);
          lines.push(`- **Tool URL:** ${t.url}`);
          lines.push(`- **Curriculum Alignment:** ${t.unitAlignment}`);
          lines.push(`- **Description:** ${t.description}`);
          lines.push(`- **Educational Objective:** ${t.educationalObjective}\n`);
        });

        lines.push(`**Classroom Tip:** Have students run simulations before direct instruction to test their initial intuitions, then re-run them after the lesson to measure decision improvement.`);

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'get_brand_info': {
        const topic = args.topic || 'all';
        const b = BRAND_BOOK_DATA;

        const lines: string[] = [
          `# BeginFin Official Brand Guidelines & Institutional Background`,
          `**Entity Type:** ${b.entityStatus}`,
          `**Origins:** ${b.founded} | **Etymology:** ${b.portmanteau}\n`
        ];

        if (topic === 'all' || topic === 'story') {
          lines.push(`## Founders & Founding Story`);
          b.founders.forEach(f => {
            lines.push(`- **${f.name}** (${f.role}): ${f.credentials}. Contact: \`${f.email}\``);
          });
          lines.push(`\nFounded by Lake Belton High School students Vishnu Kakarla and Kruz Smith, BeginFin aims to combat the billions lost annually to avoidable debt and fees. After observing these barriers across Canada, India, and the United States, Vishnu started the platform in Dec 2025 (launched Jan 2026), later teaming up with Kruz (June 2026) to expand community outreach and interactive tools.\n`);
        }

        if (topic === 'all' || topic === 'mission_values') {
          lines.push(`## Mission & Vision`);
          lines.push(`- **Mission Statement:** ${b.mission}`);
          lines.push(`- **Vision Statement:** ${b.vision}`);
          lines.push(`\n## Core Values:`);
          b.coreValues.forEach(cv => {
            lines.push(`- **${cv.title}:** ${cv.description}`);
          });
          lines.push(``);
        }

        if (topic === 'all' || topic === 'voice_tone') {
          lines.push(`## Brand Persona & Voice`);
          lines.push(`**Voice:** ${b.brandPersona.voice}`);
          lines.push(`\n**Required Phrasing Rules:**`);
          b.brandPersona.phrasingRules.forEach(r => lines.push(`- ${r}`));
          lines.push(`\n**Official Taglines:**`);
          b.brandPersona.taglines.forEach(t => lines.push(`- "${t}"`));
          lines.push(``);
        }

        if (topic === 'all' || topic === 'visual_identity') {
          lines.push(`## Visual Identity`);
          lines.push(`- **Logo:** ${b.visualIdentity.logo}`);
          lines.push(`- **Palette:**`);
          lines.push(`  - **${b.visualIdentity.palette.irisPulse.name}:** \`${b.visualIdentity.palette.irisPulse.hex}\` (${b.visualIdentity.palette.irisPulse.role})`);
          lines.push(`  - **${b.visualIdentity.palette.slateGray.name}:** \`${b.visualIdentity.palette.slateGray.hex}\` (${b.visualIdentity.palette.slateGray.role})`);
          lines.push(`  - **${b.visualIdentity.palette.glacialWhite.name}:** \`${b.visualIdentity.palette.glacialWhite.hex}\` (${b.visualIdentity.palette.glacialWhite.role})`);
          lines.push(`- **Typography:** ${b.visualIdentity.typography}`);
          lines.push(`- **Iconography:** ${b.visualIdentity.iconography}\n`);
        }

        if (topic === 'all' || topic === 'recognitions') {
          lines.push(`## Honors, Recognitions & Milestones`);
          b.recognitionsAndMilestones.forEach(m => lines.push(`- ${m}`));
          lines.push(``);
        }

        if (topic === 'all' || topic === 'privacy') {
          lines.push(`## Privacy Notice & Data Commitment`);
          lines.push(`> ${b.privacyNotice}`);
          lines.push(``);
        }

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      case 'get_teacher_dashboard_guide': {
        const lines: string[] = [
          `# BeginFin Teacher Dashboard Guide (begin-fin.com/app)`,
          `BeginFin offers a 100% free teacher management portal with no paywall, no ads, and no student data selling.\n`,
          `## Key Capabilities:`,
          `1. **One-Click Classroom Creation:** Generate a unique 6-character class code for your class period.`,
          `2. **Google Classroom Sync:** Directly link your Google Classroom courses, publish coursework assignments to Google Classroom, and sync student grades automatically.`,
          `3. **Real-Time Gradebook & Analytics:** View per-unit quiz scores, module completion statuses, and export student records to CSV.`,
          `4. **Certification Management:** Download official PDF certificates of completion or deliver verifiable digital credentials via Certifier.io with one click.`,
          `\n## Quick Start in 3 Steps:`,
          `1. Sign in to https://begin-fin.com with your Google account.`,
          `2. Select the **Teacher** role and name your classroom.`,
          `3. Share your Class Code or Google Classroom link with students.`
        ];

        return {
          content: [{ type: 'text', text: lines.join('\n') }]
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown MCP tool: "${name}". Use "tools/list" to see available tools.` }],
          isError: true
        };
    }
  } catch (err: any) {
    return {
      content: [{ type: 'text', text: `Error executing MCP tool "${name}": ${err?.message || err}` }],
      isError: true
    };
  }
}

export async function handleMcpJsonRpcAsync(body: any): Promise<any> {
  const { jsonrpc = '2.0', id, method, params } = body || {};

  // Handle client notifications (no response needed if id is undefined)
  if (method === 'notifications/initialized' || method?.startsWith('notifications/')) {
    return id !== undefined ? { jsonrpc: '2.0', id, result: {} } : null;
  }

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: {
          protocolVersion: params?.protocolVersion || MCP_SERVER_INFO.protocolVersion,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
            logging: {}
          },
          serverInfo: {
            name: MCP_SERVER_INFO.name,
            version: MCP_SERVER_INFO.version
          },
          instructions: `You are connected to the BeginFin Model Context Protocol (MCP) server. BeginFin is a 100% free, student-led open educational resource founded in Temple, TX by Lake Belton High School students Vishnu Kakarla and Kruz Smith. We behave as an encouraging mentor and trusted community ally who removes barriers to financial education. We speak with a clear, steady, judgment-free voice translating complex financial topics into plain language that honors learners' lived experiences. We reject corporate pretense, stiff institutional language, paywalls, and trendy fintech slang. We use human-first terminology like "learners" and "tools", and choose warm, everyday phrasing like "building momentum". Ground all lesson plans, recommendations, and student guidance in named BeginFin units (Units 1 through 9), our suite of interactive simulators (Credit Score Simulator, Austin Job Simulator, Tax Roadmap, 50/30/20 Budget Calculator, Compound Interest Calculator), and concrete platform actions for teachers and learners at begin-fin.com.`
        }
      };

    case 'ping':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: {}
      };

    case 'logging/setLevel':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: {}
      };

    case 'roots/list':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: { roots: [] }
      };

    case 'completion/complete':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: {
          completion: {
            values: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7', 'Unit 8', 'Unit 9'],
            hasMore: false
          }
        }
      };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: {
          tools: MCP_TOOLS
        }
      };

    case 'tools/call': {
      const { name, arguments: args } = params || {};
      if (!name) {
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          error: { code: -32602, message: 'Missing tool name in tools/call' }
        };
      }
      const result = await executeMcpTool(name, args || {});
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result
      };
    }

    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result: {
          resources: MCP_RESOURCES
        }
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
                text: BEGINFIN_UNITS.map(u => `Unit ${u.unitNumber}: ${u.title}\n${u.description}\nOutcomes:\n${u.outcomes.map(o => `- ${o}`).join('\n')}`).join('\n\n')
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
  // Synchronous fallback for non-tools/call methods
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

  // Set standard SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.flushHeaders();

  // Determine host and protocol
  const host = req.get('host') || 'begin-fin.com';
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const endpointUrl = `${proto}://${host}/api/mcp/messages?sessionId=${sessionId}`;

  // 1. Send the MANDATORY MCP SSE endpoint event
  res.write(`event: endpoint\r\ndata: ${endpointUrl}\r\n\r\n`);

  // 2. Keep-alive ping interval to prevent proxies from terminating idle connections
  const pingTimer = setInterval(() => {
    try {
      res.write(`: ping\r\n\r\n`);
    } catch (e) {
      clearInterval(pingTimer);
      activeSessions.delete(sessionId);
    }
  }, 15000);

  const session: McpSession = {
    id: sessionId,
    res,
    createdAt: Date.now(),
    lastActive: Date.now(),
    pingTimer
  };

  activeSessions.set(sessionId, session);

  const cleanup = () => {
    clearInterval(pingTimer);
    activeSessions.delete(sessionId);
  };

  req.on('close', cleanup);
  res.on('close', cleanup);
  req.on('error', cleanup);
  res.on('error', cleanup);
}

export async function handleMcpMessagePost(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string) || req.body?.sessionId;
  const body = req.body;

  if (!body) {
    return res.status(400).json({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error: Empty request body' } });
  }

  const session = sessionId ? activeSessions.get(sessionId) : null;
  if (session) {
    session.lastActive = Date.now();
  }

  // Handle batch JSON-RPC
  if (Array.isArray(body)) {
    const responses = [];
    for (const item of body) {
      const resp = await handleMcpJsonRpcAsync(item);
      if (resp) responses.push(resp);
    }

    if (session) {
      // Dispatch responses over SSE stream
      for (const resp of responses) {
        session.res.write(`event: message\r\ndata: ${JSON.stringify(resp)}\r\n\r\n`);
      }
      return res.status(202).json({ jsonrpc: '2.0', result: { status: 'accepted', count: responses.length } });
    } else {
      return res.json(responses);
    }
  }

  // Handle single JSON-RPC
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
    endpoints: {
      sse: `${baseUrl}/sse`,
      messages: `${baseUrl}/api/mcp/messages`,
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
