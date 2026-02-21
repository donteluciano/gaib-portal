'use client';

import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import Sidebar from '@/components/Sidebar';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans flex transition-colors duration-200">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="ml-64 flex-1 p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
