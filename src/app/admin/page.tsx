'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs";
import { Input } from '@/components/ui/input/input';
import { Document, useFiles } from '@/features/admin/api/file';
import { useUploadFile } from '@/features/admin/api/upload';

export default function AdminPage() {
  const { data: files = [], isLoading, error } = useFiles();
  const uploadFileMutation = useUploadFile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Transform API data to match Document type for the table
  const documents: Document[] = files.map(file => ({
    name: file.fileName,
    uploadDate: new Date(file.createdAt).toLocaleDateString(),
    positiveRatings: 0, // Placeholder: Update with actual data if available
    negativeRatings: 0, // Placeholder: Update with actual data if available
    queries: 0, // Placeholder: Update with actual data if available
  }));

  // Handle file selection
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

  if (isLoading) {
    return <div className="px-14">Loading...</div>;
  }

  if (error) {
    return <div className="px-14">Error loading files: {error.message}</div>;
  }

  return (
    <div className="px-14 text-neutral-800">
      <Tabs defaultValue="docs" className="w-full">
        <div className="flex justify-end pt-8">
          <TabsList>
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
                  <TableHead>Document</TableHead>
                  <TableHead className="text-center">Positive Rate</TableHead>
                  <TableHead className="text-center">Query Count</TableHead>
                  <TableHead className="text-center">Upload Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell
                      className={`text-center ${
                        (doc.positiveRatings / (doc.positiveRatings + doc.negativeRatings)) < 0.5
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {(100 * doc.positiveRatings / (doc.positiveRatings + doc.negativeRatings) || 0).toFixed(2)}%
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
                      <p className="text-sm text-neutral-500 mt-2">MD, TXT, and PDF formats, maximum size of 50MB</p>
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
            <button className='px-4'>
              Delete
            </button>
          </div>
        </TabsContent>
        <TabsContent value="topics">
          <div className="bg-neutral-50 shadow rounded p-6 overflow-y-auto max-h-[350px]">
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
                {documents.map((doc, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell
                      className={`text-center ${
                        (doc.positiveRatings / (doc.positiveRatings + doc.negativeRatings)) < 0.5
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {(100 * doc.positiveRatings / (doc.positiveRatings + doc.negativeRatings) || 0).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-center">{doc.queries}</TableCell>
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