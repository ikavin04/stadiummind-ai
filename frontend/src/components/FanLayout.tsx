/**
 * FanLayout — Top-navigation layout for fan-facing pages.
 * Replaces the operational sidebar with a clean top bar so the fan
 * experience feels like a consumer product, not a back-office tool.
 */
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, MessageSquare, LogOut, Globe, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { LANGUAGES } from '../lib/i18n';
import { cn } from '../lib/utils';
import type { Language } from '../types';
import { useState } from 'react';

interface FanLayoutProps {
  children: ReactNode;
}

export function FanLayout({ children }: FanLayoutProps) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { language, setLanguage, theme, toggleTheme } = useAppStore();
  const { user, logout } = useAuth();
  const [showLang, setShowLang] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === language)!;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* ── Top nav ── */}
      <header className="shrink-0 border-b border-bg-border bg-bg-surface/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/fan-hub')}
            className="flex items-center gap-2 shrink-0 group"
            aria-label="StadiumMind home"
          >
            <div className="w-7 h-7 rounded-lg bg-accent-green/15 border border-accent-green/20 flex items-center justify-center group-hover:bg-accent-green/25 transition-colors">
              <Building2 className="w-4 h-4 text-accent-green" aria-hidden />
            </div>
            <span className="text-display text-sm font-bold text-text-primary hidden sm:block">
              Stadium<span className="text-accent-green">Mind</span>
            </span>
          </button>

          {/* Nav links */}
          <nav className="flex items-center gap-1 ml-4" aria-label="Fan navigation">
            <button
              id="fan-nav-hub"
              onClick={() => navigate('/fan-hub')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                location.pathname === '/fan-hub'
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
            >
              Fan Hub
            </button>
            <button
              id="fan-nav-assistant"
              onClick={() => navigate('/assistant')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                location.pathname === '/assistant'
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden />
              AI Assistant
            </button>
          </nav>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-accent-amber animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-accent-blue" />
              )}
            </button>

            {/* Language selector */}
            <div className="relative">
              <button
                id="fan-btn-language"
                onClick={() => setShowLang(!showLang)}
                aria-label="Select language"
                aria-expanded={showLang}
                className="btn-ghost !px-2.5 !py-1.5 flex items-center gap-1.5 text-xs"
              >
                <Globe className="w-3.5 h-3.5" aria-hidden />
                <span>{currentLang.flag} {currentLang.label}</span>
              </button>
              {showLang && (
                <div className="absolute right-0 top-full mt-2 glass-card !p-1.5 min-w-[160px] z-50 animate-slide-in-up">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      id={`fan-lang-${lang.code}`}
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

            {/* User / logout */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center text-xs font-bold text-accent-green shrink-0">
                  {(user.display_name ?? user.email)[0].toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-accent-red transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
