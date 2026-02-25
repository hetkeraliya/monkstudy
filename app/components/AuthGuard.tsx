"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // If not logged in and not already on the login page, redirect
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      }
      // If logged in and trying to access login page, send to dashboard
      if (isAuthenticated && pathname === '/login') {
        router.push('/');
      }
    }
  }, [mounted, isAuthenticated, pathname, router]);

  // Prevent hydration mismatch flashes by not rendering until mounted
  if (!mounted) return null;

  // If on login page, just render the login page
  if (pathname === '/login') return <>{children}</>;

  // If authenticated, render the protected app
  return isAuthenticated ? <>{children}</> : null;
}
