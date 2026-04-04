import Link from "next/link";

export const metadata = {
  title: "Terms of Service | CodeGraph",
  description: "Terms of Service for CodeGraph",
};

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 mb-6">Last updated: April 4, 2026</p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-600 mb-4">
            By accessing and using CodeGraph, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Use of Service</h2>
          <p className="text-slate-600 mb-4">
            CodeGraph provides an interactive learning platform for programming education. You may use the platform for personal, educational purposes. You agree not to:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Use the code execution features for any malicious purposes</li>
            <li>Attempt to overload or abuse the platform infrastructure</li>
            <li>Share or distribute course content without permission</li>
            <li>Create multiple accounts to circumvent any platform limitations</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. User Accounts</h2>
          <p className="text-slate-600 mb-4">
            You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating an account.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Content</h2>
          <p className="text-slate-600 mb-4">
            Course content, problems, and educational materials are owned by CodeGraph. Code you write and submit remains yours, but you grant us a license to store and process it for the purpose of providing the service.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Code Execution</h2>
          <p className="text-slate-600 mb-4">
            The platform provides code execution capabilities through third-party services. We are not responsible for any issues arising from code execution. All code is executed in sandboxed environments.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Limitation of Liability</h2>
          <p className="text-slate-600 mb-4">
            CodeGraph is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of the platform.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">7. Changes to Terms</h2>
          <p className="text-slate-600 mb-4">
            We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">8. Contact</h2>
          <p className="text-slate-600 mb-4">
            For questions about these terms, please contact us through the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
