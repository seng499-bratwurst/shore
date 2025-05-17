import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shore',
  description:
    "LLM powered interface to data from Ocean Networks Canada's Cambridge Bay Coastal Community Observatory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
