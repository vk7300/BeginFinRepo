import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  AlertCircle, 
  Home, 
  Utensils, 
  Car, 
  Wifi, 
  HeartPulse, 
  GraduationCap, 
  Film, 
  PiggyBank, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Sliders,
  Sparkles
} from 'lucide-react';

export interface JobProfile {
  id: string;
  title: string;
  category: string;
  annualSalary: number;
  description: string;
  suggestedExpenses: {
    housing: number;
    food: number;
    transport: number;
    utilities: number;
    healthcare: number;
    debt: number;
    discretionary: number;
    savings: number;
  };
}

export const JOB_PROFILES: JobProfile[] = [
  {
    id: 'teacher',
    title: 'Teacher',
    category: 'Education & Public Service',
    annualSalary: 46000,
    description: 'Entry-level secondary or elementary public school teacher with state credentialing.',
    suggestedExpenses: {
      housing: 1150,
      food: 350,
      transport: 300,
      utilities: 180,
      healthcare: 150,
      debt: 200,
      discretionary: 200,
      savings: 300
    }
  },
  {
    id: 'tradesperson',
    title: 'Tradesperson',
    category: 'Skilled Trades & Construction',
    annualSalary: 52000,
    description: 'Entry-level licensed electrician, plumber, HVAC technician, or welder apprentice.',
    suggestedExpenses: {
      housing: 1200,
      food: 400,
      transport: 380,
      utilities: 200,
      healthcare: 180,
      debt: 100,
      discretionary: 250,
      savings: 450
    }
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    category: 'Business & Startups',
    annualSalary: 48000,
    description: 'Early-stage venture founder or small business owner drawing modest initial owner draw.',
    suggestedExpenses: {
      housing: 1250,
      food: 380,
      transport: 280,
      utilities: 200,
      healthcare: 250,
      debt: 150,
      discretionary: 200,
      savings: 350
    }
  },
  {
    id: 'consultant',
    title: 'Consultant',
    category: 'Professional Services',
    annualSalary: 75000,
    description: 'Entry-level management, financial, or technology strategy analyst at a consulting firm.',
    suggestedExpenses: {
      housing: 1650,
      food: 550,
      transport: 420,
      utilities: 250,
      healthcare: 200,
      debt: 350,
      discretionary: 450,
      savings: 750
    }
  },
  {
    id: 'fast-food',
    title: 'Fast Food Worker',
    category: 'Hospitality & Food Service',
    annualSalary: 31200,
    description: 'Full-time entry crew member or line cook earning approximately $15.00 per hour.',
    suggestedExpenses: {
      housing: 850,
      food: 280,
      transport: 200,
      utilities: 150,
      healthcare: 120,
      debt: 50,
      discretionary: 120,
      savings: 150
    }
  },
  {
    id: 'nurse',
    title: 'Registered Nurse',
    category: 'Healthcare & Clinical',
    annualSalary: 68000,
    description: 'Entry-level hospital staff RN with associate or Bachelor of Science in Nursing (BSN).',
    suggestedExpenses: {
      housing: 1500,
      food: 480,
      transport: 360,
      utilities: 220,
      healthcare: 180,
      debt: 300,
      discretionary: 350,
      savings: 650
    }
  },
  {
    id: 'doctor',
    title: 'Doctor',
    category: 'Medical Residency',
    annualSalary: 72000,
    description: 'First or second-year medical resident physician in clinical postgraduate training.',
    suggestedExpenses: {
      housing: 1600,
      food: 500,
      transport: 380,
      utilities: 240,
      healthcare: 200,
      debt: 600,
      discretionary: 300,
      savings: 600
    }
  },
  {
    id: 'surgeon',
    title: 'Surgeon',
    category: 'Surgical Specialist',
    annualSalary: 260000,
    description: 'Entry-level attending general surgeon post-fellowship / specialty board certification.',
    suggestedExpenses: {
      housing: 3800,
      food: 1100,
      transport: 850,
      utilities: 450,
      healthcare: 400,
      debt: 1800,
      discretionary: 1500,
      savings: 4500
    }
  }
];

export const SalarySimulator: React.FC = () => {
  const [selectedJobId, setSelectedJobId] = useState<string>('teacher');
  const [customSalary, setCustomSalary] = useState<number | null>(null);

  // Fixed standard average tax rates (national averages)
  const federalTaxRate = 0.12; // 12% fixed average effective federal tax
  const stateTaxRate = 0.045;  // 4.5% fixed national average state tax
  const ficaTaxRate = 0.0765;  // 7.65% FICA (Social Security 6.2% + Medicare 1.45%)

  const currentJob = useMemo(() => {
    return JOB_PROFILES.find(j => j.id === selectedJobId) || JOB_PROFILES[0];
  }, [selectedJobId]);

  // Expenses State initialized with selected job's baseline
  const [expenses, setExpenses] = useState(currentJob.suggestedExpenses);

  const activeSalary = customSalary !== null ? customSalary : currentJob.annualSalary;

  // Handle job switch: update expenses to defaults
  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setCustomSalary(null);
    const job = JOB_PROFILES.find(j => j.id === jobId);
    if (job) {
      setExpenses({ ...job.suggestedExpenses });
    }
  };

  const handleExpenseChange = (category: keyof typeof expenses, value: number) => {
    setExpenses(prev => ({
      ...prev,
      [category]: Math.max(0, Math.round(value))
    }));
  };

  const handleResetToDefaults = () => {
    setCustomSalary(null);
    setExpenses({ ...currentJob.suggestedExpenses });
  };

  // Calculations
  const grossMonthly = activeSalary / 12;
  const federalTaxMonthly = grossMonthly * federalTaxRate;
  const stateTaxMonthly = grossMonthly * stateTaxRate;
  const ficaTaxMonthly = grossMonthly * ficaTaxRate;
  const totalTaxesMonthly = federalTaxMonthly + stateTaxMonthly + ficaTaxMonthly;
  const netMonthly = grossMonthly - totalTaxesMonthly;

  const totalLivingExpenses = Object.values(expenses).reduce((acc, val) => acc + val, 0);
  const netCashFlow = netMonthly - totalLivingExpenses;

  // 50/30/20 Groupings
  // Needs: Housing, Food, Transport, Utilities, Healthcare, Debt
  const totalNeeds = expenses.housing + expenses.food + expenses.transport + expenses.utilities + expenses.healthcare + expenses.debt;
  // Wants: Discretionary
  const totalWants = expenses.discretionary;
  // Savings: Savings
  const totalSavings = expenses.savings;

  const needsPercent = netMonthly > 0 ? (totalNeeds / netMonthly) * 100 : 0;
  const wantsPercent = netMonthly > 0 ? (totalWants / netMonthly) * 100 : 0;
  const savingsPercent = netMonthly > 0 ? (totalSavings / netMonthly) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Tool Introduction & Disclaimer Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7F7FFA]/10 border border-[#7F7FFA]/20 text-[#7F7FFA] text-xs font-bold uppercase tracking-wider mb-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Career & Budgeting Tool</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Entry Salary & Living Cost Simulator
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mt-1">
              Explore realistic entry-level career compensation, test customizable living expense scenarios, and analyze net monthly cash flow.
            </p>
          </div>

          <button
            onClick={handleResetToDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Informational Disclaimer Banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Informational Notice:</strong> For informational and educational purposes only. National average entry compensation and living costs vary considerably by state, metropolitan cost-of-living index, local municipal taxes, employer benefit deductibles, and individual financial lifestyle.
          </p>
        </div>
      </div>

      {/* Step 1: Select a Career Profession */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            1. Select Entry-Level Profession (National Averages)
          </h3>
          <span className="text-xs font-semibold text-[#7F7FFA]">
            {JOB_PROFILES.length} Profiles Available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {JOB_PROFILES.map((job) => {
            const isSelected = selectedJobId === job.id;
            return (
              <button
                key={job.id}
                type="button"
                onClick={() => handleJobSelect(job.id)}
                className={`p-3.5 sm:p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected 
                    ? 'border-[#7F7FFA] bg-[#7F7FFA]/5 shadow-xs' 
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 line-clamp-1">{job.category}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#7F7FFA] shrink-0" />
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{job.title}</h4>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-xs font-bold text-[#7F7FFA]">
                    ${job.annualSalary.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">/yr entry</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Simulator Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Living Costs Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  2. Customize Monthly Living Expenses
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust sliders to simulate your target city or lifestyle choices.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Expenses</span>
                <p className="text-base font-black text-slate-900">
                  ${totalLivingExpenses.toLocaleString()}/mo
                </p>
              </div>
            </div>

            {/* Expense Slider Rows */}
            <div className="space-y-4">
              {/* Housing */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[#7F7FFA]" />
                    Housing & Rent (incl. renter's insurance)
                  </span>
                  <div className="flex items-center gap-1">
                    <span>$</span>
                    <input 
                      type="number"
                      value={expenses.housing}
                      onChange={(e) => handleExpenseChange('housing', Number(e.target.value))}
                      className="w-20 px-2 py-0.5 text-right font-bold text-slate-900 border border-slate-200 rounded-lg text-xs"
                      min={0}
                      max={10000}
                    />
                  </div>
                </div>
                <input 
                  type="range"
                  min={400}
                  max={4500}
                  step={50}
                  value={expenses.housing}
                  onChange={(e) => handleExpenseChange('housing', Number(e.target.value))}
                  className="w-full accent-[#7F7FFA] cursor-pointer"
                />
              </div>

              {/* Food & Groceries */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                    Groceries & Household Essentials
                  </span>
                  <div className="flex items-center gap-1">
                    <span>$</span>
                    <input 
                      type="number"
                      value={expenses.food}
                      onChange={(e) => handleExpenseChange('food', Number(e.target.value))}
                      className="w-20 px-2 py-0.5 text-right font-bold text-slate-900 border border-slate-200 rounded-lg text-xs"
                      min={0}
                      max={2500}
                    />
                  </div>
                </div>
                <input 
                  type="range"
                  min={100}
                  max={1500}
                  step={25}
                  value={expenses.food}
                  onChange={(e) => handleExpenseChange('food', Number(e.target.value))}
                  className="w-full accent-[#7F7FFA] cursor-pointer"
                />
              </div>

              {/* Transportation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    Transportation (Auto loan, gas, transit, auto insurance)
                  </span>
                  <div className="flex items-center gap-1">
                    <span>$</span>
                    <input 
                      type="number"
                      value={expenses.transport}
                      onChange={(e) => handleExpenseChange('transport', Number(e.target.value))}
                      className="w-20 px-2 py-0.5 text-right font-bold text-slate-900 border border-slate-200 rounded-lg text-xs"
                      min={0}
                      max={2000}
                    />
                  </div>
                </div>
                <input 
                  type="range"
                  min={50}
                  max={1200}
                  step={25}
                  value={expenses.transport}
                  onChange={(e) => handleExpenseChange('transport', Number(e.target.value))}
                  className="w-full accent-[#7F7FFA] cursor-pointer"
                />
              </div>

              {/* Utilities & Internet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-amber-600" />
                    Utilities, Electricity, Water & Mobile Phone
                  </span>
                  <div className="flex items-center gap-1">
                    <span>$</span>
                    <input 
                      type="number"
                      value={expenses.utilities}
                      onChange={(e) => handleExpenseChange('utilities', Number(e.target.value))}
                      className="w-20 px-2 py-0.5 text-right font-bold text-slate-900 border border-slate-200 rounded-lg text-xs"
                      min={0}
                      max={1000}
                    />
                  </div>
                </div>
                <input 
                  type="range"
                  min={50}
                  max={700}
                  step={20}
                  value={expenses.utilities}
                  onChange={(e) => handleExpenseChange('utilities', Number(e.target.value))}
                  className="w-full accent-[#7F7FFA] cursor-pointer"
                />
              </div>

              {/* Healthcare & Medical */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    Health Insurance Premium & Out-of-Pocket Care
                  </span>
                  <div className="flex items-center gap-1">
                    <span>$</span>
                    <input 
                      type="number"
                      value={expenses.healthcare}
                      onChange={(e) => handleExpenseChange('healthcare', Number(e.target.value))}
                      className="w-20 px-2 py-0.5 text-right font-bold text-slate-900 border border-slate-200 rounded-lg text-xs"
                      min={0}
                      max={1500}
                    />
                  </div>
                </div>
                <input 
                  type="range"
                  min={0}
                  max={800}
                  step={25}
                  value={expenses.healthcare}
                  onChange={(e) => handleExpenseChange('healthcare', Number(e.target.value))}
                  className="w-full accent-[#7F7FFA] cursor-pointer"
                />
              </div>

              {/* Student Loans & Debt */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    Student Loans & Debt Repayment
                  </span>
                  <div className="flex items-center gap-1">
                    <span>$</span>
                    <input 
                      type="number"
                      value={expenses.debt}
                      onChange={(e) => handleExpenseChange('debt', Number(e.target.value))}
                      className="w-20 px-2 py-0.5 text-right font-bold text-slate-900 border border-slate-200 rounded-lg text-xs"
                      min={0}
                      max={3000}
                    />
                  </div>
                </div>
                <input 
                  type="range"
                  min={0}
                  max={2000}
                  step={50}
                  value={expenses.debt}
                  onChange={(e) => handleExpenseChange('debt', Number(e.target.value))}
                  className="w-full accent-[#7F7FFA] cursor-pointer"
                />
              </div>

              {/* Discretionary & Dining Out */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-indigo-500" />
                    Discretionary Spending, Dining Out & Entertainment
                  </span>
                  <div className="flex items-center gap-1">
                    <span>$</span>
                    <input 
                      type="number"
                      value={expenses.discretionary}
                      onChange={(e) => handleExpenseChange('discretionary', Number(e.target.value))}
                      className="w-20 px-2 py-0.5 text-right font-bold text-slate-900 border border-slate-200 rounded-lg text-xs"
                      min={0}
                      max={3000}
                    />
                  </div>
                </div>
                <input 
                  type="range"
                  min={0}
                  max={2000}
                  step={25}
                  value={expenses.discretionary}
                  onChange={(e) => handleExpenseChange('discretionary', Number(e.target.value))}
                  className="w-full accent-[#7F7FFA] cursor-pointer"
                />
              </div>

              {/* Emergency Fund & Investments */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
                    Emergency Savings, HYSA & Retirement (401k/IRA)
                  </span>
                  <div className="flex items-center gap-1">
                    <span>$</span>
                    <input 
                      type="number"
                      value={expenses.savings}
                      onChange={(e) => handleExpenseChange('savings', Number(e.target.value))}
                      className="w-20 px-2 py-0.5 text-right font-bold text-slate-900 border border-slate-200 rounded-lg text-xs"
                      min={0}
                      max={6000}
                    />
                  </div>
                </div>
                <input 
                  type="range"
                  min={0}
                  max={5000}
                  step={50}
                  value={expenses.savings}
                  onChange={(e) => handleExpenseChange('savings', Number(e.target.value))}
                  className="w-full accent-[#7F7FFA] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Breakdown & Analysis */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Monthly Compensation & Tax Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#7F7FFA]" />
              <span>Monthly Compensation & Tax Math</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600">Gross Monthly Earnings</span>
                <span className="font-bold text-slate-900">${Math.round(grossMonthly).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Federal Income Tax (~12.0%)</span>
                <span className="text-rose-600 font-semibold">-${Math.round(federalTaxMonthly).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>State Income Tax (~4.5% avg)</span>
                <span className="text-rose-600 font-semibold">-${Math.round(stateTaxMonthly).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>FICA Payroll Tax (7.65%)</span>
                <span className="text-rose-600 font-semibold">-${Math.round(ficaTaxMonthly).toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t-2 border-slate-100 flex justify-between items-center font-bold">
                <span className="text-slate-900">Net Take-Home Pay (Monthly)</span>
                <span className="text-[#7F7FFA] text-sm sm:text-base font-black">
                  ${Math.round(netMonthly).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Cash Flow Outcome Card */}
          <div className={`p-6 rounded-3xl border shadow-xs space-y-3 transition-colors ${
            netCashFlow >= 0 
              ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950' 
              : 'bg-rose-50/70 border-rose-200/80 text-rose-950'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                {netCashFlow >= 0 ? 'Monthly Net Surplus' : 'Monthly Net Deficit'}
              </span>
              {netCashFlow >= 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              )}
            </div>

            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              {netCashFlow >= 0 ? '+' : '-'}${Math.abs(Math.round(netCashFlow)).toLocaleString()}/mo
            </div>

            <p className="text-xs leading-relaxed opacity-90">
              {netCashFlow >= 0 
                ? 'Your simulated take-home income comfortably covers all planned monthly living expenses and savings goals.'
                : 'Living expenses exceed your net take-home pay. Consider reducing discretionary costs or exploring shared housing.'}
            </p>
          </div>

          {/* 50/30/20 Rule Benchmark Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                50/30/20 Rule Framework Check
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">Net Income Share</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Needs */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Needs (Target ≤50%)</span>
                  <span className={needsPercent > 50 ? 'text-amber-600' : 'text-slate-900'}>
                    ${totalNeeds.toLocaleString()} ({needsPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      needsPercent > 50 ? 'bg-amber-500' : 'bg-[#7F7FFA]'
                    }`}
                    style={{ width: `${Math.min(100, needsPercent)}%` }}
                  />
                </div>
              </div>

              {/* Wants */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Wants (Target ≤30%)</span>
                  <span className={wantsPercent > 30 ? 'text-amber-600' : 'text-slate-900'}>
                    ${totalWants.toLocaleString()} ({wantsPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      wantsPercent > 30 ? 'bg-amber-500' : 'bg-indigo-400'
                    }`}
                    style={{ width: `${Math.min(100, wantsPercent)}%` }}
                  />
                </div>
              </div>

              {/* Savings */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Savings & Investing (Target ≥20%)</span>
                  <span className={savingsPercent < 20 ? 'text-amber-600' : 'text-emerald-600'}>
                    ${totalSavings.toLocaleString()} ({savingsPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      savingsPercent >= 20 ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${Math.min(100, savingsPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
