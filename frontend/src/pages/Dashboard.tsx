import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { VolunteerDashboard } from '../components/dashboards/VolunteerDashboard';
import { SecurityDashboard } from '../components/dashboards/SecurityDashboard';
import { MedicalDashboard } from '../components/dashboards/MedicalDashboard';
import { ManagerDashboard } from '../components/dashboards/ManagerDashboard';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import { useRole } from '../lib/roles';
import { useCountUp } from '../lib/useCountUp';
import { manualSimulateTick, getDashboardSummary } from '../lib/api';
import type { Zone, DashboardAlert } from '../types';

export function Dashboard() {
  const role = useRole();
  const { status, zones, alerts, summary, lastUpdated } = useDashboardSocket();
  const [ticking, setTicking] = useState(false);

  // Fallback REST fetch for initial load when WS is still connecting
  const { data: restSummary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
    refetchInterval: 30_000,
    enabled: status !== 'connected',
  });

  const displayZones: Zone[] = zones.length > 0 ? zones : (restSummary?.zones ?? []);
  const displayAlerts: DashboardAlert[] = alerts.length > 0 ? alerts : (restSummary?.active_alerts ?? []);
  const matchInfo = summary?.match_info ?? restSummary?.match_info;
  const weather = summary?.weather ?? restSummary?.weather;
  const totalFansRaw = summary?.total_fans_inside ?? restSummary?.total_fans_inside ?? 0;

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

  // Animated stat counters
  const animatedTotalFans = useCountUp(totalFansRaw);
  const animatedAlertCount = useCountUp(alertCount + watchCount);

  return (
    <Layout wsStatus={status}>
      {role === 'volunteer' && (
        <VolunteerDashboard
          zones={displayZones}
          alerts={displayAlerts}
          lastUpdated={lastUpdated}
          ticking={ticking}
          onSimulateTick={handleSimulateTick}
        />
      )}
      {role === 'security' && (
        <SecurityDashboard
          zones={displayZones}
          alerts={displayAlerts}
          lastUpdated={lastUpdated}
          ticking={ticking}
          onSimulateTick={handleSimulateTick}
        />
      )}
      {role === 'medical' && (
        <MedicalDashboard
          zones={displayZones}
          alerts={displayAlerts}
          lastUpdated={lastUpdated}
          ticking={ticking}
          onSimulateTick={handleSimulateTick}
        />
      )}
      {role === 'manager' && (
        <ManagerDashboard
          zones={displayZones}
          alerts={displayAlerts}
          matchInfo={matchInfo}
          weather={weather}
          totalFans={totalFansRaw}
          lastUpdated={lastUpdated}
          ticking={ticking}
          onSimulateTick={handleSimulateTick}
          isLoading={isLoading}
          animatedTotalFans={animatedTotalFans}
          animatedAlertCount={animatedAlertCount}
        />
      )}
    </Layout>
  );
}
