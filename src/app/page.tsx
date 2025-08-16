"use client"

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Root page useEffect triggered:', { currentUser, userProfile, loading });
    
    if (!loading) {
      // Add a small delay to ensure auth state is stable
      const timer = setTimeout(() => {
        if (currentUser && userProfile) {
          console.log('User is authenticated, redirecting to dashboard:', userProfile.role);
          // User is authenticated, redirect to appropriate dashboard
          if (userProfile.role === 'recruiter') {
            router.replace('/recruiter');
          } else if (userProfile.role === 'interviewee') {
            router.replace('/interviewee');
          }
        } else {
          console.log('User is not authenticated, redirecting to login');
          // User is not authenticated, redirect to login
          router.replace('/login');
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      console.log('Still loading authentication state...');
    }
  }, [currentUser, userProfile, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
