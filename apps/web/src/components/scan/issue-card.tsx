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

const severityIcon: Record<string, string> = {
  CRITICAL: '🔴',
  SERIOUS: '🟠',
  MODERATE: '🟡',
  MINOR: '🔵',
};

export function IssueCard({ issue, scanId }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      expanded
        ? 'border-brand-300 shadow-md shadow-brand-100/50 bg-white'
        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
    }`}>
      {/* Clickable header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start justify-between gap-3 group"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge className={`${getSeverityColor(issue.severity)} text-[10px] font-bold uppercase tracking-wider`}>
              {issue.severity}
            </Badge>
            {issue.aiFix && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] font-bold uppercase tracking-wider">
                <svg className="w-3 h-3 mr-0.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Fix
              </Badge>
            )}
            {issue.wcagRefs && issue.wcagRefs.map((ref) => (
              <Badge key={ref} className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]">
                {ref}
              </Badge>
            ))}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{issue.title}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{issue.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              {issue.occurrences} occurrence{issue.occurrences !== 1 ? 's' : ''}
            </span>
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {issue.affectedPagesCount} page{issue.affectedPagesCount !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] font-mono text-gray-400">{issue.ruleId}</span>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          expanded ? 'bg-brand-100 rotate-90' : 'bg-gray-100 group-hover:bg-gray-200'
        }`}>
          <svg
            className={`w-4 h-4 transition-colors ${expanded ? 'text-brand-600' : 'text-gray-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/80 to-white">
          {issue.aiFix ? (
            <div className="p-5 space-y-4">
              {/* AI Summary */}
              <div className="flex items-start gap-3 bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">AI Remediation</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{issue.aiFix.summary}</p>
                </div>
              </div>

              {/* Who is affected & Why it matters */}
              {(issue.aiFix.whoIsAffected || issue.aiFix.whyItMatters) && (
                <div className="grid md:grid-cols-2 gap-3">
                  {issue.aiFix.whoIsAffected && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Who is affected</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{issue.aiFix.whoIsAffected}</p>
                    </div>
                  )}
                  {issue.aiFix.whyItMatters && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Why it matters</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{issue.aiFix.whyItMatters}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Fix Steps */}
              {issue.aiFix.fixSteps && issue.aiFix.fixSteps.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">How to fix</p>
                  <ol className="space-y-1.5">
                    {issue.aiFix.fixSteps.map((step: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
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
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">How to verify</p>
                  <ul className="space-y-1">
                    {issue.aiFix.testHowToVerify.map((step: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* View full details link */}
              <Link
                href={`/scan/${scanId}/issues/${issue.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold group"
              >
                View full details
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">{issue.description}</p>
              <Link
                href={`/scan/${scanId}/issues/${issue.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold"
              >
                View details
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
