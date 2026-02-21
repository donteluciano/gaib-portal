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
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--bg-primary)',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
      }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main style={{ 
          marginLeft: '256px', /* 64 * 4 = 256px (w-64) */
          flex: 1,
          padding: '24px',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
        }}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
