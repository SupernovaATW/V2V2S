import React from 'react';

interface ProgressBarProps {
  percent: number;
  className?: string;
}

export function ProgressBar({ percent, className = '' }: ProgressBarProps) {
  return (
    <div className={`h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          backgroundColor: percent >= 100 ? 'var(--success)' : 'var(--accent)',
        }}
      />
    </div>
  );
}
