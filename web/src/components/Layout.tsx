import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function Layout({ title, children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-bg font-sans w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
