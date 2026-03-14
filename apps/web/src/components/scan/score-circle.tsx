'use client';

import { useEffect, useState } from 'react';
import { cn, getScoreColor } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'lg';
}

export function ScoreCircle({ score, size = 'lg' }: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = size === 'lg' ? 54 : 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const svgSize = size === 'lg' ? 140 : 90;
  const strokeWidth = size === 'lg' ? 8 : 6;

  // Animate score count-up
  useEffect(() => {
    if (score === 0) return;
    const duration = 1200;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [score]);

  const strokeColor = score >= 90 ? '#16a34a' : score >= 70 ? '#ca8a04' : '#dc2626';
  const label = score >= 90 ? 'Compliant' : score >= 70 ? 'At Risk' : 'Non-Compliant';
  const labelColor = score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="relative inline-flex flex-col items-center">
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
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold tabular-nums', getScoreColor(score), size === 'lg' ? 'text-3xl' : 'text-xl')}>
            {Math.round(displayScore)}
          </span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>
      {size === 'lg' && (
        <span className={cn('text-xs font-semibold mt-2 uppercase tracking-wide', labelColor)}>
          {label}
        </span>
      )}
    </div>
  );
}
