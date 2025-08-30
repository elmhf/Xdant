"use client";
import { useParams } from "next/navigation";
import { useMemo, useCallback } from "react";
import Dashboard from '@/app/component/dashboard/dashboard';
import { useReportData } from "../../hook/useReportData";

export default function CBCTReportPage() {
  const params = useParams();
  const patientId = params.patientId;
  const cbctReportId = params.cbctReportid;

  // إنشاء options object مرة واحدة فقط
  const reportOptions = useMemo(() => ({
    autoFetch: true,
    retryAttempts: 2,
    retryDelay: 1000, // تغيير من 0 إلى 1000ms
    onSuccess: (data) => {
      console.log('Report loaded successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to load report:', error);
    }
  }), []); // empty dependencies لأن القيم ثابتة

  const {
    data,
    loading,
    error,
    isRetrying,
    retryCount,
    refetch,
    cancel,
    isSuccess
  } = useReportData(cbctReportId, "cbct ai", reportOptions);

  // استخدام useCallback للـ event handlers
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading report...</div>
      </div>
    );
  }

  // Retrying state
  if (isRetrying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Retrying... ({retryCount}/2)</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">Error: {error}</p>
        <div className="flex gap-2">
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
          <button 
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess && data) {
    return (
      <div className="w-full max-h-full mx-auto max-w-[90%] sm:w-full">
        <Dashboard reportType="cbct ai" reportData={data} />
      </div>
    );
  }

  // No data state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">No data available</div>
    </div>
  );
}