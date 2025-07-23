import { api } from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { AuthResponse } from '../types/auth';

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
  oncToken: z.string(),
  name: z.string(),
});

export type SignUpData = z.infer<typeof signUpSchema>;

const signUp = async (data: SignUpData): Promise<AuthResponse> =>
  await api.post<SignUpData, AuthResponse>('register', data);

export const useSignUp = () => {
  return useMutation({
    mutationFn: signUp,
  });
};
