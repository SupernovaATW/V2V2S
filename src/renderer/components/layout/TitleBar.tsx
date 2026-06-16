import React from 'react';

interface TitleBarProps {
  theme: 'light' | 'dark';
}

export function TitleBar({ theme }: TitleBarProps) {
  return (
    <div className="h-10 w-full bg-[var(--bg-sidebar)] border-b border-[var(--border)] flex items-center justify-between px-4 titlebar-drag">
      <span className="text-xs font-medium text-[var(--text-secondary)]">V2V</span>
    </div>
  );
}
