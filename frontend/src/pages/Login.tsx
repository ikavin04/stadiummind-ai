import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, HeartPulse, HandHelping, User } from 'lucide-react';
import { useAuth, type DemoRole } from '../hooks/useAuth';
import { Spinner } from '../components/Spinner';

const ROLES: Array<{ id: DemoRole; label: string; description: string; icon: React.ReactNode; color: string }> = [
  {
    id: 'manager',
    label: 'Stadium Manager',
    description: 'Full dashboard access — crowd data, alerts, all AI modules',
    icon: <LayoutDashboardIcon />,
    color: 'border-accent-green/40 hover:border-accent-green',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Crowd monitoring, gate alerts, incident tracking',
    icon: <Shield className="w-5 h-5" />,
    color: 'border-accent-amber/40 hover:border-accent-amber',
  },
  {
    id: 'medical',
    label: 'Medical Staff',
    description: 'Incident alerts, zone monitoring, emergency coordination',
    icon: <HeartPulse className="w-5 h-5" />,
    color: 'border-accent-red/40 hover:border-accent-red',
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    description: 'Task assignments, Fan Assistant, zone status',
    icon: <HandHelping className="w-5 h-5" />,
    color: 'border-accent-blue/40 hover:border-accent-blue',
  },
  {
    id: 'fan',
    label: 'Fan',
    description: 'Fan Assistant — seating, food, parking, schedule',
    icon: <User className="w-5 h-5" />,
    color: 'border-bg-border hover:border-accent-green/40',
  },
];

function LayoutDashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();
  const [selected, setSelected] = useState<DemoRole>('manager');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginAsDemo(selected);
      // Fans → assistant, everyone else → dashboard
      navigate(user.dashboard_config.default_view === 'fan_assistant' ? '/assistant' : '/dashboard');
    } catch {
      setError('Could not connect to the backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4" style={{
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(0,226,138,0.12) 0%, transparent 60%)',
    }}>
      <div className="w-full max-w-md space-y-6 animate-slide-in-up">
        {/* Hero */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">🏟️</div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Stadium<span className="text-accent-green">Mind</span> AI
          </h1>
          <p className="text-text-secondary text-sm">
            The Intelligent Operating System for FIFA World Cup 2026
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="live-dot" aria-hidden />
            <span className="text-xs text-accent-green font-medium">Live Demo Mode</span>
          </div>
        </div>

        {/* Role Selector */}
        <div className="glass-card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Select your role</h2>
            <p className="text-xs text-text-muted mt-0.5">Each role gets a tailored dashboard view</p>
          </div>

          <div className="space-y-2" role="radiogroup" aria-label="Role selection">
            {ROLES.map((role) => (
              <button
                key={role.id}
                id={`role-${role.id}`}
                role="radio"
                aria-checked={selected === role.id}
                onClick={() => setSelected(role.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left ${
                  selected === role.id
                    ? 'border-accent-green/60 bg-accent-green/8 text-text-primary'
                    : `border-bg-border bg-bg-card/50 text-text-secondary ${role.color}`
                }`}
              >
                <div className={selected === role.id ? 'text-accent-green' : 'text-text-muted'}>
                  {role.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{role.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{role.description}</p>
                </div>
                {selected === role.id && (
                  <div className="w-2 h-2 rounded-full bg-accent-green shrink-0" />
                )}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-xs text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            id="btn-enter-dashboard"
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <Spinner size="sm" /> : null}
            {loading ? 'Connecting...' : `Enter as ${ROLES.find(r => r.id === selected)?.label}`}
          </button>

          <p className="text-center text-xs text-text-muted">
            Firebase auth ready to plug in — see{' '}
            <code className="text-text-secondary">useAuth.ts</code> for the swap point
          </p>
        </div>

        {/* Competition badge */}
        <p className="text-center text-xs text-text-muted">
          PromptWars Challenge 4 · Smart Stadiums & Tournament Operations
        </p>
      </div>
    </div>
  );
}
