import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, Users, AlertTriangle, CloudSun, Zap, RefreshCw,
  ArrowRight, Clock
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { AlertCard } from '../components/AlertCard';
import { OccupancyBar } from '../components/OccupancyBar';
import { SeverityBadge } from '../components/Badge';
import { RoadmapCard, RoadmapModal, ROADMAP_MODULES } from '../components/RoadmapCard';
import { Spinner } from '../components/Spinner';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import { useAppStore } from '../store/useAppStore';
import { manualSimulateTick, getDashboardSummary } from '../lib/api';
import { t } from '../lib/i18n';
import type { RoadmapModule, Zone, DashboardAlert } from '../types';

export function Dashboard() {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { status, zones, alerts, summary, lastUpdated } = useDashboardSocket();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [roadmapModule, setRoadmapModule] = useState<RoadmapModule | null>(null);
  const [ticking, setTicking] = useState(false);

  // Fallback REST fetch for initial load when WS is still connecting
  const { data: restSummary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
    refetchInterval: 30_000,
    enabled: status !== 'connected',
  });

  const displayZones: Zone[] = zones.length > 0 ? zones : (restSummary?.zones ?? []);
  const displayAlerts: DashboardAlert[] = (alerts.length > 0 ? alerts : (restSummary?.active_alerts ?? []))
    .filter((a: DashboardAlert) => !dismissedAlerts.has(a.zone_id));
  const matchInfo = summary?.match_info ?? restSummary?.match_info;
  const weather = summary?.weather ?? restSummary?.weather;
  const totalFans = summary?.total_fans_inside ?? restSummary?.total_fans_inside ?? 0;

  const handleDismiss = (zoneId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, zoneId]));
  };

  const handleSimulateTick = async () => {
    setTicking(true);
    try {
      await manualSimulateTick();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setTicking(false), 1500);
    }
  };

  const alertCount = displayAlerts.filter(a => a.severity === 'alert').length;
  const watchCount = displayAlerts.filter(a => a.severity === 'watch').length;

  return (
    <Layout wsStatus={status}>
      {/* Roadmap modal — UI only, no backend */}
      <RoadmapModal module={roadmapModule} onClose={() => setRoadmapModule(null)} />

      <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
        {/* ── Page Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="live-dot" aria-hidden />
              <span className="text-xs text-accent-green font-medium uppercase tracking-wider">
                {status === 'connected' ? t('liveUpdates', language) : status === 'connecting' ? t('connecting', language) : t('disconnected', language)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Operations {t('dashboard', language)}
            </h1>
            {lastUpdated && (
              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden />
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          {/* Simulate tick button for demo */}
          <button
            id="btn-simulate-tick"
            onClick={handleSimulateTick}
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
              <span className="text-xs text-text-muted uppercase tracking-wider">{t('totalFans', language)}</span>
              <Activity className="w-4 h-4 text-accent-green" aria-hidden />
            </div>
            <p className="stat-value text-2xl">{totalFans.toLocaleString()}</p>
            <p className="text-xs text-text-muted mt-1">{displayZones.length} zones monitored</p>
          </GlassCard>

          <GlassCard id="stat-alerts">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted uppercase tracking-wider">{t('activeAlerts', language)}</span>
              <AlertTriangle className="w-4 h-4 text-accent-amber" aria-hidden />
            </div>
            <p className="stat-value text-2xl">{alertCount + watchCount}</p>
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
                <span className="text-xl" role="img" aria-label={weather.condition}>{weather.icon}</span>
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
              Zone Occupancy
            </h2>
            {isLoading && displayZones.length === 0 ? (
              <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayZones.map((zone) => (
                  <GlassCard
                    key={zone.id}
                    id={`zone-card-${zone.id}`}
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
                        <span className="text-accent-amber font-medium">AI: </span>
                        {zone.latest_prediction.recommended_action}
                      </p>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/crowd/${zone.id}`); }}
                      className="text-xs text-text-muted hover:text-accent-green transition-colors flex items-center gap-1 mt-auto"
                      aria-label={`View details for ${zone.name}`}
                    >
                      {t('viewDetails', language)} <ArrowRight className="w-3 h-3" aria-hidden />
                    </button>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Alerts Feed */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" aria-hidden />
              {t('activeAlerts', language)}
            </h2>
            {displayAlerts.length === 0 ? (
              <GlassCard className="text-center py-8">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-sm text-text-muted">{t('noAlerts', language)}</p>
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
            <h2 className="text-lg font-bold text-text-primary">{t('roadmapTitle', language)}</h2>
            <p className="text-sm text-text-muted mt-1">{t('roadmapSubtitle', language)}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ROADMAP_MODULES.map((mod) => (
              <RoadmapCard key={mod.id} module={mod} onOpen={setRoadmapModule} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
