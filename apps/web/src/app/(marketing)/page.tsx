'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            AI finds the issues.
            <br />
            <span className="text-brand-600">Humans validate the experience.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Detect, fix, and verify WCAG 2.2 accessibility issues with AI-powered scanning,
            contextual code fixes, and real human testing.
          </p>

          {/* Free Scan Form */}
          <form onSubmit={handleScan} className="max-w-xl mx-auto">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter your website URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-base h-12"
              />
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? 'Scanning...' : 'Free Scan'}
              </Button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <p className="mt-3 text-sm text-gray-500">
              Get your accessibility score, top issues, and quick fixes - free.
            </p>
          </form>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Scan',
                description: 'Enter your URL. Our AI scans your page for WCAG 2.2 violations using advanced accessibility analysis.',
              },
              {
                step: '2',
                title: 'Fix',
                description: 'Get contextual code fixes tailored to your tech stack. Before/after code snippets you can copy directly.',
              },
              {
                step: '3',
                title: 'Validate',
                description: 'Real users with disabilities test your site. Get confirmation that the experience actually works.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            More Than Just Detection
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'AI Remediation Engine', desc: 'Contextual before/after code fixes adapted to your stack (HTML, React, Vue, Angular, WordPress).' },
              { title: 'Priority Scoring', desc: 'Issues ranked by severity, frequency, and user impact. Fix what matters most first.' },
              { title: 'WCAG 2.2 Coverage', desc: 'Full coverage of WCAG 2.2 Level A and AA success criteria.' },
              { title: 'Human Validation', desc: 'Real testers with disabilities verify the actual user experience, not just automated rules.' },
              { title: 'Developer-Ready', desc: 'Issue board, code snippets, and exportable task lists. Built for dev workflows.' },
              { title: 'Compliance Reports', desc: 'Executive and technical PDF reports for stakeholders, legal, and procurement.' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
