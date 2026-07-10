import type { Severity } from '../types';
import { cn } from '../lib/utils';
import { occupancyLabel } from '../lib/roles';

interface OccupancyBarProps {
  current: number;
  capacity: number;
  severity: Severity;
  showLabel?: boolean;
  /** When true (Volunteer role) shows plain-language status instead of raw %. */
  volunteerMode?: boolean;
  className?: string;
}

const BAR_BG: Record<Severity, string> = {
  normal: 'bg-accent-green',
  watch:  'bg-accent-amber',
  alert:  'bg-accent-red',
};

export function OccupancyBar({
  current, capacity, severity, showLabel = true, volunteerMode = false, className,
}: OccupancyBarProps) {
  const pct = Math.min(100, Math.round((current / capacity) * 100));

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Occupancy</span>
          {volunteerMode ? (
            <span className={cn('font-medium text-xs', {
              'text-accent-green': severity === 'normal',
              'text-accent-amber': severity === 'watch',
              'text-accent-red':   severity === 'alert',
            })}>
              {occupancyLabel(severity)}
            </span>
          ) : (
            <span className={cn('font-semibold font-mono', {
              'text-accent-green': severity === 'normal',
              'text-accent-amber': severity === 'watch',
              'text-accent-red':   severity === 'alert',
            })}>
              {pct}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-1.5 bg-bg-border rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', BAR_BG[severity])}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Zone occupancy: ${volunteerMode ? occupancyLabel(severity) : `${pct}%`}`}
        />
      </div>
      {showLabel && !volunteerMode && (
        <div className="flex justify-between text-xs text-text-muted">
          <span>{current.toLocaleString()}</span>
          <span>cap {capacity.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
