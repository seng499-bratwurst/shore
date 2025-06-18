import { useAuthStore } from '@/features/auth/stores/auth-store';
import { api } from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { AuthResponse } from '../types/auth';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginData = z.infer<typeof loginSchema>;

const _login = async (data: LoginData): Promise<AuthResponse> =>
  await api.post<LoginData, AuthResponse>('login', data);

export const useLogin = () => {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: _login,
    onSuccess: (data) => {
      if (data && data.jwt) {
        login(data.jwt);
      }
    },
  });
};
