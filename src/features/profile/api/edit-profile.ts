import { api } from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

export const editProfileSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    oncToken: z.string().optional(),
    oldPassword: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 6, {
        message: 'Password must be at least 6 characters',
      }),
    newPassword: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 6, {
        message: 'Password must be at least 6 characters',
      }),
    newPasswordConfirmed: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 6, {
        message: 'Password must be at least 6 characters',
      }),
  })
  .refine((data) => !data.newPassword || data.newPassword === data.newPasswordConfirmed, {
    message: "Passwords don't match",
    path: ['newPasswordConfirmed'],
  });

export type EditProfileData = z.infer<typeof editProfileSchema>;

const editProfile = async (
  data: EditProfileData
): Promise<{ name: string; email: string; ONCApiToken: string }> =>
  await api
    .patch<EditProfileData, { data: { name: string; email: string; ONCApiToken: string } }>(
      'users',
      data
    )
    .then((res) => res.data);

export const useEditProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

const getProfile = async (): Promise<{ name: string; email: string; ONCApiToken: string; role: string }> => {
  const response = await api.get('me');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = response as any;  
  const user = parsed.user;
  const roles = parsed.roles || [];
  const userRole = roles.length > 0 ? roles[0] : 'User';
    
  return {
    name: user.name,
    email: user.email,
    ONCApiToken: user.ONCApiToken || null,
    role: userRole,
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
      role: data.role,
    }),
  });
};
