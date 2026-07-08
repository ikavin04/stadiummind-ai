/**
 * Mock auth hook — structured so real Firebase can be dropped in without
 * touching any other component. Just swap the implementation of this hook.
 *
 * Currently: demo role-selector login that calls /api/auth/demo-login.
 * Firebase swap: replace demoLogin calls with signInWithGoogle/signInWithEmailAndPassword,
 * get the ID token from auth.currentUser.getIdToken(), call /api/auth/sync.
 */
import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { demoLogin, setAuthToken } from '../lib/api';

export type DemoRole = 'fan' | 'manager' | 'security' | 'medical' | 'volunteer';

export function useAuth() {
  const { user, setUser, setAuthToken: storeSetToken } = useAppStore();

  const loginAsDemo = useCallback(async (role: DemoRole) => {
    try {
      const data = await demoLogin(role);
      // In real Firebase flow: token = await firebaseUser.getIdToken()
      const token = data.demo_token ?? 'demo-token';
      setAuthToken(token);       // inject into api.ts fetch wrapper
      storeSetToken(token);      // persist in Zustand
      setUser(data);
      return data;
    } catch (err) {
      console.error('Demo login failed:', err);
      throw err;
    }
  }, [setUser, storeSetToken]);

  const logout = useCallback(() => {
    setAuthToken(null);
    storeSetToken(null);
    setUser(null);
    // Firebase swap: await auth.signOut()
  }, [setUser, storeSetToken]);

  return {
    user,
    isAuthenticated: !!user,
    loginAsDemo,
    logout,
  };
}
