'use client';

import { Button } from '@/components/ui/button/button';
import { Checkbox } from '@/components/ui/checkbox/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';
import { useState } from 'react';
import { Input } from '@/components/ui/input/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs';
import { useDeleteFile } from '@/features/admin/api/deleteFile';
import { Document, useFiles } from '@/features/admin/api/file';
import { useUploadFile } from '@/features/admin/api/upload';
import { useFileMetrics, TopicMetric, fetchMultipleTopicMetrics, fetchTopicMetrics } from '@/features/admin/api/filemetrics';
import { AxiosError } from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import { useQuery } from '@tanstack/react-query';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { ScrollArea } from '@/components/ui/scroll-area/scroll-area';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminPage() {
  const { data: files = [], isLoading: isFilesLoading, error: filesError, refetch: refetchFiles } = useFiles();
  const { data: metrics = [], isLoading: isMetricsLoading, error: metricsError, refetch: refetchMetrics } = useFileMetrics();
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteFile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [sourceLink, setSourceLink] = useState<string>('');
  const [sourceType, setSourceType] = useState<string>('');
  const [topicSearch, setTopicSearch] = useState<string>('');
  const [searchedTopics, setSearchedTopics] = useState<TopicMetric[]>([]);

  // Default topics for metrics fetching
  const defaultTopics = ['location', 'pH', 'conductivity','temperature', 'turbidity', 'pressure', 'CO2'];

  // Fetch default topic metrics using the API
  const { data: defaultTopicMetrics = [], isLoading: isTopicsLoading, error: topicsError, refetch: refetchTopics } = useQuery<TopicMetric[], Error>({
    queryKey: ['topicMetrics', defaultTopics],
    queryFn: () => fetchMultipleTopicMetrics(defaultTopics),
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const topics = [...searchedTopics, ...defaultTopicMetrics];

  // Handle topic search
  const handleTopicSearch = async () => {
    if (!topicSearch) return;
    try {
      const result = await fetchTopicMetrics(topicSearch);
      setSearchedTopics((prev) => {
        const existing = prev.find((t) => t.topic === result.topic);
        if (existing) return prev; // Avoid duplicates
        return [result, ...prev]; // Add new topic to the top
      });
      setTopicSearch('');
    } catch (error) {
      console.error('Error searching topic:', error);
    }
  };

  // Transform API data to match Document type for the table
  const documents: Document[] = files.map((file) => {
    const fileMetric = metrics.find((metric) => metric.fileId === file.id) || {
      upVotes: 0,
      downVotes: 0,
      usages: 0,
    };
    return {
      id: file.id,
      name: file.name,
      uploadDate: new Date(file.createdAt).toLocaleDateString(),
      sourceLink: file.sourceLink || '',
      sourceType: file.sourceType || '',
      upVotes: fileMetric.upVotes,
      downVotes: fileMetric.downVotes,
      usages: fileMetric.usages,
    };
  });

  // Handle file selection for upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Handle file upload and close dialog
  const handleUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('File', selectedFile);
      formData.append('SourceLink', sourceLink);
      formData.append('SourceType', sourceType);
      
      uploadFileMutation.mutate(formData, {
        onSuccess: () => {
          setSelectedFile(null);
          setSourceLink('');
          setSourceType('');
          refetchFiles();
        },
        onError: (error) => {
          console.error('Upload error:', error.message);
        },
      });
    }
  };

  // Handle checkbox toggle for file selection
  const handleCheckboxChange = (fileId: number, checked: boolean) => {
    setSelectedFileIds((prev) =>
      checked ? [...prev, fileId] : prev.filter((id) => id !== fileId)
    );
  };

  // Handle delete button click
  const handleDelete = () => {
    selectedFileIds.forEach((fileId) => {
      deleteFileMutation.mutate(fileId, {
        onSuccess: () => {
          setSelectedFileIds((prev) => prev.filter((id) => id !== fileId));
          refetchFiles();
        },
        onError: (error) => {
          console.error('Delete error:', error.message);
        },
      });
    });
  };

  // Manual refetch for all APIs
  const handleRefetchAll = () => {
    refetchFiles();
    refetchMetrics();
    refetchTopics();
  };

  // Bar chart data
  const barChartData = {
    labels: topics.map((topic) => topic.topic),
    datasets: [
      {
        label: 'Query Count',
        data: topics.map((topic) => topic.queryCount),
        backgroundColor: '#a045ce',
      },
    ],
  };

  if (isFilesLoading || isMetricsLoading || isTopicsLoading) {
    return (
      <div className="px-14">
        <ScrollArea className="h-[calc(100vh-2rem)]">
          <div>Loading...</div>
        </ScrollArea>
      </div>
    );
  }

  if (filesError || metricsError || topicsError) {
    let errorMessage = 'Error loading data';
    if (filesError) {
      errorMessage = 'Error loading files: ' + filesError.message;
      if ((filesError as AxiosError)?.response?.status === 401) {
        errorMessage = 'You must be logged in as an admin user to view the Admin Page.';
      } else if ((filesError as AxiosError)?.response?.status === 403) {
        errorMessage = 'You must be an Admin User to view the Administration Page.';
      }
    } else if (metricsError) {
      errorMessage = 'Error loading metrics: ' + metricsError.message;
    } else if (topicsError) {
      errorMessage = 'Error loading topic metrics: ' + topicsError.message;
    }

    return (
      <div className="px-14">
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <Button variant="outline" onClick={handleRefetchAll}>
            Try Again
          </Button>
      </div>
    );
  }

  return (
    <div className="px-14">
      <ScrollArea className="h-[calc(100vh-2rem)]">
        <Tabs defaultValue="docs" className="w-full">
          <div className="flex justify-end pt-4">
            <TabsList className="dark:bg-primary-900 bg-neutral-200">
              <TabsTrigger value="docs">Documents</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="docs">
            <div className="shadow rounded p-6 overflow-y-auto max-h-[350px]">
              <h2 className="text-xl font-semibold mb-2">Document Management</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead className="text-center">Source Type</TableHead>
                    <TableHead className="text-center">Positive Rate</TableHead>
                    <TableHead className="text-center">Query Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Checkbox
                          className="border border-black"
                          checked={selectedFileIds.includes(doc.id)}
                          onCheckedChange={(checked) => handleCheckboxChange(doc.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        {doc.sourceLink ? (
                          <a
                            href={doc.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {doc.name}
                          </a>
                        ) : (
                          doc.name
                        )}
                      </TableCell>
                      <TableCell className="text-center">{doc.sourceType}</TableCell>
                      <TableCell
                        className={`text-center ${
                          doc.upVotes / (doc.usages) < 0.5
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {(
                          (100 * doc.upVotes) / (doc.usages) || 0
                        ).toFixed(2)}
                        %
                      </TableCell>
                      <TableCell className="text-center">{doc.usages}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-4 space-x-2 dark:text-neutral-50">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Upload</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>
                      Select a file to upload to the document management system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-neutral-400 p-8 text-center mb-4 rounded cursor-pointer hover:bg-neutral-100 transition-colors">
                      <label htmlFor="file-upload">
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".md,.txt,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {selectedFile ? (
                          <p className="text-sm text-neutral-800">{selectedFile.name}</p>
                        ) : (
                          <>
                            <p>Choose a file or drag and drop it here</p>
                            <p className="text-sm text-neutral-500 mt-2">
                              MD, TXT, and PDF formats, maximum size of 50MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    <div>
                      <label htmlFor="source-link" className="block text-sm font-medium">
                        Source Link
                      </label>
                      <Input
                        id="source-link"
                        type="text"
                        value={sourceLink}
                        onChange={(e) => setSourceLink(e.target.value)}
                        placeholder="Enter source link"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="source-type" className="block text-sm font-medium">
                        Source Type
                      </label>
                      <Select value={sourceType} onValueChange={setSourceType}>
                        <SelectTrigger id="source-type" className="mt-1">
                          <SelectValue placeholder="Select source type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cambridge_bay_papers">Cambridge Bay Papers</SelectItem>
                          <SelectItem value="cambridge_bay_web_articles">
                            Cambridge Bay Web Articles
                          </SelectItem>
                          <SelectItem value="confluence_json">Confluence JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={!selectedFile || !sourceType || uploadFileMutation.isPending}
                      >
                        {uploadFileMutation.isPending ? 'Uploading...' : 'Upload'}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                disabled={selectedFileIds.length === 0 || deleteFileMutation.isPending}
                onClick={handleDelete}
                className="px-4"
              >
                {deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="topics">
            <div className="shadow rounded p-6">
              <h2 className="text-xl font-semibold mb-4">Topics</h2>
              <div className="flex flex-row gap-6">
                <div className="flex-shrink-0 w-[300px]">
                  <div className="mb-4">
                    <h4 className="text-m font-medium mb-2">Search Topics</h4>
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        value={topicSearch}
                        onChange={(e) => setTopicSearch(e.target.value)}
                        placeholder="Search for a topic"
                        className="flex-grow"
                      />
                      <Button onClick={handleTopicSearch} disabled={!topicSearch}>
                        Search
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-m font-medium mb-2 pt-6">Query Count Distribution</h4>
                    <div className="max-w-[300px] h-[200px]">
                      <Bar
                        data={barChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: { display: true, text: 'Query Count' },
                            },
                            x: {
                              title: { display: true, text: 'Topics' },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto max-h-[350px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead className="text-center">Positive Rate</TableHead>
                        <TableHead className="text-center">Query Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topics.map((topic) => (
                        <TableRow key={topic.topic}>
                          <TableCell>{topic.topic}</TableCell>
                          <TableCell
                            className={`text-center ${
                              topic.fileUpVotes / (topic.queryCount) < 0.5
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            {(
                              (100 * topic.fileUpVotes) / (topic.queryCount) || 0
                            ).toFixed(2)}
                            %
                          </TableCell>
                          <TableCell className="text-center">{topic.queryCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}