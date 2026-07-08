import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store/useAppStore';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CrowdDetail } from './pages/CrowdDetail';
import { FanAssistant } from './pages/FanAssistant';
import { setAuthToken } from './lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 2,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authToken } = useAppStore();

  // Restore token into api.ts on re-hydrate
  if (authToken) setAuthToken(authToken);

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/crowd"
            element={<ProtectedRoute><CrowdDetail /></ProtectedRoute>}
          />
          <Route
            path="/crowd/:zoneId"
            element={<ProtectedRoute><CrowdDetail /></ProtectedRoute>}
          />
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
