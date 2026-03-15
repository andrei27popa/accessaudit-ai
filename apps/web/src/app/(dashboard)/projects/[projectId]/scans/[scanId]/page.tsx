'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ScoreCircle } from '@/components/scan/score-circle';
import { IssueCard } from '@/components/scan/issue-card';
import { getComplianceColor } from '@/lib/utils';
import { api } from '@/lib/api';

export default function ProjectScanResultsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const scanId = params.scanId as string;

  const [scan, setScan] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [pollCount, setPollCount] = useState(0);

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

  useEffect(() => {
    if (scan && scan.status !== 'DONE' && scan.status !== 'FAILED') {
      const timer = setTimeout(fetchScan, 2000);
      return () => clearTimeout(timer);
    }
  }, [scan, pollCount, fetchScan]);

  // Loading/scanning state
  if (!scan || (loading && scan?.status !== 'DONE' && scan?.status !== 'FAILED')) {
    const statusMessages: Record<string, { message: string; detail: string }> = {
      QUEUED: { message: 'Preparing scan...', detail: 'Your scan is queued and will start shortly' },
      SCANNING: { message: 'Scanning page...', detail: 'Analyzing accessibility with WCAG 2.2 standards' },
      AGGREGATING: { message: 'Analyzing results...', detail: 'Grouping issues and calculating your score' },
      REMEDIATING: { message: 'Generating AI fixes...', detail: 'AI is creating code fixes for your issues' },
    };
    const info = statusMessages[scan?.status] || statusMessages.QUEUED;

    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="relative w-16 h-16 mb-5">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">{info.message}</h2>
        <p className="text-sm text-gray-500">{info.detail}</p>
        {scan?.url && (
          <p className="text-xs text-gray-400 font-mono mt-3 truncate max-w-xs">{scan.url}</p>
        )}
      </div>
    );
  }

  // Failed state
  if (scan.status === 'FAILED') {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Scan Failed</h2>
        <p className="text-sm text-gray-500 mb-4">
          {scan.errorMessage || 'Could not complete the scan. Please try again.'}
        </p>
        <Link href={`/projects/${projectId}`} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
          &larr; Back to project
        </Link>
      </div>
    );
  }

  // Results
  const summary = scan.summary || {};
  const severityCounts = {
    critical: issues.filter(i => i.severity === 'CRITICAL').length,
    serious: issues.filter(i => i.severity === 'SERIOUS').length,
    moderate: issues.filter(i => i.severity === 'MODERATE').length,
    minor: issues.filter(i => i.severity === 'MINOR').length,
  };
  const issuesWithFix = issues.filter(i => i.aiFix);

  const filteredIssues = activeTab === 'all' ? issues
    : activeTab === 'fixable' ? issuesWithFix
    : issues.filter(i => i.severity === activeTab);

  const tabs = [
    { id: 'all', label: 'All Issues', count: issues.length },
    { id: 'CRITICAL', label: 'Critical', count: severityCounts.critical },
    { id: 'SERIOUS', label: 'Serious', count: severityCounts.serious },
    { id: 'fixable', label: 'AI Fix', count: issuesWithFix.length },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/projects" className="hover:text-gray-700 transition-colors">Projects</Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <Link href={`/projects/${projectId}`} className="hover:text-gray-700 transition-colors">
          {scan.project?.name || 'Project'}
        </Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">Scan Results</span>
      </div>

      {/* Score + Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <ScoreCircle score={scan.score || 0} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">Scan Results</h1>
              {scan.complianceLabel && (
                <Badge className={`${getComplianceColor(scan.complianceLabel)} text-xs`}>
                  {scan.complianceLabel}
                </Badge>
              )}
            </div>
            <a href={scan.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 mb-3">
              {scan.url}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <div className="flex flex-wrap gap-4 text-sm">
              {severityCounts.critical > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <strong className="text-red-600">{severityCounts.critical}</strong> Critical
                </span>
              )}
              {severityCounts.serious > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <strong className="text-orange-600">{severityCounts.serious}</strong> Serious
                </span>
              )}
              {severityCounts.moderate > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <strong className="text-amber-600">{severityCounts.moderate}</strong> Moderate
                </span>
              )}
              {severityCounts.minor > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <strong className="text-blue-600">{severityCounts.minor}</strong> Minor
                </span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500 text-right">
            <p>Scanned {new Date(scan.finishedAt || scan.createdAt).toLocaleDateString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">{scan.pagesScanned} page{scan.pagesScanned !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* AI Fix Banner */}
      {issuesWithFix.length > 0 && (
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
            <p className="text-xs text-purple-600 mt-0.5">Click any issue to see the fix with code examples.</p>
          </div>
        </div>
      )}

      {/* Issue Tabs + List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
    </div>
  );
}
