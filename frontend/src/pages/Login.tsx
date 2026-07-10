import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, HeartPulse, HandHelping, User, Building2, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuth, type DemoRole } from '../hooks/useAuth';
import { useAppStore } from '../store/useAppStore';
import { Spinner } from '../components/Spinner';
import trophyImg from '../assets/championship_trophy.png';

const ROLES: Array<{ id: DemoRole; label: string; description: string; icon: React.ReactNode; color: string }> = [
  {
    id: 'manager',
    label: 'Stadium Manager',
    description: 'Full dashboard access — crowd data, alerts, all AI modules',
    icon: <LayoutDashboard className="w-5 h-5" />,
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

export function Login() {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();
  const { theme, toggleTheme } = useAppStore();
  const [selected, setSelected] = useState<DemoRole>('manager');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginAsDemo(selected);
      // Fan role → Fan Hub; all staff roles → operational dashboard
      navigate(user.role === 'fan' ? '/fan-hub' : '/dashboard');
    } catch {
      setError('Could not connect to the backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col lg:flex-row transition-colors duration-200">
      {/* Left Brand Showcase (FIFA World Cup 2026 Branding) */}
      <div className="hidden lg:flex lg:w-3/5 bg-[#1A52EE] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Pitch Markings decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none pitch-bg" />
        
        {/* Floating radial glow behind trophy */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl pointer-events-none" />

        {/* Header info */}
        <div className="z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Building2 className="w-5 h-5 text-white" aria-hidden />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">StadiumMind AI</span>
        </div>

        {/* Giant Typography and Trophy container */}
        <div className="z-10 relative flex-1 flex flex-col justify-center items-center">
          {/* Background massive font */}
          <div className="text-center font-display font-black leading-none uppercase select-none pointer-events-none">
            <div className="text-[12rem] tracking-tighter opacity-15 leading-none">WE ARE</div>
            <div className="text-[16rem] tracking-widest opacity-25 leading-none mt-[-40px]">26</div>
          </div>
          
          {/* Golden Trophy floating in front */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={trophyImg}
              alt="FIFA World Cup Trophy"
              className="h-[80%] max-h-[500px] object-contain drop-shadow-[0_20px_50px_rgba(255,200,0,0.35)] animate-hero-float"
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10">
          <h2 className="text-4xl font-extrabold tracking-tight font-display">NEW YORK</h2>
          <h2 className="text-4xl font-extrabold tracking-tight font-display text-white/60">NEW JERSEY</h2>
          <p className="text-xs text-white/50 mt-2 font-mono">STADIUM COMMAND &amp; CONTROL CENTER</p>
        </div>
      </div>

      {/* Mobile Header Graphic */}
      <div className="lg:hidden w-full bg-[#1A52EE] relative overflow-hidden flex flex-col justify-center items-center py-10 px-6 text-white text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none pitch-bg" />
        <div className="z-10 flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">StadiumMind AI</span>
        </div>
        
        <div className="relative w-44 h-44 z-10 flex items-center justify-center">
          <div className="text-center font-display font-black leading-none uppercase opacity-20 select-none">
            <div className="text-5xl leading-none">WE ARE</div>
            <div className="text-7xl leading-none">26</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={trophyImg}
              alt="FIFA World Cup Trophy"
              className="h-[90%] object-contain drop-shadow-[0_10px_25px_rgba(255,200,0,0.3)] animate-hero-float"
            />
          </div>
        </div>
        <div className="z-10 mt-2">
          <h2 className="text-xl font-extrabold font-display leading-tight">NEW YORK NEW JERSEY</h2>
        </div>
      </div>

      {/* Right Access Control Panel */}
      <div className="w-full lg:w-2/5 flex flex-col justify-between p-8 lg:p-12 bg-bg-base relative min-h-full lg:min-h-screen">
        {/* Theme Toggle */}
        <div className="flex justify-between items-center mb-8 lg:mb-0">
          <div className="lg:block hidden" />
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl border border-bg-border bg-bg-surface hover:bg-bg-border/30 text-text-primary transition-all duration-200 shadow-sm flex items-center justify-center gap-2 text-xs font-semibold ml-auto"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-accent-amber animate-spin-slow" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-accent-blue" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Center Login Form */}
        <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-primary font-display uppercase">
              Live Operations Portal
            </h2>
            <p className="text-text-secondary text-sm">
              Access the intelligent command dashboard or fan experience hub.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="live-dot" aria-hidden />
              <span className="text-xs text-accent-green font-semibold">Live Sandbox Mode</span>
            </div>
          </div>

          <div className="glass-card p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Select a Profile Role</h3>
              <p className="text-xs text-text-muted mt-0.5">Simulate role-specific views and controls</p>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 no-scrollbar animate-fade-in-up" role="radiogroup" aria-label="Role selection">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  id={`role-${role.id}`}
                  role="radio"
                  aria-checked={selected === role.id}
                  onClick={() => setSelected(role.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left ${
                    selected === role.id
                      ? 'border-accent-green/80 bg-accent-green/5 text-text-primary shadow-sm'
                      : `border-bg-border bg-bg-card/40 text-text-secondary ${role.color}`
                  }`}
                >
                  <div className={selected === role.id ? 'text-accent-green' : 'text-text-muted'}>
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{role.label}</p>
                    <p className="text-xs text-text-muted mt-0.5 leading-snug">{role.description}</p>
                  </div>
                  {selected === role.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-green shrink-0 shadow-sm" />
                  )}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-xs text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-xl px-3.5 py-2.5 font-medium animate-slide-in-up">
                {error}
              </p>
            )}

            <button
              id="btn-enter-dashboard"
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold tracking-wide shadow-lg uppercase text-xs"
            >
              {loading ? <Spinner size="sm" /> : null}
              {loading ? 'Entering Portal...' : `Enter as ${ROLES.find(r => r.id === selected)?.label}`}
            </button>

            <p className="text-center text-[10px] text-text-muted font-mono leading-relaxed">
              Demo sandbox powered by Mock Server. Firebase auth integration point configured in <code className="text-text-secondary">useAuth.ts</code>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center lg:text-left mt-8 lg:mt-0 border-t border-bg-border/60 pt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-text-muted gap-2 font-mono">
          <span>FIFA World Cup 2026 Operations</span>
          <span>Smart Stadiums &amp; Operational Command</span>
        </div>
      </div>
    </div>
  );
}
