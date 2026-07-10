import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store/useAppStore';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CrowdDetail } from './pages/CrowdDetail';
import { FanAssistant } from './pages/FanAssistant';
import { FanHub } from './pages/FanHub';
import { setAuthToken } from './lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 2,
    },
  },
});

/** Redirects unauthenticated users to /login. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authToken } = useAppStore();

  // Restore token into api.ts on re-hydrate
  if (authToken) setAuthToken(authToken);

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * Redirects the 'fan' role away from staff-only pages.
 * Fans land on /fan-hub instead of the operational dashboard.
 */
function NonFanRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAppStore();
  if (user?.role === 'fan') return <Navigate to="/fan-hub" replace />;
  return <>{children}</>;
}

/**
 * Redirects non-fan roles away from /fan-hub.
 * The Fan Hub is fan-exclusive — staff roles stay on the ops dashboard.
 */
function FanOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAppStore();
  if (user && user.role !== 'fan') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Staff-only pages — fans redirected to /fan-hub */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <NonFanRoute><Dashboard /></NonFanRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/crowd"
            element={
              <ProtectedRoute>
                <NonFanRoute><CrowdDetail /></NonFanRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/crowd/:zoneId"
            element={
              <ProtectedRoute>
                <NonFanRoute><CrowdDetail /></NonFanRoute>
              </ProtectedRoute>
            }
          />

          {/* Fan-exclusive page — non-fan roles redirected to /dashboard */}
          <Route
            path="/fan-hub"
            element={
              <ProtectedRoute>
                <FanOnlyRoute><FanHub /></FanOnlyRoute>
              </ProtectedRoute>
            }
          />

          {/* Shared — all authenticated roles */}
          <Route
            path="/assistant"
            element={<ProtectedRoute><FanAssistant /></ProtectedRoute>}
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
