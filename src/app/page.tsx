"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (currentUser && userProfile) {
        // User is authenticated, redirect based on role
        if (userProfile.role === 'recruiter') {
          router.push('/recruiter');
        } else if (userProfile.role === 'interviewee') {
          router.push('/interviewee');
        }
      } else {
        // User is not authenticated, redirect to login
        router.push('/login');
      }
    }
  }, [currentUser, userProfile, loading, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
