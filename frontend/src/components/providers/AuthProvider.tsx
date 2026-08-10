'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, UserRole } from '@/store/authStore';

const roleRoutes: Record<UserRole, string> = {
  [UserRole.Customer]: '/dashboard',
  [UserRole.Supplier]: '/supplier',
  [UserRole.Admin]: '/admin',
  [UserRole.Agent]: '/dashboard',
  [UserRole.Support]: '/admin'
};

export function AuthProvider({ children, requireRole }: { children: React.ReactNode, requireRole?: UserRole }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (requireRole) {
      if (!isAuthenticated()) {
        router.push('/login');
      } else if (user?.role !== requireRole) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, user, requireRole, router, mounted, pathname]);

  // Don't render protected content during SSR to prevent hydration mismatch with localStorage
  if (requireRole && !mounted) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }

  // Prevent rendering if not authorized
  if (requireRole && mounted && (!isAuthenticated() || user?.role !== requireRole)) {
    return null;
  }

  return <>{children}</>;
}
