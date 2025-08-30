"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Dashboard from '@/app/component/dashboard/dashboard';
import { useReportData } from "../../hook/useReportData";
import useImageCard from "@/app/component/dashboard/main/ImageXRay/component/useImageCard";

import ReportLoading from '@/app/component/utils/ReportLoading';

export default function CBCTReportPage() {
  const params = useParams();
  const cbctReportId = params.cbctReportid;
  const lastProcessedId = useRef(null);
  const [imageCard, setImageCard] = useState(null);
  
  // Initialize imageCard separately to avoid stageRef issues
  const imageCardHook = useImageCard();
  
  // Set imageCard only when it's properly initialized
  useEffect(() => {
    if (imageCardHook && !imageCard) {
      console.log('🖼️ ImageCard initialized');
      setImageCard(imageCardHook);
    }
  }, [imageCardHook, imageCard]);

  const {
    data,
    loading,
    error,
    fetchData,
    retry,
    clearCache,
    hasData,
    hasError,
    reportType
  } = useReportData({ imageCard });

  // Simple effect - only triggers on reportId change
  useEffect(() => {
    console.log('📊 Effect triggered:', {
      cbctReportId,
      lastProcessed: lastProcessedId.current,
      hasImageCard: !!imageCard
    });

    // Skip if no reportId or same as last processed
    if (!cbctReportId || cbctReportId === lastProcessedId.current) {
      return;
    }

    // Skip if imageCard not ready (to avoid stageRef errors)
    if (!imageCard) {
      console.log('⏳ Waiting for imageCard to initialize...');
      return;
    }

    console.log('🚀 Fetching new report:', cbctReportId);
    lastProcessedId.current = cbctReportId;

    // Simple fetch without complex state management
    fetchData(cbctReportId).catch(error => {
      console.error('❌ Fetch failed:', error);
    });

  }, [cbctReportId, imageCard, fetchData]);

  // Loading state
  if (loading) {
    return (
      <ReportLoading message="Loading CBCT Report..." reportId={cbctReportId} imageCard={imageCard} icon="📄" />
    );
  }

  // Error state
  if (hasError) {
    const handleRetry = () => {
      console.log('🔄 Retrying...');
      lastProcessedId.current = null; // Reset to allow refetch
      retry(cbctReportId);
    };

    const handleClearCache = () => {
      clearCache();
      lastProcessedId.current = null;
      console.log('🗑️ Cache cleared');
    };

    return (
      <div className="flex w-full flex-col items-center justify-center min-h-screen gap-4 p-6 max-w-md mx-auto">
        <div className="text-red-500 text-6xl animate-bounce">⚠️</div>
        <h2 className="text-xl font-semibold text-red-600">
          Failed to Load CBCT Report
        </h2>
        <p className="text-red-500 text-center text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </p>
        <div className="text-xs text-gray-500 text-center bg-gray-50 px-3 py-2 rounded">
          Report ID: {cbctReportId}
        </div>
        <div className="flex gap-3 mt-4">
          <button 
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
          >
            🔄 Try Again
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={handleClearCache}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm transition-colors shadow-sm"
            >
              Clear Cache
            </button>
          )}
        </div>
      </div>
    );
  }

  // Success state
  if (hasData && data) {
    console.log('✅ Rendering Dashboard with data, type:', reportType);
    return (
      <div className="w-full max-h-full mx-auto max-w-[90%] sm:w-full">
        <Dashboard reportType={reportType || "cbct"} reportData={data} />
      </div>
    );
  }

  // No data state
  const handleLoadReport = () => {
    console.log('📄 Manual load requested');
    lastProcessedId.current = null;
    if (cbctReportId && imageCard) {
      fetchData(cbctReportId);
    }
  };

  return (
    <div className="flex flex-col w-screen items-center justify-center min-h-screen gap-6 p-6">
      <div className="text-gray-400 text-6xl">📄</div>
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-600 mb-2">
          No CBCT Report Data Available
        </h2>
        <p className="text-sm text-gray-500 max-w-md">
          The CBCT report could not be loaded. This might be due to network issues or the report may not exist.
        </p>
      </div>
      <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded font-mono">
        Report ID: {cbctReportId}
      </div>
      <button 
        onClick={handleLoadReport}
        disabled={!imageCard}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm disabled:opacity-50"
      >
        🔄 Load Report
      </button>
      {!imageCard && (
        <div className="text-xs text-gray-500">
          ⏳ Waiting for image viewer to initialize...
        </div>
      )}
    </div>
  );
}