'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: 'student' | 'professional';
}

export default function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(storedUser);
        
        // 1. Initial check from LocalStorage for speed
        if (user.userType !== allowedRole) {
          router.push('/dashboard?error=access-denied');
          return;
        }

        // 2. Secondary check from DB for security/freshness
        const response = await fetch(`/api/auth/profile?userId=${user._id}`);
        if (!response.ok) {
           router.push('/login');
           return;
        }
        
        const data = await response.json();
        if (data.user.userType !== allowedRole) {
          // Sync localStorage if it was wrong
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push('/dashboard?error=access-denied');
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error('RoleGuard error:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [allowedRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 animate-pulse font-medium">Verifying access rights...</p>
        </div>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
