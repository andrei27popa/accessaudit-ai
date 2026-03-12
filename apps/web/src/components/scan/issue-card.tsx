'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
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
  return (
    <Link
      href={`/scan/${scanId}/issues/${issue.id}`}
      className="block border border-gray-200 rounded-lg p-4 hover:border-brand-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={getSeverityColor(issue.severity)}>
              {issue.severity}
            </Badge>
            {issue.aiFix && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                AI Fix Available
              </Badge>
            )}
          </div>
          <h3 className="font-medium text-gray-900 text-sm">{issue.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{issue.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{issue.occurrences} occurrence{issue.occurrences !== 1 ? 's' : ''}</span>
            <span>{issue.affectedPagesCount} page{issue.affectedPagesCount !== 1 ? 's' : ''}</span>
            {issue.wcagRefs && (issue.wcagRefs as string[]).length > 0 && (
              <span>WCAG {(issue.wcagRefs as string[]).join(', ')}</span>
            )}
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
