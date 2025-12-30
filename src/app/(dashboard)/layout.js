"use client"
import Navbar from '@/components/shared/navbar/NavBar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/utils/apiClient';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verify session with a protected route
        await apiClient('/api/users/me');
        // If successful, user is authenticated
      } catch (error) {
        // If 401 or error, redirect to login
        // apiClient handles 401 redirects mostly, but valid to reinforce here
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen p-0 w-full flex flex-col space-y-4 overflow-hidden">
      {/* Fixed Navbar with transparent backdrop */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md">
        <div className="mx-auto" style={{ maxWidth: '80vw' }}>
          <Navbar />
        </div>
      </div>

      {/* Scrollable Content with padding for fixed navbar */}
      <div className="flex-1 overflow-y-scroll pt-16">
        <div className="mx-auto" style={{ maxWidth: '80vw' }}>
          {children}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1350px) {
          .mx-auto {
            max-width: calc(100vw - 20px) !important;
            margin: 10px 10px 0 10px !important;
          }
        }
      `}</style>
    </div>
  );
}