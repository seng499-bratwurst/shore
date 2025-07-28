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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/select';
import { useUserList , useUpdateUserRoles, UserRoleSchema } from '@/features/admin/api/user';

const Documents = () => {
  const { data: files = [], isLoading, error, refetch } = useFiles();
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteFile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [sourceLink, setSourceLink] = useState<string>('');
  const [sourceType, setSourceType] = useState<string>('');

  // Transform API data to match Document type for the table
  const documents: Document[] = files.map((file) => ({
    id: file.id,
    name: file.name,
    uploadDate: new Date(file.createdAt).toLocaleDateString(),
    sourceLink: file.sourceLink || '',
    sourceType: file.sourceType || '',
    positiveRatings: 0, // Placeholder: Update with actual data if available
    negativeRatings: 0, // Placeholder: Update with actual data if available
    queries: 0, // Placeholder: Update with actual data if available
  }));

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
    let errorMessage = 'Error loading documents: ' + error.message;

    if ([401, 403].includes((error as AxiosError)?.response?.status || 0)) {
      errorMessage = 'You must be logged in as an admin user to view the document list.';
    }

    return (
      <div className="px-14">
        <p className="text-red-600 mb-4">{errorMessage}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
        <div className="shadow rounded p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-2">Document Management</h2>
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Document</TableHead>
                <TableHead className="text-center">Source Link</TableHead>
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
                <TableCell>{doc.name}</TableCell>
                <TableCell className="text-center">{doc.sourceLink}</TableCell>
                <TableCell className="text-center">{doc.sourceType}</TableCell>
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
    </>
  );
};

const Topics = () => {
  const topics: Topic[] = dummyTopics; // Assuming dummyTopics is fetched or managed elsewhere.

  return (
    <div className="shadow rounded p-6 overflow-y-auto">
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
                  topic.positiveRatings / (topic.positiveRatings + topic.negativeRatings) < 0.5
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {(
                  (100 * topic.positiveRatings) / (topic.positiveRatings + topic.negativeRatings) ||
                  0
                ).toFixed(2)}
                %
              </TableCell>
              <TableCell className="text-center">{topic.queries}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const Roles = () => {
  const { data: users = [], isLoading, error, refetch } = useUserList();
  const updateUserRolesMutation = useUpdateUserRoles();
  const [changedRoles, setChangedRoles] = useState<{ userId: string; newRole: string }[]>([]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setChangedRoles((prev) => {
      const changesWithoutUser = prev.filter((change) => change.userId !== userId);
      const oldUserState = users.find((user) => user.id === userId);
      if (!oldUserState) return changesWithoutUser;
      if (oldUserState.roles.includes(UserRoleSchema.parse(newRole))) {
        return changesWithoutUser;
      }
      return [...changesWithoutUser, { userId, newRole }];
    });
  };

  const handleSubmitChanges = () => {
    const userRoleUpdates = changedRoles.map(({ userId, newRole }) => ({
      id: userId,
      role: UserRoleSchema.parse(newRole),
    }));

    if (userRoleUpdates.length === 0) {
      console.warn('No role changes to submit.');
      return;
    }

    updateUserRolesMutation.mutate(userRoleUpdates, {
        onSuccess: (result) => {
            const successful = result.filter((res) => res.success).map((res) => res.userId);
            setChangedRoles((prev) => prev.filter((change) => !successful.includes(change.userId)));
        },
        onError: (error) => {
            // Should never be reached, but handle gracefully
            console.error('Error updating user roles:', error);
        },
    });
  };

  console.log('Changed Roles:', changedRoles);

  if (isLoading) {
    return <div className="px-14">Loading...</div>;
  }

  if (error) {
    let errorMessage = 'Error loading users: ' + error.message;

    if ([401, 403].includes((error as AxiosError)?.response?.status || 0)) {
      errorMessage = 'You must be logged in as an admin user to view the user list.';
    }

    return (
      <div className="px-14">
        <p className="text-red-600 mb-4">{errorMessage}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="shadow rounded p-6 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-2">User Roles</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.toSorted((a, b) => a.id.localeCompare(b.id)).map((user) => (
            <TableRow key={user.id} className={changedRoles.some((change) => change.userId === user.id) ? 'bg-primary-100 dark:bg-primary-700 hover:bg-primary-200 dark:hover:bg-primary-600' : ''}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={
                    changedRoles.find((change) => change.userId === user.id)?.newRole ||
                    user.roles[0] ||
                    'User'
                  }
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSubmitChanges}
          disabled={changedRoles.length === 0 || updateUserRolesMutation.isPending}
        >
          {updateUserRolesMutation.isPending ? 'Submitting...' : 'Submit Changes'}
        </Button>
      </div>
    </div>
  );
};

export default function AdminPage() {
  return (
    <Tabs defaultValue="documents" className="w-full">
        <div className="flex justify-end pt-8">
        <TabsList className="dark:bg-primary-900 bg-neutral-200">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        </div>
        <TabsContent value="documents">
        <Documents />
        </TabsContent>
        <TabsContent value="topics">
        <Topics />
        </TabsContent>
        <TabsContent value="roles">
        <Roles />
        </TabsContent>
    </Tabs>
    )
}
