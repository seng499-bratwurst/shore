'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow, } from '@/components/ui/table/table';
import { Dialog } from '@/components/ui/dialog/dialog';
import UploadModal from '@/components/ui/upload/upload';

type Document = {
  name: string;
  uploadDate: string;
  positiveRatings: number;
  negativeRatings: number;
  queries: number;
};

export default function AdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showModal, setShowModal] = useState(false);

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
          <div className="space-x-2">
            <button 
              onClick={() => setShowModal(true)}
            >
              Upload
            </button>
            <button className='px-4'>
              Delete
            </button>
            <UploadModal isOpen={showModal} onClose={() => setShowModal(false)} />
          </div>
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
        {/* <table className="w-full table-auto border-t border-neutral-200">
          <tbody>
            {documents.map((doc, idx) => (
              <tr key={idx} className="border-t border-neutral-200">
                <td className="p-2"><input type="checkbox" /></td>
                <td className="p-2 ">{doc.name}</td>
                <td className="p-2 text-neutral-400 text-right">{doc.uploadDate}</td>
                <td className="p-2 text-right">...</td>
              </tr>
            ))}
          </tbody>
        </table> */}
      </div>
    </div>
  );
}
