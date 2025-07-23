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
import { LoginData, loginSchema, useLogin } from '../api/login';

export type LoginFormProps = {
  onCancel?: () => void;
  onSignUp?: () => void;
  onSuccess?: () => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onCancel, onSignUp, onSuccess }) => {
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const login = useLogin({ onSuccess });

  const onSubmit: SubmitHandler<LoginData> = (data) => {
    console.log('Form submitted:', data);
    login.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        <p className="text-sm text-muted-foreground mt-2">
          Don&apos;t have an account?{' '}
          <Button variant="link" className="p-0" type="button" onClick={onSignUp}>
            Sign up
          </Button>
        </p>
        <div className="flex items-center justify-end space-x-2 pt-6">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { LoginForm };
