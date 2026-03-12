'use client';

import { cn, getScoreColor } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'lg';
}

export function ScoreCircle({ score, size = 'lg' }: ScoreCircleProps) {
  const radius = size === 'lg' ? 54 : 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = size === 'lg' ? 140 : 90;
  const strokeWidth = size === 'lg' ? 8 : 6;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke={score >= 90 ? '#16a34a' : score >= 70 ? '#ca8a04' : '#dc2626'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', getScoreColor(score), size === 'lg' ? 'text-3xl' : 'text-xl')}>
          {Math.round(score)}
        </span>
        <span className="text-xs text-gray-500">/100</span>
      </div>
    </div>
  );
}
