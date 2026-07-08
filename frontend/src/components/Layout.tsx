import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, MessageSquare, Globe,
  Activity, Menu, X, LogOut, Wifi, WifiOff
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../hooks/useAuth';
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

export function Layout({ children, wsStatus = 'disconnected' }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, sidebarOpen, toggleSidebar } = useAppStore();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    { label: t('dashboard', language), path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, id: 'nav-dashboard' },
    { label: t('crowdPrediction', language), path: '/crowd', icon: <Users className="w-4 h-4" />, id: 'nav-crowd' },
    { label: t('fanAssistant', language), path: '/assistant', icon: <MessageSquare className="w-4 h-4" />, id: 'nav-assistant' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-bg-border bg-bg-surface/50 backdrop-blur-xl transition-all duration-300 shrink-0',
          sidebarOpen ? 'w-56' : 'w-16'
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-bg-border">
          <div className="text-xl shrink-0">🏟️</div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-text-primary whitespace-nowrap">StadiumMind</p>
              <p className="text-xs text-accent-green whitespace-nowrap">AI</p>
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
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Connection status + user */}
        <div className="p-3 border-t border-bg-border space-y-2">
          {/* WS status */}
          <div className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs',
            wsStatus === 'connected' ? 'text-accent-green' : 'text-text-muted'
          )}>
            {wsStatus === 'connected'
              ? <Wifi className="w-3.5 h-3.5 shrink-0" aria-hidden />
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
