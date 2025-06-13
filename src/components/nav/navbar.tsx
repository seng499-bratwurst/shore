import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/button/button'
import Image from 'next/image';


export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900 w-full h-16 relative shadow-sm">
      <div className="flex items-center">
        <Image src={'/onc_logo.png'} width={64} height={64} alt="Ocean Networks Canada" className="h-16 w-auto mr-4 "  />
        <h1 className="text-2xl text-neutral-900 dark:text-neutral-50 font-bold">Astrolabe</h1>
      </div>
      <div className="space-x-4">
        <Link  href="/login">
            <Button className="bg-primary-50 dark:bg-primary-900 hover:bg-primary-200 dark:text-neutral-50 text-neutral-900 px-4 py-2">Log in</Button>
        </Link>
        <Link href="/login">
            <Button className="bg-primary-500 hover:bg-primary-600 text-neutral-900 px-4 py-2 ">Sign Up</Button>
        </Link>
      </div>
    </nav>
  );
}