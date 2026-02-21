'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Sidebar from '@/components/Sidebar';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Check initial state
    const collapsedState = localStorage.getItem('gaib-sidebar-collapsed');
    setIsCollapsed(collapsedState === 'true');

    // Listen for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-sidebar') {
          const sidebarState = document.documentElement.getAttribute('data-sidebar');
          setIsCollapsed(sidebarState === 'collapsed');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans flex transition-colors duration-200">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main 
          className={`${isCollapsed ? 'ml-20' : 'ml-64'} flex-1 p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300`}
        >
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
