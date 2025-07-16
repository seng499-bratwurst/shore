import { api } from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

export const passwordSchema = z.object({
  oldPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPasswordConfirmed: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.newPasswordConfirmed, {
  message: "Passwords don't match",
  path: ['newPasswordConfirmed'],
});

export type PasswordUpdateData = z.infer<typeof passwordSchema>;

const updatePassword = async (data: PasswordUpdateData): Promise<{ message: string }> =>
  await api.patch<PasswordUpdateData, { data: { message: string } }>('password', data).then((res) => res.data);

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: updatePassword,
  });
};
