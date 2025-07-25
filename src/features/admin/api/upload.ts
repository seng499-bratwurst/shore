import { api } from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// API call function for uploading a file
const uploadFile = async (formData: FormData): Promise<number> => {
  const response = await api.post('files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('Upload response:', response);

  const parsed = z.number().parse(response);
  return parsed;
};

// Hook to upload a file
export const useUploadFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      // Refetch the file list after successful upload
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};