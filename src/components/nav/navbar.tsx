import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/button/button'
import onc_logo from './onc_logo.png';
import Image from 'next/image';


export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-neutral-100 w-full h-16 relative shadow-sm">
      <div className="flex items-center">
        <Image src={onc_logo} alt="Ocean Networks Canada" className="h-16 w-auto mr-4 "  />
        <h1 className="text-2xl text-neutral-900 font-bold">Astrolabe</h1>
      </div>
      <div className="space-x-4">
        <Link className="text-neutral-900" href="/login">
            Log In
        </Link>
        <Link href="/login">
            <Button className="bg-primary-400 text-neutral-900 px-4 py-2 rounded">Register</Button>
        </Link>
      </div>
    </nav>
  );
}