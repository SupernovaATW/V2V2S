import React from 'react';

type Status = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

interface StatusBadgeProps {
  status: Status;
}

const colors: Record<Status, string> = {
  queued: 'bg-[var(--bg-hover)] text-[var(--text-secondary)]',
  running: 'bg-[rgba(204,120,92,0.15)] text-[var(--accent)]',
  completed: 'bg-[rgba(93,184,114,0.15)] text-[var(--success)]',
  failed: 'bg-[rgba(198,69,69,0.15)] text-[var(--error)]',
  cancelled: 'bg-[var(--bg-hover)] text-[var(--text-secondary)] line-through',
};

const dots: Record<Status, string> = {
  queued: 'bg-[var(--text-secondary)]',
  running: 'bg-[var(--accent)] animate-pulse',
  completed: 'bg-[var(--success)]',
  failed: 'bg-[var(--error)]',
  cancelled: 'bg-[var(--text-secondary)]',
};

const labels: Record<Status, string> = {
  queued: 'Queue',
  running: 'Active',
  completed: 'Done',
  failed: 'Failed',
  cancelled: 'Cancel',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {labels[status]}
    </span>
  );
}
