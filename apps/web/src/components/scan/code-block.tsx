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
    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center border-b border-gray-200 bg-gray-50/80">
        <button
          onClick={() => setView('before')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
            view === 'before'
              ? 'bg-white text-red-600 border-b-2 border-red-500 -mb-px'
              : 'text-gray-400 hover:text-gray-600',
          )}
        >
          Before
        </button>
        <button
          onClick={() => setView('after')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
            view === 'after'
              ? 'bg-white text-green-600 border-b-2 border-green-500 -mb-px'
              : 'text-gray-400 hover:text-gray-600',
          )}
        >
          After (Fixed)
        </button>
        <div className="ml-auto flex items-center gap-2 px-3">
          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{language}</span>
          <button
            onClick={handleCopy}
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all',
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            )}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className={cn(
        'p-0 text-sm overflow-x-auto max-h-60',
        view === 'before' ? 'bg-red-50/50' : 'bg-green-50/50',
      )}>
        <code className="block">
          {lines.map((line, i) => (
            <div key={i} className="flex hover:bg-black/5 transition-colors">
              <span className="select-none text-[10px] text-gray-400 w-8 flex-shrink-0 text-right pr-3 py-0.5 border-r border-gray-200/80 bg-gray-50/50 tabular-nums">{i + 1}</span>
              <span className="pl-3 py-0.5 whitespace-pre text-xs">{line}</span>
            </div>
          ))}
        </code>
      </pre>
      {notes && (
        <div className="px-4 py-2.5 bg-blue-50 border-t border-gray-200 text-xs text-blue-800 leading-relaxed">
          {notes}
        </div>
      )}
    </div>
  );
}
