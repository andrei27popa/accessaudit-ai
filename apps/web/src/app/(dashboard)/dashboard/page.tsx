'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreCircle } from '@/components/scan/score-circle';
import { getComplianceColor } from '@/lib/utils';
import { api } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  domain: string;
  latestScore: number | null;
  latestComplianceLabel: string | null;
  lastScanAt: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your accessibility projects</p>
        </div>
        <Link href="/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started.</p>
            <Link href="/projects/new">
              <Button>Create Project</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <p className="text-sm text-gray-500">{project.domain}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {project.latestScore != null ? (
                      <>
                        <ScoreCircle score={project.latestScore} size="sm" />
                        <div className="text-right">
                          {project.latestComplianceLabel && (
                            <Badge className={getComplianceColor(project.latestComplianceLabel)}>
                              {project.latestComplianceLabel}
                            </Badge>
                          )}
                          {project.lastScanAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(project.lastScanAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">No scans yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
