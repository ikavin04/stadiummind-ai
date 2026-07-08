import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, Language } from '../types';

interface AppState {
  // Auth
  user: AuthUser | null;
  authToken: string | null;
  setUser: (user: AuthUser | null) => void;
  setAuthToken: (token: string | null) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      authToken: null,
      setUser: (user) => set({ user }),
      setAuthToken: (authToken) => set({ authToken }),

      language: 'en',
      setLanguage: (language) => set({ language }),

      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'stadiummind-app',
      partialize: (state) => ({
        language: state.language,
        user: state.user,
        authToken: state.authToken,
      }),
    }
  )
);
