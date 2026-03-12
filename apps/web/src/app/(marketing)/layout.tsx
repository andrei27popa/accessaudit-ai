import Link from 'next/link';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-brand-600">
            AccessAudit<span className="text-gray-400 font-normal ml-1">AI</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          AccessAudit AI - AI-powered web accessibility auditing
        </div>
      </footer>
    </div>
  );
}
