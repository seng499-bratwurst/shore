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
      <div className="flex justify-end mb-4">
        <Button className="mb-4 px-4 py-2 bg-neutral-300 hover:bg-neutral-400 rounded">View Logs</Button>
      </div>
      <div className="flex justify-between mb-2">
          
        </div>
      <div className="bg-neutral-50 shadow rounded p-6">
        
        <h2 className="text-xl font-semibold mb-2">Document Management</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Positive Rate</TableHead>
              <TableHead>Query Count</TableHead>
              <TableHead>Upload Date</TableHead>
            </TableRow>

          </TableHeader>
          <TableBody>
            {documents.map((doc, indx) => (
              <TableRow key={indx} >
                <TableCell>{doc.name}</TableCell>
                <TableCell>{doc.positiveRatings / (doc.positiveRatings + doc.negativeRatings)}%</TableCell>
                <TableCell>{doc.queries}</TableCell>
                <TableCell>{doc.uploadDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end mt-4 space-x-2">
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
    </div>
  );
}
