/**
 * ROADMAP TIER — UI ONLY.
 * These components make ZERO backend calls.
 * They are display-only "Planned" cards per MDD §3.2 and §14.
 */
import {
  X, Map, HardHat, Stethoscope, Accessibility,
  UtensilsCrossed, Leaf,
} from 'lucide-react';
import type { RoadmapModule } from '../types';
import { PlannedBadge } from './Badge';
import { GlassCard } from './GlassCard';

// ─── Icon map: module id → lucide ReactNode ────────────────────────────────────
// Replaces emoji icon strings so no emoji characters appear in the rendered UI.
const MODULE_ICONS: Record<string, React.ReactNode> = {
  'indoor-nav':        <Map           className="w-5 h-5" aria-hidden />,
  'volunteer-copilot': <HardHat       className="w-5 h-5" aria-hidden />,
  'medical-assistant': <Stethoscope   className="w-5 h-5" aria-hidden />,
  'accessibility':     <Accessibility className="w-5 h-5" aria-hidden />,
  'vendor-intelligence':<UtensilsCrossed className="w-5 h-5" aria-hidden />,
  'sustainability':    <Leaf          className="w-5 h-5" aria-hidden />,
};

// ─── Roadmap module definitions ───────────────────────────────────────────────
// All content is static — no network requests.

export const ROADMAP_MODULES: RoadmapModule[] = [
  {
    id: 'indoor-nav',
    name: 'Indoor Navigation AI',
    icon: 'map',
    tagline: 'Step-by-step wayfinding from any point to any point inside the stadium.',
    description:
      'Guides fans from their current location to their seat, gate, concession stand, or medical center using real-time indoor positioning.',
    architecture:
      'Computer vision anchors + BLE beacon mesh → indoor graph model → A* pathfinding → Gemini generates natural-language turn-by-turn directions. Floor plans stored as navigation graphs in the DB. Fan app uses WebSockets to receive live re-routing when a zone is closed.',
  },
  {
    id: 'volunteer-copilot',
    name: 'Volunteer Copilot',
    icon: 'hardhat',
    tagline: 'AI task queue and shift assistant for stadium volunteers.',
    description:
      'Gives each volunteer a personalized AI briefing, shift task list, and real-time re-assignment recommendations when crowd hotspots develop.',
    architecture:
      'Role-based task queue in Postgres → Gemini generates context-aware task summaries and priority rankings → WebSocket push to volunteer mobile devices. Integrates with Crowd Prediction alerts to auto-escalate reassignment requests.',
  },
  {
    id: 'medical-assistant',
    name: 'Medical Assistant',
    icon: 'stethoscope',
    tagline: 'Triage support and AED routing for stadium medical teams.',
    description:
      'Enables fans to report medical incidents via the app. AI triages severity and routes the nearest medical team with AED and defibrillator locations.',
    architecture:
      'Fan incident report → Gemini triage prompt (rule-based + LLM escalation) → severity classification → nearest AED lookup via PostGIS → WebSocket alert to on-duty paramedics. All medical data encrypted at rest.',
  },
  {
    id: 'accessibility',
    name: 'Accessibility Assistant',
    icon: 'accessibility',
    tagline: 'Mobility-aware routing and ASL interpretation request queue.',
    description:
      'Provides wheelchair-accessible pathfinding, elevator availability, companion seating requests, and on-demand ASL interpreter dispatch.',
    architecture:
      'Accessibility layer on top of Indoor Navigation graph (filters out stairs, marks elevator outages) → Gemini generates accessible route narration → ASL interpreter request queue managed via Postgres job table with WebSocket status updates.',
  },
  {
    id: 'vendor-intelligence',
    name: 'Vendor Intelligence',
    icon: 'utensils',
    tagline: 'Real-time restocking recommendations for concession vendors.',
    description:
      'Monitors POS transaction rates across concession stands and predicts which items will run out before the next half, triggering restocking alerts.',
    architecture:
      'POS system webhook → transaction aggregation by SKU per stand → Gemini analyzes sell-through rate vs. crowd occupancy trend → structured JSON restocking recommendation → vendor tablet push via WebSocket. Integrates with Crowd Prediction surge data.',
  },
  {
    id: 'sustainability',
    name: 'Sustainability Dashboard',
    icon: 'leaf',
    tagline: 'Energy and water consumption analytics with AI efficiency recommendations.',
    description:
      'Tracks real-time energy consumption, water usage, and waste generation across the stadium, with AI recommendations for reducing environmental impact.',
    architecture:
      'IoT sensor telemetry → time-series aggregation in TimescaleDB (extension on Postgres) → Gemini generates natural-language efficiency recommendations → dashboard visualization in Recharts. Tracks against FIFA Green Football pledge KPIs.',
  },
];

// ─── Roadmap Card ─────────────────────────────────────────────────────────────

interface RoadmapCardProps {
  module: RoadmapModule;
  onOpen: (module: RoadmapModule) => void;
}

export function RoadmapCard({ module, onOpen }: RoadmapCardProps) {
  return (
    <GlassCard
      hover
      onClick={() => onOpen(module)}
      className="flex flex-col gap-3"
      id={`roadmap-${module.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-xl bg-bg-surface flex items-center justify-center text-text-secondary border border-bg-border">
          {MODULE_ICONS[module.id]}
        </div>
        <PlannedBadge />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{module.name}</h3>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{module.tagline}</p>
      </div>
      <div className="mt-auto pt-2 border-t border-bg-border">
        <span className="text-xs text-text-muted hover:text-accent-green transition-colors">
          View architecture →
        </span>
      </div>
    </GlassCard>
  );
}

// ─── Roadmap Modal ────────────────────────────────────────────────────────────

interface RoadmapModalProps {
  module: RoadmapModule | null;
  onClose: () => void;
}

export function RoadmapModal({ module, onClose }: RoadmapModalProps) {
  if (!module) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${module.name} roadmap details`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      {/* Modal */}
      <div className="relative glass-card max-w-lg w-full animate-slide-in-up">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg-surface flex items-center justify-center text-text-secondary border border-bg-border">
                {MODULE_ICONS[module.id]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-text-primary">{module.name}</h2>
                  <PlannedBadge />
                </div>
                <p className="text-xs text-text-secondary mt-0.5">{module.tagline}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">Overview</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{module.description}</p>
          </div>

          {/* Architecture */}
          <div className="bg-bg-surface rounded-xl p-4 border border-bg-border">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
              Planned Architecture
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">{module.architecture}</p>
          </div>

          {/* Footer note */}
          <p className="text-xs text-text-muted italic">
            This module is in the roadmap tier — it demonstrates platform vision but contains no live backend logic.
          </p>
        </div>
      </div>
    </div>
  );
}
