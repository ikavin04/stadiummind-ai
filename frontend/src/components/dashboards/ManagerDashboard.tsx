import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Users, AlertTriangle, Zap, RefreshCw,
  ArrowRight, Clock, CheckCircle2
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { AlertCard } from '../AlertCard';
import { OccupancyBar } from '../OccupancyBar';
import { SeverityBadge } from '../Badge';
import { RoadmapCard, RoadmapModal, ROADMAP_MODULES } from '../RoadmapCard';
import { WeatherIcon } from '../WeatherIcon';
import { Spinner } from '../Spinner';
import type { Zone, DashboardAlert, RoadmapModule, MatchInfo, WeatherInfo } from '../../types';

interface ManagerDashboardProps {
  zones: Zone[];
  alerts: DashboardAlert[];
  matchInfo?: MatchInfo | null;
  weather?: WeatherInfo | null;
  totalFans: number;
  lastUpdated: Date | null;
  ticking: boolean;
  onSimulateTick: () => void;
  isLoading: boolean;
  animatedTotalFans: number;
  animatedAlertCount: number;
}

export function ManagerDashboard({
  zones, alerts, matchInfo, weather, totalFans: _totalFans,
  lastUpdated, ticking, onSimulateTick, isLoading,
  animatedTotalFans, animatedAlertCount
}: ManagerDashboardProps) {
  const navigate = useNavigate();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [roadmapModule, setRoadmapModule] = useState<RoadmapModule | null>(null);

  const displayZones = zones;
  const displayAlerts = alerts.filter(a => !dismissedAlerts.has(a.zone_id));

  const handleDismiss = (zoneId: string) => {
    setDismissedAlerts(prev => new Set([...prev, zoneId]));
  };

  const alertCount = displayAlerts.filter(a => a.severity === 'alert').length;
  const watchCount = displayAlerts.filter(a => a.severity === 'watch').length;

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Roadmap modal — UI only, no backend */}
      <RoadmapModal module={roadmapModule} onClose={() => setRoadmapModule(null)} />

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bg-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="live-dot" aria-hidden />
            <span className="text-xs text-accent-green font-medium uppercase tracking-wider">
              Stadium Operations Centre
            </span>
          </div>
          <h1 className="text-display text-3xl font-bold text-text-primary tracking-tight">
            Stadium Operations Master Control
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mt-1">
            <span>Global tournament supervisor portal — FIFA World Cup 2026</span>
            {lastUpdated && (
              <span className="flex items-center gap-1 border-l border-bg-border pl-3">
                <Clock className="w-3.5 h-3.5" aria-hidden />
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        {/* Simulate tick button for demo */}
        <button
          onClick={onSimulateTick}
          disabled={ticking}
          aria-label="Manually advance simulation"
          className="btn-ghost flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${ticking ? 'animate-spin' : ''}`} aria-hidden />
          Simulate Tick
        </button>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard id="stat-fans">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted uppercase tracking-wider">Total Fans Inside</span>
            <Activity className="w-4 h-4 text-accent-green" aria-hidden />
          </div>
          <p className="stat-value text-2xl">{animatedTotalFans.toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-1">{displayZones.length} zones monitored</p>
        </GlassCard>

        <GlassCard id="stat-alerts">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted uppercase tracking-wider">Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-accent-amber" aria-hidden />
          </div>
          <p className="stat-value text-2xl">{animatedAlertCount}</p>
          <p className="text-xs text-text-muted mt-1">
            {alertCount} critical · {watchCount} watch
          </p>
        </GlassCard>

        {/* Match Info */}
        {matchInfo && (
          <GlassCard id="stat-match" className="lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted uppercase tracking-wider">Match</span>
              <span className="text-xs font-semibold text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full">
                {matchInfo.status}
              </span>
            </div>
            <p className="text-sm font-bold text-text-primary leading-tight">{matchInfo.match}</p>
            <p className="text-xs text-text-muted mt-1">KO {matchInfo.kickoff}</p>
          </GlassCard>
        )}

        {/* Weather */}
        {weather && (
          <GlassCard id="stat-weather">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted uppercase tracking-wider">Weather</span>
              <WeatherIcon
                condition={weather.condition}
                className="w-5 h-5 text-text-secondary"
              />
            </div>
            <p className="stat-value text-2xl">{weather.temperature_c}°C</p>
            <p className="text-xs text-text-muted mt-1">{weather.condition} · {weather.humidity_pct}% humidity</p>
          </GlassCard>
        )}
      </div>

      {/* ── Main content: Zones + Alerts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Zone Grid */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4" aria-hidden />
            All Monitored Zones
          </h2>
          {isLoading && displayZones.length === 0 ? (
            <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayZones.map((zone) => (
                <GlassCard
                  key={zone.id}
                  hover
                  onClick={() => navigate(`/crowd/${zone.id}`)}
                  className="space-y-3"
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
                    <p className="text-xs text-text-muted leading-relaxed border-t border-bg-border pt-2">
                      <span className="text-accent-amber font-medium">AI Recommendation: </span>
                      {zone.latest_prediction.recommended_action}
                    </p>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/crowd/${zone.id}`); }}
                    className="text-xs text-text-muted hover:text-accent-green transition-colors flex items-center gap-1 mt-auto"
                  >
                    View Crowd History <ArrowRight className="w-3 h-3" />
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Alerts Feed */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 animate-pulse" aria-hidden />
            Active Operations Alerts
          </h2>
          {displayAlerts.length === 0 ? (
            <GlassCard className="text-center py-8">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-accent-green" aria-hidden />
              </div>
              <p className="text-sm text-text-muted font-medium">All monitored zones operating within limits</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {displayAlerts.map((alert) => (
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

      {/* ── Roadmap Section (UI-only — zero backend calls) ── */}
      <div className="space-y-4 pt-4 border-t border-bg-border">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Stadium Operations Roadmap</h2>
          <p className="text-sm text-text-muted mt-1">Planned artificial intelligence expansion modules for MetLife Stadium</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ROADMAP_MODULES.map((mod) => (
            <RoadmapCard key={mod.id} module={mod} onOpen={setRoadmapModule} />
          ))}
        </div>
      </div>
    </div>
  );
}
