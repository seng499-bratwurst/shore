import { api } from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

export const UserRoleSchema = z.enum(["User", "Admin"])

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    roles: z.array(UserRoleSchema),
})

export type User = z.infer<typeof UserSchema>;

const userListQueryKey = ["user-list"]

const fetchUsers = async (): Promise<User[]> => {
    const response = await api.get("admin/user-list");
    return z.array(UserSchema).parse(response);
}

export const useUserList = () => {
    return useQuery<User[], Error>({
        queryKey: userListQueryKey,
        queryFn: fetchUsers,
    })
}

export const UserRoleUpdateSchema = z.object({
    id: z.string(),
    role: UserRoleSchema,
})

export type UserRoleUpdate = z.infer<typeof UserRoleUpdateSchema>

const updateUserRole = async (userRoleUpdate: UserRoleUpdate) => {
    const payload = { newRole: userRoleUpdate.role };
    await api.patch(`admin/users/${userRoleUpdate.id}/role`, payload);
}

const updateUserRoles = async (userRoleUpdates: UserRoleUpdate[]): Promise<{ userId: string; success: boolean }[]> => {
    const promises = userRoleUpdates.map(async (update) => {
        try {
            await updateUserRole(update);
            return update.id;
        } catch (error) {
            console.error(`Failed to update role for user ${update.id}:`, error);
            throw { userId: update.id, error };
        }
    });

    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return { userId: result.value, success: true };
        } else {
            const failedUserId = result.reason.userId || userRoleUpdates[index]?.id || 'unknown';
            return { userId: failedUserId, success: false };
        }
    });
}

export const useUpdateUserRoles = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateUserRoles,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userListQueryKey });
        },
    });
}
