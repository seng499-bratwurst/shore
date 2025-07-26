import { api } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// Define the individual file metric schema
const fileMetricSchema = z.object({
  fileId: z.number(),
  upVotes: z.number(),
  downVotes: z.number(),
  usages: z.number(),
});

// Define the API response schema
const fileMetricsResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().nullable(),
  data: z.array(fileMetricSchema),
});

// Define the FileMetric type
export type FileMetric = z.infer<typeof fileMetricSchema>;

// API call function to fetch file metrics
const fetchFileMetrics = async (): Promise<FileMetric[]> => {
  const response = await api.get('metrics');
  const parsed = z.array(fileMetricSchema).parse(response);
  console.log('Metrics Response', parsed);
  return parsed;
};

// Hook to fetch file metrics
export const useFileMetrics = () => {
  return useQuery<FileMetric[], Error>({
    queryKey: ['fileMetrics'],
    queryFn: fetchFileMetrics,
  });
};