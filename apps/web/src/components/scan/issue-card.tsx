'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/scan/code-block';
import { getSeverityColor } from '@/lib/utils';

interface IssueCardProps {
  issue: {
    id: string;
    ruleId: string;
    severity: string;
    title: string;
    description: string;
    occurrences: number;
    affectedPagesCount: number;
    wcagRefs: string[];
    aiFix: any | null;
  };
  scanId: string;
}

export function IssueCard({ issue, scanId }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:border-brand-300 transition-all overflow-hidden">
      {/* Clickable header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge className={getSeverityColor(issue.severity)}>
              {issue.severity}
            </Badge>
            {issue.aiFix && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                AI Fix Available
              </Badge>
            )}
            {issue.wcagRefs && issue.wcagRefs.length > 0 && (
              issue.wcagRefs.map((ref) => (
                <Badge key={ref} className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                  {ref}
                </Badge>
              ))
            )}
          </div>
          <h3 className="font-medium text-gray-900 text-sm">{issue.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{issue.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{issue.occurrences} occurrence{issue.occurrences !== 1 ? 's' : ''}</span>
            <span>{issue.affectedPagesCount} page{issue.affectedPagesCount !== 1 ? 's' : ''}</span>
            <span className="text-[11px] font-mono text-gray-400">{issue.ruleId}</span>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          {issue.aiFix ? (
            <div className="p-4 space-y-4">
              {/* AI Summary */}
              <div className="flex items-start gap-2">
                <span className="text-lg">&#x1f916;</span>
                <div>
                  <p className="text-sm font-semibold text-purple-900">AI Remediation</p>
                  <p className="text-sm text-gray-700 mt-1">{issue.aiFix.summary}</p>
                </div>
              </div>

              {/* Who is affected & Why it matters */}
              {(issue.aiFix.whoIsAffected || issue.aiFix.whyItMatters) && (
                <div className="grid md:grid-cols-2 gap-3">
                  {issue.aiFix.whoIsAffected && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Who is affected</p>
                      <p className="text-sm text-gray-700">{issue.aiFix.whoIsAffected}</p>
                    </div>
                  )}
                  {issue.aiFix.whyItMatters && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Why it matters</p>
                      <p className="text-sm text-gray-700">{issue.aiFix.whyItMatters}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Fix Steps */}
              {issue.aiFix.fixSteps && issue.aiFix.fixSteps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">How to fix</p>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    {issue.aiFix.fixSteps.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Code Fix Preview */}
              {issue.aiFix.codeFixes?.length > 0 && (
                <CodeBlock
                  before={issue.aiFix.codeFixes[0].before}
                  after={issue.aiFix.codeFixes[0].after}
                  language={issue.aiFix.codeFixes[0].language}
                  notes={issue.aiFix.codeFixes[0].notes}
                />
              )}

              {/* Verify */}
              {issue.aiFix.testHowToVerify && issue.aiFix.testHowToVerify.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">How to verify</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {issue.aiFix.testHowToVerify.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* View full details link */}
              <Link
                href={`/scan/${scanId}/issues/${issue.id}`}
                className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline font-medium"
              >
                View full details &rarr;
              </Link>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-3">{issue.description}</p>
              <Link
                href={`/scan/${scanId}/issues/${issue.id}`}
                className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline font-medium"
              >
                View details &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
