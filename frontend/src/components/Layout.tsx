import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, MessageSquare, Building2,
  Menu, X, LogOut, Wifi, WifiOff, Sun, Moon, Globe
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { useRole, ROLE_NAV } from '../lib/roles';
import type { ConnectionStatus } from '../hooks/useDashboardSocket';
import { t, LANGUAGES } from '../lib/i18n';
import { cn } from '../lib/utils';
import type { Language } from '../types';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  id: string;
}

interface LayoutProps {
  children: ReactNode;
  wsStatus?: ConnectionStatus;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',       path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, id: 'nav-dashboard' },
  { label: 'Crowd Prediction',path: '/crowd',     icon: <Users className="w-4 h-4" />,           id: 'nav-crowd' },
  { label: 'Fan Assistant',   path: '/assistant', icon: <MessageSquare className="w-4 h-4" />,   id: 'nav-assistant' },
];

export function Layout({ children, wsStatus = 'disconnected' }: LayoutProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { language, setLanguage, sidebarOpen, toggleSidebar, theme, toggleTheme } = useAppStore();
  const { user, logout } = useAuth();
  const role      = useRole();
  const [showLang, setShowLang] = useState(false);

  // Filter nav items by role permissions
  const allowedPaths = ROLE_NAV[role] ?? [];
  const navItems = ALL_NAV_ITEMS.filter((item) => allowedPaths.includes(item.path));

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-bg-border bg-bg-surface/80 backdrop-blur-xl transition-all duration-300 shrink-0 z-30',
          'bg-panel-depth',
          // On mobile: fixed drawer overlay; on lg+: always visible in the flow
          'fixed lg:relative inset-y-0 left-0',
          sidebarOpen ? 'w-56' : 'w-0 lg:w-16 overflow-hidden lg:overflow-visible'
        )}
        aria-label="Main navigation"
      >
        {/* Logo row — centered in collapsed mode, logo+text+X in expanded */}
        <div className={cn(
          'flex items-center h-16 px-3 border-b border-bg-border shrink-0',
          sidebarOpen ? 'gap-3' : 'justify-center'
        )}>
          {/* Building icon — always visible */}
          <div className="w-7 h-7 rounded-lg bg-accent-green/15 border border-accent-green/20 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-accent-green" aria-hidden />
          </div>
          {/* Text — only when expanded */}
          {sidebarOpen && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-display text-sm font-bold text-text-primary whitespace-nowrap leading-tight">StadiumMind</p>
              <p className="text-xs text-accent-green whitespace-nowrap font-medium">AI Operations</p>
            </div>
          )}
          {/* Toggle button — visible in expanded only; collapsed uses the nav icon below */}
          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Navigation links">
          {/* Expand button — shown as first icon in collapsed mode */}
          {!sidebarOpen && (
            <button
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="nav-item w-full justify-center px-0"
              title="Expand menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          {navItems.map((item) => (
            <button
              key={item.path}
              id={item.id}
              onClick={() => navigate(item.path)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              className={cn(
                'nav-item w-full text-left',
                !sidebarOpen && 'justify-center px-0',
                location.pathname === item.path && 'active'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{t(
                item.path === '/dashboard' ? 'dashboard'
                : item.path === '/crowd' ? 'crowdPrediction'
                : 'fanAssistant',
                language
              )}</span>}
            </button>
          ))}
        </nav>

        {/* Connection status + user */}
        <div className="p-3 border-t border-bg-border space-y-2">
          {/* Language selector */}
          <div className="relative">
            <button
              id="staff-btn-language"
              onClick={() => setShowLang(!showLang)}
              aria-label="Select language"
              aria-expanded={showLang}
              className={cn(
                "flex items-center gap-3 w-full px-2 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-150 text-left",
                !sidebarOpen && "justify-center"
              )}
              title="Change language"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden />
              {sidebarOpen && <span>{LANGUAGES.find(l => l.code === language)?.flag} {LANGUAGES.find(l => l.code === language)?.label}</span>}
            </button>
            {showLang && (
              <div className={cn(
                "absolute glass-card !p-1.5 min-w-[150px] z-50 animate-slide-in-up",
                sidebarOpen ? "left-0 bottom-full mb-1" : "left-full ml-2 bottom-0"
              )}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    id={`staff-lang-${lang.code}`}
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

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center gap-3 w-full px-2 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-150 text-left",
              !sidebarOpen && "justify-center"
            )}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-accent-amber shrink-0 animate-spin-slow" aria-hidden />
                {sidebarOpen && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-accent-blue shrink-0" aria-hidden />
                {sidebarOpen && <span>Dark Mode</span>}
              </>
            )}
          </button>

          {/* WS status */}
          <div className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs',
            wsStatus === 'connected' ? 'text-accent-green' : 'text-text-muted'
          )}>
            {wsStatus === 'connected'
              ? <Wifi    className="w-3.5 h-3.5 shrink-0" aria-hidden />
              : <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden />
            }
            {sidebarOpen && (
              <span>{wsStatus === 'connected' ? t('connected', language) : wsStatus === 'connecting' ? t('connecting', language) : t('disconnected', language)}</span>
            )}
          </div>

          {/* User + logout */}
          {user && (
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center text-xs font-bold text-accent-green shrink-0">
                {(user.display_name ?? user.email)[0].toUpperCase()}
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{user.display_name ?? user.email}</p>
                    <p className="text-xs text-text-muted capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    aria-label={t('logout', language)}
                    className="p-1 rounded-lg hover:bg-white/5 text-text-muted hover:text-accent-red transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main content — offset to account for fixed sidebar on desktop */}
      <main
        className={cn(
          'flex-1 overflow-y-auto flex flex-col transition-all duration-300',
          // On desktop: push content right by sidebar width
          sidebarOpen ? 'lg:ml-56' : 'lg:ml-16'
        )}
        id="main-content"
        tabIndex={-1}
      >
        {/* Mobile top bar with hamburger */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-bg-border bg-bg-surface/80 backdrop-blur-xl shrink-0">
          <button
            onClick={toggleSidebar}
            aria-label="Open navigation"
            className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-6 h-6 rounded-lg bg-accent-green/15 border border-accent-green/20 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-accent-green" aria-hidden />
          </div>
          <p className="text-sm font-bold text-text-primary">StadiumMind <span className="text-accent-green">AI</span></p>
        </div>
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
