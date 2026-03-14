'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

const COMPLIANCE_BADGES = ['WCAG 2.2', 'ADA', 'EAA', 'Section 508', 'EN 301 549', 'AODA'];

const LEGISLATION = [
  {
    id: 'us',
    region: 'United States',
    laws: [
      { name: 'ADA Title III', desc: 'Requires businesses to provide equal access to goods and services, including websites. Based on WCAG 2.2 AA.' },
      { name: 'Section 508', desc: 'Requires federal agencies and contractors to make ICT accessible. References WCAG 2.0 AA.' },
    ],
  },
  {
    id: 'eu',
    region: 'European Union',
    laws: [
      { name: 'European Accessibility Act (EAA)', desc: 'Requires products and services sold in the EU to be accessible by June 2025. Based on EN 301 549 / WCAG 2.1 AA.' },
      { name: 'EN 301 549', desc: 'Harmonized European standard for ICT accessibility. References WCAG 2.1 Level AA.' },
    ],
  },
  {
    id: 'ca',
    region: 'Canada',
    laws: [
      { name: 'AODA', desc: 'Accessibility for Ontarians with Disabilities Act. Requires WCAG 2.0 AA compliance for public and large private organizations.' },
      { name: 'ACA', desc: 'Accessible Canada Act. National framework for proactive accessibility in federally regulated sectors.' },
    ],
  },
];

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeLeg, setActiveLeg] = useState('us');
  const router = useRouter();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let scanUrl = url.trim();
    if (!scanUrl) return;

    if (!scanUrl.startsWith('http://') && !scanUrl.startsWith('https://')) {
      scanUrl = 'https://' + scanUrl;
    }

    try {
      new URL(scanUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const result = await api.freeScan(scanUrl);
      router.push(`/scan/${result.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start scan');
    } finally {
      setLoading(false);
    }
  };

  const activeLegislation = LEGISLATION.find((l) => l.id === activeLeg) || LEGISLATION[0];

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find out if your website is
            <br />
            <span className="text-brand-600">Accessible</span> and <span className="text-brand-600">Compliant</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our free ADA and WCAG compliance checker identifies web accessibility issues
            and gives AI-powered code fixes. Type your URL to start now!
          </p>

          {/* Free Scan Form */}
          <form onSubmit={handleScan} className="max-w-2xl mx-auto">
            <div className="flex gap-3 bg-white p-2 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 flex-1 pl-3">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                <Input
                  type="text"
                  placeholder="Type Website's URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="text-base h-12 border-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="px-8 h-12">
                {loading ? 'Scanning...' : 'Scan Website'}
              </Button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </form>

          {/* Compliance Checks */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-6">
            <span className="text-sm text-gray-500">Checks for Compliance With:</span>
            {COMPLIANCE_BADGES.map((badge) => (
              <span key={badge} className="flex items-center gap-1 text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                {badge}
              </span>
            ))}
          </div>

          {/* Trust line */}
          <p className="text-xs text-gray-400 mt-4">No signup required. Free results in 30 seconds. AI-powered fixes included.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 'WCAG 2.2', label: 'Full Coverage' },
              { value: '50+', label: 'WCAG Criteria' },
              { value: '30+', label: 'Auto-Fix Rules' },
              { value: '5+', label: 'Legal Frameworks' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-brand-600">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Find and Fix Accessibility Issues
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Before they become a legal problem. Our scanner shows you what&apos;s wrong and exactly how to fix it &mdash; fast, clear, and actionable.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Scan',
                description: 'Enter your URL. Our engine scans your page against 50+ WCAG 2.2 Level A and AA criteria using axe-core.',
                color: 'bg-blue-50 text-blue-600 border-blue-200',
              },
              {
                step: '2',
                title: 'Analyze',
                description: 'Get a detailed report with your accessibility score, severity breakdown, compliance status, and affected WCAG criteria.',
                color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
              },
              {
                step: '3',
                title: 'Fix with AI',
                description: 'Receive AI-generated before/after code fixes, WCAG technique references, and framework-specific guidance (React, Vue, Angular).',
                color: 'bg-green-50 text-green-600 border-green-200',
              },
            ].map((item) => (
              <div key={item.step} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-full ${item.color} border text-xl font-bold flex items-center justify-center mx-auto mb-4`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Frameworks */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            We Audit Against Every Major Standard &mdash; <span className="text-brand-600">Worldwide</span>
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
            Our scanner checks compliance with accessibility standards and legislation from around the world.
          </p>

          {/* Compliance Badge Row */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {COMPLIANCE_BADGES.map((badge) => (
              <div key={badge} className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-2 border-green-600 bg-white">
                <span className="text-xs font-bold text-green-700 text-center leading-tight">{badge}</span>
                <span className="text-[10px] text-gray-400">Compliance</span>
              </div>
            ))}
          </div>

          {/* Legislation Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              {LEGISLATION.map((leg) => (
                <button
                  key={leg.id}
                  onClick={() => setActiveLeg(leg.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeLeg === leg.id
                      ? 'bg-brand-50 text-brand-700 border-b-2 border-brand-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {leg.region}
                </button>
              ))}
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activeLegislation.laws.map((law) => (
                  <div key={law.name} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-1">{law.name}</h4>
                    <p className="text-sm text-gray-600">{law.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            More Than Just Detection
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Unlike basic scanners, AccessAudit AI provides actionable fixes, not just a list of problems.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'AI Remediation Engine', desc: 'Contextual before/after code fixes adapted to your stack (HTML, React, Vue, Angular, WordPress).', icon: '&#x1f9e0;' },
              { title: 'Priority Scoring', desc: 'Issues ranked by severity, frequency, and user impact. Fix what matters most first.', icon: '&#x1f4ca;' },
              { title: 'WCAG 2.2 AA Coverage', desc: 'Full coverage of 50+ WCAG 2.2 Level A and AA success criteria with technique references.', icon: '&#x2705;' },
              { title: 'Legal Compliance', desc: 'Compliance mapping for ADA, Section 508, EAA, EN 301 549, and AODA per issue.', icon: '&#x2696;' },
              { title: 'Developer-Ready', desc: 'Code snippets, WCAG technique links, and framework-specific notes. Built for dev workflows.', icon: '&#x1f4bb;' },
              { title: 'Human Validation', desc: 'Real testers with disabilities verify the actual user experience (coming soon).', icon: '&#x1f9d1;' },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl border border-gray-200 hover:shadow-md hover:border-brand-200 transition-all">
                <div className="text-2xl mb-3" dangerouslySetInnerHTML={{ __html: feature.icon }} />
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-brand-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to make your website accessible?
          </h2>
          <p className="text-brand-100 mb-8">
            Run your free scan now and get AI-powered fixes in seconds.
          </p>
          <form onSubmit={handleScan} className="max-w-xl mx-auto">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter your website URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-base h-12 bg-white"
              />
              <Button type="submit" size="lg" disabled={loading} className="bg-white text-brand-600 hover:bg-brand-50 px-8 h-12 font-semibold">
                {loading ? 'Scanning...' : 'Free Scan'}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
