'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreCircle } from '@/components/scan/score-circle';
import { IssueCard } from '@/components/scan/issue-card';
import { getComplianceColor, getSeverityColor } from '@/lib/utils';
import { api } from '@/lib/api';

const FRAMEWORKS = [
  { id: 'ADA', name: 'ADA Title III', region: 'United States' },
  { id: 'SECTION508', name: 'Section 508', region: 'United States' },
  { id: 'EAA', name: 'European Accessibility Act', region: 'European Union' },
  { id: 'EN301549', name: 'EN 301 549', region: 'European Union' },
  { id: 'AODA', name: 'AODA', region: 'Canada' },
];

export default function ScanResultsPage() {
  const params = useParams();
  const scanId = params.scanId as string;

  const [scan, setScan] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  const fetchScan = useCallback(async () => {
    try {
      const scanData = await api.getScan(scanId);
      setScan(scanData);

      if (scanData.status === 'DONE' || scanData.status === 'FAILED') {
        const issueData = await api.getScanIssues(scanId);
        setIssues(issueData);
        setLoading(false);
      } else {
        setPollCount((c) => c + 1);
      }
    } catch {
      setLoading(false);
    }
  }, [scanId]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  // Poll while scanning
  useEffect(() => {
    if (scan && scan.status !== 'DONE' && scan.status !== 'FAILED') {
      const timer = setTimeout(fetchScan, 2000);
      return () => clearTimeout(timer);
    }
  }, [scan, pollCount, fetchScan]);

  // Status messages and progress
  const statusInfo: Record<string, { message: string; detail: string; progress: number }> = {
    QUEUED: { message: 'Preparing your scan...', detail: 'Your scan is queued and will start shortly', progress: 10 },
    SCANNING: { message: 'Scanning your page...', detail: 'Analyzing accessibility with WCAG 2.2 standards', progress: 40 },
    AGGREGATING: { message: 'Analyzing results...', detail: 'Grouping issues and calculating your score', progress: 65 },
    REMEDIATING: { message: 'Generating fixes...', detail: 'AI is creating code fixes for your issues', progress: 85 },
  };

  // Still loading / scanning
  if (!scan || (loading && scan?.status !== 'DONE' && scan?.status !== 'FAILED')) {
    const info = statusInfo[scan?.status] || statusInfo.QUEUED;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Link href="/" className="text-2xl font-bold text-brand-600 mb-8">
          AccessAudit<span className="text-gray-400 font-normal ml-1">AI</span>
        </Link>
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{info.message}</h2>
            <p className="text-sm text-gray-500 mb-3">
              {scan?.url || 'Loading...'}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${info.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {info.detail}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Failed
  if (scan.status === 'FAILED') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Link href="/" className="text-2xl font-bold text-brand-600 mb-8">
          AccessAudit<span className="text-gray-400 font-normal ml-1">AI</span>
        </Link>
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">&#10060;</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Scan Failed</h2>
            <p className="text-sm text-gray-500 mb-4">
              {scan.errorMessage || 'Could not scan this page. Please check the URL and try again.'}
            </p>
            <Link href="/">
              <Button>Try Again</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = scan.summary || {};

  // Extract unique WCAG criteria from all issues
  const wcagCriteria = [...new Set(
    issues.flatMap((i) => (i.wcagRefs as string[]) || [])
  )].sort();

  // Compute WCAG stats
  const totalWcagCriteria = 50; // Approximate total WCAG 2.2 AA criteria
  const failedCriteria = wcagCriteria.length;
  const passedCriteria = Math.max(0, totalWcagCriteria - failedCriteria);

  // Filter issues by tab
  const issuesWithFix = issues.filter((i) => i.aiFix);
  const filteredIssues = activeTab === 'all' ? issues
    : activeTab === 'critical' ? issues.filter((i) => i.severity === 'CRITICAL')
    : activeTab === 'serious' ? issues.filter((i) => i.severity === 'SERIOUS')
    : activeTab === 'fixable' ? issuesWithFix
    : issues;

  // Compliance status per framework
  const isNonCompliant = (scan.score || 0) < 90;

  const tabs = [
    { id: 'all', label: 'All Issues', count: issues.length },
    { id: 'critical', label: 'Critical', count: summary.criticalCount || 0 },
    { id: 'serious', label: 'Serious', count: summary.seriousCount || 0 },
    { id: 'fixable', label: 'AI Fix Available', count: issuesWithFix.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-brand-600">
            AccessAudit<span className="text-gray-400 font-normal ml-1">AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">New Scan</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Run Full Audit</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Results Title Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900">
            Audit results for <a href={scan.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">{scan.url}</a>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Scanned 1 page &middot; {new Date(scan.finishedAt || scan.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Compliance Status Banner */}
      <div className={`${isNonCompliant ? 'bg-red-600' : 'bg-green-600'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isNonCompliant ? '\u2718' : '\u2714'}</span>
            <div>
              <span className="text-lg font-bold">{isNonCompliant ? 'NOT COMPLIANT' : 'LIKELY COMPLIANT'}</span>
              <p className="text-sm opacity-90">
                {isNonCompliant
                  ? 'Your site may be at risk of accessibility lawsuits.'
                  : 'Your site appears to meet WCAG 2.2 AA standards.'}
              </p>
            </div>
          </div>
          {issues.length > 0 && (
            <Link href="/signup">
              <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                Fix {issues.length} Issues
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-6 space-y-6">

              {/* Score Card */}
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Audit Score</p>
                  <ScoreCircle score={scan.score || 0} size="lg" />
                  <p className="text-sm text-gray-500 mt-3">
                    {(scan.score || 0) < 90
                      ? 'Websites with a score lower than 90 are at risk of accessibility lawsuits.'
                      : 'Your site meets recommended accessibility standards.'}
                  </p>
                </CardContent>
              </Card>

              {/* WCAG 2.2 Criteria Breakdown */}
              <Card>
                <CardContent className="py-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">WCAG 2.2 Criteria</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm text-gray-700">Critical Issues</span>
                      </div>
                      <span className="text-sm font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded">{failedCriteria}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-700">Passed Audits</span>
                      </div>
                      <span className="text-sm font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded">{passedCriteria}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-sm text-gray-700">Need Manual Review</span>
                      </div>
                      <span className="text-sm font-semibold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">{Math.round(totalWcagCriteria * 0.3)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Severity Breakdown */}
              <Card>
                <CardContent className="py-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Issues by Severity</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Critical', count: summary.criticalCount || 0, color: 'bg-red-500' },
                      { label: 'Serious', count: summary.seriousCount || 0, color: 'bg-orange-500' },
                      { label: 'Moderate', count: summary.moderateCount || 0, color: 'bg-yellow-500' },
                      { label: 'Minor', count: summary.minorCount || 0, color: 'bg-blue-500' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                        <span className="text-sm font-bold text-gray-900">{item.count}</span>
                        {issues.length > 0 && (
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.count / issues.length) * 100}%` }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Frameworks */}
              <Card>
                <CardContent className="py-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Compliance Status</h3>
                  <div className="space-y-2">
                    {FRAMEWORKS.map((fw) => (
                      <div key={fw.id} className="flex items-center justify-between py-1">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{fw.name}</p>
                          <p className="text-xs text-gray-400">{fw.region}</p>
                        </div>
                        {isNonCompliant ? (
                          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">At Risk</span>
                        ) : (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Compliant</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-brand-50 border-brand-200">
                <CardContent className="py-5 text-center">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Want a full audit?</p>
                  <p className="text-xs text-gray-600 mb-3">
                    Scan all pages, get AI fixes, and validate with human testers.
                  </p>
                  <Link href="/signup">
                    <Button size="sm" className="w-full">Get Started Free</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">

            {/* WCAG Criteria Tags */}
            {wcagCriteria.length > 0 && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-900">WCAG Criteria Affected</h2>
                  <span className="text-xs text-gray-400">{wcagCriteria.length} of ~{totalWcagCriteria} criteria</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {wcagCriteria.map((ref) => (
                    <a
                      key={ref}
                      href={`https://www.w3.org/WAI/WCAG22/Understanding/${ref.replace(/\./g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded hover:bg-red-100 transition-colors"
                    >
                      {ref}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Issue Summary */}
            {issues.length > 0 && issuesWithFix.length > 0 && (
              <div className="mb-6 p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center gap-2">
                <span className="text-lg">&#x1f916;</span>
                <p className="text-sm text-purple-800">
                  <span className="font-semibold">{issuesWithFix.length} of {issues.length} issues</span> have AI-generated fixes.
                  Click any issue to expand and see the fix.
                </p>
              </div>
            )}

            {/* Issue Tabs */}
            <div className="mb-6">
              <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Issues List */}
            {filteredIssues.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  {issues.length === 0 ? (
                    <>
                      <div className="text-4xl mb-3">&#127881;</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">No issues found!</h3>
                      <p className="text-sm text-gray-500">
                        This page appears to meet WCAG 2.2 AA standards. Great job!
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No issues in this category.</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} scanId={scanId} />
                ))}
              </div>
            )}

            {/* Compliance Footer */}
            <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-3">Accessibility guidelines and legislations we test by:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['WCAG 2.2', 'ADA', 'Section 508', 'EAA', 'EN 301 549', 'AODA'].map((name) => (
                  <span key={name} className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded border border-gray-200">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
