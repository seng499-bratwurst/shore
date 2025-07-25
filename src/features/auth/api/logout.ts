import { api } from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';
import { User } from '../types/auth';

const logout = async (): Promise<void> => api.post('/logout');

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      useAuthStore.setState({
        user: {} as User,
        roles: [],
        isLoggedIn: false,
        isHydrating: false,
      });
    },
  });
};
