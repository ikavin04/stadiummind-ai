import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Activity, Clock, Zap, Shield } from 'lucide-react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { CrowdChart } from '../components/CrowdChart';
import { OccupancyBar } from '../components/OccupancyBar';
import { SeverityBadge } from '../components/Badge';
import { Spinner } from '../components/Spinner';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import { useAppStore } from '../store/useAppStore';
import { getCrowdZones, getZoneHistory, getCrowdPredictions } from '../lib/api';
import type { Zone } from '../types';
import { t } from '../lib/i18n';
import { cn } from '../lib/utils';

export function CrowdDetail() {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { status, zones: wsZones } = useDashboardSocket();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Fetch all zones
  const { data: restZones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ['crowd-zones'],
    queryFn: getCrowdZones,
    refetchInterval: 20_000,
  });

  const zones: Zone[] = wsZones.length > 0 ? wsZones : restZones;
  const selectedZone = selectedZoneId
    ? zones.find((z) => z.id === selectedZoneId)
    : zones[0];

  // Fetch history for selected zone
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['zone-history', selectedZone?.id],
    queryFn: () => getZoneHistory(selectedZone!.id),
    enabled: !!selectedZone?.id,
    refetchInterval: 15_000,
  });

  // Fetch latest predictions for selected zone
  const { data: predictions = [] } = useQuery({
    queryKey: ['zone-predictions', selectedZone?.id],
    queryFn: () => getCrowdPredictions(selectedZone?.id),
    enabled: !!selectedZone?.id,
    refetchInterval: 15_000,
  });

  const latestPrediction = selectedZone?.latest_prediction ?? predictions[0] ?? null;

  return (
    <Layout wsStatus={status}>
      <div className="p-4 sm:p-6 space-y-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
            className="btn-ghost flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden />
            Dashboard
          </button>
          <div>
            <h1 className="text-display text-2xl font-bold text-text-primary">{t('crowdPrediction', language)}</h1>
            <p className="text-sm text-text-muted">Per-zone occupancy trends and AI forecasts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zone list */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              All Zones
            </h2>
            {zonesLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : (
              zones.map((zone) => (
                <button
                  key={zone.id}
                  id={`zone-list-${zone.id}`}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={cn(
                    'w-full text-left glass-card !p-3 transition-all duration-150',
                    (selectedZone?.id === zone.id)
                      ? 'border-accent-green/50 bg-accent-green/5'
                      : 'hover:border-bg-border/80 hover:-translate-y-0.5'
                  )}
                  aria-pressed={selectedZone?.id === zone.id}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-text-primary leading-tight truncate">{zone.name}</p>
                    <SeverityBadge severity={zone.severity} />
                  </div>
                  <OccupancyBar
                    current={zone.current_count}
                    capacity={zone.capacity}
                    severity={zone.severity}
                    showLabel={false}
                  />
                  <p className="text-xs text-text-muted mt-1 text-right font-mono">
                    {zone.occupancy_pct}%
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Detail panel */}
          {selectedZone ? (
            <div className="lg:col-span-2 space-y-4">
              {/* Zone header */}
              <GlassCard id="crowd-detail-panel">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">{selectedZone.name}</h2>
                    <p className="text-sm text-text-muted capitalize mt-0.5">{selectedZone.zone_type}</p>
                  </div>
                  <SeverityBadge severity={selectedZone.severity} pulse={selectedZone.severity !== 'normal'} />
                </div>
                <OccupancyBar
                  current={selectedZone.current_count}
                  capacity={selectedZone.capacity}
                  severity={selectedZone.severity}
                />
              </GlassCard>

              {/* Chart */}
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Activity className="w-4 h-4 text-accent-green" aria-hidden />
                    Occupancy History
                  </h3>
                  {historyLoading && <Spinner size="sm" />}
                </div>
                <div className="overflow-x-auto">
                  {history ? (
                    <CrowdChart
                      history={history}
                      minutesUntilFull={latestPrediction?.minutes_until_overcapacity}
                    />
                  ) : (
                    <div className="h-56 flex items-center justify-center">
                      <Spinner size="lg" />
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* AI Prediction */}
              {latestPrediction && (
                <GlassCard id="ai-prediction-panel" className={cn(
                  'border',
                  latestPrediction.severity === 'alert'  ? 'border-accent-red/40'   :
                  latestPrediction.severity === 'watch'  ? 'border-accent-amber/40' :
                  'border-bg-border'
                )}>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className={cn('w-4 h-4', {
                      'text-accent-red':   latestPrediction.severity === 'alert',
                      'text-accent-amber': latestPrediction.severity === 'watch',
                      'text-accent-green': latestPrediction.severity === 'normal',
                    })} aria-hidden />
                    <h3 className="text-sm font-semibold text-text-primary">AI Prediction</h3>
                    {latestPrediction.confidence && (
                      <span className="ml-auto text-xs text-text-muted">
                        {Math.round(latestPrediction.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {latestPrediction.minutes_until_overcapacity != null && (
                      <div className="bg-bg-surface rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3.5 h-3.5 text-text-muted" aria-hidden />
                          <span className="text-xs text-text-muted">Time Until Full</span>
                        </div>
                        <p className={cn('text-2xl font-bold', {
                          'text-accent-red':   latestPrediction.severity === 'alert',
                          'text-accent-amber': latestPrediction.severity === 'watch',
                          'text-accent-green': latestPrediction.severity === 'normal',
                        })}>
                          {latestPrediction.minutes_until_overcapacity}
                          <span className="text-sm font-normal text-text-muted ml-1">min</span>
                        </p>
                      </div>
                    )}
                    <div className="bg-bg-surface rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-3.5 h-3.5 text-text-muted" aria-hidden />
                        <span className="text-xs text-text-muted">{t('recommended', language)}</span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {latestPrediction.recommended_action ?? '—'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden />
                    Generated {latestPrediction.created_at ? new Date(latestPrediction.created_at).toLocaleTimeString() : '—'}
                  </p>
                </GlassCard>
              )}
            </div>
          ) : (
            <div className="xl:col-span-2 flex items-center justify-center">
              <p className="text-text-muted">Select a zone to view details</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
