import { api } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// Define the individual file schema
const fileItemSchema = z.object({
  id: z.number(),
  fileName: z.string(),
  createdAt: z.string(),
  uploadedBy: z.string(),
});

// Define the API response schema
export const fileSchema = z.object({
  success: z.boolean(),
  error: z.string().nullable(),
  data: z.array(fileItemSchema),
});

// Define the File type
export type File = z.infer<typeof fileItemSchema>;

// Define the Document type for the table
export type Document = {
  name: string;
  uploadDate: string;
  positiveRatings: number;
  negativeRatings: number;
  queries: number;
};

// API call function
const fetchFiles = async (): Promise<File[]> => {
  const response = await api.get('files');
  console.log('API Response:', response); // Keep for debugging
  const parsed = fileSchema.parse(response);
  if (!parsed.success) {
    throw new Error(parsed.error || 'Failed to fetch files');
  }
  return parsed.data;
};

// Hook to fetch files
export const useFiles = () => {
  return useQuery<File[], Error>({
    queryKey: ['files'],
    queryFn: fetchFiles,
  });
};