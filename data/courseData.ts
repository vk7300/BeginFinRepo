import { Language } from './uiTranslations';

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
}

export interface ModuleData {
  title: string;
  description: string;
  content: string;
  quiz: QuizQuestion[];
  quizAlternative?: QuizQuestion[];
}

export interface Module {
  id: string;
  requiresAuth?: boolean;
  isOptional?: boolean;
  translations: { en: ModuleData };
}

const blueText = (text: string) => `**${text}**`;

export const modules: Module[] = [
  {
    id: 'm1',
    translations: {
      en: {
        title: 'Personal Finance Fundamentals',
        description: 'Master bank accounts, budgeting, and the 50/30/20 rule.',
        content: `
          Strong personal finance starts with understanding key economic principles, measuring your financial position, and managing the flow of your money.

          Fundamental Economic Concepts:
          Every financial choice you make involves trade-offs. Understanding these economic realities helps you make more deliberate decisions.
          • ${blueText("Scarcity")}: The fundamental economic problem of having unlimited human desires but limited resources (time, money, energy). Scarcity forces us to make choices.
          • ${blueText("Opportunity Cost")}: The value of the next best alternative that you give up when making a choice. For example, if Maria wants a new laptop but also needs to pay rent, choosing to pay rent means her opportunity cost is the laptop. Every dollar spent on one item is a dollar that cannot be spent on another.

          Measuring Your Wealth:
          Before you can navigate to a destination, you must know your starting point. This is measured by your personal balance sheet.
          • ${blueText("Assets")}: Items of value that you own, including cash, bank accounts, investments, and physical property.
          • ${blueText("Liabilities")}: Financial debts or obligations that you owe to others, such as credit card balances, student loans, or car notes.
          • ${blueText("Net Worth")}: The ultimate measure of your overall financial position, defined mathematically as ${blueText("Assets minus Liabilities")}. Building wealth is the process of increasing your assets while reducing your liabilities.

          Banking Essentials:
          Financial stability begins with choosing where to deposit your earnings. Selecting the right accounts protects your capital and ensures adequate liquidity.
          • ${blueText("Checking Accounts")}: Serving as your primary spending hub, checking accounts provide instant access to your funds via debit cards, ATMs, and electronic transfers. They typically offer low or zero interest and are designed for high-frequency daily transactions.
          • ${blueText("Savings Accounts")}: Designed for storing wealth and establishing emergency reserves, these accounts offer a safe place to hold capital while earning modest interest. To protect consumers, financial institutions historically limited monthly withdrawals from savings accounts, encouraging disciplined saving habits.
          • ${blueText("High-Yield Savings Accounts (HYSA)")}: Offered primarily by online banks, HYSAs feature interest rates that are often 10 to 20 times higher than traditional brick-and-mortar savings accounts. This yields significantly better compound growth while maintaining near-instant access to your capital.
          • ${blueText("Federal Protection (FDIC/NCUA)")}: When choosing a bank, always ensure they are backed by the Federal Deposit Insurance Corporation (FDIC) for banks, or the National Credit Union Administration (NCUA) for credit unions. This federally insures your deposits up to $250,000 per depositor, per institution, securing your hard-earned money against bank failures.
          • ${blueText("Annual Percentage Yield (APY)")}: The APY reflects the total amount of interest you earn on an account in one year, taking compounding frequency into account. A higher APY means your savings grow faster over time.

          The Art of Budgeting:
          • ${blueText("Budget")}: A budget is not merely a record of past purchases; it is a proactive, strategic plan for how your future income will be spent, saved, and invested.
          • ${blueText("Prioritization")}: When building a budget, you must prioritize ${blueText("essential needs")} (like housing, utilities, and basic food) first before allocating funds to discretionary wants or lifestyle enhancements.
          • ${blueText("The 50/30/20 Rule")}: A widely respected, simple framework for allocating your monthly net (after-tax) income:
            - ${blueText("50% Needs")}: Essential obligations that you must pay to survive. This includes rental or mortgage payments, basic utilities (electricity, water), health and auto insurance, minimal groceries, and minimum mandatory debt payments.
            - ${blueText("30% Wants")}: Discretionary spending on choices that enhance your lifestyle but are not strictly necessary. This includes restaurant dining, gym memberships, Netflix or Spotify subscriptions, hobbies, travel, and impulse purchases.
            - ${blueText("20% Financial Goals")}: Saving and investing in your future. This portion is dedicated to building a 3-to-6-month emergency fund, investing in retirement accounts (like IRAs or 401ks), or paying down high-interest debt (such as credit card balances) beyond the minimum payment.

          Charitable Giving:
          • ${blueText("Giving Back")}: National Standards for Personal Financial Education emphasize that charitable giving should be an intentional part of your broader financial plan. Whether it is 1% or 10% of your income, allocating resources to non-profit organizations or community causes helps create positive social impact while fostering a healthy relationship with wealth.

          Key Takeaway: A budget is not a set of restrictions designed to limit your freedom; it is a personalized roadmap that gives you permission to spend your money intentionally, without guilt.
        `,
        quiz: [
          {
            question: "Which account is best for your daily gas and grocery purchases?",
            options: ["Savings Account", "Checking Account", "Brokerage Account", "Trust Fund"]
          },
          {
            question: "In the 50/30/20 rule, where does a Netflix subscription go?",
            options: ["Needs", "Wants", "Financial Goals", "Taxes"]
          },
          {
            question: "Why choose an HYSA over a regular savings account?",
            options: ["Easier ATM access", "Higher interest returns", "Better debit card colors", "Free checkbooks"]
          },
          {
            question: "What percentage of income is recommended for 'Needs'?",
            options: ["20%", "30%", "50%", "70%"]
          }
        ],
        quizAlternative: [
          {
            question: "Which agency federally insures checking and savings accounts up to $250,000 at a credit union?",
            options: ["FDIC", "SEC", "NCUA", "Federal Reserve"]
          },
          {
            question: "According to the National Standards, how should charitable giving be incorporated?",
            options: ["Only if there is leftover cash at the end of the year", "As an intentional, pre-planned part of your financial allocations", "By borrowing money to donate", "It is discouraged in modern financial planning"]
          },
          {
            question: "What does APY stand for in bank accounts?",
            options: ["Annual Percentage Yield", "Average Payment Year", "Asset Portfolio Yield", "Accrued Principal Yield"]
          },
          {
            question: "If your monthly net income is $4,000, how much should be directed to savings/investments under the 50/30/20 rule?",
            options: ["$2,000", "$1,200", "$800", "$400"]
          }
        ]
      }
    }
  },
  {
    id: 'm2',
    translations: {
      en: {
        title: 'Job Finance & USA Taxes',
        description: 'Understanding paychecks, W-2 vs W-4, and IRS forms.',
        content: `
          Understanding how much you actually keep from your paycheck is vital for long-term planning. Earning income is the foundation of wealth, but tax regulations determine your true disposable income.

          Essential USA Tax Forms:
          Navigating IRS documentation is an important practical life skill. Knowing which forms to complete and file helps keep your records accurate and prevents avoidable penalties.
          • ${blueText("W-4 Form")}: Completed when starting a job. It tells your employer how much federal income tax to withhold from your pay. Filing this accurately prevents a surprise tax bill in April.
          • ${blueText("W-2 Form")}: A formal tax summary of your annual earnings and the taxes withheld. Your employer must send this to you by January 31st each year.
          • ${blueText("1040 Form")}: The main individual tax return form filed annually with the IRS to calculate your final tax liability, tax credits, and any refund owed.

          Paycheck Terminology:
          To manage your personal cash flows, you must dissect the components of your compensation statement.
          • ${blueText("Gross Pay")}: Your total earnings before any taxes, retirement contributions, or benefit deductions are removed.
          • ${blueText("Net Pay")}: Your actual "take-home" pay. This is the liquid money deposited into your bank account on payday.
          • ${blueText("FICA Taxes")}: Mandatory federal payroll deductions that fund Social Security (6.2%) and Medicare (1.45%) systems. These are matched by your employer.
          • ${blueText("Tax Withholding")}: The portion of your gross pay sent directly to the federal and state governments by your employer as advance payments toward your annual tax liability.

          Pro Tip:
          • ${blueText("Withholding Strategy")}: Proactive personal finance frameworks recommend evaluating your tax withholding choices periodically. Adjusting your W-4 ensures you do not give the government an interest-free loan (by receiving an oversized refund) or end up owing substantial penalties at year-end.
        `,
        quiz: [
          {
            question: "Which form do you receive annually from your employer to report earnings?",
            options: ["W-4", "W-2", "I-9", "1040-ES"]
          },
          {
            question: "What is 'Net Pay'?",
            options: ["Salary before taxes", "Salary after all taxes/deductions", "Company profit share", "Total bonuses"]
          },
          {
            question: "Which form do you fill out to set your tax withholding when hired?",
            options: ["W-2", "W-4", "1099", "1040"]
          },
          {
            question: "What is the typical deadline for filing personal income taxes in the US?",
            options: ["January 1", "April 15", "July 4", "December 31"]
          }
        ],
        quizAlternative: [
          {
            question: "What two social programs are funded by FICA payroll taxes?",
            options: ["Medicaid and Food Stamps", "Social Security and Medicare", "Public Education and Infrastructure", "Military and Defense"]
          },
          {
            question: "Why should you periodically review and update your W-4 form?",
            options: ["To change your job title", "To adjust tax withholding based on life changes like marriage or a new baby", "To get a higher starting hourly rate", "To claim exemptions from FICA taxes"]
          },
          {
            question: "If a worker has a gross pay of $1,000 and net pay of $750, what does the $250 difference represent?",
            options: ["Direct savings", "Total deductions and withholdings", "Discretionary spends", "Company overhead cost"]
          },
          {
            question: "Who pays FICA taxes on behalf of an employee?",
            options: ["Only the employee", "Only the employer", "Both the employee and the employer equally", "The state government"]
          }
        ]
      }
    }
  },
  {
    id: 'm3',
    translations: {
      en: {
        title: 'Investing Basics',
        description: 'Introduction to stocks, bonds, and ETFs.',
        content: `
          Investing is the engine of long-term wealth creation. It is the process of putting your money into assets that have the potential to grow in value over time, outpacing inflation.

          Primary Asset Classes:
          Understanding asset classes helps you design a portfolio that balances risk and return.
          • ${blueText("Stocks (Equities)")}: Buying a share of ownership in a public corporation. Offers high potential growth but carries higher risk, as stock prices can be volatile.
          • ${blueText("Bonds (Fixed-Income)")}: Essentially a loan you make to a government or corporation. The issuer pays you regular interest and returns the principal at maturity. Generally lower risk than stocks.
          • ${blueText("Index Funds & ETFs")}: A single "basket" that holds hundreds of different stocks or bonds. This provides instant diversification, protecting you from the failure of any single company.

          Key Investment Principles:
          • ${blueText("Compound Growth")}: Earning returns on your previous returns. Over decades, compounding turns small regular savings into significant wealth.
          • ${blueText("Risk vs. Reward")}: The fundamental law of investing: to earn higher potential returns, you must accept greater potential risk of loss.
          • ${blueText("Diversification")}: Spreading your investment capital across multiple companies, industries, and asset classes to reduce overall portfolio risk.

          Pro Tip:
          • ${blueText("Asset Allocation")}: Standard financial planning guidelines highlight that your portfolio should align with your specific time horizon and risk tolerance. A longer time horizon typically allows for higher allocations to stocks, as you have time to recover from market downturns.
          • ${blueText("Risk Tolerance")}: An investor's emotional and financial capacity to endure market volatility and potential investment losses without liquidating assets prematurely. It is shaped by your investment timeline, cash reserves, and financial obligations.
        `,
        quiz: [
          {
            question: "What does buying a 'Stock' represent?",
            options: ["A loan to a company", "Partial ownership in a company", "A tax deduction", "Insurance policy"]
          },
          {
            question: "What is the primary benefit of an Index Fund?",
            options: ["Guaranteed profit", "Zero management fees", "Diversification across many assets", "Government backing"]
          },
          {
            question: "Which asset is considered 'Fixed Income'?",
            options: ["Common Stocks", "Bonds", "Cryptocurrency", "Venture Capital"]
          },
          {
            question: "What is 'Asset Allocation'?",
            options: ["Picking the best single stock", "Dividing your portfolio across different assets", "Paying your broker", "Buying gold"]
          }
        ],
        quizAlternative: [
          {
            question: "How does diversification protect an investor?",
            options: ["It guarantees positive returns", "It eliminates all market volatility", "It spreads risk so that a single stock failure doesn't ruin the portfolio", "It lowers taxes on capital gains"]
          },
          {
            question: "What is the primary trade-off when choosing bonds over stocks?",
            options: ["Higher growth potential but higher risk", "Lower risk but lower potential returns", "Guaranteed higher dividends", "Zero liquidity"]
          },
          {
            question: "Why does inflation pose a threat to holding cash long-term?",
            options: ["It reduces the liquidity of cash", "It erodes the purchasing power of money over time", "It causes interest rates to drop to zero", "It increases taxes on cash savings"]
          },
          {
            question: "What is compound growth?",
            options: ["Earning returns on your original principal only", "Earning returns on both your principal and prior returns", "Paying compound taxes on investments", "Losing money steadily over time"]
          }
        ]
      }
    }
  },
  {
    id: 'm4',
    translations: {
      en: {
        title: 'Debt & Credit Mastery',
        description: 'Understand credit scores, interest rates, and leverage.',
        content: `
          Managing debt is just as important as growing assets. Credit is a powerful tool; used wisely, it builds wealth, but used poorly, it leads to financial ruin.

          The Credit Ecosystem:
          Your credit profile dictates your ability to purchase homes, buy vehicles, and access favorable interest rates.
          • ${blueText("Credit Score")}: A three-digit number (ranging from 300 to 850) that represents your creditworthiness to lenders.
          • ${blueText("Payment History (35%)")}: The single largest factor in your FICO score. Late payments can severely damage your credit rating.
          • ${blueText("Credit Utilization (30%)")}: The percentage of your available credit that you are currently using. Standard guidelines recommend keeping this below 30%.
          • ${blueText("Credit Report")}: A detailed record of your borrowing history compiled by the three major credit bureaus: Equifax, Experian, and TransUnion.

          Good Debt vs. Bad Debt:
          • ${blueText("Good Debt")}: Low-interest borrowing used to purchase assets that grow in value or increase your earning capacity (e.g., student loans for education, mortgages for real estate).
          • ${blueText("Bad Debt")}: High-interest borrowing for depreciating consumer goods (e.g., credit card debt for luxury items, payday loans).

          Debt Repayment Frameworks:
          • ${blueText("Avalanche Method")}: Paying off the debt with the highest interest rate first. This is mathematically optimal and saves the most money.
          • ${blueText("Snowball Method")}: Paying off the smallest debt balances first to build psychological momentum.
        `,
        quiz: [
          {
            question: "What is the most important factor in calculating your credit score?",
            options: ["Amount of credit used", "Payment history", "Length of credit history", "Types of credit"]
          },
          {
            question: "What is a recommended 'Credit Utilization' ratio?",
            options: ["100%", "Above 50%", "Below 30%", "As high as possible"]
          },
          {
            question: "Which of these is typically considered 'Good Debt'?",
            options: ["Credit card debt", "A mortgage", "A payday loan", "A vacation loan"]
          },
          {
            question: "The 'Avalanche Method' of debt repayment focuses on which debt first?",
            options: ["Smallest balance", "Largest balance", "Highest interest rate", "Lowest interest rate"]
          }
        ],
        quizAlternative: [
          {
            question: "What are the three major credit bureaus that compile credit reports in the US?",
            options: ["Equifax, Experian, TransUnion", "FICO, VantageScore, IRS", "Chase, Bank of America, Wells Fargo", "Federal Reserve, FDIC, SEC"]
          },
          {
            question: "If your total credit limit across all cards is $10,000, what is the maximum recommended balance to keep your utilization healthy?",
            options: ["$1,000", "$3,000", "$5,000", "$9,000"]
          },
          {
            question: "How does a higher credit score affect the cost of borrowing?",
            options: ["It has no effect on interest rates", "It leads to lower interest rates and lower total borrowing costs", "It increases fees and insurance premiums", "It limits the maximum amount you can borrow"]
          },
          {
            question: "What is credit utilization?",
            options: ["The number of times you swipe your card in a month", "The ratio of your total credit card balances to your total credit limits", "The interest rate on your unpaid balance", "The annual fee charged by the card provider"]
          }
        ]
      }
    }
  },
  {
    id: 'm5',
    translations: {
      en: {
        title: 'Retirement Planning & Taxes',
        description: 'Preparing for the future and optimizing taxes.',
        content: `
          Retirement planning is not about hitting a specific age; it is about reaching a level of assets where working is optional because passive income covers your living expenses.

          Tax-Advantaged Retirement Accounts:
          The government provides special accounts with tax incentives to encourage saving for retirement.
          • ${blueText("Traditional IRA / 401(k)")}: Contributions are made with pre-tax income, reducing your taxable income today. Your investments grow tax-deferred, and you pay income tax upon withdrawal in retirement.
          • ${blueText("Roth IRA / 401(k)")}: Contributions are made with after-tax income. Your money grows tax-free, and all qualified withdrawals in retirement are completely tax-free.
          • ${blueText("Employer Matching")}: A program where employers match your retirement contributions up to a specific percentage. This represents a 100% immediate return on your money and should never be declined.

          Critical Financial Concepts:
          • ${blueText("Taxable Income")}: The portion of your gross income subject to federal and state taxation.
          • ${blueText("Tax Exemptions & Credits")}: Provisions that reduce your tax burden. Credits reduce your tax liability dollar-for-dollar, while deductions lower your taxable income.
          • ${blueText("Time Value of Money")}: The principle that a dollar today is worth more than a dollar tomorrow due to its potential earning capacity. Starting early maximizes this power.
        `,
        quiz: [
          {
            question: "What is 'Employer Matching' in a retirement plan?",
            options: ["A loan from your boss", "Free money your company adds to your savings", "A tax deduction", "An insurance policy"]
          },
          {
            question: "What does a 'Tax Deduction' do?",
            options: ["Increases your taxes", "Reduces the amount of your income that is taxed", "Pays off your debt", "Reduces your credit score"]
          },
          {
            question: "What is 'Capital Gains Tax'?",
            options: ["Tax on your regular salary", "Tax on profits from selling investments", "A property tax", "A sales tax"]
          },
          {
            question: "When should you start saving for retirement?",
            options: ["At age 50", "After buying your dream car", "As soon as possible (now)", "After you retire"]
          }
        ],
        quizAlternative: [
          {
            question: "What is the key advantage of a Roth retirement account?",
            options: ["Immediate tax deduction when contributing", "Tax-free growth and tax-free withdrawals in retirement", "Guaranteed high interest rates", "Ability to withdraw all funds without penalty at any age"]
          },
          {
            question: "How does tax-deferral benefit a traditional retirement account?",
            options: ["You never pay taxes on the money", "You delay paying taxes until you withdraw the funds in retirement", "You pay taxes immediately but at a discounted rate", "It eliminates all investment risk"]
          },
          {
            question: "Why is employer matching referred to as 'free money'?",
            options: ["It is paid directly to your bank checking account", "It is an additional employer contribution that matches your savings up to a limit", "It is funded by state tax credits", "It does not require you to contribute anything"]
          },
          {
            question: "What is taxable income?",
            options: ["Your total gross salary before any adjustments", "The adjusted portion of your income that is subject to taxation after deductions", "The total amount of tax you owe", "Your salary after all taxes are paid"]
          }
        ]
      }
    }
  },
  {
    id: 'm6',
    translations: {
      en: {
        title: 'Filing Taxes Roadmap',
        description: 'A 5-step roadmap to filing your first US Federal Tax Return.',
        content: `
          Filing your first federal income tax return can be intimidating, but breaking it down into structured milestones makes it simple and manageable.

          The 5-Step Filing Roadmap:
          • ${blueText("Step 1: Withholding Audit")}: Examine your paycheck stubs. Verify that your W-4 was filled out correctly and that the correct amount of federal and state income tax is being withheld by your employer.
          • ${blueText("Step 2: Paper Trail Collection")}: Gather all year-end tax documentation. By January 31st, employers must issue W-2s, and financial institutions must issue 1099s (for contract work or investment interest). Keep these organized.
          • ${blueText("Step 3: Deduction Selection")}: Decide between taking the Standard Deduction (a fixed dollar amount that reduces taxable income based on filing status) or Itemizing Deductions (summing up qualified expenses like charitable donations and mortgage interest). Most first-time filers choose the Standard Deduction.
          • ${blueText("Step 4: Filing Method Selection")}: Choose how to file. First-time filers with moderate income can file for free using the IRS Free File portal, FreeTaxUSA, or volunteer-run IRS VITA programs.
          • ${blueText("Step 5: Settlement & Direct Deposit")}: Submit your 1040 form. If you withheld too much tax, set up a secure direct deposit to receive your tax refund. If you withheld too little, arrange a payment to the IRS by the April 15th deadline.
        `,
        quiz: [
          {
            question: "Which form is used to set up your federal tax withholding when you start a new job?",
            options: ["W-2", "W-4", "1040", "1099"]
          },
          {
            question: "What is the standard deadline for filing your individual federal tax return in the US?",
            options: ["January 1st", "April 15th", "July 4th", "December 31st"]
          },
          {
            question: "Which document does your employer send you by January 31st showing your earnings and taxes paid?",
            options: ["Form 1040", "Form W-4", "Form W-2", "Form 1098"]
          },
          {
            question: "What is the difference between tax deductions and tax credits?",
            options: ["Deductions are for rich people only", "Deductions lower taxable income; credits lower tax bill dollar-for-dollar", "They are the same thing", "Credits are only for business owners"]
          }
        ],
        quizAlternative: [
          {
            question: "What is the Standard Deduction in federal income tax?",
            options: ["A penalty for late filing", "A fixed dollar amount that reduces your taxable income, depending on filing status", "A tax credit for low-income earners", "The automatic withholding from your pay"]
          },
          {
            question: "Why should you use Direct Deposit when receiving a tax refund?",
            options: ["It is required by federal law", "It is faster, safer, and deposits the refund directly into your bank account", "It increases your total refund amount", "It prevents you from being audited"]
          },
          {
            question: "What happens if you do not file your tax return by the April 15th deadline?",
            options: ["Nothing, there are no deadlines", "The IRS will automatically file it and pay you a refund", "You may face failure-to-file and failure-to-pay penalties and interest", "Your credit score immediately drops to 300"]
          },
          {
            question: "Which IRS program provides free tax prep assistance to individuals with moderate income or disabilities?",
            options: ["VITA (Volunteer Income Tax Assistance)", "SEC", "FICA", "W-4 Support"]
          }
        ]
      }
    }
  },
  {
    id: 'm7',
    translations: {
      en: {
        title: 'Insurance & Risk Management',
        description: 'Protect your assets with insurance and guard against identity theft.',
        content: `
          Life is unpredictable. Risk management is the process of identifying, evaluating, and minimizing the financial impact of potential losses.

          Types of Insurance:
          Insurance transfer financial risk from you to an insurance company in exchange for regular payments.
          • ${blueText("Health Insurance")}: Covers medical expenses, safeguarding you from catastrophic, life-altering medical debt.
          • ${blueText("Auto Insurance")}: Protects against liability for damage or bodily injury to others, as well as collision damage to your vehicle.
          • ${blueText("Renters/Homeowners Insurance")}: Covers damage to your physical residence and protects your personal belongings (such as laptops and furniture) inside it.
          • ${blueText("Life Insurance")}: Provides a financial safety net for your designated beneficiaries in the event of your death.

          Understanding Insurance Costs:
          • ${blueText("Premium")}: The amount you pay (monthly or annually) to keep your insurance policy active.
          • ${blueText("Deductible")}: The out-of-pocket amount you must pay before the insurance company begins paying for a claim. A higher deductible usually leads to a lower premium.
          • ${blueText("Emergency Fund")}: A highly liquid pool of cash (ideally 3 to 6 months of living expenses) that serves as your primary defense against sudden job loss or unexpected expenses.
        `,
        quiz: [
          {
            question: "Which type of insurance is usually required by law for drivers?",
            options: ["Life Insurance", "Auto Insurance", "Pet Insurance", "Disability Insurance"]
          },
          {
            question: "What is the primary purpose of an insurance 'Premium'?",
            options: ["The amount you pay to keep the policy active", "The amount you pay when you make a claim", "The maximum the insurance will pay", "A bonus for not having accidents"]
          },
          {
            question: "How can you prevent someone from opening a new credit card in your name?",
            options: ["Delete your bank app", "Freeze your credit with the 3 major bureaus", "Change your phone number", "Pay in cash only"]
          },
          {
            question: "Why do you need Renters Insurance if you don't own the building?",
            options: ["To pay the landlord's mortgage", "To protect your personal belongings like electronics and furniture", "To pay for building repairs", "It is never needed for renters"]
          }
        ],
        quizAlternative: [
          {
            question: "What is an insurance 'Deductible'?",
            options: ["The discount you get for safe driving", "The out-of-pocket amount you must pay before insurance coverage kicks in", "The monthly fee to keep the policy active", "The maximum limit the policy will pay"]
          },
          {
            question: "How does raising your deductible affect your premium?",
            options: ["It raises your premium", "It typically lowers your premium", "It has no effect on premium costs", "It cancels your insurance coverage"]
          },
          {
            question: "How much money is recommended to hold in a liquid emergency fund?",
            options: ["1 week of expenses", "3 to 6 months of basic living expenses", "1 year of total gross income", "$100,000"]
          },
          {
            question: "What risk does Renters Insurance primarily transfer?",
            options: ["The cost of building foundation repairs", "The cost of replacing stolen or damaged personal belongings inside a rented home", "The landlord's loss of rental income", "The tenant's utility bills"]
          }
        ]
      }
    }
  },
  {
    id: 'm8',
    translations: {
      en: {
        title: 'Consumer Rights & Philanthropy',
        description: 'Identity protection, consumer laws, and the impact of giving.',
        content: `
          Being a financially literate citizen means protecting your personal assets from fraud while learning how to use your surplus resources to impact the world.

          Consumer Protection:
          The financial marketplace can be complex, and fraud is a real threat. Knowing your rights and protections is critical.
          • ${blueText("Identity Theft")}: When a criminal accesses your personal info (SSN, birthdate) to open credit accounts or steal tax refunds.
          • ${blueText("Credit Freeze")}: A free security measure that restricts access to your credit report, making it impossible for identity thieves to open new accounts in your name.
          • ${blueText("FCRA (Fair Credit Reporting Act)")}: A federal law protecting your right to an accurate, private credit report. You are legally entitled to one free credit report annually from each bureau via AnnualCreditReport.com.

          The Impact of Philanthropy:
          Charitable giving is an integral part of personal finance under the National Standards.
          • ${blueText("Philanthropy")}: Directing your money, time, or skills toward community causes and non-profit organizations.
          • ${blueText("Tax Advantage (501c3)")}: Donations made to verified 501(c)(3) charitable organizations can be deducted on your tax return, lowering your overall tax bill if you itemize deductions.
        `,
        quiz: [
          {
            question: "Where can you get a free credit report once a year from each bureau?",
            options: ["FreeCreditScore.com", "AnnualCreditReport.com", "IRS.gov", "CreditKarma.com"]
          },
          {
            question: "What is the best way to secure your accounts from unauthorized access?",
            options: ["Using the same password", "Two-Factor Authentication (2FA)", "Writing passwords on paper", "Sharing passwords with friends"]
          },
          {
            question: "Which type of organization usually qualifies for tax-deductible donations?",
            options: ["For-profit corporations", "501(c)(3) non-profits", "Political campaigns", "Private clubs"]
          }
        ],
        quizAlternative: [
          {
            question: "What does a credit freeze do to protect you from identity theft?",
            options: ["It closes all your existing credit cards", "It blocks lenders from pulling your credit report, preventing new unauthorized accounts", "It drops your credit utilization to zero", "It pays off your balances automatically"]
          },
          {
            question: "What is the primary official website to request your free annual credit report under the law?",
            options: ["FreeCreditScore.com", "AnnualCreditReport.com", "CreditKarma.com", "MyFICO.com"]
          },
          {
            question: "Under the Fair Credit Reporting Act (FCRA), what is your main right?",
            options: ["A guaranteed credit score of 800", "To review and dispute any inaccurate information on your credit report", "Free credit cards with zero interest", "Exemption from paying income taxes"]
          },
          {
            question: "Which of these constitutes a form of philanthropy under the National Standards?",
            options: ["Buying stock in an green energy company", "Donating money, volunteering your time, or sharing your expertise with a local non-profit", "Paying your monthly utility bills", "Saving money in a High-Yield Savings Account"]
          }
        ]
      }
    }
  },
  {
    id: 'm9',
    isOptional: true,
    translations: {
      en: {
        title: 'Medical Finances',
        description: 'A plain-language guide to health insurance terms, reading medical bills, patient rights, and managing medical debt.',
        content: `
          1. Health Insurance Terms:
          • **Premium**: The monthly payment required to keep your health insurance coverage active.
          • **Deductible**: The annual amount you must pay out-of-pocket before your insurance begins sharing costs.
          • **Copay**: A fixed dollar fee (e.g., $25) paid at the time of a doctor visit or pharmacy pickup.
          • **Coinsurance**: Your percentage share (e.g., 20%) of medical costs after you meet your deductible.
          • **Out-of-Pocket Maximum**: The annual limit on what you pay. Once reached, insurance covers 100% of covered in-network care.

          2. Health Plans & Tax-Advantaged Accounts:
          • **HMO vs. PPO**: HMOs usually require selecting a primary care doctor and staying in-network. PPOs offer more choice and out-of-network coverage at higher costs.
          • **Health Savings Account (HSA)**: Paired with High-Deductible Health Plans. Money goes in tax-free, grows tax-free, and rolls over year after year.
          • **Flexible Spending Account (FSA)**: Employer-sponsored tax-free account for medical expenses that usually has a "use-it-or-lose-it" annual expiration.

          3. Understanding Bills & Patient Rights:
          • **Explanation of Benefits (EOB)**: A document from your insurer showing what was billed, covered, and what you owe. An EOB is not a bill.
          • **Itemized Medical Bills**: Always request a detailed line-by-line statement with procedure codes before paying to check for errors or duplicate charges.
          • **The No Surprises Act**: Federal law protecting you from unexpected balance bills during emergency care or at in-network facilities.

          4. Managing Medical Debt:
          • **Charity Care & Negotiation**: Non-profit hospitals must offer financial assistance based on income. You can also negotiate prompt-pay cash discounts or 0% interest payment plans.
          • **Credit Bureau Rules**: Medical bills under $500 do not appear on credit reports, and paid medical debt is removed from credit histories.
          • **Avoid High-Interest Traps**: Beware of deferred-interest medical credit cards; work directly with hospital billing departments first.
        `,
        quiz: [],
        quizAlternative: []
      }
    }
  }
];
