import { useEffect, useState } from 'react';
import { AlertTriangle, Eye, CheckCircle, X } from 'lucide-react';
import type { DashboardAlert } from '../types';
import { cn } from '../lib/utils';

const ICONS = {
  alert:  <AlertTriangle className="w-4 h-4 text-accent-red" aria-hidden />,
  watch:  <Eye className="w-4 h-4 text-accent-amber" aria-hidden />,
  normal: <CheckCircle className="w-4 h-4 text-accent-green" aria-hidden />,
};

interface AlertCardProps {
  alert: DashboardAlert;
  onDismiss?: (zoneId: string) => void;
}

export function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const [visible, setVisible] = useState(false);

  // Slide in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss?.(alert.zone_id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'glass-card !p-4 flex items-start gap-3 transition-all duration-300',
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6',
        {
          'border-accent-red/40':   alert.severity === 'alert',
          'border-accent-amber/40': alert.severity === 'watch',
        }
      )}
    >
      <div className="mt-0.5 shrink-0">{ICONS[alert.severity]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">{alert.zone_name}</p>
        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{alert.message}</p>
        <p className="text-xs text-text-muted mt-1">
          {new Date(alert.timestamp).toLocaleTimeString()}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={dismiss}
          aria-label="Dismiss alert"
          className="shrink-0 p-1 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
