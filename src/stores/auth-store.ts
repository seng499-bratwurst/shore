'use client';

import { create } from 'zustand';

type AuthState = {
  token: string | null;
  isLoggedIn: boolean;
};

type AuthActions = {
  login: (token: string) => void;
  logout: () => void;
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set) => ({
  token: null,
  isLoggedIn: false,
  hydrated: false,
  login: (token: string) => set(() => ({ token, isLoggedIn: true, hydrated: true })),
  logout: () => set(() => ({ token: null, isLoggedIn: false, hydrated: true })),
}));
