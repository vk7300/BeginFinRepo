import React, { useEffect } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const TermsOfUse: React.FC<Props> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentDate = "August 20, 2026";

  return (
    <div className="min-h-screen bg-[#F4F8FA] py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-[#7F7FFA] transition-colors font-bold mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-16 border border-slate-200/80 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#7F7FFA]" />
          
          <div className="space-y-8 text-[#3C3C3C] text-sm leading-relaxed text-justify">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-black text-slate-900 mb-2">TERMS OF USE</h1>
              <p className="italic text-[10pt] text-slate-500">Last Revised: {currentDate}</p>
            </div>

            <section className="space-y-4">
              <h4 className="font-bold uppercase tracking-tight text-slate-900">DISCLAIMER: NO FINANCIAL ADVICE</h4>
              <div className="bg-[#F4F8FA] p-6 rounded-2xl border-2 border-[#7F7FFA]/30 flex gap-4">
                <AlertTriangle className="w-8 h-8 text-[#7F7FFA] shrink-0 mt-0.5" />
                <p className="text-[#3C3C3C] font-bold italic leading-relaxed">
                  BeginFin is an EDUCATIONAL PLATFORM ONLY. The materials, interactive modules, simulators, and tools provided on this website are NOT intended to be financial, investment, legal, or tax advice. Always seek the advice of a qualified professional for your specific circumstances. We do not provide personalized recommendations.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">1. ACCEPTANCE OF TERMS, MINIMUM AGE REQUIREMENT (14+) & OPEN SOURCE CURRICULUM</h4>
              <p>BeginFin (the "Platform") is a free educational platform founded in December 2025 in Temple, Texas as a student-led initiative by Vishnu Kakarla and Kruz Smith. By accessing begin-fin.com or its application portal at begin-fin.com/app, you agree to be bound by these Terms of Use and our Privacy Policy. The curriculum is open-source and free to use for non-commercial educational purposes.</p>
              <p><strong>Minimum Age Requirement (14+):</strong> You must be at least 14 years of age to register for an account, access personalized features, or use the Platform. By creating an account or signing in, you certify and warrant that you are at least 14 years old.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">2. LICENSE GRANTS & PERMITTED USE</h4>
              <p>Subject to these Terms, BeginFin grants you the following limited licenses:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>General User License:</strong> You are granted a personal, non-exclusive, non-transferable, revocable license to access and use the Platform, course modules, interactive simulators, and personal progress tracking tools for personal, non-commercial educational purposes.</li>
                <li><strong>Educator License:</strong> Verified teachers and educational institutions are granted a limited, non-exclusive license to utilize the Platform, its Educator Dashboard ("School Mode"), Google Classroom integration, and downloadable lesson planning resources within academic environments. This includes enrolling students, syncing class rosters, publishing coursework assignments, and monitoring class mastery.</li>
                <li><strong>Claude Lesson Planner Skill:</strong> The Claude Skill markdown resource (<code>beginfin-lesson-planner.md</code>) is provided open-source under permissible educational terms for instructors to generate customized personal finance lesson plans, pacing guides, and discussion prompts.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">3. EDUCATIONAL CONTENT, SIMULATORS & INTERACTIVE TOOLS</h4>
              <p>BeginFin provides structured personal finance learning modules, interactive tools, and visual calculators designed for educational exploration:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Core Learning Units:</strong> Six foundational modules covering Personal Finance Fundamentals, Income & Taxes, Banking & Budgeting, Credit & Debt, Investing & Wealth Building, and Risk Management & Insurance.</li>
                <li><strong>Interactive Simulators:</strong> The Entry Salary & Living Cost Simulator, Credit Score Sandbox, and Interactive Tax Roadmap utilize generalized economic estimates, standard national average tax rates, and hypothetical scenarios for illustrative purposes. They do not constitute career counseling, loan underwriting, tax return preparation, or formal credit advisory services.</li>
                <li><strong>Local Computation:</strong> Financial calculations performed within interactive simulators occur locally within your browser. BeginFin does not collect, sell, or monetize user-entered hypothetical financial amounts.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">4. BRADLEY AI EDUCATIONAL ASSISTANT (POWERED BY GOOGLE GEMINI®)</h4>
              <p>Bradley is an automated personal finance educational assistant powered by Google's Gemini models. Access is provided to registered users and is subject to a daily rate limit of 5 messages per user.</p>
              <ul className="list-disc ml-6 space-y-2 text-xs leading-relaxed text-slate-700">
                <li><strong>Third-Party Technology:</strong> Bradley is powered by Google Gemini APIs. Usage is subject to Google's Terms of Service and Privacy Policy.</li>
                <li><strong>Accuracy Disclaimer:</strong> Responses generated by Bradley are produced dynamically by artificial intelligence and <strong>may not be accurate, complete, or up-to-date</strong>. You are solely responsible for independently verifying any information before relying on it.</li>
                <li><strong>Strictly Non-Advisory:</strong> Bradley provides purely conceptual explanations of financial literacy principles and strictly refuses personalized financial, tax, legal, or investment recommendations.</li>
                <li><strong>No Liability:</strong> BeginFin, its founders, contributors, and affiliates <strong>are not liable for any damages, losses, financial decisions, errors, or omissions arising from or related to the use of or reliance on Bradley</strong> or its outputs.</li>
                <li><strong>Privacy of AI Interactions:</strong> BeginFin does not inspect, sell, or monetize private user chat queries. Interactions are processed in real-time for immediate response generation.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">5. COURSE CERTIFICATION & DIGITAL CREDENTIALS</h4>
              <p>BeginFin offers course completion recognition subject to the following criteria:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Standard Course Certificate:</strong> Upon earning 100% completion across all course units, users can generate and download a personalized PDF Certificate of Completion rendered directly in the browser. Certificates include unique completion identifiers and watermark validation.</li>
                <li><strong>Optional Verifiable Credentials (Certifier.io):</strong> Users who choose to request a third-party digital verifiable credential authorize BeginFin to transmit their name and email address to Certifier.io solely for badge generation.</li>
                <li><strong>Academic Integrity:</strong> Certificates are issued on the condition that all coursework and assessments were completed honestly by the named individual. BeginFin reserves the right to invalidate or revoke credentials obtained through fraudulent means or false representation.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">6. EDUCATIONAL RECORDS, SCHOOL USAGE & GOOGLE CLASSROOM</h4>
              <p>When utilized within schools or academic institutions ("School Mode"):</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Classroom Purpose:</strong> Student activity data (module scores, completion status, quiz results) is utilized solely to deliver educational reporting to the teacher who manages the classroom invite code.</li>
                <li><strong>Google Classroom Integration:</strong> For instructors who connect Google Classroom, BeginFin utilizes approved Google OAuth scopes exclusively to import class rosters, create coursework assignments, and publish course announcements at the instructor's direction.</li>
                <li><strong>Anti-Cheat & Assessment Integrity:</strong> To preserve academic integrity in classroom settings, assessments may monitor full-screen focus and window focus changes. Any suspected circumvention or unauthorized collaboration may be reported to the instructor.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">7. USER ACCOUNTS & SECURITY</h4>
              <p>Registration and sign-in are available via Google One Tap, Google Single Sign-On (SSO), email/password authentication, or SMS phone verification. You are responsible for safeguarding your login credentials. We implement industry-standard safeguards, including TLS encryption, Firebase Authentication controls, Google Identity Services integrations, and Firestore security rules. For account deletion or data portability requests, users may utilize Account Settings or email support@begin-fin.com.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">8. INTELLECTUAL PROPERTY & ATTRIBUTIONS</h4>
              <p>The hosted BeginFin platform, website software, custom visual assets, and design system are maintained by BeginFin. The core curriculum text is open-source for non-commercial educational use.</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Educational Framework Alignment:</strong> Curriculum topics are developed with national financial education frameworks in mind, referencing principles from the <em>National Standards for Personal Finance Education</em> (2021), developed jointly by the <strong>Council for Economic Education (CEE)</strong> and the <strong>Jump$tart Coalition for Personal Financial Literacy</strong>. Copyright &copy; 2021 CEE and Jump$tart. All rights reserved.</li>
                <li><strong>College Board AP® Notice:</strong> AP® is a registered trademark of the College Board, which is not affiliated with, and does not endorse, BeginFin.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">9. PROHIBITED CONDUCT</h4>
              <p>Users agree not to: (a) utilize the Platform for any unlawful purpose; (b) attempt to reverse engineer, disrupt, or compromise the integrity of the infrastructure; (c) deploy automated bots, scrapers, or exploits; (d) circumvent academic assessment controls; or (e) transmit malicious code or engage in harassment.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">10. LIMITATION OF LIABILITY & DISCLAIMER OF WARRANTIES</h4>
              <p>The Platform is provided on an "as-is" and "as-available" basis without warranties of any kind, whether express or implied. To the maximum extent permitted by applicable law, in no event shall BeginFin, its founders, contributors, or partners be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits or data. Our aggregate liability for any claim under these terms is limited to $10.00 USD.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">11. INDEMNIFICATION, GOVERNING LAW & DISPUTE RESOLUTION</h4>
              <p>You agree to defend, indemnify, and hold harmless BeginFin and its creators from and against any claims, liabilities, damages, and expenses arising out of your use of the Platform or violation of these Terms. These Terms are governed by and construed in accordance with the laws of the State of Texas, without regard to conflict of law principles. Any dispute arising under these Terms shall be resolved in the state or federal courts located in Texas.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">12. MODIFICATIONS & ENTIRE AGREEMENT</h4>
              <p>These Terms, together with our Privacy Policy, constitute the complete agreement between you and BeginFin. We reserve the right to update these Terms periodically. Continued use of the Platform following updates constitutes acceptance of the revised Terms.</p>
            </section>

            <div className="pt-12 text-center text-slate-400 text-[10pt] font-sans italic">
              Questions regarding these Terms of Use should be directed to support@begin-fin.com.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
