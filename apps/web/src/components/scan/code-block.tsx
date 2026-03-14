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
  const [copied, setCopied] = useState(false);

  const code = view === 'before' ? before : after;
  const lines = code.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

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
        <div className="ml-auto flex items-center gap-2 px-3">
          <span className="text-xs text-gray-400">{language}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className={cn(
        'p-0 text-sm overflow-x-auto',
        view === 'before' ? 'bg-red-50' : 'bg-green-50',
      )}>
        <code className="block">
          {lines.map((line, i) => (
            <div key={i} className="flex hover:bg-black/5">
              <span className="select-none text-xs text-gray-400 w-8 flex-shrink-0 text-right pr-3 py-0.5 border-r border-gray-200 bg-gray-50/50">{i + 1}</span>
              <span className="pl-3 py-0.5 whitespace-pre">{line}</span>
            </div>
          ))}
        </code>
      </pre>
      {notes && (
        <div className="px-4 py-2 bg-blue-50 border-t border-gray-200 text-sm text-blue-800">
          {notes}
        </div>
      )}
    </div>
  );
}
