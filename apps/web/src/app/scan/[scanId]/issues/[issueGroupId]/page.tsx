'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/scan/code-block';
import { getSeverityColor } from '@/lib/utils';
import { api } from '@/lib/api';

export default function IssueDetailPage() {
  const params = useParams();
  const scanId = params.scanId as string;
  const issueGroupId = params.issueGroupId as string;

  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIssueDetail(issueGroupId)
      .then(setIssue)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [issueGroupId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Issue not found</p>
      </div>
    );
  }

  const aiFix = issue.aiFix;
  const wcagRefs = Array.isArray(issue.wcagRefs) ? issue.wcagRefs : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/scan/${scanId}`} className="text-gray-500 hover:text-gray-700">
            &larr; Back to results
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Issue Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
            <Badge className="bg-gray-100 text-gray-600 border-gray-200">{issue.ruleId}</Badge>
            {wcagRefs.map((ref: string) => (
              <Badge key={ref} className="bg-blue-50 text-blue-700 border-blue-200">
                WCAG {ref}
              </Badge>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
          <p className="text-gray-600 mt-2">{issue.description}</p>
          <div className="flex gap-4 mt-3 text-sm text-gray-500">
            <span>{issue.occurrences} occurrence{issue.occurrences !== 1 ? 's' : ''}</span>
            <span>{issue.affectedPagesCount} page{issue.affectedPagesCount !== 1 ? 's' : ''} affected</span>
            <a href={issue.helpUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
              Learn more &rarr;
            </a>
          </div>
        </div>

        {/* AI Remediation */}
        {aiFix && (
          <Card className="mb-6 border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <span>🤖</span> AI Remediation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-gray-800">{aiFix.summary}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Who is affected</h4>
                  <p className="text-sm text-gray-600">{aiFix.whoIsAffected}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Why it matters</h4>
                  <p className="text-sm text-gray-600">{aiFix.whyItMatters}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Fix Steps</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {aiFix.fixSteps?.map((step: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700">{step}</li>
                  ))}
                </ol>
              </div>

              {aiFix.codeFixes?.map((fix: any, i: number) => (
                <CodeBlock
                  key={i}
                  before={fix.before}
                  after={fix.after}
                  language={fix.language}
                  notes={fix.notes}
                />
              ))}

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">How to verify</h4>
                <ul className="list-disc list-inside space-y-1">
                  {aiFix.testHowToVerify?.map((step: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700">{step}</li>
                  ))}
                </ul>
              </div>

              {/* WCAG Techniques & Legal Context */}
              <div className="grid md:grid-cols-2 gap-4">
                {aiFix.wcagTechniques && aiFix.wcagTechniques.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">WCAG Techniques</h4>
                    <div className="flex flex-wrap gap-1">
                      {aiFix.wcagTechniques.map((tech: string) => (
                        <a
                          key={tech}
                          href={`https://www.w3.org/WAI/WCAG22/Techniques/${tech.match(/^[A-Z]+/)?.[0] || 'general'}/${tech}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100"
                        >
                          {tech}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {aiFix.legalContext && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Legal & Compliance</h4>
                    <p className="text-sm text-gray-600">{aiFix.legalContext}</p>
                  </div>
                )}
              </div>

              {/* Framework-specific fixes */}
              {aiFix.frameworkFixes && Object.keys(aiFix.frameworkFixes).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Framework-Specific Notes</h4>
                  <div className="space-y-2">
                    {Object.entries(aiFix.frameworkFixes).map(([framework, note]: [string, any]) => (
                      note && (
                        <div key={framework} className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="text-xs font-semibold text-gray-500 uppercase">{framework}</span>
                          <p className="text-sm text-gray-700 mt-1">{note}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Risk level:</span>
                <Badge className={
                  aiFix.riskLevel === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
                  aiFix.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }>
                  {aiFix.riskLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Affected Instances */}
        <Card>
          <CardHeader>
            <CardTitle>Affected Elements ({issue.instances?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {issue.instances?.map((instance: any) => (
                <div key={instance.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {instance.pageUrl || instance.pageTitle}
                    </span>
                  </div>
                  {instance.selector && (
                    <p className="text-xs font-mono text-gray-500 mb-2">
                      Selector: {instance.selector}
                    </p>
                  )}
                  {instance.snippet && (
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border border-gray-200">
                      <code>{instance.snippet}</code>
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
