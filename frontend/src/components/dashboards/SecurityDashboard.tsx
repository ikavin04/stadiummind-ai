import { useState } from 'react';
import {
  Shield, Eye, ShieldAlert,
  Zap, RefreshCw, AlertTriangle, ArrowRight, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../GlassCard';
import { AlertCard } from '../AlertCard';
import { OccupancyBar } from '../OccupancyBar';
import { SeverityBadge } from '../Badge';
import type { Zone, DashboardAlert } from '../../types';

interface SecurityDashboardProps {
  zones: Zone[];
  alerts: DashboardAlert[];
  lastUpdated: Date | null;
  ticking: boolean;
  onSimulateTick: () => void;
}

export function SecurityDashboard({
  zones, alerts, lastUpdated, ticking, onSimulateTick
}: SecurityDashboardProps) {
  const navigate = useNavigate();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [patrols, setPatrols] = useState([
    { id: 'patrol-1', name: 'Patrol Alpha (Gate A)', status: 'On Patrol', color: 'text-accent-green' },
    { id: 'patrol-2', name: 'Patrol Beta (Concourse East)', status: 'Responding to Crowd Surge', color: 'text-accent-amber' },
    { id: 'patrol-3', name: 'Patrol Gamma (Gate B)', status: 'Stationary Guard', color: 'text-text-secondary' },
    { id: 'patrol-4', name: 'Patrol Delta (Lower Level)', status: 'Available', color: 'text-accent-green' },
  ]);

  const handleDismiss = (zoneId: string) => {
    setDismissedAlerts(prev => new Set([...prev, zoneId]));
  };

  const handleSimulateDispatch = (patrolId: string) => {
    setPatrols(prev => prev.map(p => {
      if (p.id === patrolId) {
        return {
          ...p,
          status: p.status === 'Available' || p.status === 'On Patrol' ? 'Dispatched to Gate C' : 'On Patrol',
          color: p.status === 'Available' || p.status === 'On Patrol' ? 'text-accent-red' : 'text-accent-green'
        };
      }
      return p;
    }));
  };

  // Security dashboard focuses strictly on gate and concourse zones
  const securityZones = zones
    .filter(z => z.zone_type === 'gate' || z.zone_type === 'concourse')
    .sort((a, b) => b.occupancy_pct - a.occupancy_pct);

  const activeSecurityAlerts = alerts.filter(a => !dismissedAlerts.has(a.zone_id));

  const alertCount = activeSecurityAlerts.filter(a => a.severity === 'alert').length;
  const watchCount = activeSecurityAlerts.filter(a => a.severity === 'watch').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bg-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="live-dot" aria-hidden />
            <span className="text-xs text-accent-red font-medium uppercase tracking-wider">
              Security Tactical Command
            </span>
          </div>
          <h1 className="text-display text-3xl font-bold text-text-primary tracking-tight">
            Security &amp; Tactical Command
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mt-1">
            <span>Stadium security surveillance and emergency incident management</span>
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
          Surveillance Refresh
        </button>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="border-accent-red/20 bg-accent-red/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted uppercase tracking-wider">Active Alerts</span>
            <ShieldAlert className="w-4 h-4 text-accent-red" aria-hidden />
          </div>
          <p className="stat-value text-2xl text-accent-red">{alertCount + watchCount}</p>
          <p className="text-[10px] text-text-muted mt-1">
            {alertCount} Critical · {watchCount} Watch
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted uppercase tracking-wider">Active Patrols</span>
            <Shield className="w-4 h-4 text-accent-green" aria-hidden />
          </div>
          <p className="stat-value text-2xl text-accent-green">
            {patrols.filter(p => p.status !== 'Stationary Guard').length}
          </p>
          <p className="text-[10px] text-text-muted mt-1">4 units deployed</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted uppercase tracking-wider">Surveillance Camera Status</span>
            <Eye className="w-4 h-4 text-accent-green" aria-hidden />
          </div>
          <p className="stat-value text-2xl">98%</p>
          <p className="text-[10px] text-text-muted mt-1">124 cameras online</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted uppercase tracking-wider">Tactical Channels</span>
            <Zap className="w-4 h-4 text-accent-amber" aria-hidden />
          </div>
          <p className="stat-value text-2xl">4 Active</p>
          <p className="text-[10px] text-text-muted mt-1">Main + Concourse + Gates + VIP</p>
        </GlassCard>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Gates & Concourse Monitoring */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent-red" aria-hidden />
            Gate &amp; Concourse Flow Overview
            <span className="text-xs font-normal text-text-muted normal-case tracking-normal ml-1">
              — sorted by risk level
            </span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {securityZones.map(zone => (
              <GlassCard
                key={zone.id}
                hover
                onClick={() => navigate(`/crowd/${zone.id}`)}
                className="space-y-3 border-accent-red/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary leading-tight">{zone.name}</p>
                    <p className="text-xs text-text-muted capitalize mt-0.5">{zone.zone_type}</p>
                  </div>
                  <SeverityBadge severity={zone.severity} pulse={zone.severity !== 'normal'} />
                </div>
                <OccupancyBar
                  current={zone.current_count}
                  capacity={zone.capacity}
                  severity={zone.severity}
                />
                {zone.latest_prediction?.recommended_action && zone.severity !== 'normal' && (
                  <p className="text-xs text-text-secondary leading-relaxed border-t border-bg-border pt-2">
                    <span className="text-accent-red font-medium">AI Dispatch Recommendation: </span>
                    {zone.latest_prediction.recommended_action}
                  </p>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/crowd/${zone.id}`); }}
                  className="text-xs text-text-muted hover:text-accent-red transition-colors flex items-center gap-1 mt-auto"
                >
                  Inspect Surveillance Logs <ArrowRight className="w-3 h-3" />
                </button>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right Column: Tactical Dispatch & Patrol Logs */}
        <div className="space-y-6">
          
          {/* Tactical Patrol Units */}
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent-green" aria-hidden />
              <h2 className="text-display text-base font-bold text-text-primary">Deployed Patrol Teams</h2>
            </div>
            
            <div className="space-y-2.5">
              {patrols.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-bg-surface rounded-xl border border-bg-border">
                  <div>
                    <p className="text-xs font-bold text-text-primary">{p.name}</p>
                    <p className={`text-[10px] ${p.color} font-medium mt-0.5`}>{p.status}</p>
                  </div>
                  <button
                    onClick={() => handleSimulateDispatch(p.id)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-bg-card border border-bg-border text-text-secondary hover:text-text-primary hover:border-accent-green/45 transition-all"
                  >
                    {p.status.startsWith('Dispatched') ? 'Recall' : 'Dispatch'}
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Active Incidents Alerts Feed */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent-red">
              <AlertTriangle className="w-5 h-5" aria-hidden />
              <h2 className="text-display text-xs font-semibold uppercase tracking-wider">Incident Alerts Queue</h2>
            </div>

            {activeSecurityAlerts.length === 0 ? (
              <GlassCard className="text-center py-6">
                <p className="text-sm text-text-muted">No security incidents flagged.</p>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {activeSecurityAlerts.map(alert => (
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
