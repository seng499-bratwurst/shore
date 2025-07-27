'use client';

import { api } from '@/lib/axios';
import { create } from 'zustand';
import { Role, User } from '../types/auth';

type AuthState = {
  isLoggedIn: boolean;
  user: User;
  roles: Role[];
  isHydrating: boolean;
  sessionalKey: string;
};

type AuthStore = AuthState;

type CurrentUserResponse = {
  roles: Role[];
  user: User;
};

type SessionalKeyResponse = {
  sessionId: string;
};

const getCurrentUser = (): Promise<CurrentUserResponse> => api.get('/me');
const getSessionalKey = (): Promise<SessionalKeyResponse> => api.get('/sessional-keys');

export const useAuthStore = create<AuthStore>()((set) => {
  const initialState: AuthStore = {
    isLoggedIn: false,
    user: {} as User,
    roles: [],
    sessionalKey: '',
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
      getSessionalKey()
        .then(({ sessionId }) => {
          set({
            sessionalKey: sessionId,
            isLoggedIn: false,
            isHydrating: false,
          });
        })
        .catch(() => {
          set({
            isLoggedIn: false,
            isHydrating: false,
          });
        });
    });

  return { ...initialState };
});
