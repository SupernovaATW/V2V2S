import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 ${onClick ? 'cursor-pointer hover:bg-[var(--bg-hover)]' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
