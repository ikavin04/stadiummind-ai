import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import type { ZoneHistory } from '../types';

interface CrowdChartProps {
  history: ZoneHistory;
  minutesUntilFull?: number | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card !p-3 text-xs space-y-1">
      <p className="text-text-muted">{label}</p>
      <p className="text-accent-green font-semibold">{payload[0]?.value}% occupancy</p>
      {payload[0]?.payload?.count && (
        <p className="text-text-secondary">{payload[0].payload.count.toLocaleString()} fans</p>
      )}
    </div>
  );
};

export function CrowdChart({ history, minutesUntilFull }: CrowdChartProps) {
  const data = history.readings.map((r) => ({
    time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    occupancy: r.occupancy_pct,
    count: r.count,
  }));

  // Compute projected overcapacity line position if we have a prediction
  const projectedLabel = minutesUntilFull != null ? `~${minutesUntilFull}m` : null;

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00E28A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00E28A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#252A3A" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#525870', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 110]}
            tick={{ fill: '#525870', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Warning zone reference line at 70% */}
          <ReferenceLine y={70} stroke="#F2A623" strokeDasharray="4 4" strokeWidth={1}
            label={{ value: '70%', fill: '#F2A623', fontSize: 10, position: 'insideTopRight' }} />
          {/* Critical line at 100% */}
          <ReferenceLine y={100} stroke="#E24B4A" strokeDasharray="4 4" strokeWidth={1}
            label={{ value: '100%', fill: '#E24B4A', fontSize: 10, position: 'insideTopRight' }} />
          <Area
            type="monotone"
            dataKey="occupancy"
            stroke="#00E28A"
            strokeWidth={2}
            fill="url(#occupancyGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#00E28A', strokeWidth: 0 }}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
