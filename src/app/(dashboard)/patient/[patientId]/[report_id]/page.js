"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Dashboard from '@/app/component/dashboard/dashboard';
import { useReportData } from "../hook/useReportData";
import { useToothSliceData } from "../hook/useToothSliceData";
import useImageCard from "@/app/component/dashboard/main/ImageXRay/component/useImageCard";
import ReportLoading from '@/app/component/utils/ReportLoading';

export default function ReportPage() {
  const params = useParams();
  const lastProcessedId = useRef(null);
  const [imageCard, setImageCard] = useState(null);

  // Extract report ID and type from params
  const reportId = params.report_id;
  const patientId = params.patientId;
  
  // Detect report type from URL or query parameters
  const reportType = params.report_type || 'unknown';

  // Initialize imageCard separately to avoid stageRef issues
  const imageCardHook = useImageCard();

  // Set imageCard only when it's properly initialized
  useEffect(() => {
    if (imageCardHook && !imageCard) {
      console.log('🖼️ ImageCard initialized');
      setImageCard(imageCardHook);
    }
  }, [imageCardHook, imageCard]);

  // Use different hooks based on report type
  const reportDataHook = reportType === 'toothSlice' ? useToothSliceData() : useReportData({ imageCard });
  
  const {
    data,
    loading,
    error,
    fetchData,
    retry,
    clearCache,
    hasData,
    hasError,
    reportType: detectedReportType
  } = reportDataHook;

  // Simple effect - only triggers on reportId change
  useEffect(() => {
         console.log('📊 Effect triggered:', {
       reportId,
       patientId,
       reportType,
       lastProcessed: lastProcessedId.current,
       hasImageCard: !!imageCard
     });

    // Skip if no reportId or same as last processed
    if (!reportId || reportId === lastProcessedId.current) {
      return;
    }

    // Skip if imageCard not ready (to avoid stageRef errors)
    if (!imageCard) {
      console.log('⏳ Waiting for imageCard to initialize...');
      return;
    }

         console.log('🚀 Fetching new report:', reportId, 'Patient:', patientId, 'Type:', reportType);
     lastProcessedId.current = reportId;

    // Simple fetch without complex state management
    fetchData(reportId).catch(error => {
      console.error('❌ Fetch failed:', error);
    });

  }, [reportId, reportType, imageCard, fetchData]);

  // Get appropriate loading message and icon based on report type
  const getLoadingConfig = () => {
    switch (reportType) {
      case 'pano':
        return { message: "Loading Panoramic Report...", icon: "🦷" };
      case 'threeDModel':
        return { message: "Loading 3D Model Report...", icon: "🎯" };
      case 'cbct':
        return { message: "Loading CBCT Report...", icon: "📄" };
      case 'toothSlice':
        return { message: "Loading Tooth Slice...", icon: "🦷" };
      default:
        return { message: "Loading Report...", icon: "📊" };
    }
  };

  // Get appropriate error message based on report type
  const getErrorConfig = () => {
    switch (reportType) {
      case 'pano':
        return { title: "Failed to Load Panoramic Report", icon: "🦷" };
      case 'threeDModel':
        return { title: "Failed to Load 3D Model Report", icon: "🎯" };
      case 'cbct':
        return { title: "Failed to Load CBCT Report", icon: "📄" };
      case 'toothSlice':
        return { title: "Failed to Load Tooth Slice", icon: "🦷" };
      default:
        return { title: "Failed to Load Report", icon: "📊" };
    }
  };

  // Get appropriate no data message based on report type
  const getNoDataConfig = () => {
    switch (reportType) {
      case 'pano':
        return { 
          title: "No Panoramic Report Data Available",
          description: "The panoramic report could not be loaded. This might be due to network issues or the report may not exist.",
          icon: "🦷"
        };
      case 'threeDModel':
        return { 
          title: "No 3D Model Report Data Available",
          description: "The 3D model report could not be loaded. This might be due to network issues or the report may not exist.",
          icon: "🎯"
        };
      case 'cbct':
        return { 
          title: "No CBCT Report Data Available",
          description: "The CBCT report could not be loaded. This might be due to network issues or the report may not exist.",
          icon: "📄"
        };
      case 'toothSlice':
        return { 
          title: "No Tooth Slice Data Available",
          description: "The tooth slice data could not be loaded. This might be due to network issues or the tooth data may not exist.",
          icon: "🦷"
        };
      default:
        return { 
          title: "No Report Data Available",
          description: "The report could not be loaded. This might be due to network issues or the report may not exist.",
          icon: "📊"
        };
    }
  };

  // Loading state
  if (loading) {
    const { message, icon } = getLoadingConfig();
    return (
      <ReportLoading 
        message={message} 
        reportId={reportId} 
        imageCard={imageCard} 
        icon={icon} 
      />
    );
  }

  // Error state
  if (hasError) {
    const { title, icon } = getErrorConfig();
    
    const handleRetry = () => {
      console.log('🔄 Retrying...');
      lastProcessedId.current = null; // Reset to allow refetch
      retry(reportId);
    };

    const handleClearCache = () => {
      clearCache();
      lastProcessedId.current = null;
      console.log('🗑️ Cache cleared');
    };

    return (
      <div className="flex w-full flex-col items-center justify-center min-h-screen gap-4 p-6 max-w-md mx-auto">
        <div className="text-red-500 text-6xl animate-bounce">{icon}</div>
        <h2 className="text-xl font-semibold text-red-600">
          {title}
        </h2>
        <p className="text-red-500 text-center text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </p>
                 <div className="text-xs text-gray-500 text-center bg-gray-50 px-3 py-2 rounded">
           Report ID: {reportId}
         </div>
         <div className="text-xs text-gray-500 text-center bg-gray-50 px-3 py-2 rounded">
           Patient ID: {patientId}
         </div>
         <div className="text-xs text-gray-500 text-center bg-gray-50 px-3 py-2 rounded">
           Type: {reportType}
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
    console.log('✅ Rendering Dashboard with data, type:', detectedReportType || reportType);
    return (
      <div className="w-full max-h-full mx-auto max-w-[90%] sm:w-full">
        <Dashboard 
          reportType={detectedReportType || reportType} 
          reportData={data} 
        />
      </div>
    );
  }

  // Special handling for toothSlice - now it uses the unified data system
  if (reportType === 'toothSlice') {
    // Import and render the ToothSlice component with unified data
    const ToothSliceComponent = React.lazy(() => import("./ToothSlice/[toothId]/page"));
    
    return (
      <div className="w-full max-h-full mx-auto max-w-[90%] sm:w-full">
        <React.Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600">Loading tooth slice...</p>
            </div>
          </div>
        }>
          <ToothSliceComponent />
        </React.Suspense>
      </div>
    );
  }

  // No data state
  const { title, description, icon } = getNoDataConfig();
  
  const handleLoadReport = () => {
    console.log('📄 Manual load requested');
    lastProcessedId.current = null;
    if (reportId && imageCard) {
      fetchData(reportId);
    }
  };

  return (
    <div className="flex flex-col w-screen items-center justify-center min-h-screen gap-6 p-6">
      <div className="text-gray-400 text-6xl">{icon}</div>
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-600 mb-2">
          {title}
        </h2>
        <p className="text-sm text-gray-500 max-w-md">
          {description}
        </p>
      </div>
             <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded font-mono">
         Report ID: {reportId}
       </div>
       <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded font-mono">
         Patient ID: {patientId}
       </div>
       <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded font-mono">
         Type: {reportType}
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
