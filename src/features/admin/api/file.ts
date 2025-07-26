import { api } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// Define the individual file schema
const fileItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.string(),
  uploadedBy: z.string().optional(),
  sourceLink: z.string().optional(),
  sourceType: z.string().optional(),
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
  id: number;
  name: string;
  sourceLink: string;
  sourceType: string;
  uploadDate: string;
  upVotes: number;
  downVotes: number;
  usages: number;
};

// API call function
const fetchFiles = async (): Promise<File[]> => {
  const response = await api.get('files');
  console.log('API Response :', response);
  
  const parsed = z.array(fileItemSchema).parse(response);
  return parsed;
};

// Hook to fetch files
export const useFiles = () => {
  return useQuery<File[], Error>({
    queryKey: ['files'],
    queryFn: fetchFiles,
  });
};