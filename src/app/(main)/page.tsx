// 'use client'; // No longer needed for simple rendering

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

export default function MainPage() {
  // const router = useRouter();

  // useEffect(() => {
  //   router.replace('/warehouses');
  // }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <p>Hello from the Main Page! If you see this, the layout is working.</p>
      {/* We can re-add the redirect or navigation to warehouses once this is visible */}
    </div>
  );
}
