'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreCircle } from '@/components/scan/score-circle';
import { IssueCard } from '@/components/scan/issue-card';
import { getComplianceColor, getSeverityColor } from '@/lib/utils';
import { api } from '@/lib/api';

export default function ProjectScanResultsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const scanId = params.scanId as string;

  const [scan, setScan] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
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

  if (!scan || (loading && scan?.status !== 'DONE')) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4" />
        <p className="text-gray-500">
          {scan?.status === 'SCANNING' ? 'Scanning page...' :
           scan?.status === 'AGGREGATING' ? 'Analyzing issues...' :
           scan?.status === 'REMEDIATING' ? 'Generating AI fixes...' :
           'Loading...'}
        </p>
      </div>
    );
  }

  const filteredIssues = filter === 'all'
    ? issues
    : issues.filter((i) => i.severity === filter);

  const summary = scan.summary || {};

  return (
    <div>
      <div className="mb-6">
        <Link href={`/projects/${projectId}`} className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to project
        </Link>
      </div>

      {/* Score + Summary */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-center gap-8">
            <ScoreCircle score={scan.score || 0} size="lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Scan Results</h1>
              <p className="text-sm text-gray-500 mb-3">{scan.url}</p>
              {scan.complianceLabel && (
                <Badge className={`${getComplianceColor(scan.complianceLabel)} text-sm px-3 py-1`}>
                  {scan.complianceLabel}
                </Badge>
              )}
              <div className="flex gap-6 mt-3 text-sm">
                <span><strong className="text-red-600">{summary.criticalCount || 0}</strong> Critical</span>
                <span><strong className="text-orange-600">{summary.seriousCount || 0}</strong> Serious</span>
                <span><strong className="text-yellow-600">{summary.moderateCount || 0}</strong> Moderate</span>
                <span><strong className="text-blue-600">{summary.minorCount || 0}</strong> Minor</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issue Board */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Issues ({filteredIssues.length})</h2>
        <div className="flex gap-2">
          {['all', 'CRITICAL', 'SERIOUS', 'MODERATE', 'MINOR'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === sev
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {sev === 'all' ? 'All' : sev}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              {filter === 'all' ? 'No issues found!' : `No ${filter.toLowerCase()} issues`}
            </CardContent>
          </Card>
        ) : (
          filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} scanId={scanId} />
          ))
        )}
      </div>
    </div>
  );
}
