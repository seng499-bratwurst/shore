import type { Metadata } from 'next';
import { Fira_Code, Inter } from 'next/font/google';
import './globals.css';

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
  return (
    <html lang="en">
      <body className={`${inter.variable} ${firaCode.variable}`}>{children}</body>
    </html>
  );
}
