'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreCircle } from '@/components/scan/score-circle';
import { getComplianceColor } from '@/lib/utils';
import { api } from '@/lib/api';

interface ProjectDetail {
  id: string;
  name: string;
  domain: string;
  detectedStack: string | null;
  createdAt: string;
  scans: Array<{
    id: string;
    type: string;
    status: string;
    url: string;
    score: number | null;
    complianceLabel: string | null;
    pagesScanned: number;
    createdAt: string;
    finishedAt: string | null;
  }>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const projectId = params.projectId as string;

  useEffect(() => {
    api.getProject(projectId)
      .then(setProject)
      .catch(() => router.push('/projects'))
      .finally(() => setLoading(false));
  }, [projectId, router]);

  const handleNewScan = async () => {
    if (!project) return;
    setScanning(true);
    try {
      const scan = await api.createScan(projectId, project.domain);
      router.push(`/projects/${projectId}/scans/${scan.id}`);
    } catch (err) {
      console.error('Failed to start scan:', err);
    } finally {
      setScanning(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  const latestScan = project.scans[0];
  const completedScans = project.scans.filter(s => s.status === 'DONE');
  const bestScore = completedScans.length > 0
    ? Math.max(...completedScans.map(s => s.score || 0))
    : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/projects" className="hover:text-gray-700 transition-colors">Projects</Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <a href={project.domain} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
              {project.domain}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            {project.detectedStack && (
              <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">{project.detectedStack}</Badge>
            )}
          </div>
        </div>
        <Button onClick={handleNewScan} disabled={scanning} className="rounded-xl">
          {scanning ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Starting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Run New Scan
            </span>
          )}
        </Button>
      </div>

      {/* Score Overview */}
      {latestScan?.score != null && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <ScoreCircle score={latestScan.score} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {latestScan.complianceLabel && (
                  <Badge className={`${getComplianceColor(latestScan.complianceLabel)} text-sm px-3 py-1`}>
                    {latestScan.complianceLabel}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Last scanned {new Date(latestScan.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-gray-900">{completedScans.length}</p>
                <p className="text-xs text-gray-500">Total Scans</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{latestScan.pagesScanned}</p>
                <p className="text-xs text-gray-500">Pages</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{bestScore != null ? Math.round(bestScore) : '—'}</p>
                <p className="text-xs text-gray-500">Best Score</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scan History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Scan History</h2>
          <span className="text-xs text-gray-400">{project.scans.length} scan{project.scans.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="p-4">
          {project.scans.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-1">No scans yet</p>
              <p className="text-xs text-gray-400">Run your first scan to see results here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {project.scans.map((scan) => (
                <Link
                  key={scan.id}
                  href={`/projects/${projectId}/scans/${scan.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Status indicator */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      scan.status === 'DONE' ? 'bg-green-50' :
                      scan.status === 'FAILED' ? 'bg-red-50' :
                      'bg-amber-50'
                    }`}>
                      {scan.status === 'DONE' ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : scan.status === 'FAILED' ? (
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M16.023 9.348" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-brand-700 transition-colors">
                        {scan.url}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`text-[10px] px-1.5 py-0 ${
                          scan.type === 'FREE' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          scan.type === 'FULL' ? 'bg-brand-50 text-brand-700 border-brand-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {scan.type}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(scan.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {scan.score != null && (
                      <span className={`text-lg font-bold ${
                        scan.score >= 90 ? 'text-green-600' :
                        scan.score >= 70 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {Math.round(scan.score)}
                      </span>
                    )}
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
