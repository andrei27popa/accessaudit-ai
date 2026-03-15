'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreCircle } from '@/components/scan/score-circle';
import { IssueCard } from '@/components/scan/issue-card';
import { getSeverityColor } from '@/lib/utils';
import { api } from '@/lib/api';

const FRAMEWORKS = [
  { id: 'ADA', name: 'ADA Title III', region: 'United States', icon: '🇺🇸' },
  { id: 'SECTION508', name: 'Section 508', region: 'United States', icon: '🏛️' },
  { id: 'EAA', name: 'European Accessibility Act', region: 'European Union', icon: '🇪🇺' },
  { id: 'EN301549', name: 'EN 301 549', region: 'European Union', icon: '📋' },
  { id: 'AODA', name: 'AODA', region: 'Canada', icon: '🇨🇦' },
];

export default function ScanResultsPage() {
  const params = useParams();
  const scanId = params.scanId as string;

  const [scan, setScan] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [startTime] = useState(() => Date.now());
  const [wakeTriggered, setWakeTriggered] = useState(false);

  const fetchScan = useCallback(async () => {
    try {
      const scanData = await api.getScan(scanId);
      setScan(scanData);

      // If stuck in QUEUED for > 20 seconds, trigger a manual wake-up
      if (scanData.status === 'QUEUED' && !wakeTriggered) {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > 20) {
          api.wakeWorkers().catch(() => {});
          setWakeTriggered(true);
        }
      }

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
  }, [scanId, wakeTriggered, startTime]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  useEffect(() => {
    if (scan && scan.status !== 'DONE' && scan.status !== 'FAILED') {
      // Poll faster initially, slow down in QUEUED state
      const delay = scan.status === 'QUEUED' ? 3000 : 2000;
      const timer = setTimeout(fetchScan, delay);
      return () => clearTimeout(timer);
    }
  }, [scan, pollCount, fetchScan]);

  // Dynamic status messages based on elapsed time
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  const getQueuedMessage = () => {
    if (elapsedSeconds > 45) return { message: 'Starting scan workers...', detail: 'Almost ready — our scan infrastructure is warming up. This is a one-time delay.', progress: 12 };
    if (elapsedSeconds > 20) return { message: 'Waking up scan engine...', detail: 'Starting our scan workers. First scan may take up to a minute.', progress: 10 };
    return { message: 'Preparing your scan...', detail: 'Your scan is queued and will start shortly', progress: 8 };
  };

  const queuedInfo = getQueuedMessage();
  const statusInfo: Record<string, { message: string; detail: string; progress: number; step: number }> = {
    QUEUED: { ...queuedInfo, step: 0 },
    SCANNING: { message: 'Scanning your page...', detail: 'Analyzing accessibility with WCAG 2.2 standards', progress: 40, step: 1 },
    AGGREGATING: { message: 'Analyzing results...', detail: 'Grouping issues and calculating your score', progress: 65, step: 2 },
    REMEDIATING: { message: 'Generating AI fixes...', detail: 'AI is creating code fixes for your issues', progress: 85, step: 3 },
  };

  // Loading / scanning state
  if (!scan || (loading && scan?.status !== 'DONE' && scan?.status !== 'FAILED')) {
    const info = statusInfo[scan?.status] || statusInfo.QUEUED;
    const currentStep = info.step;
    const steps = [
      { label: 'Queue', icon: '⏳', doneIcon: '✓' },
      { label: 'Scan', icon: '🔍', doneIcon: '✓' },
      { label: 'Analyze', icon: '📊', doneIcon: '✓' },
      { label: 'AI Fix', icon: '🤖', doneIcon: '✓' },
    ];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-brand-50/30 to-purple-50/20 px-4">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-900">AccessAudit<span className="text-brand-600 ml-0.5">AI</span></span>
        </Link>

        <div className="w-full max-w-lg">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <div className="text-center mb-8">
              <div className="relative mx-auto w-16 h-16 mb-5">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{info.message}</h2>
              <p className="text-sm text-gray-500 font-mono truncate max-w-xs mx-auto">
                {scan?.url || 'Loading...'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-8 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${info.progress}%` }}
              />
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-between relative mb-4">
              {/* Connecting line */}
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-200" />
              <div className="absolute top-5 left-[10%] h-0.5 bg-brand-500 transition-all duration-700"
                style={{ width: `${Math.min(100, (currentStep / (steps.length - 1)) * 100)}%`, maxWidth: '80%' }} />

              {steps.map((step, i) => (
                <div key={step.label} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    i < currentStep
                      ? 'bg-green-500 text-white shadow-md shadow-green-200'
                      : i === currentStep
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 scale-110'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}>
                    {i < currentStep ? '✓' : step.icon}
                  </div>
                  <span className={`text-xs font-medium ${i <= currentStep ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">{info.detail}</p>
          </div>
          <p className="text-xs text-gray-400 text-center mt-5">
            {scan?.status === 'QUEUED' && elapsedSeconds > 30
              ? 'First scan may take up to 90 seconds while workers start up'
              : 'This usually takes 30-60 seconds'}
          </p>
        </div>
      </div>
    );
  }

  // Failed
  if (scan.status === 'FAILED') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-gray-50 px-4">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-900">AccessAudit<span className="text-brand-600 ml-0.5">AI</span></span>
        </Link>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Scan Failed</h2>
          <p className="text-sm text-gray-500 mb-6">
            {scan.errorMessage || 'Could not scan this page. Please check the URL and try again.'}
          </p>
          <Link href="/">
            <Button className="rounded-xl">Try Again</Button>
          </Link>
        </div>
      </div>
    );
  }

  // === RESULTS VIEW ===
  const summary = scan.summary || {};

  // Extract unique WCAG criteria from all issues
  const wcagCriteria = [...new Set(
    issues.flatMap((i) => (i.wcagRefs as string[]) || [])
  )].sort();

  // Actual severity counts from issues
  const severityCounts = {
    critical: issues.filter(i => i.severity === 'CRITICAL').length,
    serious: issues.filter(i => i.severity === 'SERIOUS').length,
    moderate: issues.filter(i => i.severity === 'MODERATE').length,
    minor: issues.filter(i => i.severity === 'MINOR').length,
  };

  // Total occurrences across all issues
  const totalOccurrences = issues.reduce((sum, i) => sum + (i.occurrences || 0), 0);

  // Filter issues by tab
  const issuesWithFix = issues.filter((i) => i.aiFix);
  const filteredIssues = activeTab === 'all' ? issues
    : activeTab === 'critical' ? issues.filter((i) => i.severity === 'CRITICAL')
    : activeTab === 'serious' ? issues.filter((i) => i.severity === 'SERIOUS')
    : activeTab === 'fixable' ? issuesWithFix
    : issues;

  const isNonCompliant = (scan.score || 0) < 90;
  const score = scan.score || 0;

  const tabs = [
    { id: 'all', label: 'All Issues', count: issues.length },
    { id: 'critical', label: 'Critical', count: severityCounts.critical },
    { id: 'serious', label: 'Serious', count: severityCounts.serious },
    { id: 'fixable', label: 'AI Fix Available', count: issuesWithFix.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">AccessAudit<span className="text-brand-600 ml-0.5">AI</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-lg text-xs">New Scan</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-lg text-xs">Run Full Audit</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className={`relative overflow-hidden ${isNonCompliant
        ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500'
        : 'bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500'
      }`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isNonCompliant ? 'bg-white/20' : 'bg-white/20'
              }`}>
                {isNonCompliant ? (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
              </div>
              <div className="text-white">
                <h1 className="text-xl font-bold">
                  {isNonCompliant ? 'Accessibility Issues Found' : 'Likely Compliant'}
                </h1>
                <p className="text-sm text-white/80 mt-0.5">
                  <a href={scan.url} target="_blank" rel="noopener noreferrer" className="hover:text-white underline underline-offset-2">
                    {scan.url}
                  </a>
                  <span className="mx-2 text-white/40">|</span>
                  Scanned {new Date(scan.finishedAt || scan.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {issues.length > 0 && (
              <Link href="/signup">
                <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold shadow-lg shadow-black/10 px-6">
                  Fix {issues.length} Issue{issues.length !== 1 ? 's' : ''}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
            <div className="py-4 px-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{score}</p>
              <p className="text-xs text-gray-500 mt-0.5">Score / 100</p>
            </div>
            <div className="py-4 px-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{issues.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Issue Groups</p>
            </div>
            <div className="py-4 px-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalOccurrences}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Occurrences</p>
            </div>
            <div className="py-4 px-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{issuesWithFix.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">AI Fixes Ready</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-20 space-y-5">

              {/* Site Screenshot */}
              {scan.screenshotUrl && (
                <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={scan.screenshotUrl}
                      alt={`Screenshot of ${scan.url}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="px-3 py-2.5 border-t border-gray-100">
                    <p className="text-xs text-gray-500 truncate font-mono">{scan.url}</p>
                    {scan.pageTitle && <p className="text-xs text-gray-400 truncate mt-0.5">{scan.pageTitle}</p>}
                  </div>
                </div>
              )}

              {/* Score Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
                <ScoreCircle score={score} size="lg" />
                <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                  {score >= 90
                    ? 'Your site meets recommended accessibility standards.'
                    : score >= 70
                    ? 'Some issues need attention to meet compliance.'
                    : 'Significant issues need to be fixed for compliance.'}
                </p>
              </div>

              {/* Issues Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Issues by Severity</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Critical', count: severityCounts.critical, color: 'bg-red-500', lightColor: 'bg-red-50 text-red-700' },
                    { label: 'Serious', count: severityCounts.serious, color: 'bg-orange-500', lightColor: 'bg-orange-50 text-orange-700' },
                    { label: 'Moderate', count: severityCounts.moderate, color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-700' },
                    { label: 'Minor', count: severityCounts.minor, color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`} />
                      <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${item.lightColor}`}>
                        {item.count}
                      </span>
                      {issues.length > 0 && (
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color} transition-all duration-700`}
                            style={{ width: `${Math.max(item.count > 0 ? 10 : 0, (item.count / Math.max(issues.length, 1)) * 100)}%` }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* WCAG Criteria Summary */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">WCAG 2.2 Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-red-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">Failed Criteria</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">{wcagCriteria.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">Passed Checks</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{summary.passedCount || Math.max(0, 50 - wcagCriteria.length)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">Needs Review</span>
                    </div>
                    <span className="text-sm font-bold text-amber-600">{summary.incompleteCount || '—'}</span>
                  </div>
                </div>
                {/* Visual bar */}
                <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden flex">
                  <div className="bg-green-500 transition-all duration-700" style={{ width: `${Math.max(0, 100 - wcagCriteria.length * 2)}%` }} />
                  <div className="bg-amber-400 transition-all duration-700" style={{ width: `${Math.min(30, wcagCriteria.length)}%` }} />
                  <div className="bg-red-500 transition-all duration-700" style={{ width: `${wcagCriteria.length * 2}%` }} />
                </div>
              </div>

              {/* Compliance Frameworks */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Compliance Status</h3>
                <div className="space-y-2.5">
                  {FRAMEWORKS.map((fw) => (
                    <div key={fw.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-base">{fw.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{fw.name}</p>
                      </div>
                      {isNonCompliant ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 uppercase tracking-wide">
                          At Risk
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 uppercase tracking-wide">
                          Pass
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl p-5 text-center shadow-lg shadow-brand-500/20">
                <p className="text-sm font-bold text-white mb-1">Want a full site audit?</p>
                <p className="text-xs text-brand-100 mb-4">
                  Scan all pages, get AI fixes, and validate compliance.
                </p>
                <Link href="/signup">
                  <Button className="w-full bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-semibold">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">

            {/* WCAG Criteria Affected */}
            {wcagCriteria.length > 0 && (
              <div className="mb-5 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-900">WCAG Criteria Affected</h2>
                  <span className="text-xs text-gray-400">{wcagCriteria.length} of ~50 criteria</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {wcagCriteria.map((ref) => (
                    <a
                      key={ref}
                      href={`https://www.w3.org/WAI/WCAG22/Understanding/${ref.replace(/\./g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      {ref}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* AI Fix Banner */}
            {issues.length > 0 && issuesWithFix.length > 0 && (
              <div className="mb-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/50 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-900">
                    {issuesWithFix.length} of {issues.length} issues have AI-generated fixes
                  </p>
                  <p className="text-xs text-purple-600 mt-0.5">Click any issue to expand and see the fix with code examples.</p>
                </div>
              </div>
            )}

            {/* Issue Tabs */}
            <div className="mb-5 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center border-b border-gray-100 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? 'border-brand-600 text-brand-600 bg-brand-50/50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md font-bold ${
                      activeTab === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Issues List */}
              <div className="p-4">
                {filteredIssues.length === 0 ? (
                  <div className="py-8 text-center">
                    {issues.length === 0 ? (
                      <>
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No issues found!</h3>
                        <p className="text-sm text-gray-500">This page meets WCAG 2.2 AA standards.</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No issues in this category.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredIssues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} scanId={scanId} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Footer */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
              <p className="text-xs text-gray-500 mb-3">Accessibility guidelines and legislations we test by:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['WCAG 2.2', 'ADA', 'Section 508', 'EAA', 'EN 301 549', 'AODA'].map((name) => (
                  <span key={name} className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
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
