import { useAuthStore } from '@/features/auth/stores/auth-store';
import { api } from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

const getProfile = async (): Promise<{ name: string; email: string; ONCApiToken: string }> => {

    const response = await api.get('me');
    console.log('API Response:', response);

    const parsed = response as any; 
    const user = parsed.user;

    console.log("name", parsed.user.name);
    return {
    name: user.name,
    email: user.email,
    ONCApiToken: user.ONCApiToken || null
  };
};

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
    select: (data) => ({
      name: data.name,
      email: data.email,
      oncToken: data.ONCApiToken,
    }),
    
  });
};