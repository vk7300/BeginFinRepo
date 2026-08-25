import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckSquare, 
  Calculator, 
  Send, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Info, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const TaxRoadmap: React.FC<Props> = ({ onComplete, onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = [
    { id: 1, title: 'W-4 Mastery', icon: FileText },
    { id: 2, title: 'The Paper Trail', icon: CheckSquare },
    { id: 3, title: 'The 1040 Logic', icon: Calculator },
    { id: 4, title: 'Filing Methods', icon: Send },
    { id: 5, title: 'The Refund', icon: DollarSign },
  ];

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <FileText className="w-6 h-6" /> What is a W-4?
              </h3>
              <p className="text-indigo-800 leading-relaxed">
                The <span className="font-bold">Form W-4</span> tells your employer how much federal income tax to withhold from your paycheck. 
                If you withhold too much, you get a big refund (an interest-free loan to the government). 
                If you withhold too little, you might owe money and penalties.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-2">Pro Tip: Head of Household</h4>
                <p className="text-sm text-slate-600">If you are unmarried and pay more than half the cost of keeping up a home for a qualifying person, check this box to lower your taxes.</p>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-2">Multiple Jobs?</h4>
                <p className="text-sm text-slate-600">If you have two jobs, use the "Multiple Jobs Worksheet" on the W-4 to ensure both employers withhold the correct total amount.</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                <span className="font-bold">Avoid over-withholding:</span> Use the IRS Tax Withholding Estimator online once a year to check if you're on track.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-bold text-slate-900">Gather Your Documents</h3>
            <p className="text-slate-600">Before you start filing, ensure you have the following documents ready. This "Paper Trail" is essential for accurate filing.</p>
            
            <div className="space-y-3">
              {[
                { id: 'w2', label: 'W-2 (Wage and Tax Statement)', desc: 'From every employer you worked for. Shows how much you earned and how much was withheld.' },
                { id: 'i1099', label: '1099-INT (Interest Income)', desc: 'From your bank if you earned more than $10 in interest.' },
                { id: 't1098', label: '1098-T (Tuition Statement)', desc: 'From your college. Essential for claiming education credits.' },
                { id: 'id', label: 'Government Issued ID', desc: 'Driver\'s License or Passport for identity verification.' }
              ].map(item => (
                <div 
                  key={item.id}
                  className="w-full flex items-start gap-4 p-4 rounded-xl border bg-white border-slate-100"
                >
                  <div className="mt-1 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calculator className="w-6 h-6" /> The 1040 Logic: An Example
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-indigo-800/30 rounded-xl border border-indigo-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Total Income</span>
                    <span className="text-xl font-bold">$50,000</span>
                  </div>
                  <p className="text-[10px] text-indigo-400 italic">Example: Your total earnings for the year.</p>
                </div>

                <div className="flex items-center justify-center py-1">
                  <span className="text-indigo-400 font-bold text-xl">−</span>
                </div>

                <div className="p-4 bg-indigo-800/30 rounded-xl border border-indigo-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Standard Deduction</span>
                    <span className="text-xl font-bold">$14,600</span>
                  </div>
                  <p className="text-[10px] text-indigo-400 italic">2024 amount for Single filers. This amount is tax-free.</p>
                </div>

                <div className="pt-4 border-t border-indigo-700">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-200">Taxable Income:</span>
                    <span className="text-3xl font-black text-emerald-400">$35,400</span>
                  </div>
                  <p className="text-[10px] text-indigo-400 mt-2">This is the portion of your income that is actually subject to federal income tax.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3">
              <Info className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-sm text-slate-600">
                <span className="font-bold">How it works:</span> You don't pay taxes on your entire paycheck. The government gives you a "Standard Deduction" (a chunk of money you don't have to pay taxes on). Subtracting this from your total income gives you your <span className="font-bold">Taxable Income</span>.
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-bold text-slate-900">Choose Your Filing Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white border-2 border-indigo-100 rounded-2xl hover:border-indigo-500 transition-all group">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600 font-black">USA</div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">FreeTaxUSA</h4>
                <ul className="text-sm text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free Federal Filing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Supports complex forms</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Highly rated by experts</li>
                </ul>
                <a href="https://www.freetaxusa.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:underline">
                  Visit Website <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="p-6 bg-white border-2 border-emerald-100 rounded-2xl hover:border-emerald-500 transition-all group">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600 font-black">VITA</div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">IRS VITA Program</h4>
                <ul className="text-sm text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free in-person help</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> For income {"<"} $64,000</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Great for students</li>
                </ul>
                <a href="https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:underline">
                  Find a Location <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">The Finish Line</h3>
              <p className="text-slate-500">You've mapped out your tax lifecycle!</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold">01</div>
                <div>
                  <p className="font-bold text-slate-900">Direct Deposit is King</p>
                  <p className="text-xs text-slate-500">Get your refund in 21 days or less. Paper checks can take months.</p>
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 font-bold">02</div>
                <div>
                  <p className="font-bold text-slate-900">The April 15 Deadline</p>
                  <p className="text-xs text-slate-500">Mark your calendar. If you owe money, pay by this date to avoid interest.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={onComplete}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Complete Module <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">TAX ROADMAP</h2>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Informational Guide</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Progress Tracker */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex justify-between items-center px-2 min-w-[500px] md:min-w-0 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isPast = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200' : 
                  isPast ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {isPast ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : <Icon className="w-4 h-4 md:w-5 md:h-5" />}
                </div>
                <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
          {/* Progress Line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-10 mx-12" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 -z-10 mx-12 transition-all duration-700 ease-out" 
            style={{ width: `calc(${(currentStep - 1) / 4 * 100}% - 24px)` }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button 
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-5 h-5" /> Previous
        </button>
        
        {currentStep < 5 && (
          <button 
            onClick={nextStep}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            Next Step <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
