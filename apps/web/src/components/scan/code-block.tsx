'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  before: string;
  after: string;
  language?: string;
  notes?: string;
}

export function CodeBlock({ before, after, language = 'html', notes }: CodeBlockProps) {
  const [view, setView] = useState<'before' | 'after'>('after');

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setView('before')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            view === 'before'
              ? 'bg-white text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-700',
          )}
        >
          Before
        </button>
        <button
          onClick={() => setView('after')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            view === 'after'
              ? 'bg-white text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700',
          )}
        >
          After (Fixed)
        </button>
        <span className="ml-auto px-4 py-2 text-xs text-gray-400 self-center">{language}</span>
      </div>
      <pre className={cn(
        'p-4 text-sm overflow-x-auto',
        view === 'before' ? 'bg-red-50' : 'bg-green-50',
      )}>
        <code>{view === 'before' ? before : after}</code>
      </pre>
      {notes && (
        <div className="px-4 py-2 bg-blue-50 border-t border-gray-200 text-sm text-blue-800">
          {notes}
        </div>
      )}
    </div>
  );
}
