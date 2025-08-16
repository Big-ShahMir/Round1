"use client"

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'recruiter' | 'interviewee';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!currentUser) {
        router.push(redirectTo);
        return;
      }

      // If role is required and user doesn't have the required role, redirect to home
      if (requiredRole && userProfile?.role !== requiredRole) {
        router.push('/');
        return;
      }
    }
  }, [currentUser, userProfile, loading, requiredRole, redirectTo, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or doesn't have required role, don't render children
  if (!currentUser || (requiredRole && userProfile?.role !== requiredRole)) {
    return null;
  }

  // Render children if authenticated and has required role
  return <>{children}</>;
}

