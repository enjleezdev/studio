'use client'; // Required for redirect in App Router

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MainPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/warehouses');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Loading StockPilot...</p>
      {/* Optionally, add a spinner here */}
    </div>
  );
}
