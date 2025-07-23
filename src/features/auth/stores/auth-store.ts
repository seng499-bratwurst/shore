'use client';

import { api } from '@/lib/axios';
import { create } from 'zustand';
import { Role, User } from '../types/auth';

type AuthState = {
  isLoggedIn: boolean;
  user: User;
  roles: Role[];
  isHydrating: boolean;
};

type AuthStore = AuthState;

type CurrentUserResponse = {
  roles: Role[];
  user: User;
};

const getCurrentUser = (): Promise<CurrentUserResponse> => api.get('/me');

export const useAuthStore = create<AuthStore>()((set) => {
  const initialState: AuthStore = {
    isLoggedIn: false,
    user: {} as User,
    roles: [],
    isHydrating: true,
  };

  // Immediately hydrate the store
  getCurrentUser()
    .then((data) => {
      set({
        user: data.user,
        roles: data.roles,
        isLoggedIn: true,
        isHydrating: false,
      });
    })
    .catch(() => {
      set({
        user: {} as User,
        roles: [],
        isLoggedIn: false,
        isHydrating: false,
      });
    });

  return { ...initialState };
});
