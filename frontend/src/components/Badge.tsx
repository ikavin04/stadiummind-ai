import { CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { Severity } from '../types';
import { cn } from '../lib/utils';

const SEVERITY_STYLES: Record<Severity, string> = {
  normal: 'severity-normal',
  watch:  'severity-watch',
  alert:  'severity-alert',
};

const SEVERITY_LABELS: Record<Severity, string> = {
  normal: 'Normal',
  watch:  'Watch',
  alert:  'Alert',
};

/** Icon component for each severity — lucide, consistent w-3 h-3 sizing. */
const SEVERITY_ICONS: Record<Severity, React.ReactNode> = {
  normal: <CheckCircle2 className="w-3 h-3" aria-hidden />,
  watch:  <AlertTriangle className="w-3 h-3" aria-hidden />,
  alert:  <ShieldAlert   className="w-3 h-3" aria-hidden />,
};

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
  pulse?: boolean;
}

export function SeverityBadge({ severity, className, pulse }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border',
        SEVERITY_STYLES[severity],
        className
      )}
    >
      {pulse && <span className="live-dot w-1.5 h-1.5" />}
      {SEVERITY_ICONS[severity]}
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

interface PlannedBadgeProps {
  className?: string;
}

export function PlannedBadge({ className }: PlannedBadgeProps) {
  return (
    <span className={cn('planned-badge', className)}>
      Planned
    </span>
  );
}
