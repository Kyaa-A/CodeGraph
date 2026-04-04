import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | CodeGraph",
  description: "Privacy Policy for CodeGraph",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 mb-6">Last updated: April 4, 2026</p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-slate-600 mb-4">We collect the following information:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>Account information:</strong> Name, email address when you create an account</li>
            <li><strong>Learning data:</strong> Course progress, problem submissions, quiz attempts</li>
            <li><strong>Code submissions:</strong> Code you write and submit for execution or grading</li>
            <li><strong>Usage data:</strong> Pages visited, features used, timestamps</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-slate-600 mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Provide and improve the learning platform</li>
            <li>Track your learning progress and streaks</li>
            <li>Execute and evaluate your code submissions</li>
            <li>Personalize your learning experience</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Data Storage</h2>
          <p className="text-slate-600 mb-4">
            Your data is stored securely using Supabase (built on PostgreSQL). We use industry-standard security measures to protect your information.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Code Execution</h2>
          <p className="text-slate-600 mb-4">
            Code you submit for execution is sent to third-party compilation services for processing. This code is not stored by the third-party services beyond the execution session.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Data Sharing</h2>
          <p className="text-slate-600 mb-4">
            We do not sell your personal information. We may share anonymized, aggregated data for analytics purposes.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Your Rights</h2>
          <p className="text-slate-600 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Access your personal data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Export your learning progress</li>
            <li>Opt out of non-essential communications</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">7. Cookies</h2>
          <p className="text-slate-600 mb-4">
            We use essential cookies for authentication and session management. No third-party tracking cookies are used.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">8. Contact</h2>
          <p className="text-slate-600 mb-4">
            For privacy-related questions or requests, please contact us through the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
