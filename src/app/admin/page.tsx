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
import { dummyTopics, Topic } from '@/features/admin/data/topicsDummyData';
import { AxiosError } from 'axios';

export default function AdminPage() {
  const { data: files = [], isLoading, error, refetch } = useFiles();
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteFile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);

  // Transform API data to match Document type for the table
  const documents: Document[] = files.map((file) => ({
    id: file.id,
    name: file.fileName,
    uploadDate: new Date(file.createdAt).toLocaleDateString(),
    positiveRatings: 0, // Placeholder: Update with actual data if available
    negativeRatings: 0, // Placeholder: Update with actual data if available
    queries: 0, // Placeholder: Update with actual data if available
  }));

  // Dummy Data (For Topics Table)
  const topics: Topic[] = dummyTopics;

  // Handle file selection for upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Handle file upload and close dialog
  const handleUpload = () => {
    if (selectedFile) {
      uploadFileMutation.mutate(selectedFile, {
        onSuccess: () => {
          setSelectedFile(null); // Reset file input
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
        },
        onError: (error) => {
          console.error('Delete error:', error.message);
        },
      });
    });
  };

  if (isLoading) {
    return <div className="px-14">Loading...</div>;
  }

  if (error) {
    let errorMessage = 'Error loading files: ' + error.message;

    if ((error as AxiosError)?.response?.status === 401) {
      errorMessage = 'You must be logged in as an admin user to view the Admin Page.';
    } else if ((error as AxiosError)?.response?.status === 403) {
      errorMessage = 'You must be an Admin User to view the Administration Page.';
    }

    return (
      <div className="px-14">
        <p className="mb-4 text-red-600">{errorMessage}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="px-14 ">
      <Tabs defaultValue="docs" className="w-full">
        <div className="flex justify-end pt-8">
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
                  <TableHead className="text-center">Positive Rate</TableHead>
                  <TableHead className="text-center">Query Count</TableHead>
                  <TableHead className="text-center">Upload Date</TableHead>
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
                    <TableCell>{doc.name}</TableCell>
                    <TableCell
                      className={`text-center ${
                        doc.positiveRatings / (doc.positiveRatings + doc.negativeRatings) < 0.5
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {(
                        (100 * doc.positiveRatings) / (doc.positiveRatings + doc.negativeRatings) ||
                        0
                      ).toFixed(2)}
                      %
                    </TableCell>
                    <TableCell className="text-center">{doc.queries}</TableCell>
                    <TableCell className="text-center">{doc.uploadDate}</TableCell>
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
                <label
                  htmlFor="file-upload"
                  className="border-2 border-dashed border-neutral-400 p-8 text-center mb-4 rounded cursor-pointer hover:bg-neutral-100 transition-colors"
                >
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
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={!selectedFile || uploadFileMutation.isPending}
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
          <div className="shadow rounded p-6 overflow-y-auto max-h-[350px]">
            <h2 className="text-xl font-semibold mb-2">Topics</h2>
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
                  <TableRow key={topic.id}>
                    <TableCell>{topic.name}</TableCell>
                    <TableCell
                      className={`text-center ${
                        topic.positiveRatings / (topic.positiveRatings + topic.negativeRatings) <
                        0.5
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {(
                        (100 * topic.positiveRatings) /
                          (topic.positiveRatings + topic.negativeRatings) || 0
                      ).toFixed(2)}
                      %
                    </TableCell>
                    <TableCell className="text-center">{topic.queries}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
