import { api } from '@/lib/axios';
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useAuthStore } from '../stores/auth-store';
import { AuthResponse } from '../types/auth';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginData = z.infer<typeof loginSchema>;

const _login = async (data: LoginData): Promise<AuthResponse> =>
  await api.post<LoginData, AuthResponse>('login', data);

export const useLogin = (options: UseMutationOptions<AuthResponse, Error, LoginData> = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: _login,
    onSuccess: (data, ...rest) => {
      options?.onSuccess?.(data, ...rest);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      useAuthStore.setState({
        user: data.user,
        roles: data.roles,
        isLoggedIn: true,
        isHydrating: false,
      });
    },
  });
};
