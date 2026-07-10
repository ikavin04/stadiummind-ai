import { useEffect, useRef, useCallback, useState } from 'react';
import type { DashboardSummary, WSEvent, Zone, DashboardAlert, CrowdPrediction } from '../types';

const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
const PING_INTERVAL = 25_000;  // 25s keepalive
const RECONNECT_DELAY = 3_000; // 3s before reconnect

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface UseDashboardSocketReturn {
  status: ConnectionStatus;
  zones: Zone[];
  alerts: DashboardAlert[];
  latestPredictions: CrowdPrediction[];
  summary: DashboardSummary | null;
  lastUpdated: Date | null;
}

export function useDashboardSocket(): UseDashboardSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [latestPredictions, setLatestPredictions] = useState<CrowdPrediction[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleEvent = useCallback((event: WSEvent) => {
    setLastUpdated(new Date());

    switch (event.event_type) {
      case 'initial_state': {
        const data = event.data as unknown as DashboardSummary;
        setSummary(data);
        setZones(data.zones ?? []);
        setAlerts(data.active_alerts ?? []);
        setLatestPredictions(data.latest_predictions ?? []);
        break;
      }
      case 'crowd_update': {
        const update = event.data as unknown as CrowdPrediction & { current_count: number; occupancy_pct: number; capacity: number };
        // Update the matching zone in-place
        setZones((prev) =>
          prev.map((z) =>
            z.id === update.zone_id
              ? { ...z, current_count: update.current_count, occupancy_pct: update.occupancy_pct, severity: update.severity, latest_prediction: update }
              : z
          )
        );
        // Upsert into latestPredictions
        setLatestPredictions((prev) => {
          const filtered = prev.filter((p) => p.zone_id !== update.zone_id);
          return [update as unknown as CrowdPrediction, ...filtered];
        });
        break;
      }
      case 'alert': {
        const alert = event.data as unknown as DashboardAlert;
        setAlerts((prev) => {
          // Deduplicate by zone_id — keep freshest
          const filtered = prev.filter((a) => a.zone_id !== alert.zone_id);
          return [alert, ...filtered].slice(0, 20); // cap at 20 alerts
        });
        break;
      }
      default:
        break;
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    setStatus('connecting');

    const ws = new WebSocket(`${WS_BASE}/api/dashboard/live`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return; }
      setStatus('connected');
      // Start keepalive pings
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping');
      }, PING_INTERVAL);
    };

    ws.onmessage = (msg) => {
      try {
        const event: WSEvent = JSON.parse(msg.data);
        handleEvent(event);
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      if (pingRef.current) clearInterval(pingRef.current);
      if (!mountedRef.current) return;
      setStatus('disconnected');
      // Auto-reconnect
      reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [handleEvent]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (pingRef.current) clearInterval(pingRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { status, zones, alerts, latestPredictions, summary, lastUpdated };
}
