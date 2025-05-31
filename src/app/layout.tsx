import type { Metadata } from 'next';
import { Fira_Code, Inter } from 'next/font/google';
import React from 'react';
import ReactDOM from 'react-dom';
import './globals.css';
import Navbar from '@/components/nav/navbar';

export const metadata: Metadata = {
  title: 'Shore',
  description:
    "LLM powered interface to data from Ocean Networks Canada's Cambridge Bay Coastal Community Observatory",
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Import and configure axe-core for accessibility testing in development mode
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    import('@axe-core/react').then((axe) => {
      axe.default(React, ReactDOM, 1000);
    });
  }
  return (
    <html lang="en">
      <body className={`${inter.variable} ${firaCode.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
