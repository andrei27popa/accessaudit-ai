'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

/* ───── Data ───── */

const COMPLIANCE_BADGES = ['WCAG 2.2', 'ADA', 'EAA', 'Section 508', 'EN 301 549', 'AODA'];

const FEATURES = [
  {
    title: 'AI Remediation Engine',
    desc: 'Get contextual before/after code fixes adapted to your stack — HTML, React, Vue, Angular, or WordPress.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    title: 'Priority Scoring',
    desc: 'Issues ranked by severity, frequency, and user impact. Fix what matters most first for maximum compliance.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'WCAG 2.2 AA Full Coverage',
    desc: 'Complete coverage of 50+ WCAG 2.2 Level A and AA success criteria with technique references for every issue.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    title: 'Legal Compliance Mapping',
    desc: 'Automatic mapping to ADA, Section 508, EAA, EN 301 549, and AODA per issue for global compliance.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    title: 'Developer-Ready Output',
    desc: 'Code snippets, WCAG technique links, and framework-specific notes. Built for dev workflows, not lawyers.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: 'Human Validation',
    desc: 'Real testers with disabilities verify the actual user experience. Automated + human for true compliance.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

const STEPS = [
  { num: '01', title: 'Enter Your URL', desc: 'Just paste your website URL. No signup, no credit card, no catch. Instant scan.' },
  { num: '02', title: 'We Scan Everything', desc: 'Our engine tests 50+ WCAG 2.2 criteria using axe-core. Every element, every rule, every page.' },
  { num: '03', title: 'AI Generates Fixes', desc: 'Get before/after code snippets, fix steps, WCAG technique references, and legal context — all AI-generated.' },
];

const FAQ = [
  { q: 'Is the free scan really free?', a: 'Yes! The free scan analyzes one page against 50+ WCAG 2.2 criteria and gives you AI-generated code fixes. No signup required, no credit card, completely free.' },
  { q: 'What standards do you test against?', a: 'We test against WCAG 2.2 Level A and AA criteria using axe-core. Our reports also map findings to ADA Title III, Section 508, European Accessibility Act (EAA), EN 301 549, and AODA.' },
  { q: 'How accurate is the AI remediation?', a: 'Our AI generates contextual fixes based on your actual code. It provides before/after code snippets, step-by-step instructions, and framework-specific guidance for React, Vue, Angular, and plain HTML.' },
  { q: 'Do you support full-site scanning?', a: 'The free scan covers one page. Our paid plans support full-site crawling, monitoring, team collaboration, and priority support. Contact us for enterprise needs.' },
  { q: 'Is my data secure?', a: 'We only access publicly available pages. Scans are processed securely, and scan data is automatically deleted after 30 days on the free plan.' },
  { q: 'Can I export the results?', a: 'Yes! Paid plans include PDF export, CSV export, and API access for integrating accessibility testing into your CI/CD pipeline.' },
];

const LEGISLATION = [
  {
    id: 'us',
    region: 'United States',
    flag: '\ud83c\uddfa\ud83c\uddf8',
    laws: [
      { name: 'ADA Title III', desc: 'Requires businesses to provide equal access to goods and services, including websites.' },
      { name: 'Section 508', desc: 'Requires federal agencies and contractors to make information and communications technology accessible.' },
    ],
  },
  {
    id: 'eu',
    region: 'European Union',
    flag: '\ud83c\uddea\ud83c\uddfa',
    laws: [
      { name: 'European Accessibility Act', desc: 'Requires products and services in the EU to be accessible by June 2025.' },
      { name: 'EN 301 549', desc: 'Harmonized European standard for ICT accessibility, references WCAG 2.1 AA.' },
    ],
  },
  {
    id: 'ca',
    region: 'Canada',
    flag: '\ud83c\udde8\ud83c\udde6',
    laws: [
      { name: 'AODA', desc: 'Ontario law requiring WCAG 2.0 AA for public and large private organizations.' },
      { name: 'Accessible Canada Act', desc: 'Federal framework for proactive accessibility in regulated sectors.' },
    ],
  },
];

/* ───── Scroll-reveal hook ───── */

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, className: `transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}` };
}

/* ───── Comparison Slider ───── */

function ComparisonSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden cursor-col-resize select-none border border-gray-200 shadow-2xl bg-white"
      style={{ aspectRatio: '16/9' }}
      onMouseDown={(e) => { setIsDragging(true); updatePosition(e.clientX); }}
      onTouchStart={(e) => { setIsDragging(true); updatePosition(e.touches[0].clientX); }}
    >
      {/* Right side – Issues view */}
      <div className="absolute inset-0 bg-gray-900 p-3 sm:p-6 flex flex-col">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
          <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-400 font-mono truncate">accessibility-report.html</span>
        </div>
        <div className="flex-1 bg-gray-950 rounded-lg border border-gray-700 p-2.5 sm:p-4 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
            <span className="text-[10px] sm:text-xs font-bold text-red-400 bg-red-950 px-1.5 sm:px-2 py-0.5 rounded">3 Critical</span>
            <span className="text-[10px] sm:text-xs font-bold text-orange-400 bg-orange-950 px-1.5 sm:px-2 py-0.5 rounded">5 Serious</span>
            <span className="text-[10px] sm:text-xs font-bold text-yellow-400 bg-yellow-950 px-1.5 sm:px-2 py-0.5 rounded">2 Minor</span>
          </div>
          <div className="space-y-2.5 sm:space-y-3 text-[11px] sm:text-sm font-mono">
            <div className="flex gap-2 items-start bg-red-950/40 rounded-lg p-2">
              <span className="text-red-400 mt-0.5 text-sm">{'\u2718'}</span>
              <div>
                <span className="text-gray-300">&lt;img src=&quot;hero.jpg&quot;&gt;</span>
                <p className="text-red-400 text-[10px] sm:text-xs mt-0.5">Missing alt attribute (WCAG 1.1.1)</p>
              </div>
            </div>
            <div className="flex gap-2 items-start bg-red-950/40 rounded-lg p-2">
              <span className="text-red-400 mt-0.5 text-sm">{'\u2718'}</span>
              <div>
                <span className="text-gray-300">&lt;button class=&quot;btn&quot;&gt;&lt;/button&gt;</span>
                <p className="text-red-400 text-[10px] sm:text-xs mt-0.5">Empty button (WCAG 4.1.2)</p>
              </div>
            </div>
            <div className="flex gap-2 items-start bg-orange-950/40 rounded-lg p-2">
              <span className="text-orange-400 mt-0.5 text-sm">{'\u26a0'}</span>
              <div>
                <span className="text-gray-300">color: #999 on #fff</span>
                <p className="text-orange-400 text-[10px] sm:text-xs mt-0.5">Low contrast 2.8:1 (WCAG 1.4.3)</p>
              </div>
            </div>
            <div className="flex gap-2 items-start bg-green-950/40 rounded-lg p-2">
              <span className="text-green-400 mt-0.5 text-sm">{'\u2714'}</span>
              <div>
                <span className="text-green-300 font-semibold">AI Fix: Add alt=&quot;Hero banner&quot;</span>
                <p className="text-green-500 text-[10px] sm:text-xs mt-0.5">Copy code fix &rarr;</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider font-semibold bg-gray-800/90 backdrop-blur px-2 py-1 rounded">
          Issues &amp; AI Fixes
        </div>
      </div>

      {/* Left side – Website view */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <div className="absolute inset-0 bg-white p-3 sm:p-6 flex flex-col" style={{ width: containerWidth ? `${containerWidth}px` : '100%' }}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
            <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-400 font-mono">your-website.com</span>
          </div>
          <div className="flex-1 bg-gradient-to-br from-brand-50 to-blue-50 rounded-lg border border-gray-200 p-2.5 sm:p-4 overflow-hidden">
            <div className="w-full h-2.5 sm:h-3 bg-brand-200 rounded mb-2 sm:mb-3" />
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 space-y-1.5 sm:space-y-2">
                <div className="w-3/4 h-3 sm:h-4 bg-gray-300 rounded" />
                <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded" />
                <div className="w-5/6 h-1.5 sm:h-2 bg-gray-200 rounded" />
                <div className="w-2/3 h-1.5 sm:h-2 bg-gray-200 rounded" />
                <div className="mt-2 sm:mt-3 w-16 sm:w-24 h-5 sm:h-7 bg-brand-400 rounded" />
              </div>
              <div className="w-1/3 h-16 sm:h-24 bg-brand-100 rounded-lg" />
            </div>
            <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="h-8 sm:h-12 bg-white rounded border border-gray-200" />
              <div className="h-8 sm:h-12 bg-white rounded border border-gray-200" />
              <div className="h-8 sm:h-12 bg-white rounded border border-gray-200" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider font-semibold bg-white/90 backdrop-blur px-2 py-1 rounded">
            Your Website
          </div>
        </div>
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 z-20 flex items-center justify-center"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-0.5 sm:w-1 h-full bg-brand-600" />
        <div className="absolute w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-brand-600 rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ───── Page ───── */

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeLeg, setActiveLeg] = useState('us');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();

  const rev1 = useScrollReveal();
  const rev2 = useScrollReveal();
  const rev3 = useScrollReveal();
  const rev4 = useScrollReveal();
  const rev5 = useScrollReveal();
  const rev6 = useScrollReveal();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let scanUrl = url.trim();
    if (!scanUrl) return;
    if (!scanUrl.startsWith('http://') && !scanUrl.startsWith('https://')) {
      scanUrl = 'https://' + scanUrl;
    }
    try { new URL(scanUrl); } catch { setError('Please enter a valid URL'); return; }
    setLoading(true);
    try {
      const result = await api.freeScan(scanUrl);
      router.push(`/scan/${result.id}`);
    } catch (err: any) {
      const msg = err.message || 'Failed to start scan';
      if (msg.includes('Too Many') || msg.includes('ThrottlerException')) {
        setError('You\'ve reached the free scan limit (3 per day). Create an account for unlimited scans.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const activeLegislation = LEGISLATION.find((l) => l.id === activeLeg) || LEGISLATION[0];

  return (
    <div className="overflow-hidden">

      {/* ─── HERO ─── */}
      <section className="relative py-16 sm:py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-brand-100/50 via-purple-50/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-blue-50/50 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5 mb-6 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-brand-700 font-medium">Free accessibility scan — No signup required</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight animate-fade-in-up delay-100">
              Make your website{' '}
              <span className="gradient-text">accessible</span>
              <br className="hidden sm:block" />
              {' '}and <span className="gradient-text">legally compliant</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              Scan your website against WCAG 2.2 standards.
              Get AI-powered code fixes, legal compliance mapping,
              and a detailed accessibility score — in seconds.
            </p>

            <form onSubmit={handleScan} className="max-w-2xl mx-auto animate-fade-in-up delay-300">
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-200/80">
                <div className="flex items-center gap-2 flex-1 pl-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <Input
                    type="text"
                    placeholder="Enter your website URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-base h-12 border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="h-12 px-8 rounded-xl font-semibold animate-pulse-glow"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Scanning...
                    </span>
                  ) : 'Scan Free'}
                </Button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </form>

            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-6 animate-fade-in-up delay-400">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Tests for:</span>
              {COMPLIANCE_BADGES.map((badge) => (
                <span key={badge} className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto animate-fade-in-up delay-500">
            <ComparisonSlider />
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="py-8 border-y border-gray-100 bg-gray-50/50" ref={rev1.ref}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${rev1.className}`}>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
            {[
              { value: 'WCAG 2.2', label: 'Full Coverage' },
              { value: '50+', label: 'Criteria Tested' },
              { value: '30+', label: 'Auto-Fix Rules' },
              { value: '5+', label: 'Legal Frameworks' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-white" ref={rev2.ref}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${rev2.className}`}>
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
              Three steps to compliance
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From URL to actionable fixes in under 30 seconds. No expertise needed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative group">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-gray-200 to-transparent" />
                )}
                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <span className="text-5xl font-bold text-brand-100 group-hover:text-brand-200 transition-colors">{step.num}</span>
                  <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 sm:py-24 bg-gray-50/80" ref={rev3.ref}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${rev3.className}`}>
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
              More than just detection
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Unlike basic scanners, we provide actionable fixes, legal mapping, and developer-ready output.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-100 group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPLIANCE FRAMEWORKS ─── */}
      <section className="py-20 sm:py-24 bg-white" ref={rev4.ref}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${rev4.className}`}>
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Global Compliance</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
              We audit against every major standard
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Compliance mapping for legislation from the US, EU, and Canada — per issue.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
            {COMPLIANCE_BADGES.map((badge) => (
              <div key={badge} className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-brand-500 bg-brand-50/50 hover:bg-brand-100 hover:scale-105 transition-all duration-300 group cursor-default">
                <span className="text-[11px] sm:text-xs font-bold text-brand-700 text-center leading-tight">{badge}</span>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="flex border-b border-gray-200">
              {LEGISLATION.map((leg) => (
                <button
                  key={leg.id}
                  onClick={() => setActiveLeg(leg.id)}
                  className={`flex-1 px-4 py-3.5 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    activeLeg === leg.id
                      ? 'bg-brand-50 text-brand-700 border-b-2 border-brand-600 -mb-px'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{leg.flag}</span>
                  <span className="hidden sm:inline">{leg.region}</span>
                </button>
              ))}
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {activeLegislation.laws.map((law) => (
                  <div key={law.name} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-gray-900 mb-1">{law.name}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{law.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 sm:py-24 bg-gray-50/80" ref={rev5.ref}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${rev5.className}`}>
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Everything you need to know about our accessibility scanner.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-brand-200 hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-5 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{item.q}</h3>
                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 sm:py-24 relative overflow-hidden" ref={rev6.ref}>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div className={`relative max-w-3xl mx-auto px-4 text-center ${rev6.className}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to make your website accessible?
          </h2>
          <p className="text-brand-200 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of developers who use AccessAudit AI to find and fix accessibility issues before they become lawsuits.
          </p>
          <form onSubmit={handleScan} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Enter your website URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-base h-12 bg-white/95 border-white/20 rounded-xl"
              />
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="bg-white text-brand-600 hover:bg-brand-50 px-8 h-12 font-semibold rounded-xl whitespace-nowrap"
              >
                {loading ? 'Scanning...' : 'Scan Free'}
              </Button>
            </div>
          </form>
          <p className="text-xs text-brand-300 mt-4">
            No signup required &middot; Results in 30 seconds &middot; AI fixes included
          </p>
        </div>
      </section>
    </div>
  );
}
