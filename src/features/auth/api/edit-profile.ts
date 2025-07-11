import { useAuthStore } from '@/features/auth/stores/auth-store';
import { api } from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

export const editProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  oncToken: z.string().optional(),
});

export type EditProfileData = z.infer<typeof editProfileSchema>;

const editProfile = async (data: EditProfileData): Promise<{ name: string; email: string; ONCApiToken: string }> =>
  await api.patch<EditProfileData, { data: { name: string; email: string; ONCApiToken: string } }>('users', data).then((res) => res.data);

export const useEditProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};