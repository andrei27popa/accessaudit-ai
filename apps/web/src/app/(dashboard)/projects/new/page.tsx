'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function NewProjectPage() {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const project = await api.createProject({
        name,
        domain: domain.startsWith('http') ? domain : `https://${domain}`,
        sitemapUrl: sitemapUrl || undefined,
      });
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Project Name"
              placeholder="My Website"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="domain"
              label="Domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
            <Input
              id="sitemap"
              label="Sitemap URL (optional)"
              placeholder="https://example.com/sitemap.xml"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
            />
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
