"use client"
import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/navbar/NavBar';
import useUserStore from '@/components/features/profile/store/userStore';


export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const getUserInfo = useUserStore(state => state.getUserInfo);
  const fetchMyClinics = useUserStore(state => state.fetchMyClinics);
  const setCurrentClinicId = useUserStore(state => state.setCurrentClinicId);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          getUserInfo(),
          fetchMyClinics()
        ]);
        // Note: fetchMyClinics in store already sets the default clinicId if not set
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getUserInfo, fetchMyClinics]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="relative w-32 h-32 animate-pulse">
          <img
            src="/XDENTAL.png"
            alt="Loading..."
            className="w-full h-full object-contain rounded-3xl"
          />
        </div>
      </div>
    );
  }

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