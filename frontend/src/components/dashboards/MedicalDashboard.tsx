import { useState } from 'react';
import {
  HeartPulse, Heart, Stethoscope, CheckCircle,
  PlusCircle, RefreshCw, AlertCircle, ShieldAlert, Clock
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { AlertCard } from '../AlertCard';
import { OccupancyBar } from '../OccupancyBar';
import { SeverityBadge } from '../Badge';
import { MedicalStatusCard } from '../MedicalStatusCard';
import type { Zone, DashboardAlert } from '../../types';

interface MedicalDashboardProps {
  zones: Zone[];
  alerts: DashboardAlert[];
  lastUpdated: Date | null;
  ticking: boolean;
  onSimulateTick: () => void;
}

export function MedicalDashboard({
  zones, alerts, lastUpdated, ticking, onSimulateTick
}: MedicalDashboardProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const handleDismiss = (zoneId: string) => {
    setDismissedAlerts(prev => new Set([...prev, zoneId]));
  };

  const handleDispatch = () => {
    setDispatchStatus('Emergency team dispatched to Concourse East!');
    setTimeout(() => setDispatchStatus(null), 4000);
  };

  // Medical Dashboard filters for facilities and clinics
  const medicalZones = zones
    .filter(z => z.zone_type === 'facility' || z.zone_type === 'concourse')
    .sort((a, b) => b.occupancy_pct - a.occupancy_pct);

  const activeAlerts = alerts.filter(a => !dismissedAlerts.has(a.zone_id));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bg-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="live-dot" aria-hidden />
            <span className="text-xs text-accent-red font-medium uppercase tracking-wider">
              Medical Operations Command
            </span>
          </div>
          <h1 className="text-display text-3xl font-bold text-text-primary tracking-tight">
            Medical Response Hub
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mt-1">
            <span>Stadium medical services, AED networks, and paramedic coordinate systems</span>
            {lastUpdated && (
              <span className="flex items-center gap-1 border-l border-bg-border pl-3">
                <Clock className="w-3.5 h-3.5" aria-hidden />
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onSimulateTick}
          disabled={ticking}
          className="btn-ghost flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${ticking ? 'animate-spin' : ''}`} aria-hidden />
          Refresh Stats
        </button>
      </div>

      {/* Dispatch Simulation Banner */}
      {dispatchStatus && (
        <div className="p-3 bg-accent-red/20 text-accent-red border border-accent-red/40 rounded-xl text-sm font-semibold flex items-center gap-2 animate-slide-in-up">
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          {dispatchStatus}
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Medical Center Status & Facility Zones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medical Center detailed card */}
          <MedicalStatusCard />

          {/* Zones Monitored */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-accent-red" aria-hidden />
              First-Aid &amp; Incident Areas
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {medicalZones.map(zone => (
                <GlassCard key={zone.id} className="space-y-3 border-accent-red/10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-text-primary leading-tight">{zone.name}</p>
                      <p className="text-xs text-text-muted capitalize mt-0.5">{zone.zone_type}</p>
                    </div>
                    <SeverityBadge severity={zone.severity} />
                  </div>
                  <OccupancyBar
                    current={zone.current_count}
                    capacity={zone.capacity}
                    severity={zone.severity}
                  />
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Emergency Actions & Medical Alerts */}
        <div className="space-y-6">
          
          {/* Emergency Response Quick Actions */}
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-accent-red" aria-hidden />
              <h2 className="text-display text-base font-bold text-text-primary">Response Control</h2>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleDispatch}
                className="w-full btn-primary !bg-accent-red hover:opacity-90 !text-text-primary flex items-center justify-center gap-2 py-3"
              >
                <HeartPulse className="w-4 h-4" />
                Dispatch On-Duty Paramedic
              </button>
              
              <button
                onClick={() => alert('AED locations broadcasted to all staff devices')}
                className="w-full btn-ghost hover:border-accent-red/30 flex items-center justify-center gap-2 py-3 text-xs"
              >
                <AlertCircle className="w-4 h-4 text-accent-amber" />
                Broadcast AED Map Coordinates
              </button>
            </div>
          </GlassCard>

          {/* Medical Alerts Queue */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent-red" aria-hidden />
              Triage Incidents Queue
            </h2>

            {activeAlerts.length === 0 ? (
              <GlassCard className="text-center py-8">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-accent-green" aria-hidden />
                </div>
                <p className="text-sm text-text-muted">All clear. No medical emergencies.</p>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {activeAlerts.map(alert => (
                  <AlertCard
                    key={`${alert.zone_id}-${alert.timestamp}`}
                    alert={alert}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
