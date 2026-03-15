'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ComparisonSliderProps {
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function ComparisonSlider({
  beforeContent,
  afterContent,
  beforeLabel = 'Website',
  afterLabel = 'Issues Found',
  className = '',
}: ComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
      setSliderPos(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) handleMove(e.touches[0].clientX);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      className={`comparison-container relative overflow-hidden rounded-2xl border border-gray-200 shadow-2xl ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After (full width background) */}
      <div className="relative w-full">
        {afterContent}
      </div>

      {/* Before (clipped overlay) */}
      <div
        className="absolute top-0 left-0 bottom-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <div style={{ width: containerRef.current?.offsetWidth || '100%' }}>
          {beforeContent}
        </div>
      </div>

      {/* Handle */}
      <div
        className="absolute top-0 bottom-0 z-20"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-1 h-full bg-white shadow-lg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border-3 border-brand-600 shadow-lg flex items-center justify-center cursor-col-resize" style={{ borderWidth: '3px', borderColor: '#2563eb' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-brand-600">
            <path d="M7 4L3 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 4L17 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
        {afterLabel}
      </div>
    </div>
  );
}
