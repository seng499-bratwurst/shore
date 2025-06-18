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
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SignUpData, signUpSchema, useSignUp } from '../api/sign-up';

export type SignUpFormProps = {
  onCancel?: () => void;
  onLogin?: () => void;
  onSuccess?: () => void;
};

const SignUpForm: React.FC<SignUpFormProps> = ({ onCancel, onLogin, onSuccess }) => {
  const form = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      oncToken: '',
      name: '',
    },
  });

  const signUp = useSignUp();

  const onSubmit: SubmitHandler<SignUpData> = (data) => {
    signUp.mutate(data, { onSuccess });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Password" type="password" {...field} />
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
        <p className="text-sm text-muted-foreground mt-2">
          Already have an account?{' '}
          <Button variant="link" className="p-0" type="button" onClick={onLogin}>
            Log in
          </Button>
        </p>
        <div className="flex items-center justify-end space-x-2 pt-6">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={signUp.isPending}>
            {signUp.isPending ? 'Signing up...' : 'Sign Up'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { SignUpForm };
