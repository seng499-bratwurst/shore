import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <main className="h-[calc(100vh-64px)]">{children}</main>;
}
