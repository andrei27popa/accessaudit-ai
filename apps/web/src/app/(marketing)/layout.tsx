import Link from 'next/link';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
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
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Free Scan</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><span className="text-gray-500">API (Coming Soon)</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Standards</h3>
              <ul className="space-y-2 text-sm">
                <li><span>WCAG 2.2</span></li>
                <li><span>ADA Title III</span></li>
                <li><span>Section 508</span></li>
                <li><span>EAA / EN 301 549</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.w3.org/WAI/WCAG22/quickref/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WCAG Quick Reference</a></li>
                <li><a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">W3C WAI</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-500">About (Coming Soon)</span></li>
                <li><span className="text-gray-500">Contact (Coming Soon)</span></li>
                <li><span className="text-gray-500">Privacy Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">AccessAudit</span>
              <span className="text-gray-500 font-normal">AI</span>
            </div>
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} AccessAudit AI. AI-powered web accessibility auditing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
