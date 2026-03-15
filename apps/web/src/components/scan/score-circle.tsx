'use client';

import { useEffect, useState } from 'react';
import { cn, getScoreColor } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'lg';
}

export function ScoreCircle({ score, size = 'lg' }: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = size === 'lg' ? 58 : 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const svgSize = size === 'lg' ? 148 : 90;
  const strokeWidth = size === 'lg' ? 10 : 6;

  // Animate score count-up
  useEffect(() => {
    if (score === 0) return;
    const duration = 1400;
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

  const strokeColor = score >= 90 ? '#16a34a' : score >= 70 ? '#d97706' : '#dc2626';
  const glowColor = score >= 90 ? 'rgba(22,163,74,0.15)' : score >= 70 ? 'rgba(217,119,6,0.15)' : 'rgba(220,38,38,0.15)';
  const bgGradient = score >= 90 ? 'from-green-50 to-emerald-50' : score >= 70 ? 'from-amber-50 to-yellow-50' : 'from-red-50 to-orange-50';
  const label = score >= 90 ? 'Compliant' : score >= 70 ? 'At Risk' : 'Non-Compliant';
  const labelColor = score >= 90 ? 'text-green-600' : score >= 70 ? 'text-amber-600' : 'text-red-600';
  const labelBg = score >= 90 ? 'bg-green-100' : score >= 70 ? 'bg-amber-100' : 'bg-red-100';

  return (
    <div className="relative inline-flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center"
        style={size === 'lg' ? { filter: `drop-shadow(0 0 20px ${glowColor})` } : undefined}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
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
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-extrabold tabular-nums tracking-tight', getScoreColor(score), size === 'lg' ? 'text-4xl' : 'text-xl')}>
            {Math.round(displayScore)}
          </span>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">/100</span>
        </div>
      </div>
      {size === 'lg' && (
        <span className={cn('text-[11px] font-bold mt-3 uppercase tracking-widest px-3 py-1 rounded-md', labelColor, labelBg)}>
          {label}
        </span>
      )}
    </div>
  );
}
