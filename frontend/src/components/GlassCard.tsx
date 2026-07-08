import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  id?: string;
}

export function GlassCard({ children, className, hover, onClick, id }: GlassCardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={cn(
        'glass-card p-5',
        hover && 'transition-all duration-200 cursor-pointer hover:border-accent-green/30 hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
