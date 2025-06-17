'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../button/button'
import Image from 'next/image';


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '../dialog/dialog'
import { InputWithLabel } from '../input/input';


export default function Header() {
  return (
    <nav className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900 w-full h-16 relative shadow-sm">
        <div className="flex items-center">
            <Image src={'/onc_logo.png'} width={64} height={64} alt="Ocean Networks Canada" className="h-16 w-auto mr-4 "  />
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
                <Dialog open={openDialog === 'login'} onOpenChange={open => setOpenDialog(open ? 'login' : null)}>
                <form>
                    <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setOpenDialog('login')}>Log in</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Log in</DialogTitle>
                        <DialogDescription>
                        Log in to your Astrolabe account.
                        </DialogDescription>
                    </DialogHeader>
                    <InputWithLabel label='Email'></InputWithLabel>
                    <InputWithLabel label='Password' type='password'></InputWithLabel>

                    <p className="text-sm text-muted-foreground mt-2">
                        Don&apos;t have an account?{' '}
                        <Button
                        variant="link"
                        className="p-0"
                        type="button"
                        onClick={() => setOpenDialog('signup')}
                        >
                        Sign up
                        </Button>
                    </p>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Log in</Button>
                    </DialogFooter>
                    </DialogContent>
                </form>
                </Dialog>
            );

            // Signup Dialog
            const signupDialog = (
                <Dialog open={openDialog === 'signup'} onOpenChange={open => setOpenDialog(open ? 'signup' : null)}>
                <form>
                    <DialogTrigger asChild>
                    <Button type="button" onClick={() => setOpenDialog('signup')}>Sign up</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Sign up</DialogTitle>
                        <DialogDescription>
                        Create your Astrolabe account.
                        </DialogDescription>
                    </DialogHeader>
                    <InputWithLabel label='Email'></InputWithLabel>
                    <InputWithLabel label='Password' type='password'></InputWithLabel>
                    <InputWithLabel label='ONC Token'></InputWithLabel>

                    <p className="text-sm text-muted-foreground mt-2">
                        Already have an account?{' '}
                        <Button
                        variant="link"
                        className="p-0"
                        type="button"
                        onClick={() => setOpenDialog('login')}
                        >
                        Log in
                        </Button>
                    </p>

                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Sign up</Button>
                    </DialogFooter>
                    </DialogContent>
                </form>
                </Dialog>
            );

            return (
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