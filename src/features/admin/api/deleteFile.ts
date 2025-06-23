import { api } from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// Define the API response schema for file deletion
const deleteFileSchema = z.object({
  success: z.boolean(),
  error: z.string().nullable(),
  data: z.union([z.null(), z.object({}).optional()]), // Allow null, empty object, or undefined
});

// API call function for deleting a file
const deleteFile = async (fileId: number): Promise<void> => {
  const response = await api.delete(`files/${fileId}`);
  console.log('DELETE API Response:', response); // Log for debugging
  const parsed = deleteFileSchema.parse(response);
  if (!parsed.success) {
    throw new Error(parsed.error || 'Failed to delete file');
  }
};

// Hook to delete a file
export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      // Refetch the file list after successful deletion
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};