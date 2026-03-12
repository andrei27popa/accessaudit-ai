'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getComplianceColor } from '@/lib/utils';
import { api } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  domain: string;
  latestScore: number | null;
  latestComplianceLabel: string | null;
  lastScanAt: string | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link href="/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No projects yet.</p>
            <Link href="/projects/new">
              <Button>Create your first project</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:border-brand-300 transition-all cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.domain}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {project.latestScore != null && (
                        <span className="text-lg font-bold text-gray-900">
                          {Math.round(project.latestScore)}/100
                        </span>
                      )}
                      {project.latestComplianceLabel && (
                        <Badge className={getComplianceColor(project.latestComplianceLabel)}>
                          {project.latestComplianceLabel}
                        </Badge>
                      )}
                      {project.lastScanAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(project.lastScanAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
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
