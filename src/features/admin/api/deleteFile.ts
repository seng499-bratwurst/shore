import { api } from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// API call function for deleting a file
const deleteFile = async (fileId: number): Promise<void> => {
  await api.delete(`files/${fileId}`);

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