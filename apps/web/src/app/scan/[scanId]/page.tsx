'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreCircle } from '@/components/scan/score-circle';
import { IssueCard } from '@/components/scan/issue-card';
import { CodeBlock } from '@/components/scan/code-block';
import { getComplianceColor, getSeverityColor } from '@/lib/utils';
import { api } from '@/lib/api';

export default function ScanResultsPage() {
  const params = useParams();
  const scanId = params.scanId as string;

  const [scan, setScan] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Poll while scanning
  useEffect(() => {
    if (scan && scan.status !== 'DONE' && scan.status !== 'FAILED') {
      const timer = setTimeout(fetchScan, 2000);
      return () => clearTimeout(timer);
    }
  }, [scan, pollCount, fetchScan]);

  // Still loading / scanning
  if (!scan || (loading && scan?.status !== 'DONE' && scan?.status !== 'FAILED')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Link href="/" className="text-2xl font-bold text-brand-600 mb-8">
          AccessAudit<span className="text-gray-400 font-normal ml-1">AI</span>
        </Link>
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Scanning your page...</h2>
            <p className="text-sm text-gray-500 mb-1">
              {scan?.url || 'Loading...'}
            </p>
            <p className="text-xs text-gray-400">
              Status: {scan?.status || 'Loading'} {scan?.status === 'REMEDIATING' && '(generating fixes)'}
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
            <div className="text-4xl mb-4">❌</div>
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

  // Get top issues with AI fixes for quick wins
  const quickWins = issues
    .filter((i) => i.aiFix)
    .slice(0, 3);

  const summary = scan.summary || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-brand-600">
            AccessAudit<span className="text-gray-400 font-normal ml-1">AI</span>
          </Link>
          <Link href="/signup">
            <Button>Run Full Audit</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Score Section */}
        <Card className="mb-8">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ScoreCircle score={scan.score || 0} size="lg" />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Accessibility Score</h1>
                <p className="text-gray-500 mb-3">{scan.url}</p>
                {scan.complianceLabel && (
                  <Badge className={`${getComplianceColor(scan.complianceLabel)} text-sm px-3 py-1`}>
                    {scan.complianceLabel}
                  </Badge>
                )}
                <div className="flex gap-6 mt-4 text-sm justify-center md:justify-start">
                  <div>
                    <span className="font-bold text-red-600">{summary.criticalCount || 0}</span>
                    <span className="text-gray-500 ml-1">Critical</span>
                  </div>
                  <div>
                    <span className="font-bold text-orange-600">{summary.seriousCount || 0}</span>
                    <span className="text-gray-500 ml-1">Serious</span>
                  </div>
                  <div>
                    <span className="font-bold text-yellow-600">{summary.moderateCount || 0}</span>
                    <span className="text-gray-500 ml-1">Moderate</span>
                  </div>
                  <div>
                    <span className="font-bold text-blue-600">{summary.minorCount || 0}</span>
                    <span className="text-gray-500 ml-1">Minor</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Wins - Fix These First</h2>
            <div className="space-y-6">
              {quickWins.map((issue) => (
                <Card key={issue.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      <CardTitle className="text-base">{issue.title}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{issue.aiFix.summary}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">How to fix:</h4>
                      <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                        {issue.aiFix.fixSteps?.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    {issue.aiFix.codeFixes?.length > 0 && (
                      <CodeBlock
                        before={issue.aiFix.codeFixes[0].before}
                        after={issue.aiFix.codeFixes[0].after}
                        language={issue.aiFix.codeFixes[0].language}
                        notes={issue.aiFix.codeFixes[0].notes}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Issues */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            All Issues ({issues.length})
          </h2>
          <div className="space-y-3">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} scanId={scanId} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-brand-50 border-brand-200">
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Want a full audit?</h2>
            <p className="text-gray-600 mb-4">
              Scan all your pages, get AI-generated fixes for every issue, and validate with real human testers.
            </p>
            <Link href="/signup">
              <Button size="lg">Get Started Free</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
