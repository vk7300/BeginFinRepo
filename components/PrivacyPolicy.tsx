import React, { useEffect } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavPadding } from './Navbar';

interface Props {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<Props> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navPadding = useNavPadding();
  const currentDate = "September 26, 2026";

  return (
    <div className={`min-h-screen bg-[#F4F8FA] ${navPadding} pb-16 px-4 sm:px-6 font-sans`}>
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
              <h1 className="text-3xl font-black text-[#3C3C3C] mb-2">PRIVACY POLICY</h1>
              <p className="italic text-[10pt] text-slate-500">Last Revised: {currentDate}</p>
            </div>

            <section className="space-y-4">
              <h4 className="font-bold uppercase tracking-tight text-[#3C3C3C]">DISCLAIMER: EDUCATIONAL ONLY & STUDENT-LED INITIATIVE</h4>
              <div className="bg-[#F4F8FA] p-6 rounded-2xl border-2 border-[#7F7FFA]/20 flex flex-col sm:flex-row gap-4">
                <AlertTriangle className="w-8 h-8 text-[#7F7FFA] shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-[#3C3C3C] font-bold italic leading-relaxed">
                    BeginFin is an open-access educational platform and student-led initiative founded in Temple, Texas. WE DO NOT PROVIDE INDIVIDUALIZED FINANCIAL, INVESTMENT, LEGAL, OR TAX ADVICE. Learners should consult qualified professionals regarding their specific circumstances.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Student-Led Resource Notice:</strong> BeginFin is developed and maintained by high school students with limited resources. While we strive to maintain high-quality educational materials, our website content, learning modules, Model Context Protocol (MCP) server, and simulators may contain unintentional inaccuracies. Please report any issues or errors to <strong>support@begin-fin.com</strong>.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-[#3C3C3C]">1. INTRODUCTION, SCOPE & FISCAL SPONSORSHIP STATUS</h4>
              <p>BeginFin ("we," "us," or "our") is a 100% free educational platform founded in December 2025 in Temple, Texas by high school co-founders Vishnu Kakarla and Kruz Smith. BeginFin operates as a student-led Open Educational Resource (OER) and a fiscally sponsored project of The Hack Foundation (dba Hack Club), a California 501(c)(3) tax-exempt public charity (EIN 81-2908499). While The Hack Foundation provides fiscal sponsorship and holds funds on BeginFin's behalf, BeginFin remains student-run and independently responsible for its own curriculum, programming, tools, and operational decisions. BeginFin is not an independently registered 501(c)(3) non-profit entity or financial advisory firm, generates zero revenue, and is not currently soliciting or accepting donations. The curriculum is open-source and free to use for non-commercial educational purposes. This Privacy Policy explains our data collection, handling, and security practices across begin-fin.com, its application portal, and its Model Context Protocol (MCP) server.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-[#3C3C3C]">2. COMPLIANCE DISCLOSURE, MINIMUM AGE (14+) & CHILDREN'S PRIVACY</h4>
              <p>BeginFin is designed for learners aged 14 and older. We do not knowingly collect, solicit, or maintain personal information from individuals under 14 years of age. All users must certify that they are at least 14 years of age and accept our Terms of Use and Privacy Policy upon account registration or sign-in. If we discover that personal data of an individual under 14 has been collected without authorized institutional or parental consent, we will promptly take steps to delete that account and all associated data.</p>
              <p>Because BeginFin is an independently maintained, bootstrapped educational project operating with limited resources, we do not conduct formal third-party audit certifications (such as formal FERPA, COPPA, or SOC 2 third-party compliance audits). However, we rigorously uphold the foundational principles of learner privacy: <strong>we guarantee that we never sell, monetize, rent, or trade personal or educational data, and we do not serve third-party advertising or build commercial tracking profiles.</strong> School educators should evaluate platform fit in accordance with their district policies.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-[#3C3C3C]">3. LEARNER EDUCATIONAL RECORDS IN SCHOOL MODE</h4>
              <p>When used in classroom settings or connected through teacher class codes, BeginFin operates to support academic learning:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Classroom Role:</strong> BeginFin provides progress reporting utilities for educators. Student learning records remain under the instructional oversight of the verified teacher.</li>
                <li><strong>Class Rosters & Automatic Enrollment:</strong> When an educator synchronizes a class roster via Google Classroom or inputs student emails into School Mode, student email identifiers are associated with the class to facilitate seamless, automatic classroom enrollment upon student sign-in, with a one-time welcome notification.</li>
                <li><strong>Educational Data Usage:</strong> Course progress (quiz scores, module completion status, assignment completions) is used exclusively for educational feedback to the enrolled learner and their verified instructor.</li>
                <li><strong>No Commercial Exploitation:</strong> We never sell, rent, or lease student records, nor do we build behavioral profiles for commercial advertising.</li>
                <li><strong>Access and Correction:</strong> Parents, guardians, or eligible students may review, update, or request the deletion of student records by emailing support@begin-fin.com.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-[#3C3C3C]">4. INFORMATION WE COLLECT & WHY</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <thead className="bg-[#F4F8FA] text-[#3C3C3C] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Description & Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-[#3C3C3C]">Account Credentials</td>
                      <td className="p-3.5">Email address, full name, or Google OAuth identity identifier to maintain saved progress across devices</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-[#3C3C3C]">Coursework & Assessment Records</td>
                      <td className="p-3.5">Module completion percentages, quiz scores, certificate generation timestamps, and academic mastery metrics</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-[#3C3C3C]">Google Classroom Data (Educators Optional)</td>
                      <td className="p-3.5">Course names, class rosters, assignments, and announcements synchronized solely at the direction of authorized teachers</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-[#3C3C3C]">Local Browser Storage & Preferences</td>
                      <td className="p-3.5">Saving user language preference (English/Spanish) and guest progress</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-[#3C3C3C]">Technical Diagnostics</td>
                      <td className="p-3.5">Basic browser version and error logs used exclusively for performance troubleshooting</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-[#F4F8FA] border border-[#7F7FFA]/20 rounded-xl text-xs font-bold text-[#3C3C3C]">
                We do NOT collect Social Security Numbers, Bank Account Information, Credit Card Numbers, Dates of Birth, or sensitive personal financial account credentials.
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-[#3C3C3C]">5. CLIENT-SIDE SIMULATORS & FINANCIAL PRIVACY</h4>
              <p>BeginFin features interactive financial modeling tools, including the Wage and Living Cost Simulator (available at <code>begin-fin.com/tools</code>):</p>
              <ul className="list-disc ml-6 space-y-2 text-xs font-medium text-slate-700">
                <li><strong>Local Execution:</strong> All numerical inputs, simulated wages, living cost adjustments, and tax calculations are computed entirely on your device within the browser.</li>
                <li><strong>No Storage of Private Financial Inputs:</strong> We do not log, transmit, or store hypothetical budgets or personal financial figures entered into interactive simulators.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-[#3C3C3C]">6. THIRD-PARTY SERVICES & MODEL CONTEXT PROTOCOL (MCP)</h4>
              <p>Data sharing is strictly limited to services required to deliver core application functionality. We do not sell or monetize personal data:</p>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li><strong>Cloud Infrastructure & Authentication:</strong> Google Cloud Platform, Firebase (Firestore database and Firebase Authentication), and Google Identity Services provide secure hosting, real-time database synchronization, and encrypted user authentication.</li>
                <li><strong>Model Context Protocol (MCP) Server (Zero User Data Transferred):</strong> BeginFin provides an open Model Context Protocol (MCP) server (at <code>https://begin-fin.com/mcp</code> and <code>https://begin-fin.com/sse</code>) allowing external AI tools (such as Claude Desktop, Claude.ai, Cursor, and Windsurf) to access BeginFin's open curriculum metadata, lesson outlines, financial calculators, and pedagogical tools. <strong>No learner profiles, user identities, student data, or personal records are ever transmitted, collected, or accessible via the MCP server.</strong> BeginFin does not host an in-app generative chatbot; all AI queries take place entirely within the user's external environment according to their provider's terms.</li>
                <li><strong>Google Classroom API:</strong> For teachers connecting their classes, BeginFin uses Google Classroom API scopes exclusively to import student rosters, create assignments, and publish course announcements.</li>
                <li><strong>Optional Verifiable Credentials (Certifier.io):</strong> If a user requests a third-party verifiable digital credential, we share their name and email with Certifier.io solely to generate the credential.</li>
                <li><strong>Legal Obligations:</strong> Information may be disclosed if required by law or in response to valid legal requests to protect platform and user safety.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-[#3C3C3C]">7. DATA SECURITY & RETENTION</h4>
              <p>We maintain technical and administrative safeguards to protect your personal data, including TLS 1.3 encryption for data in transit, AES-256 encryption at rest within Firestore, and strict access controls. Data is retained during the active life of the user account.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-[#3C3C3C]">8. USER PRIVACY RIGHTS & DATA CONTROL</h4>
              <p>All users have control over their personal data:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Access and Export:</strong> Request a summary of your account and learning data by contacting support@begin-fin.com.</li>
                <li><strong>Account Editing:</strong> Update your profile display name at any time within your user profile settings.</li>
                <li><strong>Permanent Account Deletion:</strong> Permanently remove your profile and course records via Account Settings or by emailing support@begin-fin.com.</li>
                <li><strong>Non-Discrimination:</strong> We will never deny or degrade educational access because you exercise your privacy rights.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-[#3C3C3C]">9. CONTACT INFORMATION</h4>
              <p>If you have questions, feedback, or requests regarding this Privacy Policy or our data practices, please contact us at:</p>
              <div className="bg-[#F4F8FA] p-6 rounded-2xl border border-slate-200/80 font-sans text-sm">
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
