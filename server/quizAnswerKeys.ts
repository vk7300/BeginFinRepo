export interface ServerQuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ModuleQuizSet {
  quiz: ServerQuizQuestion[];
  quizAlternative?: ServerQuizQuestion[];
}

export const SERVER_QUIZ_KEYS: Record<string, ModuleQuizSet> = {
  m1: {
    quiz: [
      {
        question: "Which account is best for your daily gas and grocery purchases?",
        options: ["Savings Account", "Checking Account", "Brokerage Account", "Trust Fund"],
        correctIndex: 1
      },
      {
        question: "In the 50/30/20 rule, where does a Netflix subscription go?",
        options: ["Needs", "Wants", "Financial Goals", "Taxes"],
        correctIndex: 1
      },
      {
        question: "Why choose an HYSA over a regular savings account?",
        options: ["Easier ATM access", "Higher interest returns", "Better debit card colors", "Free checkbooks"],
        correctIndex: 1
      },
      {
        question: "What percentage of income is recommended for 'Needs'?",
        options: ["20%", "30%", "50%", "70%"],
        correctIndex: 2
      }
    ],
    quizAlternative: [
      {
        question: "Which agency federally insures checking and savings accounts up to $250,000 at a credit union?",
        options: ["FDIC", "SEC", "NCUA", "Federal Reserve"],
        correctIndex: 2
      },
      {
        question: "According to the National Standards, how should charitable giving be incorporated?",
        options: ["Only if there is leftover cash at the end of the year", "As an intentional, pre-planned part of your financial allocations", "By borrowing money to donate", "It is discouraged in modern financial planning"],
        correctIndex: 1
      },
      {
        question: "What does APY stand for in bank accounts?",
        options: ["Annual Percentage Yield", "Average Payment Year", "Asset Portfolio Yield", "Accrued Principal Yield"],
        correctIndex: 0
      },
      {
        question: "If your monthly net income is $4,000, how much should be directed to savings/investments under the 50/30/20 rule?",
        options: ["$2,000", "$1,200", "$800", "$400"],
        correctIndex: 2
      }
    ]
  },
  m2: {
    quiz: [
      {
        question: "Which form do you receive annually from your employer to report earnings?",
        options: ["W-4", "W-2", "I-9", "1040-ES"],
        correctIndex: 1
      },
      {
        question: "What is 'Net Pay'?",
        options: ["Salary before taxes", "Salary after all taxes/deductions", "Company profit share", "Total bonuses"],
        correctIndex: 1
      },
      {
        question: "Which form do you fill out to set your tax withholding when hired?",
        options: ["W-2", "W-4", "1099", "1040"],
        correctIndex: 1
      },
      {
        question: "What is the typical deadline for filing personal income taxes in the US?",
        options: ["January 1", "April 15", "July 4", "December 31"],
        correctIndex: 1
      }
    ],
    quizAlternative: [
      {
        question: "What two social programs are funded by FICA payroll taxes?",
        options: ["Medicaid and Food Stamps", "Social Security and Medicare", "Public Education and Infrastructure", "Military and Defense"],
        correctIndex: 1
      },
      {
        question: "Why should you periodically review and update your W-4 form?",
        options: ["To change your job title", "To adjust tax withholding based on life changes like marriage or a new baby", "To get a higher starting hourly rate", "To claim exemptions from FICA taxes"],
        correctIndex: 1
      },
      {
        question: "If a worker has a gross pay of $1,000 and net pay of $750, what does the $250 difference represent?",
        options: ["Direct savings", "Total deductions and withholdings", "Discretionary spends", "Company overhead cost"],
        correctIndex: 1
      },
      {
        question: "Who pays FICA taxes on behalf of an employee?",
        options: ["Only the employee", "Only the employer", "Both the employee and the employer equally", "The state government"],
        correctIndex: 2
      }
    ]
  },
  m3: {
    quiz: [
      {
        question: "What does buying a 'Stock' represent?",
        options: ["A loan to a company", "Partial ownership in a company", "A tax deduction", "Insurance policy"],
        correctIndex: 1
      },
      {
        question: "What is the primary benefit of an Index Fund?",
        options: ["Guaranteed profit", "Zero management fees", "Diversification across many assets", "Government backing"],
        correctIndex: 2
      },
      {
        question: "Which asset is considered 'Fixed Income'?",
        options: ["Common Stocks", "Bonds", "Cryptocurrency", "Venture Capital"],
        correctIndex: 1
      },
      {
        question: "What is 'Asset Allocation'?",
        options: ["Picking the best single stock", "Dividing your portfolio across different assets", "Paying your broker", "Buying gold"],
        correctIndex: 1
      }
    ],
    quizAlternative: [
      {
        question: "How does diversification protect an investor?",
        options: ["It guarantees positive returns", "It eliminates all market volatility", "It spreads risk so that a single stock failure doesn't ruin the portfolio", "It lowers taxes on capital gains"],
        correctIndex: 2
      },
      {
        question: "What is the primary trade-off when choosing bonds over stocks?",
        options: ["Higher growth potential but higher risk", "Lower risk but lower potential returns", "Guaranteed higher dividends", "Zero liquidity"],
        correctIndex: 1
      },
      {
        question: "Why does inflation pose a threat to holding cash long-term?",
        options: ["It reduces the liquidity of cash", "It erodes the purchasing power of money over time", "It causes interest rates to drop to zero", "It increases taxes on cash savings"],
        correctIndex: 1
      },
      {
        question: "What is compound growth?",
        options: ["Earning returns on your original principal only", "Earning returns on both your principal and prior returns", "Paying compound taxes on investments", "Losing money steadily over time"],
        correctIndex: 1
      }
    ]
  },
  m4: {
    quiz: [
      {
        question: "What is the most important factor in calculating your credit score?",
        options: ["Amount of credit used", "Payment history", "Length of credit history", "Types of credit"],
        correctIndex: 1
      },
      {
        question: "What is a recommended 'Credit Utilization' ratio?",
        options: ["100%", "Above 50%", "Below 30%", "As high as possible"],
        correctIndex: 2
      },
      {
        question: "Which of these is typically considered 'Good Debt'?",
        options: ["Credit card debt", "A mortgage", "A payday loan", "A vacation loan"],
        correctIndex: 1
      },
      {
        question: "The 'Avalanche Method' of debt repayment focuses on which debt first?",
        options: ["Smallest balance", "Largest balance", "Highest interest rate", "Lowest interest rate"],
        correctIndex: 2
      }
    ],
    quizAlternative: [
      {
        question: "What are the three major credit bureaus that compile credit reports in the US?",
        options: ["Equifax, Experian, TransUnion", "FICO, VantageScore, IRS", "Chase, Bank of America, Wells Fargo", "Federal Reserve, FDIC, SEC"],
        correctIndex: 0
      },
      {
        question: "If your total credit limit across all cards is $10,000, what is the maximum recommended balance to keep your utilization healthy?",
        options: ["$1,000", "$3,000", "$5,000", "$9,000"],
        correctIndex: 1
      },
      {
        question: "How does a higher credit score affect the cost of borrowing?",
        options: ["It has no effect on interest rates", "It leads to lower interest rates and lower total borrowing costs", "It increases fees and insurance premiums", "It limits the maximum amount you can borrow"],
        correctIndex: 1
      },
      {
        question: "What is credit utilization?",
        options: ["The number of times you swipe your card in a month", "The ratio of your total credit card balances to your total credit limits", "The interest rate on your unpaid balance", "The annual fee charged by the card provider"],
        correctIndex: 1
      }
    ]
  },
  m5: {
    quiz: [
      {
        question: "What is 'Employer Matching' in a retirement plan?",
        options: ["A loan from your boss", "Free money your company adds to your savings", "A tax deduction", "An insurance policy"],
        correctIndex: 1
      },
      {
        question: "What does a 'Tax Deduction' do?",
        options: ["Increases your taxes", "Reduces the amount of your income that is taxed", "Pays off your debt", "Reduces your credit score"],
        correctIndex: 1
      },
      {
        question: "What is 'Capital Gains Tax'?",
        options: ["Tax on your regular salary", "Tax on profits from selling investments", "A property tax", "A sales tax"],
        correctIndex: 1
      },
      {
        question: "When should you start saving for retirement?",
        options: ["At age 50", "After buying your dream car", "As soon as possible (now)", "After you retire"],
        correctIndex: 2
      }
    ],
    quizAlternative: [
      {
        question: "What is the key advantage of a Roth retirement account?",
        options: ["Immediate tax deduction when contributing", "Tax-free growth and tax-free withdrawals in retirement", "Guaranteed high interest rates", "Ability to withdraw all funds without penalty at any age"],
        correctIndex: 1
      },
      {
        question: "How does tax-deferral benefit a traditional retirement account?",
        options: ["You never pay taxes on the money", "You delay paying taxes until you withdraw the funds in retirement", "You pay taxes immediately but at a discounted rate", "It eliminates all investment risk"],
        correctIndex: 1
      },
      {
        question: "Why is employer matching referred to as 'free money'?",
        options: ["It is paid directly to your bank checking account", "It is an additional employer contribution that matches your savings up to a limit", "It is funded by state tax credits", "It does not require you to contribute anything"],
        correctIndex: 1
      },
      {
        question: "What is taxable income?",
        options: ["Your total gross salary before any adjustments", "The adjusted portion of your income that is subject to taxation after deductions", "The total amount of tax you owe", "Your salary after all taxes are paid"],
        correctIndex: 1
      }
    ]
  },
  m6: {
    quiz: [
      {
        question: "Which form is used to set up your federal tax withholding when you start a new job?",
        options: ["W-2", "W-4", "1040", "1099"],
        correctIndex: 1
      },
      {
        question: "What is the standard deadline for filing your individual federal tax return in the US?",
        options: ["January 1st", "April 15th", "July 4th", "December 31st"],
        correctIndex: 1
      },
      {
        question: "Which document does your employer send you by January 31st showing your earnings and taxes paid?",
        options: ["Form 1040", "Form W-4", "Form W-2", "Form 1098"],
        correctIndex: 2
      },
      {
        question: "What is the difference between tax deductions and tax credits?",
        options: ["Deductions are for rich people only", "Deductions lower taxable income; credits lower tax bill dollar-for-dollar", "They are the same thing", "Credits are only for business owners"],
        correctIndex: 1
      }
    ],
    quizAlternative: [
      {
        question: "What is the Standard Deduction in federal income tax?",
        options: ["A penalty for late filing", "A fixed dollar amount that reduces your taxable income, depending on filing status", "A tax credit for low-income earners", "The automatic withholding from your pay"],
        correctIndex: 1
      },
      {
        question: "Why should you use Direct Deposit when receiving a tax refund?",
        options: ["It is required by federal law", "It is faster, safer, and deposits the refund directly into your bank account", "It increases your total refund amount", "It prevents you from being audited"],
        correctIndex: 1
      },
      {
        question: "What happens if you do not file your tax return by the April 15th deadline?",
        options: ["Nothing, there are no deadlines", "The IRS will automatically file it and pay you a refund", "You may face failure-to-file and failure-to-pay penalties and interest", "Your credit score immediately drops to 300"],
        correctIndex: 2
      },
      {
        question: "Which IRS program provides free tax prep assistance to individuals with moderate income or disabilities?",
        options: ["VITA (Volunteer Income Tax Assistance)", "SEC", "FICA", "W-4 Support"],
        correctIndex: 0
      }
    ]
  },
  m7: {
    quiz: [
      {
        question: "Which type of insurance is usually required by law for drivers?",
        options: ["Life Insurance", "Auto Insurance", "Pet Insurance", "Disability Insurance"],
        correctIndex: 1
      },
      {
        question: "What is the primary purpose of an insurance 'Premium'?",
        options: ["The amount you pay to keep the policy active", "The amount you pay when you make a claim", "The maximum the insurance will pay", "A bonus for not having accidents"],
        correctIndex: 0
      },
      {
        question: "How can you prevent someone from opening a new credit card in your name?",
        options: ["Delete your bank app", "Freeze your credit with the 3 major bureaus", "Change your phone number", "Pay in cash only"],
        correctIndex: 1
      },
      {
        question: "Why do you need Renters Insurance if you don't own the building?",
        options: ["To pay the landlord's mortgage", "To protect your personal belongings like electronics and furniture", "To pay for building repairs", "It is never needed for renters"],
        correctIndex: 1
      }
    ],
    quizAlternative: [
      {
        question: "What is an insurance 'Deductible'?",
        options: ["The discount you get for safe driving", "The out-of-pocket amount you must pay before insurance coverage kicks in", "The monthly fee to keep the policy active", "The maximum limit the policy will pay"],
        correctIndex: 1
      },
      {
        question: "How does raising your deductible affect your premium?",
        options: ["It raises your premium", "It typically lowers your premium", "It has no effect on premium costs", "It cancels your insurance coverage"],
        correctIndex: 1
      },
      {
        question: "How much money is recommended to hold in a liquid emergency fund?",
        options: ["1 week of expenses", "3 to 6 months of basic living expenses", "1 year of total gross income", "$100,000"],
        correctIndex: 1
      },
      {
        question: "What risk does Renters Insurance primarily transfer?",
        options: ["The cost of building foundation repairs", "The cost of replacing stolen or damaged personal belongings inside a rented home", "The landlord's loss of rental income", "The tenant's utility bills"],
        correctIndex: 1
      }
    ]
  },
  m8: {
    quiz: [
      {
        question: "Where can you get a free credit report once a year from each bureau?",
        options: ["FreeCreditScore.com", "AnnualCreditReport.com", "IRS.gov", "CreditKarma.com"],
        correctIndex: 1
      },
      {
        question: "What is the best way to secure your accounts from unauthorized access?",
        options: ["Using the same password", "Two-Factor Authentication (2FA)", "Writing passwords on paper", "Sharing passwords with friends"],
        correctIndex: 1
      },
      {
        question: "Which type of organization usually qualifies for tax-deductible donations?",
        options: ["For-profit corporations", "501(c)(3) non-profits", "Political campaigns", "Private clubs"],
        correctIndex: 1
      }
    ],
    quizAlternative: [
      {
        question: "What does a credit freeze do to protect you from identity theft?",
        options: ["It closes all your existing credit cards", "It blocks lenders from pulling your credit report, preventing new unauthorized accounts", "It drops your credit utilization to zero", "It pays off your balances automatically"],
        correctIndex: 1
      },
      {
        question: "What is the primary official website to request your free annual credit report under the law?",
        options: ["FreeCreditScore.com", "AnnualCreditReport.com", "CreditKarma.com", "MyFICO.com"],
        correctIndex: 1
      },
      {
        question: "Under the Fair Credit Reporting Act (FCRA), what is your main right?",
        options: ["A guaranteed credit score of 800", "To review and dispute any inaccurate information on your credit report", "Free credit cards with zero interest", "Exemption from paying income taxes"],
        correctIndex: 1
      },
      {
        question: "Which of these constitutes a form of philanthropy under the National Standards?",
        options: ["Buying stock in an green energy company", "Donating money, volunteering your time, or sharing your expertise with a local non-profit", "Paying your monthly utility bills", "Saving money in a High-Yield Savings Account"],
        correctIndex: 1
      }
    ]
  },
  m9: {
    quiz: [],
    quizAlternative: []
  }
};

export interface StrippedQuizQuestion {
  id?: string;
  question: string;
  options: string[];
}

export function getStrippedQuestionsForModule(moduleId: string) {
  const modData = SERVER_QUIZ_KEYS[moduleId];
  if (!modData) return null;

  const strip = (qList: ServerQuizQuestion[]): StrippedQuizQuestion[] =>
    qList.map(q => ({
      id: q.id,
      question: q.question,
      options: [...q.options]
    }));

  return {
    moduleId,
    quiz: strip(modData.quiz),
    quizAlternative: modData.quizAlternative ? strip(modData.quizAlternative) : []
  };
}

export interface UserSubmittedAnswer {
  questionIdx: number;
  selectedIdx: number;
}

export interface GradingResult {
  passed: boolean;
  score: number;
  totalQuestions: number;
  results: Array<{
    questionIdx: number;
    selectedIdx: number;
    isCorrect: boolean;
    correctIndex: number;
  }>;
}

export function gradeQuizAnswers(
  moduleId: string,
  quizVersion: 'standard' | 'alternative' = 'standard',
  submittedAnswers: UserSubmittedAnswer[]
): GradingResult | null {
  const modData = SERVER_QUIZ_KEYS[moduleId];
  if (!modData) return null;

  const targetQuiz = quizVersion === 'alternative' && modData.quizAlternative && modData.quizAlternative.length > 0
    ? modData.quizAlternative
    : modData.quiz;

  let score = 0;
  const results = targetQuiz.map((q, idx) => {
    const userAns = submittedAnswers.find(a => a.questionIdx === idx);
    const selectedIdx = userAns ? userAns.selectedIdx : -1;
    const isCorrect = selectedIdx === q.correctIndex;
    if (isCorrect) {
      score += 1;
    }
    return {
      questionIdx: idx,
      selectedIdx,
      isCorrect,
      correctIndex: q.correctIndex
    };
  });

  const totalQuestions = targetQuiz.length;
  const passed = totalQuestions === 0 ? true : (score === totalQuestions);

  return {
    passed,
    score,
    totalQuestions,
    results
  };
}
