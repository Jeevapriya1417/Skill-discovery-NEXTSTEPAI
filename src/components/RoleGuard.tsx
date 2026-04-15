'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: 'student' | 'professional';
}

export default function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const router = useRouter();
  const session = useSession();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session.isPending) return;

    if (!session.data) {
      router.push('/login');
      setLoading(false);
      return;
    }

    const user = session.data.user as any;

    if (user.userType !== allowedRole) {
      router.push('/dashboard?error=access-denied');
      setLoading(false);
      return;
    }

    setAuthorized(true);
    setLoading(false);
  }, [allowedRole, router, session.data, session.isPending]);

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
