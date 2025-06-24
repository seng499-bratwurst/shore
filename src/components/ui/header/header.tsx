'use client';

import Image from 'next/image';
import React from 'react';
import { Button } from '../button/button';

import { LoginForm } from '@/features/auth/components/login-form';
import { SignUpForm } from '@/features/auth/components/sign-up-form';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog/dialog';

export default function Header() {
  const { isLoggedIn } = useAuthStore();
  return (
    <nav className="fixed flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900 w-full h-16 shadow-sm z-50">
      <div className="flex items-center">
        <Image
          src={'/onc_logo.png'}
          width={64}
          height={64}
          alt="Ocean Networks Canada"
          className="h-16 w-auto mr-4 "
        />
        <h1 className="text-2xl text-neutral-900 dark:text-neutral-50 font-bold">Astrolabe</h1>
      </div>
      <div>
        {/* --- Log in Dialog --- */}
        <div className="flex items-center gap-[10px]">
          {/* State management for dialog switching */}
          {(() => {
            const [openDialog, setOpenDialog] = React.useState<'login' | 'signup' | null>(null);
            // Login Dialog
            const loginDialog = (
              <Dialog
                open={openDialog === 'login'}
                onOpenChange={(open) => setOpenDialog(open ? 'login' : null)}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setOpenDialog('login')}>
                    Log in
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Log in</DialogTitle>
                    <DialogDescription>Log in to your Astrolabe account.</DialogDescription>
                  </DialogHeader>
                  <LoginForm
                    onCancel={() => setOpenDialog(null)}
                    onSignUp={() => setOpenDialog('signup')}
                    onSuccess={() => setOpenDialog(null)}
                  />
                </DialogContent>
              </Dialog>
            );

            // Signup Dialog
            const signupDialog = (
              <Dialog
                open={openDialog === 'signup'}
                onOpenChange={(open) => setOpenDialog(open ? 'signup' : null)}
              >
                <DialogTrigger asChild>
                  <Button type="button" onClick={() => setOpenDialog('signup')}>
                    Sign up
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Sign up</DialogTitle>
                    <DialogDescription>Create your Astrolabe account.</DialogDescription>
                  </DialogHeader>
                  <SignUpForm
                    onCancel={() => setOpenDialog(null)}
                    onLogin={() => setOpenDialog('login')}
                    onSuccess={() => setOpenDialog(null)}
                  />
                </DialogContent>
              </Dialog>
            );

            return isLoggedIn ? (
              <></>
            ) : (
              <>
                {loginDialog}
                {signupDialog}
              </>
            );
          })()}
        </div>
      </div>
    </nav>
  );
}
