import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Clock, 
  Briefcase, 
  TrendingUp, 
  Wallet, 
  Percent, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  User, 
  Building2, 
  Car, 
  Utensils, 
  Wifi, 
  HeartPulse, 
  Sparkles, 
  Info, 
  Sliders, 
  Layers, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  Scale, 
  HelpCircle,
  PiggyBank,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Language } from '../data/uiTranslations';

export interface JobProfile {
  id: string;
  name: string;
  category: 'Healthcare' | 'Education' | 'Trades' | 'Finance' | 'Technology' | 'Entrepreneurship';
  title: string;
  baseHourly: number;
  isSalaried: boolean;
  baseSalary?: number;
  typicalHours: number;
  defaultHousing: number;
  defaultTransport: number;
  defaultFood: number;
  defaultOther: number;
  description: string;
  insights: string;
}

const CAREER_PROFILES: JobProfile[] = [
  {
    id: 'nurse',
    name: 'Registered Nurse (RN)',
    category: 'Healthcare',
    title: 'Registered Nurse at Regional Hospital',
    baseHourly: 42.50,
    isSalaried: false,
    baseSalary: 88400,
    typicalHours: 36,
    defaultHousing: 1450,
    defaultTransport: 380,
    defaultFood: 480,
    defaultOther: 420,
    description: 'Provide patient care, coordinate treatment plans, and educate communities on medical wellness.',
    insights: 'Nurses frequently work three 12-hour shifts weekly. Hourly status allows 1.5x overtime pay on extra shifts.'
  },
  {
    id: 'teacher',
    name: 'High School Teacher',
    category: 'Education',
    title: 'Public Secondary School Educator',
    baseHourly: 29.00,
    isSalaried: true,
    baseSalary: 58500,
    typicalHours: 40,
    defaultHousing: 1200,
    defaultTransport: 320,
    defaultFood: 380,
    defaultOther: 300,
    description: 'Educate students, craft rigorous curricula, and guide youth academic achievement.',
    insights: 'Salaried contracts typically cover 10 months with pension benefits and options for summer supplemental income.'
  },
  {
    id: 'electrician',
    name: 'Journeyman Electrician',
    category: 'Trades',
    title: 'Licensed Commercial & Residential Electrician',
    baseHourly: 34.00,
    isSalaried: false,
    baseSalary: 70720,
    typicalHours: 40,
    defaultHousing: 1350,
    defaultTransport: 460,
    defaultFood: 450,
    defaultOther: 350,
    description: 'Install, maintain, and repair electrical power, lighting, and control systems.',
    insights: 'Skilled union trades experience high demand, minimal student debt, and significant overtime opportunities.'
  },
  {
    id: 'accountant',
    name: 'Corporate Accountant',
    category: 'Finance',
    title: 'Staff Accountant / Financial Analyst',
    baseHourly: 38.00,
    isSalaried: true,
    baseSalary: 76500,
    typicalHours: 40,
    defaultHousing: 1550,
    defaultTransport: 350,
    defaultFood: 420,
    defaultOther: 400,
    description: 'Prepare financial records, verify tax compliance, and analyze operational expenditures.',
    insights: 'Salaried roles in accounting often experience peak workload during Q1 tax season and year-end audits.'
  },
  {
    id: 'software-eng',
    name: 'Software Engineer',
    category: 'Technology',
    title: 'Full Stack Software Developer',
    baseHourly: 54.00,
    isSalaried: true,
    baseSalary: 112000,
    typicalHours: 40,
    defaultHousing: 1850,
    defaultTransport: 280,
    defaultFood: 550,
    defaultOther: 600,
    description: 'Build web applications, engineer backend data pipelines, and design digital tools.',
    insights: 'High earning potential in tech allows rapid savings accumulation and employer retirement 401(k) matching.'
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    category: 'Technology',
    title: 'Business Intelligence & Operations Analyst',
    baseHourly: 41.50,
    isSalaried: true,
    baseSalary: 84000,
    typicalHours: 40,
    defaultHousing: 1600,
    defaultTransport: 320,
    defaultFood: 460,
    defaultOther: 450,
    description: 'Translate quantitative datasets into actionable business and financial intelligence.',
    insights: 'Analytical skills offer strong cross-industry mobility with balanced work-life flexibility.'
  },
  {
    id: 'founder',
    name: 'Small Business Founder',
    category: 'Entrepreneurship',
    title: 'Bootstrapped Business Owner',
    baseHourly: 26.00,
    isSalaried: true,
    baseSalary: 52000,
    typicalHours: 55,
    defaultHousing: 1100,
    defaultTransport: 250,
    defaultFood: 320,
    defaultOther: 280,
    description: 'Manage company strategy, client acquisition, operations, and cash flow reinvestment.',
    insights: 'Founders often draw modest baseline salaries early on to maximize working capital and reinvest in equity.'
  }
];

export const AustinJobSimulator: React.FC<{ language?: Language; standalone?: boolean }> = ({ 
  standalone = false 
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('nurse');
  const [isCustomCareer, setIsCustomCareer] = useState<boolean>(false);
  
  // Custom career fields
  const [customTitle, setCustomTitle] = useState('My Custom Career');
  const [customIsSalaried, setCustomIsSalaried] = useState(false);
  const [customHourly, setCustomHourly] = useState<number>(30);
  const [customAnnualSalary, setCustomAnnualSalary] = useState<number>(62400);

  // General Simulation Controls
  const [hoursWorked, setHoursWorked] = useState<number>(40);
  const [stateTaxRegime, setStateTaxRegime] = useState<'none' | 'moderate' | 'high'>('none');
  const [retirement401kPct, setRetirement401kPct] = useState<number>(5);

  // Living Expenses Tiers
  const [housingTier, setHousingTier] = useState<'roommate' | 'studio' | 'onebed' | 'twobed'>('onebed');
  const [transportTier, setTransportTier] = useState<'transit' | 'used' | 'financed'>('used');
  const [foodTier, setFoodTier] = useState<'frugal' | 'balanced' | 'premium'>('balanced');
  const [utilitiesTier, setUtilitiesTier] = useState<'basic' | 'standard' | 'high'>('standard');
  const [healthTier, setHealthTier] = useState<'basic' | 'standard' | 'comprehensive'>('standard');
  const [lifestyleTier, setLifestyleTier] = useState<'modest' | 'moderate' | 'active'>('moderate');

  const selectedJob = useMemo(() => {
    return CAREER_PROFILES.find(j => j.id === selectedJobId) || CAREER_PROFILES[0];
  }, [selectedJobId]);

  const effectiveHourly = useMemo(() => {
    if (isCustomCareer) {
      return customIsSalaried ? customAnnualSalary / 2080 : customHourly;
    }
    return selectedJob.baseHourly;
  }, [isCustomCareer, customIsSalaried, customAnnualSalary, customHourly, selectedJob]);

  const effectiveIsSalaried = useMemo(() => {
    if (isCustomCareer) return customIsSalaried;
    return selectedJob.isSalaried;
  }, [isCustomCareer, customIsSalaried, selectedJob]);

  // Sync default hours on career change
  const handleSelectCareer = (job: JobProfile) => {
    setIsCustomCareer(false);
    setSelectedJobId(job.id);
    setHoursWorked(job.typicalHours);
  };

  // Gross Earnings Calculation (with 1.5x overtime for non-exempt hourly)
  const earnings = useMemo(() => {
    const regularHours = Math.min(40, hoursWorked);
    const overtimeHours = Math.max(0, hoursWorked - 40);

    let weeklyGross = 0;
    if (effectiveIsSalaried) {
      // Salaried roles have a fixed base salary regardless of hours worked
      const annual = isCustomCareer ? customAnnualSalary : (selectedJob.baseSalary || effectiveHourly * 2080);
      weeklyGross = annual / 52;
    } else {
      // Hourly roles compute regular rate + 1.5x overtime
      const regularPay = regularHours * effectiveHourly;
      const overtimePay = overtimeHours * (effectiveHourly * 1.5);
      weeklyGross = regularPay + overtimePay;
    }

    const annualGross = weeklyGross * 52;
    const monthlyGross = annualGross / 12;

    // Deductions:
    // 1. 401(k) Pre-tax retirement contribution
    const monthly401k = monthlyGross * (retirement401kPct / 100);
    const taxableMonthlyGross = monthlyGross - monthly401k;
    const taxableAnnualGross = taxableMonthlyGross * 12;

    // 2. Federal Income Tax approximation (Standard deduction $14,600 single)
    const stdDeduction = 14600;
    const fedTaxableIncome = Math.max(0, taxableAnnualGross - stdDeduction);
    
    // Federal Progressive Brackets (2024/2026 Single)
    let annualFedTax = 0;
    if (fedTaxableIncome <= 11600) {
      annualFedTax = fedTaxableIncome * 0.10;
    } else if (fedTaxableIncome <= 47150) {
      annualFedTax = 1160 + (fedTaxableIncome - 11600) * 0.12;
    } else if (fedTaxableIncome <= 100525) {
      annualFedTax = 5426 + (fedTaxableIncome - 47150) * 0.22;
    } else {
      annualFedTax = 17168.50 + (fedTaxableIncome - 100525) * 0.24;
    }
    const monthlyFedTax = annualFedTax / 12;

    // 3. FICA (Social Security 6.2% + Medicare 1.45% = 7.65%)
    const monthlyFica = monthlyGross * 0.0765;

    // 4. State Income Tax
    let stateTaxRate = 0;
    if (stateTaxRegime === 'moderate') stateTaxRate = 0.045; // e.g. GA, NC, IL
    if (stateTaxRegime === 'high') stateTaxRate = 0.085; // e.g. CA, NY, NJ
    const monthlyStateTax = taxableMonthlyGross * stateTaxRate;

    const totalMonthlyDeductions = monthlyFedTax + monthlyFica + monthlyStateTax + monthly401k;
    const netMonthlyTakeHome = Math.max(0, monthlyGross - totalMonthlyDeductions);
    const netAnnualTakeHome = netMonthlyTakeHome * 12;
    const effectiveTaxRate = monthlyGross > 0 ? (totalMonthlyDeductions / monthlyGross) * 100 : 0;

    return {
      annualGross,
      monthlyGross,
      monthly401k,
      monthlyFedTax,
      monthlyFica,
      monthlyStateTax,
      totalMonthlyDeductions,
      netMonthlyTakeHome,
      netAnnualTakeHome,
      effectiveTaxRate,
      overtimeHours
    };
  }, [hoursWorked, effectiveHourly, effectiveIsSalaried, isCustomCareer, customAnnualSalary, selectedJob, retirement401kPct, stateTaxRegime]);

  // Expenses Calculations
  const expenses = useMemo(() => {
    const housingCosts = {
      roommate: 750,
      studio: 1250,
      onebed: 1600,
      twobed: 2300
    };

    const transportCosts = {
      transit: 95,
      used: 380,
      financed: 680
    };

    const foodCosts = {
      frugal: 320,
      balanced: 480,
      premium: 780
    };

    const utilitiesCosts = {
      basic: 140,
      standard: 240,
      high: 360
    };

    const healthCosts = {
      basic: 90,
      standard: 180,
      comprehensive: 320
    };

    const lifestyleCosts = {
      modest: 140,
      moderate: 340,
      active: 620
    };

    const housing = housingCosts[housingTier];
    const transport = transportCosts[transportTier];
    const food = foodCosts[foodTier];
    const utilities = utilitiesCosts[utilitiesTier];
    const health = healthCosts[healthTier];
    const lifestyle = lifestyleCosts[lifestyleTier];

    // 50/30/20 Categorization
    // Needs: Housing, Transportation, Basic Food, Utilities, Health
    const needs = housing + transport + (food * 0.7) + utilities + health;
    // Wants: Dining out portion of Food, Lifestyle & Subscriptions
    const wants = (food * 0.3) + lifestyle;
    const totalExpenses = needs + wants;

    return {
      housing,
      transport,
      food,
      utilities,
      health,
      lifestyle,
      needs,
      wants,
      totalExpenses
    };
  }, [housingTier, transportTier, foodTier, utilitiesTier, healthTier, lifestyleTier]);

  // Net Cash Flow, Savings Rate & 50/30/20 Breakdown
  const financialHealth = useMemo(() => {
    const netTakeHome = earnings.netMonthlyTakeHome;
    const monthlyNetSavings = netTakeHome - expenses.totalExpenses;
    const savingsRate = netTakeHome > 0 ? (monthlyNetSavings / netTakeHome) * 100 : 0;
    
    // 50/30/20 proportions of Net Income
    const needsPct = netTakeHome > 0 ? (expenses.needs / netTakeHome) * 100 : 0;
    const wantsPct = netTakeHome > 0 ? (expenses.wants / netTakeHome) * 100 : 0;
    const savingsPct = Math.max(0, savingsRate);

    // Wealth projections
    const annualSavings = Math.max(0, monthlyNetSavings * 12);
    const fiveYearSavingsWithCompound = annualSavings > 0 
      // Assuming 5% annual real return
      ? Math.round(monthlyNetSavings * ((Math.pow(1 + 0.05 / 12, 60) - 1) / (0.05 / 12)))
      : 0;

    // Emergency Fund Runway (Months of survival expenses)
    const emergencyMonthsPerYearSaved = expenses.totalExpenses > 0 ? annualSavings / expenses.totalExpenses : 0;

    return {
      monthlyNetSavings,
      savingsRate,
      needsPct,
      wantsPct,
      savingsPct,
      annualSavings,
      fiveYearSavingsWithCompound,
      emergencyMonthsPerYearSaved
    };
  }, [earnings.netMonthlyTakeHome, expenses]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Bento Header */}
      <div className="bg-gradient-to-br from-slate-950 via-[#0B0D1B] to-[#141838] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7F7FFA]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" /> Wage & Living Modeler
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Career, Wage & Cost of Living Simulator
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Explore real-world salaries, progressive tax brackets, and living costs to understand how income translates into real purchasing power and wealth accumulation.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md shrink-0">
            <Scale className="w-8 h-8 text-indigo-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block font-semibold">Standard Framework</span>
              <span className="text-white font-bold">NSPFE Standards Aligned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Career & Income Parameters */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Select Career */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#7F7FFA] flex items-center justify-center font-bold">1</div>
                <h3 className="font-extrabold text-slate-900 text-base">Select Career Profile</h3>
              </div>
              <button
                onClick={() => setIsCustomCareer(!isCustomCareer)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  isCustomCareer 
                    ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isCustomCareer ? 'Preset Careers' : 'Custom Career'}
              </button>
            </div>

            {!isCustomCareer ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {CAREER_PROFILES.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  return (
                    <button
                      key={job.id}
                      onClick={() => handleSelectCareer(job)}
                      className={`text-left p-3 rounded-2xl border transition-all flex flex-col justify-between gap-1.5 ${
                        isSelected 
                          ? 'border-[#7F7FFA] bg-indigo-50/50 shadow-xs ring-1 ring-[#7F7FFA]' 
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 leading-tight">{job.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#7F7FFA] shrink-0 mt-0.5" />}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>{job.isSalaried ? 'Salaried' : 'Hourly'}</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {job.isSalaried ? `$${(job.baseSalary || 0).toLocaleString()}/yr` : `$${job.baseHourly.toFixed(2)}/hr`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-in fade-in">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Career Title</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-indigo-500 outline-none"
                    placeholder="e.g. Graphic Designer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCustomIsSalaried(false)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      !customIsSalaried ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Hourly Wage
                  </button>
                  <button
                    onClick={() => setCustomIsSalaried(true)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      customIsSalaried ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Annual Salary
                  </button>
                </div>

                {!customIsSalaried ? (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Hourly Rate</span>
                      <span className="text-indigo-600 font-mono">${customHourly.toFixed(2)}/hr</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={120}
                      step={0.5}
                      value={customHourly}
                      onChange={(e) => setCustomHourly(Number(e.target.value))}
                      className="w-full accent-[#7F7FFA]"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Annual Gross Salary</span>
                      <span className="text-indigo-600 font-mono">${customAnnualSalary.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={25000}
                      max={250000}
                      step={1000}
                      value={customAnnualSalary}
                      onChange={(e) => setCustomAnnualSalary(Number(e.target.value))}
                      className="w-full accent-[#7F7FFA]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Career Insight Note */}
            {!isCustomCareer && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{selectedJob.insights}</p>
              </div>
            )}
          </div>

          {/* Card 2: Hours & Tax Settings */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#7F7FFA] flex items-center justify-center font-bold">2</div>
              <h3 className="font-extrabold text-slate-900 text-base">Working Hours & Tax Regime</h3>
            </div>

            {/* Hours Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Weekly Hours
                </span>
                <span className="px-2 py-0.5 bg-indigo-50 text-[#7F7FFA] rounded-md font-mono text-sm">
                  {hoursWorked} hrs/wk
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={75}
                value={hoursWorked}
                onChange={(e) => setHoursWorked(Number(e.target.value))}
                className="w-full accent-[#7F7FFA]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Part-Time (20h)</span>
                <span>Standard (40h)</span>
                <span>Overtime (60h+)</span>
              </div>
              {hoursWorked > 40 && !effectiveIsSalaried && (
                <p className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  ✨ +{hoursWorked - 40} hrs eligible for 1.5x Overtime Pay (${(effectiveHourly * 1.5).toFixed(2)}/hr)
                </p>
              )}
            </div>

            {/* State Income Tax Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">State Income Tax Rate</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setStateTaxRegime('none')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    stateTaxRegime === 'none' 
                      ? 'bg-[#7F7FFA] text-white border-[#7F7FFA] shadow-xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  0% (TX/FL/WA)
                </button>
                <button
                  onClick={() => setStateTaxRegime('moderate')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    stateTaxRegime === 'moderate' 
                      ? 'bg-[#7F7FFA] text-white border-[#7F7FFA] shadow-xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ~4.5% (US Avg)
                </button>
                <button
                  onClick={() => setStateTaxRegime('high')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    stateTaxRegime === 'high' 
                      ? 'bg-[#7F7FFA] text-white border-[#7F7FFA] shadow-xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ~8.5% (CA/NY)
                </button>
              </div>
            </div>

            {/* 401(k) Pre-Tax Contribution Slider */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <PiggyBank className="w-3.5 h-3.5 text-indigo-600" /> Pre-Tax 401(k) Savings
                </span>
                <span className="text-indigo-600 font-mono font-bold">{retirement401kPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={1}
                value={retirement401kPct}
                onChange={(e) => setRetirement401kPct(Number(e.target.value))}
                className="w-full accent-[#7F7FFA]"
              />
              <p className="text-[11px] text-slate-500">
                Contributes <strong className="text-slate-800">${Math.round(earnings.monthly401k).toLocaleString()}/mo</strong> directly to retirement before taxes.
              </p>
            </div>
          </div>

          {/* Card 3: Cost of Living Lifestyle Tiers */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#7F7FFA] flex items-center justify-center font-bold">3</div>
              <h3 className="font-extrabold text-slate-900 text-base">Cost of Living Choices</h3>
            </div>

            {/* Housing */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Housing & Rent
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setHousingTier('roommate')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    housingTier === 'roommate' ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Roommate ($750)
                </button>
                <button
                  onClick={() => setHousingTier('studio')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    housingTier === 'studio' ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Studio Apt ($1,250)
                </button>
                <button
                  onClick={() => setHousingTier('onebed')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    housingTier === 'onebed' ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  1-Bedroom ($1,600)
                </button>
                <button
                  onClick={() => setHousingTier('twobed')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    housingTier === 'twobed' ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  2-Bed / Home ($2,300)
                </button>
              </div>
            </div>

            {/* Transportation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-indigo-600" /> Transportation
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTransportTier('transit')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    transportTier === 'transit' ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Transit ($95)
                </button>
                <button
                  onClick={() => setTransportTier('used')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    transportTier === 'used' ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Used Car ($380)
                </button>
                <button
                  onClick={() => setTransportTier('financed')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    transportTier === 'financed' ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  New Lease ($680)
                </button>
              </div>
            </div>

            {/* Food */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-indigo-600" /> Food & Groceries
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFoodTier('frugal')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    foodTier === 'frugal' ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Meal Prep ($320)
                </button>
                <button
                  onClick={() => setFoodTier('balanced')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    foodTier === 'balanced' ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Balanced ($480)
                </button>
                <button
                  onClick={() => setFoodTier('premium')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    foodTier === 'premium' ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Dining Out ($780)
                </button>
              </div>
            </div>

            {/* Lifestyle & Health Subscriptions */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Health Care Tier</label>
                <select
                  value={healthTier}
                  onChange={(e) => setHealthTier(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                >
                  <option value="basic">Basic ($90/mo)</option>
                  <option value="standard">Standard ($180/mo)</option>
                  <option value="comprehensive">Comprehensive ($320/mo)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Lifestyle & Fun</label>
                <select
                  value={lifestyleTier}
                  onChange={(e) => setLifestyleTier(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                >
                  <option value="modest">Modest ($140/mo)</option>
                  <option value="moderate">Moderate ($340/mo)</option>
                  <option value="active">Active Social ($620/mo)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Results, 50/30/20 & Trajectory */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Executive Summary Cards Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Monthly Gross */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Gross</span>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  ${Math.round(earnings.monthlyGross).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">
                  ${Math.round(earnings.annualGross).toLocaleString()} / yr
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded-lg">
                Rate: ${effectiveHourly.toFixed(2)}/hr
              </div>
            </div>

            {/* Net Take-Home */}
            <div className="bg-gradient-to-br from-indigo-50/80 to-indigo-100/40 p-5 rounded-3xl border border-indigo-200/80 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7F7FFA]">Net Take-Home Pay</span>
              <div className="my-2">
                <span className="text-2xl font-black text-indigo-950 font-mono">
                  ${Math.round(earnings.netMonthlyTakeHome).toLocaleString()}
                </span>
                <span className="text-[11px] text-indigo-600 block font-semibold">
                  After Taxes & 401(k)
                </span>
              </div>
              <div className="text-[10px] text-indigo-700 font-bold bg-white/70 px-2 py-1 rounded-lg border border-indigo-100">
                Effective Rate: {earnings.effectiveTaxRate.toFixed(1)}%
              </div>
            </div>

            {/* Monthly Surplus/Deficit */}
            <div className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between ${
              financialHealth.monthlyNetSavings >= 0 
                ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950' 
                : 'bg-rose-50/80 border-rose-200/80 text-rose-950'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {financialHealth.monthlyNetSavings >= 0 ? 'Monthly Net Cash Flow' : 'Monthly Deficit'}
              </span>
              <div className="my-2">
                <span className="text-2xl font-black font-mono">
                  {financialHealth.monthlyNetSavings >= 0 ? '+' : ''}${Math.round(financialHealth.monthlyNetSavings).toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold opacity-90 block">
                  Savings Rate: {financialHealth.savingsRate.toFixed(1)}%
                </span>
              </div>
              <div className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                financialHealth.monthlyNetSavings >= 0 
                  ? 'bg-white/80 text-emerald-700 border-emerald-100' 
                  : 'bg-white/80 text-rose-700 border-rose-100'
              }`}>
                {financialHealth.monthlyNetSavings >= 0 ? 'Surplus Available' : 'Overspending Risk'}
              </div>
            </div>
          </div>

          {/* Detailed Deductions & Expense Breakdown Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#7F7FFA]" /> Monthly Cash Flow Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Breakdown: Deductions */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Payroll Deductions</span>
                  <span className="text-xs font-mono font-bold text-rose-600">
                    -${Math.round(earnings.totalMonthlyDeductions).toLocaleString()}/mo
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Federal Income Tax</span>
                    <span className="font-mono text-slate-900 font-semibold">${Math.round(earnings.monthlyFedTax).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FICA (Social Security & Medicare)</span>
                    <span className="font-mono text-slate-900 font-semibold">${Math.round(earnings.monthlyFica).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State Income Tax</span>
                    <span className="font-mono text-slate-900 font-semibold">${Math.round(earnings.monthlyStateTax).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>401(k) Retirement Pre-Tax</span>
                    <span className="font-mono text-indigo-600 font-semibold">${Math.round(earnings.monthly401k).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Right Breakdown: Living Expenses */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Living Expenses</span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    ${Math.round(expenses.totalExpenses).toLocaleString()}/mo
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Housing & Rent</span>
                    <span className="font-mono text-slate-900 font-semibold">${expenses.housing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transportation</span>
                    <span className="font-mono text-slate-900 font-semibold">${expenses.transport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Groceries & Food</span>
                    <span className="font-mono text-slate-900 font-semibold">${expenses.food}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilities, Health & Lifestyle</span>
                    <span className="font-mono text-slate-900 font-semibold">${expenses.utilities + expenses.health + expenses.lifestyle}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 50/30/20 Rule Target Visualizer */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-900">50/30/20 Budget Compliance</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Rule of Thumb</span>
                </div>
                <span className="text-xs font-bold text-[#7F7FFA]">
                  {financialHealth.needsPct <= 55 && financialHealth.savingsPct >= 15 ? 'Balanced Allocation' : 'Budget Adjustment Needed'}
                </span>
              </div>

              {/* Progress Stack Bar */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${Math.min(100, financialHealth.needsPct)}%` }} 
                  className="bg-indigo-600 transition-all duration-500" 
                  title={`Needs: ${financialHealth.needsPct.toFixed(1)}%`}
                />
                <div 
                  style={{ width: `${Math.min(100 - financialHealth.needsPct, financialHealth.wantsPct)}%` }} 
                  className="bg-amber-400 transition-all duration-500" 
                  title={`Wants: ${financialHealth.wantsPct.toFixed(1)}%`}
                />
                <div 
                  style={{ width: `${Math.max(0, financialHealth.savingsPct)}%` }} 
                  className="bg-emerald-500 transition-all duration-500" 
                  title={`Savings: ${financialHealth.savingsPct.toFixed(1)}%`}
                />
              </div>

              <div className="grid grid-cols-3 text-center text-xs pt-1">
                <div>
                  <span className="inline-block w-2.5 h-2.5 bg-indigo-600 rounded-full mr-1.5" />
                  <span className="font-bold text-slate-800">Needs: {financialHealth.needsPct.toFixed(0)}%</span>
                  <span className="block text-[10px] text-slate-400">(Target: ≤50%)</span>
                </div>
                <div>
                  <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-full mr-1.5" />
                  <span className="font-bold text-slate-800">Wants: {financialHealth.wantsPct.toFixed(0)}%</span>
                  <span className="block text-[10px] text-slate-400">(Target: ≤30%)</span>
                </div>
                <div>
                  <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full mr-1.5" />
                  <span className="font-bold text-slate-800">Savings: {financialHealth.savingsPct.toFixed(0)}%</span>
                  <span className="block text-[10px] text-slate-400">(Target: ≥20%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wealth Trajectory & Long-Term Projections */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">Long-Term Wealth Accumulation</h3>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                5% Real Return Model
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <span className="text-slate-400 text-xs font-semibold block">1-Year Cash Accumulation</span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  ${Math.round(financialHealth.annualSavings).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-300 mt-1 block">
                  Builds <strong className="text-white">{financialHealth.emergencyMonthsPerYearSaved.toFixed(1)} months</strong> of emergency buffer.
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <span className="text-slate-400 text-xs font-semibold block">5-Year Compounded Growth</span>
                <span className="text-2xl font-black text-emerald-300 font-mono mt-1 block">
                  ${Math.round(financialHealth.fiveYearSavingsWithCompound).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-300 mt-1 block">
                  Sustained monthly investing in broad index funds.
                </span>
              </div>
            </div>

            {/* Strategic Feedback Message */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs leading-relaxed text-slate-300">
              {financialHealth.monthlyNetSavings < 0 ? (
                <p className="flex items-start gap-2 text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span><strong>Deficit Warning:</strong> Your expenses exceed your net income. Consider reducing housing cost by finding a roommate (saves ~$850/mo) or switching to public transit.</span>
                </p>
              ) : financialHealth.savingsRate < 15 ? (
                <p className="flex items-start gap-2 text-amber-200">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
                  <span><strong>Cautious Savings:</strong> Your savings rate ({financialHealth.savingsRate.toFixed(1)}%) is under the recommended 20% mark. Trimming discretionary dining out can bolster your emergency fund.</span>
                </p>
              ) : (
                <p className="flex items-start gap-2 text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span><strong>Healthy Financial Position:</strong> You maintain a strong positive cash flow ({financialHealth.savingsRate.toFixed(1)}% savings rate). You are on track to fund your emergency reserves and start investing for retirement.</span>
                </p>
              )}
            </div>
          </div>

          {/* Legal & Educational Disclaimer */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-700">Educational Disclaimer:</strong> This simulator utilizes standard U.S. Bureau of Labor Statistics averages, 2024–2026 progressive federal tax brackets, and median metropolitan cost of living indicators. Figures represent educational approximations and do not constitute certified tax, legal, or financial advice. Individual salaries, benefits, and local living expenses vary.
          </div>
        </div>
      </div>
    </div>
  );
};
