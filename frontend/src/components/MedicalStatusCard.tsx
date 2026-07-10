/**
 * Medical Center Status card — shown only to 'medical' and 'manager' roles.
 * Uses static mock data (same pattern as RoadmapCard — zero backend calls).
 * In production this would pull from a /api/medical/status endpoint.
 */
import { HeartPulse, Users, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface MedicalStatus {
  status: 'Operational' | 'Standby' | 'Busy';
  staffOnDuty: number;
  activeIncidents: number;
  aedLocations: number;
  lastUpdated: string;
}

// Static mock — replace with API call when backend endpoint is ready
const MOCK_STATUS: MedicalStatus = {
  status: 'Operational',
  staffOnDuty: 8,
  activeIncidents: 0,
  aedLocations: 12,
  lastUpdated: 'Live',
};

function StatusPill({ status }: { status: MedicalStatus['status'] }) {
  if (status === 'Operational') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/25">
        <CheckCircle2 className="w-3 h-3" aria-hidden />
        Operational
      </span>
    );
  }
  if (status === 'Busy') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-amber/10 text-accent-amber border border-accent-amber/25">
        <AlertTriangle className="w-3 h-3" aria-hidden />
        Busy
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-bg-card text-text-muted border border-bg-border">
      <Activity className="w-3 h-3" aria-hidden />
      Standby
    </span>
  );
}

export function MedicalStatusCard() {
  const s = MOCK_STATUS;

  return (
    <GlassCard id="stat-medical" className="border-accent-red/20 bg-accent-red/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-red/15 flex items-center justify-center">
            <HeartPulse className="w-3.5 h-3.5 text-accent-red" aria-hidden />
          </div>
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Medical Center
          </span>
        </div>
        <StatusPill status={s.status} />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-2">
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary tabular-nums">{s.staffOnDuty}</p>
          <p className="text-xs text-text-muted mt-0.5 flex items-center justify-center gap-1">
            <Users className="w-3 h-3" aria-hidden />
            Staff on duty
          </p>
        </div>
        <div className="text-center border-x border-bg-border">
          <p className="text-2xl font-bold text-text-primary tabular-nums">{s.activeIncidents}</p>
          <p className="text-xs text-text-muted mt-0.5">Active incidents</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary tabular-nums">{s.aedLocations}</p>
          <p className="text-xs text-text-muted mt-0.5">AED locations</p>
        </div>
      </div>
    </GlassCard>
  );
}
