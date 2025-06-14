'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow, } from '@/components/ui/table/table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/dialog"
type Document = {
  name: string;
  uploadDate: string;
  positiveRatings: number;
  negativeRatings: number;
  queries: number;
};
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs/tabs"

export default function AdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/mocks/ragDocs.json');
      const data = await res.json();
      setDocuments(data);
    };

    fetchData();
  }, []);

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
        <div className=" shadow rounded p-6 overflow-y-auto max-h-[350px]">
          
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
              {documents.map((doc, indx) => (
                <TableRow key={indx} >
                  <TableCell>{doc.name}</TableCell>
                  <TableCell  className={` text-center ${
                    (doc.positiveRatings / (doc.positiveRatings + doc.negativeRatings)) < 0.5
                      ? "text-red-600"
                      : "text-green-600"
                  }`}>{(100 * doc.positiveRatings / (doc.positiveRatings + doc.negativeRatings)).toFixed(2)}%</TableCell>
                  <TableCell className="text-center">{doc.queries}</TableCell>
                  <TableCell className="text-center">{doc.uploadDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end mt-4 space-x-2 dark:text-neutral-50">
              <Dialog >
                <DialogTrigger >Upload</DialogTrigger>
                <DialogContent className="sm:max-w-md" >
                  
                  <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                  </DialogHeader>
                  <div className="border-2 border-dashed border-neutral-400 p-8 text-center mb-4 rounded">
                    <p>Choose a file or drag and drop it here</p>
                    <p className="text-sm text-neutral-500 mt-2">MD, TXT, and PDF formats, maximum size of 50MB</p>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Close
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
                    {documents.map((doc, indx) => (
                      <TableRow key={indx} >
                        <TableCell>{doc.name}</TableCell>
                        <TableCell  className={` text-center ${
                          (doc.positiveRatings / (doc.positiveRatings + doc.negativeRatings)) < 0.5
                            ? "text-red-600"
                            : "text-green-600"
                        }`}>{(100 * doc.positiveRatings / (doc.positiveRatings + doc.negativeRatings)).toFixed(2)}%</TableCell>
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
