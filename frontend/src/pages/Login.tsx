import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, HeartPulse, HandHelping, User, Building2, LayoutDashboard, Sun, Moon, Globe } from 'lucide-react';
import { useAuth, type DemoRole } from '../hooks/useAuth';
import { useAppStore } from '../store/useAppStore';
import { Spinner } from '../components/Spinner';
import { LANGUAGES, t } from '../lib/i18n';
import { cn } from '../lib/utils';
import type { Language } from '../types';

/**
 * Proper soccer ball SVG — clean symmetric pentagon/hexagon pattern.
 * Completely original geometry, no trademark imagery.
 */
function SoccerBall({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sb-body" cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#dde8ff" />
          <stop offset="50%"  stopColor="#b3c8f8" />
          <stop offset="100%" stopColor="#7aa0f0" />
        </radialGradient>
        <radialGradient id="sb-shine" cx="36%" cy="30%" r="40%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="sb-drop" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.3" />
        </filter>
        <clipPath id="sb-clip">
          <circle cx="100" cy="100" r="84" />
        </clipPath>
      </defs>

      {/* Main sphere */}
      <circle cx="100" cy="100" r="84" fill="url(#sb-body)" filter="url(#sb-drop)" />

      {/* Panels clipped to sphere */}
      <g clipPath="url(#sb-clip)" fill="#1a1a2e" opacity="0.80">
        {/* Top centre pentagon */}
        <polygon points="100,18 117,32 111,52 89,52 83,32" />
        {/* Upper-left pentagon */}
        <polygon points="60,42 78,30 84,50 68,62 50,54" />
        {/* Upper-right pentagon */}
        <polygon points="140,42 122,30 116,50 132,62 150,54" />
        {/* Lower-left pentagon */}
        <polygon points="46,108 62,120 60,140 40,148 28,130" />
        {/* Lower-right pentagon */}
        <polygon points="154,108 138,120 140,140 160,148 172,130" />
        {/* Bottom pentagon */}
        <polygon points="100,182 83,168 89,148 111,148 117,168" />
      </g>

      {/* Shine overlay */}
      <circle cx="100" cy="100" r="84" fill="url(#sb-shine)" />
    </svg>
  );
}

/** Stadium silhouette SVG for the mobile hero — clean, original geometry */
function StadiumSilhouette() {
  return (
    <svg viewBox="0 0 300 160" aria-hidden className="w-full max-w-xs opacity-90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ss-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Outer oval ring */}
      <ellipse cx="150" cy="90" rx="140" ry="65" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {/* Inner pitch oval */}
      <ellipse cx="150" cy="90" rx="105" ry="45" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      {/* Left stand tier */}
      <path d="M10,90 Q10,30 60,25 L70,38 Q28,42 28,90 Z" fill="url(#ss-grad)" />
      {/* Right stand tier */}
      <path d="M290,90 Q290,30 240,25 L230,38 Q272,42 272,90 Z" fill="url(#ss-grad)" />
      {/* Top stand */}
      <path d="M60,25 Q150,5 240,25 L230,38 Q150,22 70,38 Z" fill="url(#ss-grad)" />
      {/* Floodlights */}
      <rect x="52" y="14" width="4" height="16" fill="rgba(255,255,255,0.4)" rx="1" />
      <rect x="244" y="14" width="4" height="16" fill="rgba(255,255,255,0.4)" rx="1" />
      <rect x="50" y="12" width="8" height="3" fill="rgba(255,255,255,0.6)" rx="1" />
      <rect x="242" y="12" width="8" height="3" fill="rgba(255,255,255,0.6)" rx="1" />
      {/* Pitch centre line */}
      <line x1="150" y1="47" x2="150" y2="133" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {/* Centre circle */}
      <circle cx="150" cy="90" r="18" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    </svg>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();
  const { theme, toggleTheme, language, setLanguage } = useAppStore();
  const [selected, setSelected] = useState<DemoRole>('manager');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLang, setShowLang] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === language)!;

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginAsDemo(selected);
      navigate(user.role === 'fan' ? '/fan-hub' : '/dashboard');
    } catch {
      setError('Could not connect to the backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Role definitions use translated labels
  const ROLES: Array<{ id: DemoRole; descKey: string; icon: React.ReactNode; color: string }> = [
    {
      id: 'manager',
      descKey: 'roleManager',
      icon: <LayoutDashboard className="w-5 h-5" />,
      color: 'border-accent-green/40 hover:border-accent-green',
    },
    {
      id: 'security',
      descKey: 'roleSecurity',
      icon: <Shield className="w-5 h-5" />,
      color: 'border-accent-amber/40 hover:border-accent-amber',
    },
    {
      id: 'medical',
      descKey: 'roleMedical',
      icon: <HeartPulse className="w-5 h-5" />,
      color: 'border-accent-red/40 hover:border-accent-red',
    },
    {
      id: 'volunteer',
      descKey: 'roleVolunteer',
      icon: <HandHelping className="w-5 h-5" />,
      color: 'border-accent-blue/40 hover:border-accent-blue',
    },
    {
      id: 'fan',
      descKey: 'roleFan',
      icon: <User className="w-5 h-5" />,
      color: 'border-bg-border hover:border-accent-green/40',
    },
  ];

  const roleLabel = (id: DemoRole) => t(`roleLabel_${id}`, language);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col lg:flex-row transition-colors duration-200">

      {/* ── Left brand panel (desktop only) ────────────────────────────── */}
      <div className="hidden lg:flex lg:w-3/5 bg-[#1A52EE] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Pitch-mark background decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none pitch-bg" />

        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl pointer-events-none" />

        {/* Top logo */}
        <div className="z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Building2 className="w-5 h-5 text-white" aria-hidden />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">StadiumMind AI</span>
        </div>

        {/* Centre soccer ball — no watermark text */}
        <div className="z-10 flex-1 flex items-center justify-center">
          <SoccerBall className="h-[55%] max-h-[380px] w-auto animate-hero-float drop-shadow-[0_24px_60px_rgba(255,255,255,0.18)]" />
        </div>

        {/* Bottom venue info */}
        <div className="z-10">
          <h2 className="text-4xl font-extrabold tracking-tight font-display">NEW YORK</h2>
          <h2 className="text-4xl font-extrabold tracking-tight font-display text-white/60">NEW JERSEY</h2>
          <p className="text-xs text-white/50 mt-2 font-mono">STADIUM COMMAND &amp; CONTROL CENTER</p>
        </div>
      </div>

      {/* ── Mobile hero strip ──────────────────────────────────────────── */}
      <div className="lg:hidden w-full bg-[#1A52EE] relative overflow-hidden flex flex-col justify-center items-center py-8 px-6 text-white text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none pitch-bg" />
        <div className="z-10 flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">StadiumMind AI</span>
        </div>

        {/* Stadium silhouette — original graphic, no watermark text */}
        <div className="z-10 w-full max-w-xs mb-3">
          <StadiumSilhouette />
        </div>
        <div className="z-10">
          <h2 className="text-xl font-extrabold font-display leading-tight">NEW YORK · NEW JERSEY</h2>
          <p className="text-xs text-white/60 mt-1 font-mono">FIFA WORLD CUP 2026</p>
        </div>
      </div>

      {/* ── Right access panel ─────────────────────────────────────────── */}
      <div className="w-full lg:w-2/5 flex flex-col justify-between p-6 sm:p-8 lg:p-12 bg-bg-base">

        {/* Top controls: language + theme */}
        <div className="flex items-center justify-end gap-2 mb-6 lg:mb-0">
          {/* Language picker */}
          <div className="relative">
            <button
              id="login-btn-language"
              onClick={() => setShowLang(!showLang)}
              aria-label="Select language"
              aria-expanded={showLang}
              className="p-2.5 rounded-xl border border-bg-border bg-bg-surface hover:bg-bg-border/30 text-text-primary transition-all duration-200 shadow-sm flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <Globe className="w-4 h-4" />
              <span>{currentLang.flag} {currentLang.label}</span>
            </button>
            {showLang && (
              <div className="absolute right-0 top-full mt-2 glass-card !p-1.5 min-w-[160px] z-50 animate-slide-in-up">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    id={`login-lang-${lang.code}`}
                    onClick={() => { setLanguage(lang.code as Language); setShowLang(false); }}
                    className={cn(
                      'w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors',
                      language === lang.code
                        ? 'bg-accent-green/10 text-accent-green'
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                    )}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-bg-border bg-bg-surface hover:bg-bg-border/30 text-text-primary transition-all duration-200 shadow-sm flex items-center justify-center gap-2 text-xs font-semibold"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-accent-amber animate-spin-slow" />
                <span className="hidden sm:inline">{t('lightMode', language)}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-accent-blue" />
                <span className="hidden sm:inline">{t('darkMode', language)}</span>
              </>
            )}
          </button>
        </div>

        {/* Login form — centred vertically */}
        <div className="max-w-md w-full mx-auto my-auto py-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary font-display uppercase">
              {t('loginTitle', language)}
            </h2>
            <p className="text-text-secondary text-sm">
              {t('loginSubtitle', language)}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="live-dot" aria-hidden />
              <span className="text-xs text-accent-green font-semibold">{t('liveMode', language)}</span>
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">{t('selectRole', language)}</h3>
              <p className="text-xs text-text-muted mt-0.5">{t('selectRoleHint', language)}</p>
            </div>

            <div className="space-y-2 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1 no-scrollbar animate-fade-in-up" role="radiogroup" aria-label="Role selection">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  id={`role-${role.id}`}
                  role="radio"
                  aria-checked={selected === role.id}
                  onClick={() => setSelected(role.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left min-h-[52px] ${
                    selected === role.id
                      ? 'border-accent-green/80 bg-accent-green/5 text-text-primary shadow-sm'
                      : `border-bg-border bg-bg-card/40 text-text-secondary ${role.color}`
                  }`}
                >
                  <div className={selected === role.id ? 'text-accent-green' : 'text-text-muted'}>
                    {role.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{roleLabel(role.id)}</p>
                    <p className="text-xs text-text-muted mt-0.5 leading-snug truncate">{t(role.descKey, language)}</p>
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
              {loading ? t('enteringPortal', language) : `${t('enterAs', language)} ${roleLabel(selected)}`}
            </button>

            <p className="text-center text-[10px] text-text-muted font-mono leading-relaxed">
              {t('secureEnv', language)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 lg:mt-0 border-t border-bg-border/60 pt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-text-muted gap-2 font-mono">
          <span>FIFA World Cup 2026 Operations</span>
          <span>Smart Stadiums &amp; Operational Command</span>
        </div>
      </div>
    </div>
  );
}
