'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalIndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/portal/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-gray-400">Redirecting to dashboard...</p>
    </div>
  );
}
