import { cn } from '../lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'rounded-full border-2 border-bg-border border-t-accent-green animate-spin',
        SIZES[size],
        className
      )}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 bg-bg-base flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">🏟️</div>
        <Spinner size="lg" />
        <p className="text-text-secondary text-sm animate-pulse">StadiumMind AI initializing...</p>
      </div>
    </div>
  );
}
