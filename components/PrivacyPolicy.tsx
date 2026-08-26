import React, { useEffect } from 'react';
import { ArrowLeft, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<Props> = ({ onBack }) => {
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
              <h1 className="text-3xl font-black text-slate-900 mb-2">PRIVACY POLICY</h1>
              <p className="italic text-[10pt] text-slate-500">Last Revised: {currentDate}</p>
            </div>

            <section className="space-y-4">
              <h4 className="font-bold uppercase tracking-tight text-slate-900">DISCLAIMER: EDUCATIONAL ONLY</h4>
              <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-100 flex gap-4">
                <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-900 font-bold italic leading-relaxed">
                  BeginFin is an open-access educational platform and student-led initiative founded in Temple, Texas. WE DO NOT PROVIDE INDIVIDUALIZED FINANCIAL, INVESTMENT, LEGAL, OR TAX ADVICE. Learners should consult qualified professionals regarding their specific circumstances.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">1. INTRODUCTION, SCOPE & FOUNDATIONAL STATUS</h4>
              <p>BeginFin ("we," "us," or "our") is a 100% free educational platform founded in December 2025 in Temple, Texas by high school co-founders Vishnu Kakarla and Kruz Smith. BeginFin operates as a student-led Open Educational Resource (OER) with zero revenue, zero external monetization, and is not a registered 501(c)(3) non-profit entity or financial advisory firm. The curriculum is open-source and free to use for non-commercial educational purposes. This Privacy Policy explains our data collection, handling, and security practices across begin-fin.com and its application portal.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">2. COMPLIANCE DISCLOSURE & NON-GUARANTEES</h4>
              <p>Because BeginFin is an independently maintained, bootstrapped educational project operating with limited resources, we do not conduct formal third-party audit certifications (such as formal FERPA, COPPA, or SOC 2 third-party compliance audits). However, we rigorously uphold the foundational principles of learner privacy: <strong>we guarantee that we never sell, monetize, rent, or trade personal or educational data, and we do not serve third-party advertising or build commercial tracking profiles.</strong> School educators should evaluate platform fit in accordance with their district policies.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">3. LEARNER EDUCATIONAL RECORDS IN SCHOOL MODE</h4>
              <p>When used in classroom settings or connected through teacher class codes, BeginFin operates to support academic learning:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Classroom Role:</strong> BeginFin provides progress reporting utilities for educators. Student learning records remain under the instructional oversight of the verified teacher.</li>
                <li><strong>Educational Data Usage:</strong> Course progress (quiz scores, module completion status, assignment completions) is used exclusively for educational feedback to the enrolled learner and their verified instructor.</li>
                <li><strong>No Commercial Exploitation:</strong> We never sell, rent, or lease student records, nor do we build behavioral profiles for commercial advertising.</li>
                <li><strong>Access and Correction:</strong> Parents, guardians, or eligible students may review, update, or request the deletion of student records by emailing support@begin-fin.com.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">4. INFORMATION WE COLLECT & WHY</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Description & Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">Account Credentials</td>
                      <td className="p-3.5">Email address, full name, or Google OAuth identity identifier to maintain saved progress across devices</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">Coursework & Assessment Records</td>
                      <td className="p-3.5">Module completion percentages, quiz scores, certificate generation timestamps, and academic mastery metrics</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">Google Classroom Data (Educators Optional)</td>
                      <td className="p-3.5">Course names, class rosters, assignments, and announcements synchronized solely at the direction of authorized teachers</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">Local Browser Storage & Preferences</td>
                      <td className="p-3.5">Saving user language preference (English/Spanish), guest progress, and daily AI assistant rate-limit counters</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">Technical Diagnostics</td>
                      <td className="p-3.5">Basic browser version and error logs used exclusively for performance troubleshooting</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-950">
                We do NOT collect Social Security Numbers, Bank Account Information, Credit Card Numbers, Dates of Birth, or sensitive personal financial account credentials.
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">5. CLIENT-SIDE SIMULATORS & FINANCIAL PRIVACY</h4>
              <p>BeginFin features interactive financial modeling tools, including the Entry Salary & Living Cost Simulator, Credit Score Sandbox, and Interactive Tax Roadmap:</p>
              <ul className="list-disc ml-6 space-y-2 text-xs font-medium text-slate-700">
                <li><strong>Local Execution:</strong> All numerical inputs, simulated wages, hypothetical budgets, and credit adjustments are computed entirely on your device within the browser.</li>
                <li><strong>No Storage of Private Financial Inputs:</strong> We do not log, transmit, or store hypothetical budgets or personal financial figures entered into interactive simulators.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">6. THIRD-PARTY SERVICES & INTEGRATIONS</h4>
              <p>Data sharing is strictly limited to services required to deliver core application functionality. We do not sell or monetize personal data:</p>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li><strong>Cloud Infrastructure & Authentication:</strong> Google Cloud Platform, Firebase (Firestore database and Firebase Authentication), and Google Identity Services provide secure hosting, real-time database synchronization, and encrypted user authentication.</li>
                <li><strong>Bradley AI Educational Assistant (Powered by Google Gemini®):</strong> When authenticated users ask educational questions to Bradley, queries are sent to Google's Gemini API for response generation. Chat sessions are subject to Google's Privacy Policy. Interactions are rate-limited to 5 messages per user per day. BeginFin does not persist, inspect, or sell private chat logs on its application servers.</li>
                <li><strong>Google Classroom API:</strong> For teachers connecting their classes, BeginFin uses Google Classroom API scopes exclusively to import student rosters, create assignments, and publish course announcements.</li>
                <li><strong>Optional Verifiable Credentials (Certifier.io):</strong> If a user requests a third-party verifiable digital credential, we share their name and email with Certifier.io solely to generate the credential.</li>
                <li><strong>Legal Obligations:</strong> Information may be disclosed if required by law or in response to valid legal requests to protect platform and user safety.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">7. DATA SECURITY & RETENTION</h4>
              <p>We maintain technical and administrative safeguards to protect your personal data, including TLS 1.3 encryption for data in transit, AES-256 encryption at rest within Firestore, and strict access controls. Data is retained during the active life of the user account. Accounts inactive for more than 24 consecutive months are scheduled for automatic deletion or anonymization.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">8. USER PRIVACY RIGHTS & DATA CONTROL</h4>
              <p>All users have control over their personal data:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Access and Export:</strong> Request a summary of your account and learning data by contacting support@begin-fin.com.</li>
                <li><strong>Account Editing:</strong> Update your profile display name at any time within your user profile settings.</li>
                <li><strong>Permanent Account Deletion:</strong> Permanently remove your profile and course records via Account Settings or by emailing support@begin-fin.com.</li>
                <li><strong>Non-Discrimination:</strong> We will never deny or degrade educational access because you exercise your privacy rights.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-900">9. CONTACT INFORMATION</h4>
              <p>If you have questions, feedback, or requests regarding this Privacy Policy or our data practices, please contact us at:</p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 font-sans text-sm">
                <strong>BeginFin Privacy & Support Team</strong><br />
                Temple & Belton, TX<br />
                Email: support@begin-fin.com<br />
                Website: begin-fin.com
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
