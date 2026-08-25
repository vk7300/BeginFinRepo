import React, { useEffect } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<Props> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentDate = "August 20, 2026";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-16 border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
          
          <div className="space-y-8 text-slate-900 text-sm leading-relaxed text-justify">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-2">PRIVACY POLICY</h1>
              <p className="italic text-[10pt]">Last Revised: {currentDate}</p>
            </div>

            <section className="space-y-4">
              <h4 className="font-bold uppercase tracking-tight">DISCLAIMER: EDUCATIONAL ONLY</h4>
              <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-100 flex gap-4">
                <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                <p className="text-amber-900 font-bold italic leading-relaxed">
                  BeginFin is an open-source educational platform and student-led initiative. WE DO NOT PROVIDE INDIVIDUALIZED FINANCIAL, INVESTMENT, LEGAL, OR TAX ADVICE. Users should consult qualified professionals regarding their specific financial situations.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold">1. INTRODUCTION & SCOPE</h4>
              <p>BeginFin ("we," "us," or "our") is a free educational platform created as an initiative by Vishnu Kakarla and Kruz Smith. The curriculum is open-source and free to use for non-commercial educational purposes. This Privacy Policy explains how we collect, use, and safeguard your information when you visit begin-fin.com or access its application portal at begin-fin.com/app. We are dedicated to transparency and student data privacy.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold">2. STUDENT EDUCATIONAL RECORDS IN SCHOOL MODE</h4>
              <p>When used in classroom settings or connected through teacher class codes, BeginFin operates to support academic learning:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Classroom Role:</strong> BeginFin provides reporting utilities for educators. Student learning records remain under the instructional oversight of the teacher or school.</li>
                <li><strong>Education Data Usage:</strong> Course progress (quiz scores, module completion status, assignment completions) is used exclusively for educational feedback to the enrolled student and their verified instructor.</li>
                <li><strong>No Commercial Exploitation:</strong> We never sell, rent, or lease student records, nor do we build behavioral profiles for third-party commercial advertising.</li>
                <li><strong>Access and Correction:</strong> Parents, guardians, or eligible students may review, update, or request the deletion of student records by contacting their educator or emailing support@begin-fin.com.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold">3. MINOR USAGE & CHILDREN'S PRIVACY</h4>
              <p>We take precautions to protect the privacy of minors and students on our Platform:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Parental/Guardian Permission:</strong> Participants under 18 years of age must have consent from a parent or legal guardian before creating an account, accessing the interactive platform, or requesting digital credentials.</li>
                <li><strong>School Facilitation:</strong> When accessed through a school setting, the educator or institution facilitates student participation for academic purposes.</li>
                <li><strong>Data Minimization:</strong> We restrict personal data collection to what is necessary for course functionality (display name, email authentication handle, course mastery progress).</li>
                <li><strong>Parental Rights:</strong> Parents may request to review, export, or permanently delete their child's account data at any time by contacting support@begin-fin.com.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold">4. DATA WE COLLECT</h4>
              <p>The following table outlines the data collected by BeginFin and its specific functional purpose:</p>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm my-3">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 w-1/2">Data Type</th>
                      <th className="p-3.5 w-1/2">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">User Display Name</td>
                      <td className="p-3.5">Account identification, certificate generation, and educator dashboard roster display</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">Email & Account Profile (Google One Tap / SSO or Email Auth)</td>
                      <td className="p-3.5">Account authentication, credential verification, and secure session management via Firebase Authentication and Google Identity Services</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">Phone Number (Optional SMS Auth)</td>
                      <td className="p-3.5">Optional multi-factor or phone-based login verification via Firebase Auth</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">Course & Quiz Progress</td>
                      <td className="p-3.5">Tracking unit completion, calculating certification eligibility, and student analytics for teachers</td>
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
                We do NOT collect Social Security Numbers, Bank Account Information, Credit Card Numbers, Dates of Birth, or sensitive financial balances.
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold">5. CLIENT-SIDE SIMULATORS & FINANCIAL PRIVACY</h4>
              <p>BeginFin features interactive financial modeling tools, including the Austin/Metro Job Pay Simulator, Credit Score Sandbox, and Interactive Tax Roadmap:</p>
              <ul className="list-disc ml-6 space-y-2 text-xs font-medium text-slate-700">
                <li><strong>Local Execution:</strong> All numerical inputs, simulated wages, hypothetical budgets, and credit score adjustments are computed entirely on your device within the browser.</li>
                <li><strong>No Storage of Private Financial Inputs:</strong> We do not log, transmit, or store hypothetical budgets or personal financial figures entered into interactive simulators.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold">6. THIRD-PARTY SERVICES & INTEGRATIONS</h4>
              <p>Data sharing is strictly limited to services required to deliver core application functionality. We do not sell or monetize personal data:</p>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li><strong>Cloud Infrastructure & Authentication:</strong> Google Cloud Platform, Firebase (Firestore database and Firebase Authentication), and Google Identity Services (Google One Tap) provide secure hosting, real-time database synchronization, and encrypted user authentication.</li>
                <li><strong>Bradley AI Educational Assistant (Powered by Google Gemini®):</strong> When authenticated users ask educational questions to Bradley, queries are sent to Google's Gemini API for response generation. Chat sessions are subject to Google's Privacy Policy at <a href="https://policies.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">https://policies.google.com/</a>. Interactions are rate-limited to 5 messages per user per day. BeginFin does not persist, inspect, or sell private chat logs on its application servers.</li>
                <li><strong>Google Classroom API:</strong> For teachers connecting their classes, BeginFin uses Google Classroom API scopes (<code>classroom.courses.readonly</code>, <code>classroom.rosters.readonly</code>, <code>classroom.coursework.students</code>, <code>classroom.announcements</code>) exclusively to import student rosters, create assignments, and publish course announcements. OAuth tokens are used solely for user-initiated operations.</li>
                <li><strong>Optional Verifiable Credentials (Certifier.io):</strong> If a user requests a third-party verifiable digital credential, we share their name and email with Certifier.io solely to generate the credential, governed by Certifier.io's privacy policy at <a href="https://certifier.io/legal-and-security" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">https://certifier.io/legal-and-security</a>.</li>
                <li><strong>Legal Obligations:</strong> Information may be disclosed if required by law or in response to valid legal requests to protect platform and user safety.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold">7. DATA SECURITY & RETENTION</h4>
              <p>We maintain technical and administrative safeguards to protect your personal data, including TLS 1.3 encryption for data in transit, AES-256 encryption at rest within Firestore, and strict access controls. Data is retained during the active life of the user account. Accounts inactive for more than 24 consecutive months are scheduled for automatic deletion or anonymization.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold">8. USER PRIVACY RIGHTS & DATA CONTROL</h4>
              <p>All users have control over their personal data:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Access and Export:</strong> Request a summary of your account and learning data by contacting support@begin-fin.com.</li>
                <li><strong>Account Editing:</strong> Update your profile display name at any time within your user profile settings.</li>
                <li><strong>Permanent Account Deletion:</strong> Permanently remove your profile and course records via Account Settings or by emailing support@begin-fin.com.</li>
                <li><strong>Non-Discrimination:</strong> We will never deny or degrade educational access because you exercise your privacy rights.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold">9. ACCESSIBILITY COMMITMENT</h4>
              <p>BeginFin is designed for broad accessibility across devices and user needs, supporting keyboard navigation, high color contrast, screen reader compatibility, and responsive layouts. If you require accommodations, please email support@begin-fin.com.</p>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold">10. CONTACT INFORMATION</h4>
              <p>If you have questions, feedback, or requests regarding this Privacy Policy or our data practices, please contact us at:</p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 font-sans text-sm">
                <strong>BeginFin Privacy & Support Team</strong><br />
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

