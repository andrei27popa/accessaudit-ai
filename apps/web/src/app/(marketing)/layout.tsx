'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-200/50'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 relative z-50">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              AccessAudit<span className="text-brand-600 ml-0.5">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-all hover:shadow-lg hover:shadow-brand-500/25"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100/80 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span
                className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${
                  mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0 scale-x-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        <div
          className={`md:hidden fixed inset-0 top-16 bg-white z-40 transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="px-6 py-6 space-y-1">
            <Link href="/#features" className="block px-4 py-3.5 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-xl transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="block px-4 py-3.5 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-xl transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="block px-4 py-3.5 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-xl transition-colors">
              Pricing
            </Link>
            <Link href="/#faq" className="block px-4 py-3.5 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-xl transition-colors">
              FAQ
            </Link>
            <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
              <Link href="/login" className="block px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors text-center">
                Log in
              </Link>
              <Link
                href="/signup"
                className="block px-4 py-3.5 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors text-center"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-white font-bold">AccessAudit<span className="text-brand-400 ml-0.5">AI</span></span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                AI-powered web accessibility auditing. Detect issues, get code fixes, and ensure compliance.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Free Scan</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><span className="text-gray-600">API <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded-full ml-1">Soon</span></span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Standards</h3>
              <ul className="space-y-3 text-sm">
                <li>WCAG 2.2</li>
                <li>ADA Title III</li>
                <li>Section 508</li>
                <li>EAA / EN 301 549</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="https://www.w3.org/WAI/WCAG22/quickref/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WCAG Quick Reference</a></li>
                <li><a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">W3C WAI</a></li>
                <li><Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800/50 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              &copy; 2025 AccessAudit AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <span className="hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-gray-400 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
