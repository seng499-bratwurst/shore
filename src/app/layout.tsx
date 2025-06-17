import '@/app/globals.css';
import { AppProvider } from '@/app/provider';
import type { Metadata } from 'next';
import { Fira_Code, Inter } from 'next/font/google';
import React from 'react';
import ReactDOM from 'react-dom';
import Header from '@/components/ui/header/header';

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
    // suppressHydrationWarning is recommended by shadcn
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${firaCode.variable}`}>
        <header>
          <Header />
        </header>
          <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
