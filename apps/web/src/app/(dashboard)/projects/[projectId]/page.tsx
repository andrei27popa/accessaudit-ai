'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-500">{project.domain}</p>
        </div>
        <Button onClick={handleNewScan} disabled={scanning}>
          {scanning ? 'Starting scan...' : 'Run New Scan'}
        </Button>
      </div>

      {/* Score Overview */}
      {latestScan?.score != null && (
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center gap-8">
              <ScoreCircle score={latestScan.score} size="lg" />
              <div>
                {latestScan.complianceLabel && (
                  <Badge className={`${getComplianceColor(latestScan.complianceLabel)} text-sm px-3 py-1`}>
                    {latestScan.complianceLabel}
                  </Badge>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Last scanned {new Date(latestScan.createdAt).toLocaleDateString()}
                </p>
                {project.detectedStack && (
                  <p className="text-sm text-gray-500">Stack: {project.detectedStack}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          {project.scans.length === 0 ? (
            <p className="text-gray-500 text-sm">No scans yet. Run your first scan above.</p>
          ) : (
            <div className="space-y-3">
              {project.scans.map((scan) => (
                <Link
                  key={scan.id}
                  href={`/projects/${projectId}/scans/${scan.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-brand-300 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Badge className={
                      scan.status === 'DONE' ? 'bg-green-100 text-green-800 border-green-200' :
                      scan.status === 'FAILED' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }>
                      {scan.status}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{scan.url}</p>
                      <p className="text-xs text-gray-500">
                        {scan.type} scan &middot; {new Date(scan.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {scan.score != null && (
                    <span className="text-lg font-bold text-gray-900">
                      {Math.round(scan.score)}/100
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
