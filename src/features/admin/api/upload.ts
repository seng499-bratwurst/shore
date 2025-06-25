import { api } from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// Define the API response schema for file upload
const uploadFileSchema = z.object({
  success: z.boolean(),
  error: z.string().nullable(),
  data: z.number(), // File ID
});

// API call function for uploading a file
const uploadFile = async (file: File): Promise<number> => {
  const formData = new FormData();
  formData.append('file', file);

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