import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw, 
  TrendingUp, 
  Info, 
  HelpCircle, 
  Star, 
  ThumbsUp, 
  Percent, 
  Wallet, 
  DollarSign, 
  Sliders, 
  CreditCard, 
  Scale, 
  Sparkles, 
  AlertCircle, 
  Layers, 
  Clock, 
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { Language } from '../data/uiTranslations';
import { db, doc, setDoc, handleFirestoreError, OperationType } from '../firebase';

interface Props {
  language?: Language;
  userId?: string;
  onGameComplete?: (finalScore: number) => void;
  standalone?: boolean;
}

interface ScenarioAction {
  id: string;
  title: string;
  category: 'payment' | 'utilization' | 'age' | 'new_credit' | 'mix';
  deltaScore: number;
  recoveryTimeline: string;
  description: string;
  why: string;
}

const SCENARIO_ACTIONS: ScenarioAction[] = [
  {
    id: 'pay_down_utilization',
    title: 'Pay down credit card balance from 75% to 8% utilization',
    category: 'utilization',
    deltaScore: 45,
    recoveryTimeline: '1 to 2 billing cycles',
    description: 'Drastically lowers revolving credit utilization ratio reported to the bureaus.',
    why: 'Credit utilization accounts for 30% of your FICO score. Ratios under 10% signal minimal default risk to lenders.'
  },
  {
    id: 'miss_payment',
    title: 'Miss a credit card minimum payment by 30+ days',
    category: 'payment',
    deltaScore: -80,
    recoveryTimeline: '12 to 24 months to rebuild',
    description: 'A 30-day delinquency is recorded on your official credit report.',
    why: 'Payment history is the largest factor (35%). A single late payment damages prime scores severely.'
  },
  {
    id: 'authorized_user',
    title: 'Become an authorized user on a seasoned account with 100% on-time history',
    category: 'age',
    deltaScore: 35,
    recoveryTimeline: 'Next monthly reporting cycle',
    description: 'Inherits the clean credit history and credit limit of the primary account holder.',
    why: 'Boosts both length of credit history (15%) and expands total credit line to suppress overall utilization.'
  },
  {
    id: 'open_multiple_cards',
    title: 'Apply for 3 retail store credit cards in one afternoon',
    category: 'new_credit',
    deltaScore: -25,
    recoveryTimeline: '6 to 12 months',
    description: 'Triggers 3 hard credit inquiries and lowers the average age of open accounts.',
    why: 'Multiple simultaneous inquiries in a short timeframe indicate credit distress or urgent borrowing to underwriters.'
  },
  {
    id: 'close_oldest_card',
    title: 'Close your oldest credit card with a $5,000 credit limit',
    category: 'age',
    deltaScore: -30,
    recoveryTimeline: 'Long-term metric loss',
    description: 'Shrinks your total available credit limit and will eventually drop off your average account age.',
    why: 'Instantly increases your remaining utilization percentage and cuts your historical depth.'
  },
  {
    id: 'pay_installment_ontime',
    title: 'Pay auto installment loan on time for 12 consecutive months',
    category: 'mix',
    deltaScore: 25,
    recoveryTimeline: 'Gradual steady climb',
    description: 'Establishes a steady track record of paying fixed amortized debt.',
    why: 'Demonstrates credit mix (10%) and reinforces the 35% payment history pillar.'
  },
  {
    id: 'settle_collection',
    title: 'Pay off and resolve an active medical or debt collection',
    category: 'payment',
    deltaScore: 30,
    recoveryTimeline: 'Immediate on modern FICO 9/10 models',
    description: 'Resolves derogatory public record marks.',
    why: 'Newer FICO scoring algorithms ignore zero-balance collection accounts, yielding immediate score recovery.'
  }
];

const DECISION_CHALLENGES = [
  {
    id: 1,
    category: 'Credit Cards & Balances',
    question: "You have $1,200 in checking and your credit card statement shows a $950 balance with a $35 minimum due. What should you do?",
    optionA: "Pay the full $950 balance immediately before the due date.",
    optionADesc: "Eliminates interest charges completely and preserves your low credit utilization.",
    optionB: "Pay the $35 minimum payment to keep more cash in checking.",
    optionBDesc: "Triggers high revolving APR interest (approx. 24%+) and rolls over debt.",
    correct: 'A',
    points: 50,
    rationale: "Paying in full avoids credit card interest traps entirely and keeps utilization optimal."
  },
  {
    id: 2,
    category: 'Credit Utilization Management',
    question: "You have a single credit card with a $1,000 limit. You need to buy a $600 laptop for school. How should you handle this?",
    optionA: "Charge the $600 and pay it off in full right before the statement closing date.",
    optionADesc: "Reports low utilization to credit bureaus before the monthly snapshot is taken.",
    optionB: "Charge the $600 and let it sit on your monthly statement as long as you pay the minimum.",
    optionBDesc: "Reports a 60% utilization ratio to the bureaus, which depresses your credit score.",
    correct: 'A',
    points: 50,
    rationale: "Bureaus snapshot your balance on your statement date. Keeping reported utilization under 10-30% protects your score."
  },
  {
    id: 3,
    category: 'Account Longevity & History',
    question: "You signed up for your first no-annual-fee credit card 5 years ago. You recently got a new rewards card. What should you do with the old card?",
    optionA: "Keep the old card open and put a small recurring subscription on it with autopay.",
    optionADesc: "Maintains your 5-year average account age and preserves your total credit limit.",
    optionB: "Cancel and close the old card immediately so you only have one account.",
    optionBDesc: "Lowers your total credit limit and eventually damages your average credit history length.",
    correct: 'A',
    points: 50,
    rationale: "Length of credit history accounts for 15% of your FICO score. Never close your oldest no-annual-fee card."
  },
  {
    id: 4,
    category: 'Co-Signing & Financial Liability',
    question: "A close friend asks you to co-sign an auto loan because their credit score is too low to qualify alone. What is the smartest move?",
    optionA: "Politely decline to co-sign.",
    optionADesc: "Protects your credit file from late payments, missed installments, and full legal liability.",
    optionB: "Co-sign the loan to help them out without checking if you can afford their payments.",
    optionBDesc: "You are 100% legally responsible if they miss payments or default.",
    correct: 'A',
    points: 50,
    rationale: "Co-signing makes you legally liable for 100% of the debt. If the borrower defaults, your credit is wrecked."
  }
];

export const CreditScoreGame: React.FC<Props> = ({ 
  userId, 
  onGameComplete 
}) => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'calculator' | 'quiz'>('sandbox');
  
  // Tab 1: FICO Sandbox State
  const [baselineScore, setBaselineScore] = useState<number>(680);
  const [activeScenarioIds, setActiveScenarioIds] = useState<string[]>([]);

  // Tab 2: Utilization & Payoff Calculator State
  const [creditLimit, setCreditLimit] = useState<number>(5000);
  const [currentBalance, setCurrentBalance] = useState<number>(1750);
  const [interestRateApr, setInterestRateApr] = useState<number>(24.99);
  const [monthlyPaymentAmount, setMonthlyPaymentAmount] = useState<number>(150);

  // Tab 3: Decision Challenge Quiz State
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizHistory, setQuizHistory] = useState<{ id: number; answered: 'A' | 'B'; isCorrect: boolean }[]>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Computed FICO Score in Sandbox
  const simulatedScore = useMemo(() => {
    let delta = 0;
    activeScenarioIds.forEach(id => {
      const scenario = SCENARIO_ACTIONS.find(s => s.id === id);
      if (scenario) {
        delta += scenario.deltaScore;
      }
    });
    return Math.min(850, Math.max(300, baselineScore + delta));
  }, [baselineScore, activeScenarioIds]);

  const scoreTier = useMemo(() => {
    if (simulatedScore >= 800) return { label: 'Exceptional', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Best interest rates and easiest approval.' };
    if (simulatedScore >= 740) return { label: 'Very Good', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', desc: 'Competitive rates and premium reward cards.' };
    if (simulatedScore >= 670) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', desc: 'Near the national average. Standard terms.' };
    if (simulatedScore >= 580) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Subprime rates with higher interest fees.' };
    return { label: 'Poor', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', desc: 'Approval requires secured credit or co-signers.' };
  }, [simulatedScore]);

  // Tab 2: Utilization Calculations
  const utilizationRatio = useMemo(() => {
    if (creditLimit <= 0) return 0;
    return Math.min(100, (currentBalance / creditLimit) * 100);
  }, [creditLimit, currentBalance]);

  const payoffAnalysis = useMemo(() => {
    const monthlyRate = (interestRateApr / 100) / 12;
    const balance = currentBalance;

    if (balance <= 0) {
      return { months: 0, totalInterest: 0, totalPaid: 0 };
    }

    // Compare paying in full next month vs paying fixed amount
    const payInFullInterest = 0; // If paid in grace period

    let months = 0;
    let totalInterest = 0;
    let remaining = balance;

    // Minimum check: payment must exceed interest
    const minInterestFirstMonth = balance * monthlyRate;
    const effectivePayment = Math.max(monthlyPaymentAmount, minInterestFirstMonth + 5);

    if (monthlyPaymentAmount <= minInterestFirstMonth) {
      return {
        months: 999, // Unpayable
        totalInterest: 99999,
        totalPaid: 99999,
        isNegativeAmortization: true
      };
    }

    while (remaining > 0 && months < 360) {
      months++;
      const interestThisMonth = remaining * monthlyRate;
      totalInterest += interestThisMonth;
      remaining = remaining + interestThisMonth - effectivePayment;
    }

    return {
      months,
      totalInterest: Math.round(totalInterest),
      totalPaid: Math.round(balance + totalInterest),
      isNegativeAmortization: false
    };
  }, [currentBalance, interestRateApr, monthlyPaymentAmount]);

  const toggleScenario = (id: string) => {
    setActiveScenarioIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAnswerQuiz = (choice: 'A' | 'B') => {
    if (selectedOption !== null) return;
    setSelectedOption(choice);
    const currentQ = DECISION_CHALLENGES[quizIdx];
    const isCorrect = choice === currentQ.correct;
    
    if (isCorrect) {
      setQuizScore(prev => prev + currentQ.points);
    }

    setQuizHistory(prev => [...prev, { id: currentQ.id, answered: choice, isCorrect }]);
  };

  const handleNextQuiz = () => {
    if (quizIdx < DECISION_CHALLENGES.length - 1) {
      setQuizIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
      if (onGameComplete) {
        onGameComplete(quizScore);
      }
      if (userId) {
        setDoc(doc(db, 'users', userId), {
          creditScoreGameScore: quizScore,
          lastUpdated: new Date().toISOString()
        }, { merge: true }).catch(err => {
          console.error("Error saving credit score game score:", err);
        });
      }
    }
  };

  const handleResetQuiz = () => {
    setQuizIdx(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizHistory([]);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Bento Header */}
      <div className="bg-gradient-to-br from-slate-950 via-[#0C0E1E] to-[#161B3B] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7F7FFA]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5" /> Credit & FICO Score Modeler
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Credit Score Dynamics & Scenario Lab
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Explore how financial actions directly shape your 300–850 FICO score, understand the 5 core scoring pillars, and calculate true credit card interest costs.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'sandbox' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Score Sandbox
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'calculator' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Payoff & Utilization
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'quiz' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Decision Lab
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: FICO Sandbox & Real-Time Impact Modeler */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          
          {/* Left Column: Live Score Gauge & 5 Factors */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Score Display Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5 text-center">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Simulated FICO Score</span>
                <button 
                  onClick={() => setActiveScenarioIds([])}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Scenarios
                </button>
              </div>

              {/* Big Score Visualizer */}
              <div className="py-2">
                <div className="relative inline-flex items-center justify-center">
                  <span className="text-6xl font-black tracking-tight text-slate-900 font-mono">
                    {simulatedScore}
                  </span>
                  <span className="text-xs font-bold text-slate-400 block ml-2">/ 850</span>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${scoreTier.bg} ${scoreTier.color} ${scoreTier.border}`}>
                    <Sparkles className="w-3.5 h-3.5" /> {scoreTier.label} Tier
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                  {scoreTier.desc}
                </p>
              </div>

              {/* FICO Range Bar */}
              <div className="space-y-1.5 text-left">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-rose-500 w-[25%]" title="Poor (300-579)" />
                  <div className="bg-amber-400 w-[15%]" title="Fair (580-669)" />
                  <div className="bg-blue-500 w-[15%]" title="Good (670-739)" />
                  <div className="bg-indigo-600 w-[15%]" title="Very Good (740-799)" />
                  <div className="bg-emerald-500 w-[30%]" title="Exceptional (800-850)" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>300</span>
                  <span>580</span>
                  <span>670</span>
                  <span>740</span>
                  <span>800</span>
                  <span>850</span>
                </div>
              </div>

              {/* Baseline Selector */}
              <div className="pt-3 border-t border-slate-100 text-left space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Baseline Starting Score:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[580, 650, 720, 780].map((score) => (
                    <button
                      key={score}
                      onClick={() => setBaselineScore(score)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        baselineScore === score 
                          ? 'bg-[#7F7FFA] text-white border-[#7F7FFA]' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5 Core Pillars of FICO Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7F7FFA]" />
                <h3 className="font-extrabold text-slate-900 text-base">The 5 FICO Scoring Pillars</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F4F8FA] rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#3C3C3C] block">1. Payment History</span>
                    <span className="text-slate-500 text-[11px]">Pay on time, every time</span>
                  </div>
                  <span className="font-mono font-black text-[#7F7FFA] bg-white px-2.5 py-1 rounded-lg border border-[#7F7FFA]/20">35%</span>
                </div>

                <div className="p-3 bg-[#F4F8FA] rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#3C3C3C] block">2. Amounts Owed / Utilization</span>
                    <span className="text-slate-500 text-[11px]">Keep balances under 10–30% of limits</span>
                  </div>
                  <span className="font-mono font-black text-[#7F7FFA] bg-white px-2.5 py-1 rounded-lg border border-[#7F7FFA]/20">30%</span>
                </div>

                <div className="p-3 bg-[#F4F8FA] rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#3C3C3C] block">3. Length of Credit History</span>
                    <span className="text-slate-500 text-[11px]">Age of oldest and average accounts</span>
                  </div>
                  <span className="font-mono font-black text-[#7F7FFA] bg-white px-2.5 py-1 rounded-lg border border-[#7F7FFA]/20">15%</span>
                </div>

                <div className="p-3 bg-[#F4F8FA] rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#3C3C3C] block">4. New Credit & Hard Inquiries</span>
                    <span className="text-slate-500 text-[11px]">Avoid opening too many lines quickly</span>
                  </div>
                  <span className="font-mono font-black text-[#7F7FFA] bg-white px-2.5 py-1 rounded-lg border border-[#7F7FFA]/20">10%</span>
                </div>

                <div className="p-3 bg-[#F4F8FA] rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#3C3C3C] block">5. Credit Mix</span>
                    <span className="text-slate-500 text-[11px]">Revolving cards + installment loans</span>
                  </div>
                  <span className="font-mono font-black text-[#7F7FFA] bg-white px-2.5 py-1 rounded-lg border border-[#7F7FFA]/20">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Scenario Action Switches */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-[#3C3C3C] text-lg">Test Real-Life Scenarios</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Toggle actions to observe immediate credit score changes.</p>
                </div>
                <span className="text-xs font-bold text-[#7F7FFA] bg-[#F4F8FA] px-3 py-1 rounded-full border border-[#7F7FFA]/20">
                  {activeScenarioIds.length} Selected
                </span>
              </div>

              <div className="space-y-3">
                {SCENARIO_ACTIONS.map((scenario) => {
                  const isActive = activeScenarioIds.includes(scenario.id);
                  const isPositive = scenario.deltaScore > 0;
                  return (
                    <div
                      key={scenario.id}
                      onClick={() => toggleScenario(scenario.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive 
                          ? isPositive 
                            ? 'border-emerald-300 bg-emerald-50/40 shadow-xs' 
                            : 'border-rose-300 bg-rose-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isActive ? (isPositive ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-slate-300'}`} />
                          <h4 className="text-sm font-bold text-slate-900">{scenario.title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pl-4">{scenario.why}</p>
                        <span className="inline-block text-[11px] text-slate-400 font-semibold pl-4">
                          Timeline: {scenario.recoveryTimeline}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black border ${
                          isPositive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isPositive ? `+${scenario.deltaScore}` : scenario.deltaScore} pts
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isActive 
                            ? isPositive ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-rose-600 border-rose-600 text-white'
                            : 'border-slate-300'
                        }`}>
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Disclaimer card */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Educational Notice:</strong> Credit scores in this simulator are educational models based on general FICO Score guidelines. Actual credit score algorithms (FICO 8/9/10 and VantageScore 3.0/4.0) use complex non-linear multivariate calculations across Equifax, Experian, and TransUnion records.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Revolving Utilization & Payoff Modeler */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          
          {/* Left Controls: Balance & Limit Sliders */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#7F7FFA]" /> Credit Card Parameters
            </h3>

            {/* Credit Limit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Total Credit Limit</span>
                <span className="font-mono text-indigo-600 font-bold">${creditLimit.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={500}
                max={30000}
                step={250}
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full accent-[#7F7FFA]"
              />
            </div>

            {/* Current Balance */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Revolving Balance Carried</span>
                <span className="font-mono text-slate-900 font-bold">${currentBalance.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={creditLimit}
                step={50}
                value={currentBalance}
                onChange={(e) => setCurrentBalance(Number(e.target.value))}
                className="w-full accent-[#7F7FFA]"
              />
            </div>

            {/* APR Interest Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Annual Percentage Rate (APR)</span>
                <span className="font-mono text-rose-600 font-bold">{interestRateApr}%</span>
              </div>
              <input
                type="range"
                min={9.99}
                max={32.99}
                step={0.5}
                value={interestRateApr}
                onChange={(e) => setInterestRateApr(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Monthly Payment */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Planned Monthly Payment</span>
                <span className="font-mono text-emerald-600 font-bold">${monthlyPaymentAmount}/mo</span>
              </div>
              <input
                type="range"
                min={25}
                max={Math.max(500, currentBalance)}
                step={25}
                value={monthlyPaymentAmount}
                onChange={(e) => setMonthlyPaymentAmount(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Right Results: Utilization Impact & Payoff Comparison */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Utilization Meter Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Revolving Utilization</span>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                  utilizationRatio <= 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  utilizationRatio <= 30 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  utilizationRatio <= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {utilizationRatio.toFixed(1)}% Ratio
                </span>
              </div>

              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    utilizationRatio <= 10 ? 'bg-emerald-500' :
                    utilizationRatio <= 30 ? 'bg-blue-500' :
                    utilizationRatio <= 50 ? 'bg-amber-500' :
                    'bg-rose-500'
                  }`}
                  style={{ width: `${utilizationRatio}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {utilizationRatio <= 10 ? (
                  <strong className="text-emerald-700">Optimal (≤10%): Maximizes positive FICO score points.</strong>
                ) : utilizationRatio <= 30 ? (
                  <strong className="text-blue-700">Acceptable (11–30%): Safe for good credit standing.</strong>
                ) : (
                  <strong className="text-rose-700">High Risk (&gt;30%): Depresses credit score significantly. Pay down promptly.</strong>
                )}
              </p>
            </div>

            {/* Payoff Comparison Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-md space-y-5">
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Payoff Time & Interest Cost
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <span className="text-slate-400 text-xs font-semibold block">Time to Debt-Free</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">
                    {payoffAnalysis.isNegativeAmortization ? 'Never' : `${payoffAnalysis.months} Months`}
                  </span>
                  <span className="text-[11px] text-slate-300 mt-0.5 block">
                    At ${monthlyPaymentAmount}/month
                  </span>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <span className="text-slate-400 text-xs font-semibold block">Total Interest Paid</span>
                  <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">
                    ${payoffAnalysis.totalInterest.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-300 mt-0.5 block">
                    Total paid: ${payoffAnalysis.totalPaid.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Pro Tip:</strong> Paying the entire balance in full every month costs <strong className="text-emerald-400">$0 in interest</strong> and keeps your utilization at its healthiest point.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Decision Lab Interactive Challenge */}
      {activeTab === 'quiz' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6 animate-in fade-in">
          {!quizFinished ? (
            <div className="space-y-6">
              {/* Header progress */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <span className="px-3 py-1 bg-[#F4F8FA] text-[#7F7FFA] rounded-full text-xs font-bold uppercase tracking-wider border border-[#7F7FFA]/20">
                  Scenario {quizIdx + 1} of {DECISION_CHALLENGES.length}
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  Score: <strong className="text-[#7F7FFA]">{quizScore} pts</strong>
                </span>
              </div>

              {/* Question */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {DECISION_CHALLENGES[quizIdx].category}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {DECISION_CHALLENGES[quizIdx].question}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3.5">
                <button
                  onClick={() => handleAnswerQuiz('A')}
                  disabled={selectedOption !== null}
                  className={`text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col gap-1 ${
                    selectedOption === null 
                      ? 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50' 
                      : selectedOption === 'A'
                        ? DECISION_CHALLENGES[quizIdx].correct === 'A'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                          : 'border-rose-400 bg-rose-50 text-rose-950'
                        : DECISION_CHALLENGES[quizIdx].correct === 'A'
                          ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900'
                          : 'opacity-40 border-slate-200'
                  }`}
                >
                  <span className="font-bold text-sm sm:text-base">Option A: {DECISION_CHALLENGES[quizIdx].optionA}</span>
                  <span className="text-xs text-slate-600">{DECISION_CHALLENGES[quizIdx].optionADesc}</span>
                </button>

                <button
                  onClick={() => handleAnswerQuiz('B')}
                  disabled={selectedOption !== null}
                  className={`text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col gap-1 ${
                    selectedOption === null 
                      ? 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50' 
                      : selectedOption === 'B'
                        ? DECISION_CHALLENGES[quizIdx].correct === 'B'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                          : 'border-rose-400 bg-rose-50 text-rose-950'
                        : DECISION_CHALLENGES[quizIdx].correct === 'B'
                          ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900'
                          : 'opacity-40 border-slate-200'
                  }`}
                >
                  <span className="font-bold text-sm sm:text-base">Option B: {DECISION_CHALLENGES[quizIdx].optionB}</span>
                  <span className="text-xs text-slate-600">{DECISION_CHALLENGES[quizIdx].optionBDesc}</span>
                </button>
              </div>

              {/* Feedback Banner */}
              {selectedOption !== null && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in slide-in-from-top-2 ${
                  selectedOption === DECISION_CHALLENGES[quizIdx].correct
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {selectedOption === DECISION_CHALLENGES[quizIdx].correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <span className="font-bold text-sm">
                      {selectedOption === DECISION_CHALLENGES[quizIdx].correct ? 'Great Decision! (+50 pts)' : 'Suboptimal Choice'}
                    </span>
                    <p className="text-xs leading-relaxed opacity-90">
                      {DECISION_CHALLENGES[quizIdx].rationale}
                    </p>
                  </div>
                </div>
              )}

              {/* Next Button */}
              {selectedOption !== null && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuiz}
                    className="px-6 py-3 bg-[#7F7FFA] hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs flex items-center gap-2 shadow-md"
                  >
                    {quizIdx < DECISION_CHALLENGES.length - 1 ? 'Next Scenario' : 'Complete Challenge'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Challenge Completed Screen */
            <div className="text-center space-y-5 py-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Decision Lab Complete!</h3>
                <p className="text-sm text-slate-500 mt-1">You demonstrated strong understanding of credit principles.</p>
              </div>

              <div className="p-4 bg-[#F4F8FA] border border-[#7F7FFA]/20 rounded-2xl max-w-xs mx-auto">
                <span className="text-xs font-bold text-[#7F7FFA] uppercase tracking-wider block">Final Score</span>
                <span className="text-3xl font-black text-[#3C3C3C] font-mono">{quizScore} / {DECISION_CHALLENGES.length * 50} pts</span>
              </div>

              <button
                onClick={handleResetQuiz}
                className="px-6 py-3 bg-[#7F7FFA] text-white font-bold rounded-xl hover:bg-[#7F7FFA]/90 transition-all text-xs inline-flex items-center gap-2 shadow-md cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Retake Challenge
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
