import { Button } from '@/components/ui/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form/form';
import { Input } from '@/components/ui/input/input';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { EditProfileData, editProfileSchema, useEditProfile } from '../api/edit-profile';

export type EditProfileFormProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onCancel, onSuccess }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const form = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      oncToken: '',
    },
  });

  const editProfile = useEditProfile();

  const onSubmit: SubmitHandler<EditProfileData> = (data) => {
    editProfile.mutate(data, {
      onSuccess: () => {
        setMessage('Profile updated successfully!');
        setIsError(false);
        if (onSuccess) onSuccess();
      },
      onError: (error: any) => {
        setIsError(true);
        setMessage(error?.message || 'Profile update failed. Please try again.');
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {message && (
          <div
            className={`text-center text-sm ${
              isError
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {message}
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="oncToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ONC Token</FormLabel>
              <FormControl>
                <Input placeholder="ONC Token" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end space-x-2 pt-6">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={editProfile.isPending}>
            {editProfile.isPending ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { EditProfileForm };