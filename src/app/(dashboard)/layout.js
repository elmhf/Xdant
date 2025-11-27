"use client"
import Navbar from '@/components/shared/navbar/NavBar';

export default function DashboardLayout({ children }) {
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