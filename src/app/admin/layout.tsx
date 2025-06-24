import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>
        <h1 className="px-14 py-6 font-semibold">Administration</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
