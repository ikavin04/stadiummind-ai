import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, MessageSquare, Building2,
  Menu, X, LogOut, Wifi, WifiOff, Sun, Moon
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { useRole, ROLE_NAV } from '../lib/roles';
import type { ConnectionStatus } from '../hooks/useDashboardSocket';
import { t } from '../lib/i18n';
import { cn } from '../lib/utils';

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
  const { language, sidebarOpen, toggleSidebar, theme, toggleTheme } = useAppStore();
  const { user, logout } = useAuth();
  const role      = useRole();

  // Filter nav items by role permissions
  const allowedPaths = ROLE_NAV[role] ?? [];
  const navItems = ALL_NAV_ITEMS.filter((item) => allowedPaths.includes(item.path));

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-bg-border bg-bg-surface/50 backdrop-blur-xl transition-all duration-300 shrink-0',
          'bg-panel-depth',
          sidebarOpen ? 'w-56' : 'w-16'
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-bg-border">
          <div className="w-7 h-7 rounded-lg bg-accent-green/15 border border-accent-green/20 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-accent-green" aria-hidden />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-display text-sm font-bold text-text-primary whitespace-nowrap leading-tight">StadiumMind</p>
              <p className="text-xs text-accent-green whitespace-nowrap font-medium">AI Operations</p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="ml-auto p-1 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Navigation links">
          {navItems.map((item) => (
            <button
              key={item.path}
              id={item.id}
              onClick={() => navigate(item.path)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              className={cn(
                'nav-item w-full text-left',
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto" id="main-content" tabIndex={-1}>
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
