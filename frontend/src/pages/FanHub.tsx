/**
 * FanHub — Primary landing page for fans (role = 'fan').
 * A consumer-grade experience: hero banner, live match info, weather,
 * quick-action cards, stadium facilities overview, and a persistent chat FAB.
 *
 * Data: reuses the existing getDashboardSummary endpoint (no new backend).
 * All imagery is original SVG geometry — no real FIFA trademarks or athlete photos.
 */
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare, MapPin, Utensils, ParkingCircle,
  Accessibility, Heart, Info, Cloud, Thermometer,
  CalendarClock, Trophy, ChevronRight, Wind,
} from 'lucide-react';
import { FanLayout } from '../components/FanLayout';
import { WeatherIcon } from '../components/WeatherIcon';
import { getDashboardSummary } from '../lib/api';
import { cn } from '../lib/utils';

/* ── Inline SVG pitch-line decoration ─────────────────────────────────────── */
function PitchLines() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 600"
      className="absolute inset-0 w-full h-full object-cover opacity-[0.045] pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-green">
        {/* Centre circle */}
        <circle cx="400" cy="300" r="90" />
        {/* Centre spot */}
        <circle cx="400" cy="300" r="4" fill="currentColor" opacity="0.6" />
        {/* Halfway line */}
        <line x1="400" y1="30" x2="400" y2="570" />
        {/* Outer boundary */}
        <rect x="30" y="30" width="740" height="540" rx="6" />
        {/* Left penalty area */}
        <rect x="30" y="160" width="130" height="280" />
        {/* Right penalty area */}
        <rect x="640" y="160" width="130" height="280" />
        {/* Left goal area */}
        <rect x="30" y="220" width="55" height="160" />
        {/* Right goal area */}
        <rect x="715" y="220" width="55" height="160" />
        {/* Left corner arcs */}
        <path d="M30,30 Q50,30 50,50" />
        <path d="M770,30 Q770,50 750,50" />
        <path d="M30,570 Q30,550 50,550" />
        <path d="M770,570 Q750,570 750,550" />
      </g>
    </svg>
  );
}

/* ── Quick-action card ─────────────────────────────────────────────────────── */
interface QuickCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  question: string;
  accentColor?: string;
  delay?: string;
}

function QuickCard({ icon, title, subtitle, question, accentColor = 'accent-green', delay = '0s' }: QuickCardProps) {
  const navigate = useNavigate();
  const handleClick = () => navigate(`/assistant?q=${encodeURIComponent(question)}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="fan-card group animate-fade-in-up"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
      aria-label={`Quick question: ${title}`}
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200',
        `bg-${accentColor}/10 group-hover:bg-${accentColor}/20`
      )}>
        <span className={`text-${accentColor}`}>{icon}</span>
      </div>
      <h3 className="text-sm font-semibold text-text-primary leading-tight">{title}</h3>
      <p className="text-xs text-text-secondary mt-1 leading-relaxed">{subtitle}</p>
      <div className={cn(
        'mt-3 flex items-center gap-1 text-xs font-medium transition-colors duration-150',
        `text-${accentColor}/70 group-hover:text-${accentColor}`
      )}>
        Ask AI <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  );
}

/* ── Facilities item ───────────────────────────────────────────────────────── */
function FacilityItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-text-secondary">
      <div className="w-7 h-7 rounded-lg bg-bg-surface flex items-center justify-center text-text-muted border border-bg-border shrink-0">
        {icon}
      </div>
      {label}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────────── */
export function FanHub() {
  const navigate = useNavigate();

  const { data: summary } = useQuery({
    queryKey:      ['dashboard-summary'],
    queryFn:       getDashboardSummary,
    refetchInterval: 60_000,
    staleTime:     30_000,
  });

  const matchInfo = summary?.match_info;
  const weather   = summary?.weather;

  return (
    <FanLayout>
      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="fan-hero relative min-h-[70vh] flex items-center justify-center px-4 py-20" aria-label="Hero banner">
        {/* Pitch-line decoration */}
        <PitchLines />

        {/* Radial glow rings (purely CSS, no images) */}
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-[50%] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,226,138,0.10) 0%, transparent 70%)' }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto animate-hero-float">
          {/* Live match badge */}
          {matchInfo && (
            <div className="inline-flex items-center gap-2 bg-bg-card/80 border border-accent-green/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <span className="live-dot w-1.5 h-1.5" aria-hidden />
              <span className="text-xs font-semibold text-accent-green uppercase tracking-widest">
                Live — {matchInfo.status}
              </span>
            </div>
          )}

          <h1 className="text-hero text-5xl sm:text-6xl lg:text-7xl text-text-primary mb-4">
            Your{' '}
            <span className="text-accent-green">FIFA World Cup 2026</span>
            {' '}Companion
          </h1>

          <p className="text-text-secondary text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-8">
            Real-time stadium guidance, gate directions, food & parking — everything you need, powered by AI.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="fan-hero-cta"
              onClick={() => navigate('/assistant')}
              className="btn-primary flex items-center gap-2 px-6 py-3 text-base"
            >
              <MessageSquare className="w-5 h-5" aria-hidden />
              Chat with AI Assistant
            </button>
            {matchInfo && (
              <button
                id="fan-hero-match"
                onClick={() => navigate(`/assistant?q=${encodeURIComponent('Tell me about today\'s match')}`)}
                className="btn-ghost flex items-center gap-2 px-6 py-3 text-base"
              >
                <Trophy className="w-4 h-4" aria-hidden />
                Today's Match
              </button>
            )}
          </div>
        </div>

        {/* Bottom fade to content */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #0B0D12)' }}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════
          CONTENT RAIL
      ══════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10" aria-label="Fan information">

        {/* ── Live match + weather row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Match card */}
          {matchInfo ? (
            <div
              className="glass-card p-6 flex flex-col gap-3 animate-fade-in-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent-amber" aria-hidden />
                <span className="section-label">Today's Match</span>
                <span className="ml-auto text-xs font-semibold text-accent-green bg-accent-green/10 px-2.5 py-0.5 rounded-full">
                  {matchInfo.status}
                </span>
              </div>
              <p className="text-display text-2xl text-text-primary">{matchInfo.match}</p>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-text-muted" aria-hidden />
                  KO {matchInfo.kickoff}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-text-muted" aria-hidden />
                  {matchInfo.venue}
                </span>
              </div>
              <div className="mt-1 h-px bg-bg-border" />
              <p className="text-xs text-text-muted">
                Gates open 2.5 hours before kickoff. Pre-match show begins 45 min before kickoff.
              </p>
            </div>
          ) : (
            <div className="glass-card p-6 flex items-center justify-center h-36">
              <p className="text-text-muted text-sm">Loading match info...</p>
            </div>
          )}

          {/* Weather card */}
          {weather ? (
            <div
              className="glass-card p-6 flex flex-col gap-3 animate-fade-in-up"
              style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-accent-blue" aria-hidden />
                <span className="section-label">Stadium Weather</span>
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-display text-5xl text-text-primary">{weather.temperature_c}°C</p>
                  <p className="text-text-secondary text-sm mt-1">{weather.condition}</p>
                </div>
                <WeatherIcon condition={weather.condition} className="w-14 h-14 text-text-muted mb-1" />
              </div>
              <div className="flex gap-4 text-xs text-text-muted mt-auto">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5" aria-hidden />
                  {weather.humidity_pct}% humidity
                </span>
                {weather.wind_kph != null && (
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5" aria-hidden />
                    {weather.wind_kph} km/h wind
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 flex items-center justify-center h-36">
              <p className="text-text-muted text-sm">Loading weather...</p>
            </div>
          )}
        </div>

        {/* ── Quick-action cards ── */}
        <div>
          <h2 className="text-display text-2xl text-text-primary mb-1">Quick Actions</h2>
          <p className="text-text-muted text-sm mb-5">Ask our AI about anything you need at the stadium</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <QuickCard
              icon={<MapPin className="w-5 h-5" />}
              title="Find My Gate"
              subtitle="Get directions to your section entrance"
              question="How do I find my gate and seat section at MetLife Stadium?"
              accentColor="accent-green"
              delay="0.1s"
            />
            <QuickCard
              icon={<Utensils className="w-5 h-5" />}
              title="Food & Drinks"
              subtitle="Concession locations and what's available"
              question="Where are the food courts and concession stands? What food is available?"
              accentColor="accent-amber"
              delay="0.15s"
            />
            <QuickCard
              icon={<ParkingCircle className="w-5 h-5" />}
              title="Parking & Transit"
              subtitle="Parking lots, NJ Transit, ride-share info"
              question="Tell me about parking, public transport, and ride-share options for MetLife Stadium"
              accentColor="accent-blue"
              delay="0.2s"
            />
            <QuickCard
              icon={<Info className="w-5 h-5" />}
              title="Stadium Rules"
              subtitle="Bag policy, prohibited items, conduct"
              question="What are the bag policy and prohibited items at the stadium?"
              accentColor="accent-green"
              delay="0.25s"
            />
            <QuickCard
              icon={<Accessibility className="w-5 h-5" />}
              title="Accessibility"
              subtitle="Wheelchair routes, elevators, assistance"
              question="What accessibility services and wheelchair-accessible routes are available?"
              accentColor="accent-blue"
              delay="0.3s"
            />
            <QuickCard
              icon={<Heart className="w-5 h-5" />}
              title="Medical Help"
              subtitle="First aid locations and emergency contacts"
              question="Where are the first aid stations and medical help points in the stadium?"
              accentColor="accent-red"
              delay="0.35s"
            />
          </div>
        </div>

        {/* ── Stadium facilities ── */}
        <div
          className="glass-card p-6 animate-fade-in-up"
          style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-accent-green" aria-hidden />
            <h2 className="text-display text-xl text-text-primary">Stadium Facilities</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <FacilityItem icon={<MapPin className="w-3.5 h-3.5" />}    label="Gates A, B, C, D" />
            <FacilityItem icon={<Utensils className="w-3.5 h-3.5" />}  label="Food Court — Level 1" />
            <FacilityItem icon={<Heart className="w-3.5 h-3.5" />}     label="Medical — Gate B" />
            <FacilityItem icon={<Accessibility className="w-3.5 h-3.5" />} label="Accessible Entrances" />
            <FacilityItem icon={<Info className="w-3.5 h-3.5" />}      label="Fan Info Desk" />
            <FacilityItem icon={<ParkingCircle className="w-3.5 h-3.5" />} label="Parking Lots A–C" />
            <FacilityItem icon={<MessageSquare className="w-3.5 h-3.5" />} label="3 Seating Levels" />
            <FacilityItem icon={<Cloud className="w-3.5 h-3.5" />}     label="12 AED Stations" />
          </div>
          <p className="text-xs text-text-muted mt-4 leading-relaxed">
            MetLife Stadium capacity: 82,500. Sections 100–199 (Lower Bowl), 200–249 (Club Level), 300–349 (Upper Bowl).
            All seating levels accessible via escalator or elevator at Gates A and B.
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-text-muted pb-4">
          StadiumMind AI · FIFA World Cup 2026 · MetLife Stadium, New Jersey
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FLOATING CHAT BUTTON
      ══════════════════════════════════════════════════════════ */}
      <button
        id="fan-fab-chat"
        onClick={() => navigate('/assistant')}
        className="fab"
        aria-label="Open AI Assistant"
        title="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" aria-hidden />
      </button>
    </FanLayout>
  );
}
