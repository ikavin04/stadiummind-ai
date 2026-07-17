import { useState } from 'react';
import {
  ClipboardList, CheckSquare, Square,
  Megaphone, Award, Clock, RefreshCw
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { OccupancyBar } from '../OccupancyBar';
import { SeverityBadge } from '../Badge';
import type { Zone, DashboardAlert } from '../../types';

interface VolunteerDashboardProps {
  zones: Zone[];
  alerts: DashboardAlert[];
  lastUpdated: Date | null;
  ticking: boolean;
  onSimulateTick: () => void;
}

export function VolunteerDashboard({
  zones, alerts: _alerts, lastUpdated, ticking, onSimulateTick
}: VolunteerDashboardProps) {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Check in with Coordinator at Gate B Info Desk', done: true },
    { id: 2, text: 'Distribute Matchday Guides at Section 100 entrance', done: false },
    { id: 3, text: 'Assist guest with accessibility seating request in Row 14', done: false },
    { id: 4, text: 'Verify ticket scanners at Concourse Level 2 are operating', done: false },
    { id: 5, text: 'Conduct sweep of Concourse Level 1 for any safety hazards', done: false },
  ]);

  // Find all zones with watch or alert severity
  const activeAlertZones = zones.filter(z => z.severity !== 'normal');
  const [completedDynamicTasks, setCompletedDynamicTasks] = useState<Set<string>>(new Set());

  const toggleTask = (id: number | string) => {
    if (typeof id === 'string' && id.startsWith('dynamic-')) {
      const zoneId = id.replace('dynamic-', '');
      setCompletedDynamicTasks(prev => {
        const next = new Set(prev);
        if (next.has(zoneId)) {
          next.delete(zoneId);
        } else {
          next.add(zoneId);
        }
        return next;
      });
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    }
  };

  const dynamicTasks = activeAlertZones.map(z => ({
    id: `dynamic-${z.id}`,
    text: z.severity === 'alert'
      ? `CRITICAL: Help direct crowd flow at ${z.name} (Surge Alert)`
      : `Monitor crowd traffic at ${z.name} (Watch Status)`,
    done: completedDynamicTasks.has(z.id),
  }));

  const allTasks = [...dynamicTasks, ...tasks];
  const completedCount = tasks.filter(t => t.done).length + completedDynamicTasks.size;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bg-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="live-dot" aria-hidden />
            <span className="text-xs text-accent-green font-medium uppercase tracking-wider">
              Shift Active
            </span>
          </div>
          <h1 className="text-display text-3xl font-bold text-text-primary tracking-tight">
            Volunteer Shift Copilot
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mt-1">
            <span>Assigned Zone: North Concourse &amp; Gate B</span>
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
          Refresh Status
        </button>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Shifts & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shift Checklist Card */}
          <GlassCard className="border-accent-blue/20 bg-accent-blue/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-accent-blue" aria-hidden />
                <h2 className="text-display text-lg font-bold text-text-primary">Shift Task List</h2>
              </div>
              <span className="text-xs font-semibold bg-accent-blue/15 text-accent-blue px-2.5 py-1 rounded-full">
                {completedCount} of {allTasks.length} Done
              </span>
            </div>

            <div className="space-y-3" role="group" aria-label="Task checklist">
              {allTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                    task.done
                      ? 'border-bg-border bg-bg-surface/30 text-text-muted line-through'
                      : 'border-bg-border bg-bg-card hover:border-accent-blue/40 text-text-primary'
                  }`}
                  aria-pressed={task.done}
                >
                  <div className="mt-0.5 shrink-0 text-accent-blue">
                    {task.done ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium leading-tight">{task.text}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Broadcasts / Announcements */}
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2 text-accent-amber">
              <Megaphone className="w-5 h-5" aria-hidden />
              <h2 className="text-display text-base font-bold text-text-primary">Shift Broadcasts</h2>
            </div>
            
            <div className="space-y-3">
              <div className="bg-bg-surface p-3.5 rounded-xl border border-bg-border flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-amber/10 flex items-center justify-center shrink-0 text-accent-amber">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-semibold">Matchday Operations Coordinator · 10 min ago</p>
                  <p className="text-sm text-text-primary mt-1 leading-relaxed">
                    Gate B is experiencing a minor surge in crowd traffic. Volunteers near Gate B should direct arriving fans to ticket scanners 4-8. Keep up the great work!
                  </p>
                </div>
              </div>

              <div className="bg-bg-surface p-3.5 rounded-xl border border-bg-border flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0 text-accent-green">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-semibold">Stadium Operations · 1 hour ago</p>
                  <p className="text-sm text-text-primary mt-1 leading-relaxed">
                    Volunteer meal vouchers are now ready. Please collect yours at the Volunteer Lounge during your shift break. Thank you!
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Local Status Overview */}
        <div className="space-y-6">
          {/* Volunteer shift hours status */}
          <GlassCard className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-green/15 flex items-center justify-center text-accent-green">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Shift Hours</p>
              <p className="text-base font-bold text-text-primary">18:00 - 22:00</p>
              <p className="text-xs text-text-secondary">2 hours remaining</p>
            </div>
          </GlassCard>

          {/* Simple Area Status Overview */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Concourse Status Overview
            </h2>
            <div className="space-y-2">
              {zones.slice(0, 4).map(zone => (
                <GlassCard key={zone.id} className="!p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-primary leading-tight">{zone.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5 capitalize">{zone.zone_type}</p>
                    </div>
                    <SeverityBadge severity={zone.severity} />
                  </div>
                  <OccupancyBar
                    current={zone.current_count}
                    capacity={zone.capacity}
                    severity={zone.severity}
                    volunteerMode={true}
                  />
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
