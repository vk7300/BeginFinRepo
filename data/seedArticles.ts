import { Article } from '../types';

export const SEED_ARTICLES: Article[] = [
  {
    id: 'seed-paycheck-basics',
    title: 'Understanding Your First Paycheck: Gross Pay, Taxes & Net Income',
    slug: 'understanding-your-first-paycheck',
    excerpt: 'Demystifying FICA, federal and state tax withholdings, and how to read your pay stub with confidence.',
    content: `
      <h2>Welcome to the Workforce</h2>
      <p>Opening your first paycheck is an exciting milestone, but it often comes with a surprise: your take-home pay is less than your hourly wage multiplied by your hours worked. Where did that money go?</p>
      
      <h3>Gross Pay vs. Net Pay</h3>
      <p><strong>Gross pay</strong> is the total amount of money you earned before any deductions. <strong>Net pay</strong> (often called take-home pay) is what actually lands in your bank account after mandatory taxes and optional benefit deductions.</p>
      
      <h3>Key Deductions Explained</h3>
      <ul>
        <li><strong>FICA (Social Security & Medicare):</strong> A mandatory federal payroll tax. Social Security takes 6.2% and Medicare takes 1.45% of your gross earnings.</li>
        <li><strong>Federal Income Tax:</strong> Determined by your W-4 form settings and tax brackets.</li>
        <li><strong>State & Local Income Tax:</strong> Depending on where you live and work, state and municipal taxes may also apply.</li>
      </ul>
      
      <p>Understanding these deductions helps you build an accurate monthly budget based on your true take-home pay rather than your gross salary.</p>
    `,
    authorName: 'BeginFin Curriculum Team',
    authorDetails: 'Financial Education Specialists',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    category: 'Taxes & Income',
    publishedAt: '2025-01-15T12:00:00.000Z',
    updatedAt: '2025-01-15T12:00:00.000Z',
    status: 'published',
    isFeatured: true
  },
  {
    id: 'seed-50-30-20-budget',
    title: 'The 50/30/20 Budget: A Beginner-Friendly Blueprint',
    slug: 'the-50-30-20-budget-guide',
    excerpt: 'How to divide your take-home pay into needs, wants, and savings without feeling overwhelmed by micro-tracking.',
    content: `
      <h2>A Framework, Not a Straightjacket</h2>
      <p>Popularized by Senator Elizabeth Warren, the 50/30/20 rule is an intuitive starting point for personal budgeting that balances current living costs with future financial security.</p>
      
      <h3>How the Percentages Break Down:</h3>
      <ul>
        <li><strong>50% Needs:</strong> Essential living expenses including rent, groceries, utilities, transportation, and minimum debt payments.</li>
        <li><strong>30% Wants:</strong> Lifestyle choices such as dining out, streaming subscriptions, entertainment, and hobbies.</li>
        <li><strong>20% Savings & Debt Acceleration:</strong> Emergency fund contributions, high-yield savings accounts, retirement investments (like a Roth IRA), and paying down high-interest debt above minimums.</li>
      </ul>
      
      <h3>Customizing for High-Cost-of-Living Areas</h3>
      <p>If your rent consumes more than 50% of your take-home income, you may temporarily adjust the ratio to 60/20/20 or 65/20/15 while seeking ways to increase income or lower fixed costs.</p>
    `,
    authorName: 'BeginFin Curriculum Team',
    authorDetails: 'Financial Education Specialists',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80',
    category: 'Budgeting & Saving',
    publishedAt: '2025-02-01T10:00:00.000Z',
    updatedAt: '2025-02-01T10:00:00.000Z',
    status: 'published',
    isFeatured: true
  },
  {
    id: 'seed-building-credit',
    title: 'Building Credit From Zero: Step-by-Step for Students & Young Adults',
    slug: 'building-credit-from-zero',
    excerpt: 'Learn the five components of a FICO score and how to establish a strong credit profile responsibly.',
    content: `
      <h2>Why Credit Matters Early</h2>
      <p>Your credit score affects your ability to rent an apartment, qualify for competitive auto or mortgage interest rates, and in some industries, even pass employment background checks.</p>
      
      <h3>The 5 Pillars of a FICO Score</h3>
      <ol>
        <li><strong>Payment History (35%):</strong> Paying on time every single month is the single most important factor.</li>
        <li><strong>Credit Utilization (30%):</strong> The percentage of available credit you use. Keep utilization below 30%—and ideally below 10%.</li>
        <li><strong>Length of Credit History (15%):</strong> Older accounts demonstrate sustained reliability over time.</li>
        <li><strong>New Credit Inquiries (10%):</strong> Applying for too many lines of credit simultaneously can temporarily ding your score.</li>
        <li><strong>Credit Mix (10%):</strong> Having both revolving credit (credit cards) and installment loans (student loans, car loans).</li>
      </ol>
      
      <h3>Starter Strategies</h3>
      <p>Consider starting with a secured credit card or becoming an authorized user on a parent's longstanding, positive account to establish your credit file safely.</p>
    `,
    authorName: 'BeginFin Curriculum Team',
    authorDetails: 'Financial Education Specialists',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    category: 'Credit & Debt',
    publishedAt: '2025-02-15T09:30:00.000Z',
    updatedAt: '2025-02-15T09:30:00.000Z',
    status: 'published',
    isFeatured: false
  }
];
