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
import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { EditProfileData, editProfileSchema, useEditProfile, useGetProfile } from '@/features/profile/api/edit-profile';
import { useUpdatePassword } from '@/features/profile/api/password';

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
      oldPassword: '',
      newPassword: '',
      newPasswordConfirmed: '',
    },
  });

  const editProfile = useEditProfile();
  const updatePassword = useUpdatePassword();
  const { data: profileData, isLoading } = useGetProfile();

  useEffect(() => {
    if (profileData) {
      form.reset({
        name: profileData.name || '',
        email: profileData.email || '',
        oncToken: profileData.oncToken || '',
        oldPassword: '',
        newPassword: '',
        newPasswordConfirmed: '',
      });
    }
  }, [profileData, form]);

  const onSubmit: SubmitHandler<EditProfileData> = async (data) => {
    setMessage(null);
    setIsError(false);
    let hasError = false;

    // Handle profile update if any profile fields are filled
    if (data.name || data.email || data.oncToken) {
      try {
        await editProfile.mutateAsync({ name: data.name, email: data.email, oncToken: data.oncToken });
        setMessage('Profile updated successfully!');
      } catch (error: any) {
        hasError = true;
        setIsError(true);
        setMessage(error?.message || 'Profile update failed. Please try again.');
      }
    }

    // Handle password update if password fields are filled
    if (data.oldPassword && data.newPassword && data.newPasswordConfirmed) {
        try {
        await updatePassword.mutateAsync({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
          newPasswordConfirmed: data.newPasswordConfirmed,
        });
        setMessage((prev) => (prev ? `${prev} Password updated successfully!` : 'Password updated successfully!'));
        form.resetField('oldPassword');
        form.resetField('newPassword');
        form.resetField('newPasswordConfirmed');
      } catch (error: any) {
        hasError = true;
        setIsError(true);
        setMessage((prev) =>
          prev
            ? `${prev} ${error?.response?.data?.error || 'Password update failed. Please try again.'}`
            : error?.response?.data?.error || 'Password update failed. Please try again.'
        );
      }
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <div className="pt-2 space-y-4">
          <h3 className="text-lg font-medium mb-4">Change Password</h3>
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Current password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="New password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPasswordConfirmed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center justify-end space-x-2 ">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={editProfile.isPending || updatePassword.isPending}>
            {(editProfile.isPending || updatePassword.isPending) ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { EditProfileForm };
