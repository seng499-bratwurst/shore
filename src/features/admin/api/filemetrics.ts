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

// Define the individual topic metric schema
const topicMetricSchema = z.object({
  topic: z.string(),
  fileUpVotes: z.number(),
  fileDownVotes: z.number(),
  queryCount: z.number(),
});

export type FileMetric = z.infer<typeof fileMetricSchema>;
export type TopicMetric = z.infer<typeof topicMetricSchema>;

// API call function to fetch file metrics
export const fetchFileMetrics = async (): Promise<FileMetric[]> => {
  const response = await api.get('metrics');
  const parsed = z.array(fileMetricSchema).parse(response);
  console.log('Metrics:', parsed);
  return parsed;
};

// API call function to fetch topic metrics
export const fetchTopicMetrics = async (search: string): Promise<TopicMetric> => {
  if (!search) {
    throw new Error('Search term cannot be empty');
  }
  const response = await api.get(`metrics/topic?search=${encodeURIComponent(search)}`);
  const parsed = (topicMetricSchema).parse(response);
  console.log("Topics:", parsed)

  return parsed;
};

// Helper function to fetch multiple topic metrics
export const fetchMultipleTopicMetrics = async (topics: string[]): Promise<TopicMetric[]> => {
  const results = await Promise.all(
    topics.map(async (topic) => {
      try {
        return await fetchTopicMetrics(topic);
      } catch (error) {
        console.error(`Error fetching metrics for topic "${topic}":`, error);
        return { topic, fileUpVotes: 0, fileDownVotes: 0, queryCount: 0 };
      }
    })
  );
  return results;
};

// Hook to fetch file metrics
export const useFileMetrics = () => {
  return useQuery<FileMetric[], Error>({
    queryKey: ['fileMetrics'],
    queryFn: fetchFileMetrics,
  });
};