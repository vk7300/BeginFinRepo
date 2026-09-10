import { modules } from '../data/courseData';

export interface CurriculumUnitSummary {
  id: string;
  unitNumber: number;
  title: string;
  description: string;
  outcomes: string[];
  vocabulary: string[];
  platformAction: string;
  standardCodes: string[];
  suggestedDurationMinutes: number;
}

export const BEGINFIN_UNITS: CurriculumUnitSummary[] = [
  {
    id: 'm1',
    unitNumber: 1,
    title: 'Personal Finance Fundamentals',
    description: 'Bank accounts, budgeting, net worth, and the 50/30/20 rule.',
    outcomes: [
      'Construct a monthly 50/30/20 budget allocating net earnings across needs, wants, and savings.',
      'Compare checking, savings, and high-yield savings accounts based on liquidity and annual percentage yield (APY).',
      'Analyze opportunity costs and scarcity principles when making daily consumption trade-offs.',
      'Verify FDIC and NCUA deposit insurance protections to secure personal liquid assets.'
    ],
    vocabulary: [
      'Scarcity',
      'Opportunity Cost',
      'Assets & Liabilities',
      'Net Worth',
      'Checking vs. Savings',
      'High-Yield Savings Account (HYSA)',
      'Annual Percentage Yield (APY)',
      'FDIC & NCUA Insurance',
      '50/30/20 Rule'
    ],
    platformAction: 'Assign Unit 1 on begin-fin.com as pre-work or in-class launch. Use the BeginFin Wage and Living Cost Simulator at begin-fin.com/tools to explore real-world budgeting and living expenses.',
    standardCodes: ['NSPFE-Spending-1', 'NSPFE-Saving-1', 'NSPFE-Saving-2'],
    suggestedDurationMinutes: 60
  },
  {
    id: 'm2',
    unitNumber: 2,
    title: 'Job Finance & USA Taxes',
    description: 'Paychecks, W-2 vs W-4, gross vs net pay, and IRS forms.',
    outcomes: [
      'Deconstruct earnings statements to evaluate gross pay, net pay, and mandatory FICA withholdings.',
      'Complete IRS Form W-4 accurately to optimize tax withholding and avoid tax penalties.',
      'Interpret Form W-2 annual summary statements and understand personal Form 1040 tax returns.',
      'Assess total compensation packages including healthcare, benefits, and employer matches.'
    ],
    vocabulary: [
      'Gross Pay vs Net Pay',
      'FICA (Social Security & Medicare)',
      'Federal & State Withholding',
      'IRS Form W-4',
      'IRS Form W-2',
      'IRS Form 1040',
      'Total Compensation'
    ],
    platformAction: 'Assign Unit 2 on begin-fin.com. Model take-home pay, federal/state taxes, and FICA withholdings using the BeginFin Wage and Living Cost Simulator at begin-fin.com/tools.',
    standardCodes: ['NSPFE-Earning-1', 'NSPFE-Earning-2', 'NSPFE-Earning-3'],
    suggestedDurationMinutes: 60
  },
  {
    id: 'm3',
    unitNumber: 3,
    title: 'Investing Basics',
    description: 'Stocks, bonds, ETFs, compound interest, and diversification.',
    outcomes: [
      'Differentiate asset classes including individual equities, fixed-income bonds, and index funds/ETFs.',
      'Calculate compound interest growth across multi-year investment horizons.',
      'Apply portfolio diversification to mitigate single-asset volatility and market risk.',
      'Align asset allocation strategies with individual risk tolerance and investment timeframes.'
    ],
    vocabulary: [
      'Equities / Stocks',
      'Bonds / Fixed Income',
      'Index Funds & ETFs',
      'Compound Growth',
      'Diversification',
      'Dollar-Cost Averaging',
      'Risk Tolerance'
    ],
    platformAction: 'Direct students to complete Unit 3 on begin-fin.com to learn stocks, bonds, index funds, and compound growth principles.',
    standardCodes: ['NSPFE-Investing-1', 'NSPFE-Investing-2', 'NSPFE-Investing-3'],
    suggestedDurationMinutes: 75
  },
  {
    id: 'm4',
    unitNumber: 4,
    title: 'Debt & Credit Mastery',
    description: 'FICO credit scores, interest rates, loan terms, and repayment strategies.',
    outcomes: [
      'Evaluate FICO score calculation factors including payment history (35%) and credit utilization (30%).',
      'Differentiate structured debt repayment strategies using the Debt Avalanche and Debt Snowball methods.',
      'Calculate the total cost of borrowing across varied APRs, loan terms, and interest structures.',
      'Navigate credit card billing cycles and revolving lines of credit to prevent fee accumulation.'
    ],
    vocabulary: [
      'FICO Score Breakdown',
      'Credit Utilization Ratio',
      'Annual Percentage Rate (APR)',
      'Amortization',
      'Debt Avalanche vs. Debt Snowball',
      'Revolving Credit vs. Installment Loans'
    ],
    platformAction: 'Assign Unit 4 on begin-fin.com to master FICO credit scoring factors, debt payoff strategies, and loan mechanics.',
    standardCodes: ['NSPFE-Credit-1', 'NSPFE-Credit-2', 'NSPFE-Credit-3'],
    suggestedDurationMinutes: 60
  },
  {
    id: 'm5',
    unitNumber: 5,
    title: 'Retirement Planning & Taxes',
    description: 'Traditional vs Roth 401(k) & IRA, employer matches, and tax optimization.',
    outcomes: [
      'Compare Traditional and Roth tax structures regarding current tax deductions and future tax-free withdrawals.',
      'Maximize employer retirement matching contributions to capture guaranteed 100% initial returns.',
      'Assess the time value of money when establishing long-term tax-deferred wealth strategies.',
      'Calculate net taxable income after applying standard deductions and tax credits.'
    ],
    vocabulary: [
      'Traditional 401(k) / IRA',
      'Roth 401(k) / IRA',
      'Employer Match (Free Money)',
      'Vesting Period',
      'Tax Deductions vs Tax Credits',
      'Standard Deduction'
    ],
    platformAction: 'Assign Unit 5 on begin-fin.com. Check student completion in the teacher gradebook before organizing the in-class Roth vs Traditional retirement debate.',
    standardCodes: ['NSPFE-Saving-3', 'NSPFE-Investing-4'],
    suggestedDurationMinutes: 60
  },
  {
    id: 'm6',
    unitNumber: 6,
    title: 'Filing Taxes Roadmap',
    description: 'A 5-step roadmap to filing a first US Federal Tax Return.',
    outcomes: [
      'Audit payroll tax withholdings and update W-4 allowances following significant life events.',
      'Collect and organize year-end tax documentation including Form W-2 and 1099 statements.',
      'Determine optimal deduction choices between the Standard Deduction and itemized expenses.',
      'Utilize free filing utilities (IRS Free File, VITA) to accurately submit federal tax returns and set up direct deposit.'
    ],
    vocabulary: [
      'Form 1040 Preparation',
      '1099-NEC / 1099-INT',
      'Standard Deduction vs Itemized',
      'IRS Free File',
      'VITA Program',
      'Direct Deposit Refund'
    ],
    platformAction: 'Guide students through the BeginFin Interactive Tax Roadmap feature at begin-fin.com/app (Tax Roadmap view) to visualize the 5-step tax return lifecycle.',
    standardCodes: ['NSPFE-Earning-3', 'NSPFE-Spending-2'],
    suggestedDurationMinutes: 60
  },
  {
    id: 'm7',
    unitNumber: 7,
    title: 'Insurance & Risk Management',
    description: 'Protecting assets with insurance, premiums, deductibles, and emergency funds.',
    outcomes: [
      'Select health, auto, renters, and life insurance policies tailored to personal liability exposures.',
      'Calculate out-of-pocket medical and property costs across premiums, deductibles, and co-pays.',
      'Establish a liquid emergency reserve covering three to six months of essential living expenses.',
      'Implement proactive risk mitigation strategies to protect accumulated net worth against catastrophic loss.'
    ],
    vocabulary: [
      'Premium',
      'Deductible',
      'Co-Pay & Out-of-Pocket Max',
      'Liability vs Collision/Comprehensive',
      'Renters Insurance',
      'Emergency Fund (3-6 Months)'
    ],
    platformAction: 'Assign Unit 7 on begin-fin.com as pre-work before running the insurance claim and policy comparison workshop.',
    standardCodes: ['NSPFE-Risk-1', 'NSPFE-Risk-2', 'NSPFE-Risk-3'],
    suggestedDurationMinutes: 60
  },
  {
    id: 'm8',
    unitNumber: 8,
    title: 'Consumer Rights & Philanthropy',
    description: 'Identity protection, FCRA rights, credit freezes, and charitable giving.',
    outcomes: [
      'Exercise legal rights under the Fair Credit Reporting Act (FCRA) to dispute credit errors.',
      'Deploy credit freeze protocols with credit bureaus (Equifax, Experian, TransUnion) to defend against identity theft.',
      'Incorporate structured charitable contributions into personal financial planning.',
      'Understand 501(c)(3) tax deductions and legal guidelines governing philanthropic giving.'
    ],
    vocabulary: [
      'Fair Credit Reporting Act (FCRA)',
      'AnnualCreditReport.com',
      'Credit Freeze vs Fraud Alert',
      'Identity Theft Mitigation',
      '501(c)(3) Non-Profits',
      'Charitable Tax Deductions'
    ],
    platformAction: 'Assign Unit 8 on begin-fin.com. Review completion rates in the BeginFin teacher dashboard before running the Scam vs Legit sorting competition.',
    standardCodes: ['NSPFE-Spending-3', 'NSPFE-Credit-4'],
    suggestedDurationMinutes: 45
  },
  {
    id: 'm9',
    unitNumber: 9,
    title: 'Medical Finances',
    description: 'Health insurance terms, reading medical bills, patient rights, and medical debt.',
    outcomes: [
      'Interpret Explanation of Benefits (EOB) statements and itemized medical billing statements.',
      'Compare HMO, PPO, HSA, and FSA health insurance plan features and tax advantages.',
      'Apply rights under the No Surprises Act to challenge out-of-network balance billing.',
      'Negotiate interest-free hospital payment plans and apply for charity care assistance.'
    ],
    vocabulary: [
      'Explanation of Benefits (EOB)',
      'Itemized Medical Bill',
      'HMO vs PPO',
      'Health Savings Account (HSA) Triple-Tax Advantage',
      'Flexible Spending Account (FSA)',
      'No Surprises Act',
      'Hospital Charity Care'
    ],
    platformAction: 'Assign Unit 9 on begin-fin.com. Completing this final unit unlocks the downloadable BeginFin Certificate and verified digital credential for all enrolled students.',
    standardCodes: ['NSPFE-Risk-2', 'NSPFE-Spending-2'],
    suggestedDurationMinutes: 60
  }
];

export interface ActivityDefinition {
  id: string;
  unitId: string;
  unitNumber: number;
  category: 'simulation' | 'game' | 'debate' | 'calculation' | 'reflection';
  title: string;
  description: string;
  durationMinutes: number;
  materialsNeeded: string[];
  stepByStep: string[];
  differentiation: {
    scaffolding: string;
    extension: string;
  };
  beginFinConnection: string;
}

export const BEGINFIN_ACTIVITIES: ActivityDefinition[] = [
  {
    id: 'act-paycheck-budget',
    unitId: 'm1',
    unitNumber: 1,
    category: 'simulation',
    title: 'Paycheck-to-Budget Simulation: The 50/30/20 Crunch',
    description: 'Students receive a realistic entry-level paycheck stub with gross pay and mandatory deductions, calculate net take-home pay, and construct a 50/30/20 budget while defending one tough trade-off.',
    durationMinutes: 30,
    materialsNeeded: ['Sample Paystub Handout', 'Budget Worksheet or BeginFin Budget Simulator', 'Calculator'],
    stepByStep: [
      'Distribute a fictional entry-level gross earnings stub ($3,200/mo gross, with FICA, federal, state taxes leaving ~$2,450 net).',
      'Students calculate their target buckets: 50% Needs ($1,225), 30% Wants ($735), 20% Savings/Debt ($490).',
      'Present 6 realistic housing, food, transportation, and subscription expense cards that exceed the Needs bucket.',
      'Students negotiate and decide which items to downgrade or cut, writing a 2-sentence economic defense using "Opportunity Cost".',
      'Debrief as a class: Have 2 students share how they solved housing vs car trade-offs.'
    ],
    differentiation: {
      scaffolding: 'Provide a pre-filled budget template with the Needs math pre-calculated so the student focuses purely on the Want allocations.',
      extension: 'Introduce a mid-activity twist: an unexpected $180 car repair expense that forces budget triage.'
    },
    beginFinConnection: 'Pairs directly with Unit 1 on begin-fin.com. Direct students to test their numbers on the Wage and Living Cost Simulator at begin-fin.com/tools.'
  },
  {
    id: 'act-w4-mock',
    unitId: 'm2',
    unitNumber: 2,
    category: 'simulation',
    title: 'Mock IRS Form W-4 Completion & Paycheck Deconstruction',
    description: 'Students fill out a real IRS Form W-4 for a fictional first job with a twist (a second job or life change), then explain their tax withholding strategy.',
    durationMinutes: 35,
    materialsNeeded: ['Printable IRS Form W-4 Form', 'Fictional Job Offer Letter'],
    stepByStep: [
      'Provide each student with a fictional job offer ($42,000/year salary) and personal profile (single, no dependents, 1 job).',
      'Guide students through Step 1 (Personal Info), Step 2 (Multiple Jobs), Step 3 (Dependents), Step 4 (Other Adjustments), and Step 5 (Sign).',
      'Introduce a scenario change: The worker picks up weekend freelance tutoring for $8,000/year. Students adjust Step 4(c) for extra withholding.',
      'Students calculate the consequence of under-withholding vs over-withholding (getting a refund vs owing penalties).',
      'Exit ticket: Explain why getting a massive $5,000 tax refund is an interest-free loan to the government.'
    ],
    differentiation: {
      scaffolding: 'Highlight the 3 primary boxes (Step 1a, 1b, Step 5) that 90% of first-time workers need.',
      extension: 'Calculate state withholding forms in addition to federal W-4.'
    },
    beginFinConnection: 'Assign Unit 2 on begin-fin.com. Have students use the Wage and Living Cost Simulator at begin-fin.com/tools to verify gross vs net calculations.'
  },
  {
    id: 'act-stock-draft',
    unitId: 'm3',
    unitNumber: 3,
    category: 'game',
    title: 'Index Fund vs Single Stock Draft & Compound Growth Race',
    description: 'Students draft a basket of historical assets (S&P 500 ETF, Government Bonds, High-flying tech stock) and model compound returns over 10, 20, and 30-year horizons.',
    durationMinutes: 40,
    materialsNeeded: ['Asset Cards', 'Compound Interest Math Sheet', 'Graph paper or digital spreadsheet'],
    stepByStep: [
      'Divide students into small teams of 3-4.',
      'Team A invests $500/month in an S&P 500 Index Fund (historical ~8% return). Team B holds 100% in a single volatile tech stock. Team C holds cash in a traditional 0.05% bank account.',
      'Compute projected wealth milestones at Age 25, 35, 45, and 65.',
      'Simulate a market correction event (-25% dip in Year 5) to observe the buffer of diversification and dollar-cost averaging.',
      'Teams reflect on why starting at Age 20 vs Age 30 creates a hundreds-of-thousands dollar gap.'
    ],
    differentiation: {
      scaffolding: 'Provide a pre-calculated compound interest chart highlighting the total balance at age 65.',
      extension: 'Factor in 2.5% annual inflation to calculate real inflation-adjusted purchasing power.'
    },
    beginFinConnection: 'Assign Unit 3 on begin-fin.com to explore compounding horizons, dollar-cost averaging, and asset diversification.'
  },
  {
    id: 'act-debt-payoff-race',
    unitId: 'm4',
    unitNumber: 4,
    category: 'simulation',
    title: 'The Great Debt Payoff Race: Avalanche vs Snowball',
    description: 'Two teams receive identical debt loads (Credit Card $4k @ 24%, Student Loan $8k @ 6%, Auto Loan $6k @ 9%). Team Avalanche attacks highest APR; Team Snowball attacks lowest balance.',
    durationMinutes: 35,
    materialsNeeded: ['Debt Ledger Sheets', 'Credit Card Statement', 'Calculator'],
    stepByStep: [
      'Present the 3 debts and a fixed repayment budget of $800/month ($450 minimums + $350 extra cash).',
      'Team 1 calculates the Avalanche schedule (extra $350 to 24% Credit Card first).',
      'Team 2 calculates the Snowball schedule (extra $350 to smallest balance first).',
      'Compare total interest paid and psychological milestone dates.',
      'Facilitate class debate: Which method is mathematically superior vs psychologically sustainable?'
    ],
    differentiation: {
      scaffolding: 'Provide step-by-step debt elimination table templates.',
      extension: 'Calculate how a single missed payment and 29.99% penalty APR alters the payoff timeline.'
    },
    beginFinConnection: 'Direct students to Unit 4 on begin-fin.com to master credit scoring factors, interest rates, and payoff strategies.'
  },
  {
    id: 'act-roth-debate',
    unitId: 'm5',
    unitNumber: 5,
    category: 'debate',
    title: 'Traditional vs Roth 401(k) & IRA Showdown',
    description: 'Students are assigned to represent either Traditional (tax break now) or Roth (tax-free withdrawals later) for different taxpayer profiles.',
    durationMinutes: 30,
    materialsNeeded: ['Tax Bracket Chart', 'Persona Profile Cards'],
    stepByStep: [
      'Introduce Persona A (21-year-old college grad earning $35,000 in the 12% tax bracket) and Persona B (48-year-old manager earning $160,000 in the 24% bracket).',
      'Traditional team prepares arguments for tax-deferred contributions.',
      'Roth team prepares arguments for tax-exempt retirement distributions.',
      '3-minute opening arguments followed by 2-minute rebuttals.',
      'Teacher reveals: For young earners in low brackets, Roth is almost always mathematically superior; employer matches always go into pre-tax accounts.'
    ],
    differentiation: {
      scaffolding: 'Give students sentence starters: "Because this worker is currently in the __% tax bracket, paying taxes now means..."',
      extension: 'Model the impact of employer 100% 401(k) matching up to 5% of salary.'
    },
    beginFinConnection: 'Assign Unit 5 on begin-fin.com as pre-work before class.'
  },
  {
    id: 'act-scam-sorting',
    unitId: 'm8',
    unitNumber: 8,
    category: 'game',
    title: 'Scam, Error, or Legit: Consumer Rights & Credit Defense',
    description: 'Rapid-fire interactive card sort where students analyze real vs fake financial solicitations, identify Fair Credit Reporting Act (FCRA) violations, and trigger credit freezes.',
    durationMinutes: 25,
    materialsNeeded: ['10 Solicitation Cards (Phishing text, credit repair ad, legitimate bureau notice, pre-approved offer)'],
    stepByStep: [
      'Teams review 10 cards and classify each as: 1) Legitimate Offer, 2) Dangerous Scam / Phishing, 3) FCRA Disputable Error.',
      'For disputable errors, students draft a 3-bullet dispute letter demanding investigation within 30 days under the FCRA.',
      'Demonstrate the exact 3-step credit freeze process across Equifax, Experian, and TransUnion.',
      'Teams tally points for correctly identified deceptive practices.'
    ],
    differentiation: {
      scaffolding: 'Highlight red flag keywords (e.g. "guaranteed score jump", "wire money", "urgent account lock").',
      extension: 'Research state-specific identity theft recovery resources.'
    },
    beginFinConnection: 'Assign Unit 8 on begin-fin.com and verify completion on the teacher dashboard.'
  },
  {
    id: 'act-medical-eob',
    unitId: 'm9',
    unitNumber: 9,
    category: 'simulation',
    title: 'Deconstructing the Hospital Bill & The No Surprises Act',
    description: 'Students analyze an itemized medical invoice and Explanation of Benefits (EOB), spot an out-of-network surprise balance bill, and negotiate an interest-free payment plan.',
    durationMinutes: 35,
    materialsNeeded: ['Redacted Hospital Bill', 'Sample Insurance EOB Statement'],
    stepByStep: [
      'Students compare the hospital billed charge ($4,200), insurance negotiated rate ($1,800), insurance paid ($1,440), and patient responsibility ($360).',
      'Identify an unlawful $900 out-of-network assistant surgeon charge.',
      'Draft a formal dispute invoking rights under the federal No Surprises Act.',
      'Role-play calling the hospital billing office to request itemized charges and apply for charity care financial hardship discounts.'
    ],
    differentiation: {
      scaffolding: 'Provide an annotated diagram pointing out "This is not a bill" and "Total Patient Responsibility".',
      extension: 'Calculate HSA triple-tax savings when paying qualified medical expenses.'
    },
    beginFinConnection: 'Assign Unit 9 on begin-fin.com. Finishing Unit 9 unlocks official student certifications.'
  }
];

export const PACING_SEQUENCES = {
  full_certification: {
    title: 'Full Certification Course (Units 1 through 9)',
    description: 'Comprehensive personal finance curriculum covering all national standards and qualifying students for the BeginFin Certificate of Financial Literacy.',
    sequence: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'],
    recommendedWeeks: 9,
    teacherDashboardMilestone: 'Track student module completions weekly on begin-fin.com. All 9 units unlocked enable one-click certificate generation and Certifier.io credential delivery.'
  },
  first_job: {
    title: 'First-Job & Career Readiness Track',
    description: 'Designed for high school seniors and CTE students entering part-time jobs, summer internships, or their first career role.',
    sequence: ['m1', 'm2', 'm7', 'm4'],
    recommendedWeeks: 4,
    teacherDashboardMilestone: 'Assign Units 1, 2, 7, and 4. Focus on paystubs, W-4 onboarding, and auto/renters insurance liability.'
  },
  tax_season: {
    title: 'Tax Season & Filing Readiness Track',
    description: 'Timed around spring tax season (Jan - April) to teach students how to file their own Form 1040 and audit their W-4.',
    sequence: ['m2', 'm6', 'm5', 'm1'],
    recommendedWeeks: 4,
    teacherDashboardMilestone: 'Have students navigate the BeginFin Tax Roadmap (begin-fin.com/app) alongside classroom W-2 analysis.'
  },
  credit_readiness: {
    title: 'Credit Mastery & Consumer Protection Track',
    description: 'Essential preparation before college or independent living to establish FICO scores safely and prevent predatory debt.',
    sequence: ['m1', 'm4', 'm8', 'm7'],
    recommendedWeeks: 4,
    teacherDashboardMilestone: 'Use the BeginFin Credit Simulator game during Unit 4 to demonstrate utilization scoring in action.'
  },
  investing_forward: {
    title: 'Investing & Long-Term Wealth Track',
    description: 'Focused on compound interest, index fund investing, retirement accounts, and risk management.',
    sequence: ['m1', 'm3', 'm5', 'm7'],
    recommendedWeeks: 4,
    teacherDashboardMilestone: 'Pair classroom stock drafts with the Compound Interest Simulator on begin-fin.com/tools.'
  }
};

export const BRAND_BOOK_DATA = {
  name: 'BeginFin',
  portmanteau: 'Derived from "Beginning Finance"',
  founded: 'December 2025 in Temple, TX (Launched January 2026)',
  entityStatus: 'Student-led open educational resource (OER). Generates zero revenue ($0). Not a registered 501(c)(3) non-profit.',
  founders: [
    {
      name: 'Vishnu Kakarla',
      role: 'Co-Founder (Strategy & Platform)',
      credentials: '2026 BPA Personal Finance Nationals qualifier, Lake Belton High School',
      email: 'vishnu@begin-fin.com'
    },
    {
      name: 'Kruz Smith',
      role: 'Co-Founder (Curriculum & Outreach)',
      credentials: '2025-26 Lake Belton High School NHS Chapter Treasurer (Joined June 2026)',
      email: 'kruz@begin-fin.com'
    }
  ],
  mission: 'To eliminate barriers to economic opportunity by providing every individual with free, open access financial education and the credentials they need to build lasting financial confidence.',
  vision: 'A world where financial education is a universal right, not a luxury, enabling every individual to navigate their economic future with dignity and confidence.',
  coreValues: [
    {
      title: 'Open Access',
      description: 'Education belongs to the community, not behind a paywall. 100% free open educational resource with zero ads, zero paywalls, and zero hidden fees.'
    },
    {
      title: 'Trust & Privacy',
      description: 'Strict data-minimization framework. We never monetize or sell user data, offer a seamless Guest Mode, and do not track or log user sessions.'
    },
    {
      title: 'Learners First',
      description: 'Intuitive, deeply practical, and engaging tools, modules, and quizzes designed to simplify the financial journey.'
    },
    {
      title: 'Accountability',
      description: 'We answer directly to our learners, not to investors or corporate stakeholders.'
    },
    {
      title: 'Impact-Driven',
      description: 'Guided entirely by public good and genuine empowerment rather than commercial interests.'
    }
  ],
  brandPersona: {
    voice: 'Encouraging mentor and trusted community ally. Clear, steady, and judgment-free voice translating complex financial topics into plain language that honors learners\' lived experiences.',
    phrasingRules: [
      'Use "learner" instead of transactional terms like "customer" or "user".',
      'Use "tools" instead of corporate terms like "solution" or "product".',
      'Choose warm, everyday phrasing like "building momentum" over trendy fintech hustle slang.',
      'Avoid dry academic jargon, legalisms, and extreme/unverifiable claims.'
    ],
    taglines: [
      'Financial confidence starts here.',
      'Jumpstart your financial confidence, for free.',
      'Financial education shouldn’t be a luxury.',
      'Learn financial literacy. Prove it to the world.',
      'Removing barriers to economic freedom.',
      'Bite-sized lessons. Massive confidence.',
      'Make the cents make sense, for free.'
    ]
  },
  visualIdentity: {
    palette: {
      irisPulse: { name: 'BeginFin Iris Pulse', hex: '#7F7FFA', role: 'Primary Brand Accent & Gradients' },
      slateGray: { name: 'BeginFin Slate Gray', hex: '#3C3C3C', role: 'Typography & Structural Contrast' },
      glacialWhite: { name: 'BeginFin Glacial White', hex: '#F4F8FA', role: 'Background Canvas & Elevated Surfaces' }
    },
    typography: 'Inter (Bold, Regular, Italicized, Light)',
    iconography: 'Lucide open-source library',
    logo: 'Bold, italicized dollar sign in Inter typeface against layered gradients of BeginFin Iris Pulse (#7F7FFA).'
  },
  recognitionsAndMilestones: [
    '10,000+ unique visitors across 25+ countries.',
    'Gubernatorial Commendation from Governor Greg Abbott (State of Texas).',
    'Mayoral Proclamations from the City of Temple, TX and City of Belton, TX.',
    'Vetted and listed in the Jump$tart Coalition Clearinghouse directory for the National Standards for Personal Finance Education (NSPFE).',
    'Licensed by the College Board to use their AP® trademark for upcoming AP Business with Personal Finance resources (not endorsed by the College Board).'
  ],
  privacyNotice: 'As a bootstrapped student-led resource with limited resources, BeginFin cannot guarantee compliance with FERPA, COPPA, or SOC2. BeginFin guarantees that no user data is sold, sessions are not tracked, and learners retain full data control via Guest Mode.'
};

export const INTERACTIVE_TOOLS_DATA = [
  {
    id: 'wage-living-cost-simulator',
    name: 'Wage and Living Cost Simulator',
    url: 'https://begin-fin.com/tools',
    unitAlignment: 'Unit 1 (Personal Finance Fundamentals) & Unit 2 (Job Finance & USA Taxes)',
    description: 'Calculates take-home pay, federal income taxes, FICA (Social Security & Medicare) withholdings, and balances real-world living expenses across career choices and metropolitan living costs.',
    educationalObjective: 'Connects career earning potential directly to take-home pay and practical monthly living expenses.'
  }
];

