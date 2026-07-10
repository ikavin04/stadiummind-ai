import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type Elevation = 'base' | 'raised' | 'inset';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  id?: string;
  elevation?: Elevation;
}

const ELEVATION_CLASSES: Record<Elevation, string> = {
  base:   'shadow-glass',
  raised: 'shadow-glass-lg border-white/[0.08]',
  inset:  'shadow-none bg-bg-surface/70 border-bg-border/60',
};

export function GlassCard({
  children, className, hover, onClick, id, elevation = 'base',
}: GlassCardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={cn(
        'glass-card p-5',
        ELEVATION_CLASSES[elevation],
        hover && [
          'transition-all duration-200 cursor-pointer',
          'hover:shadow-glass-lg hover:border-accent-green/20 hover:-translate-y-0.5',
        ],
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
