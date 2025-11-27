"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Dashboard from '@/components/features/dashboard/dashboard';
import { useReportData } from "../hook/useReportData";
import { useToothSliceData } from "../hook/useToothSliceData";
import useImageCard from "@/components/features/dashboard/main/ImageXRay/component/useImageCard";
import ReportLoading from '@/components/shared/report-loading/ReportLoading';

export default function ReportPage() {
  const params = useParams();
  const lastProcessedId = useRef(null);
  const [imageCard, setImageCard] = useState(null);

  // Extract report ID and type from params
  const reportId = params.report_id;
  const patientId = params.patientId;
  const reportType = params.report_type || 'unknown';

  // FIXED: Always call all hooks at the top level, never conditionally
  const imageCardHook = useImageCard();
  const reportDataHook = useReportData({ imageCard });
  const toothSliceDataHook = useToothSliceData();

  // Choose which hook's data to use based on report type (but both hooks are always called)
  const activeHook = reportType === 'toothSlice' ? toothSliceDataHook : reportDataHook;

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
  } = activeHook;

  // Set imageCard when it's properly initialized
  useEffect(() => {
    if (imageCardHook && !imageCard) {

      setImageCard(imageCardHook);
    }
  }, [imageCardHook, imageCard]);

  // Effect for fetching data
  useEffect(() => {


    // Skip if no reportId or same as last processed
    if (!reportId || reportId === lastProcessedId.current) {
      return;
    }

    // Skip if imageCard not ready (to avoid stageRef errors)


    lastProcessedId.current = reportId;

    // Fetch data
    fetchData(reportId).catch(error => {
      console.error('❌ Fetch failed:', error);
    });

  }, [reportId, reportType, imageCard, fetchData]);

  // Helper functions for UI messages
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

  // Event handlers
  const handleRetry = () => {

    lastProcessedId.current = null;
    retry(reportId);
  };

  const handleClearCache = () => {
    clearCache();
    lastProcessedId.current = null;

  };

  const handleLoadReport = () => {

    lastProcessedId.current = null;
    if (reportId && imageCard) {
      console.log('🚀 fetchData called:', imageCard);
      fetchData(reportId);
    }
  };

  // FIXED: All conditional rendering happens after all hooks are called

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

    return (
      <div className="w-full max-h-full  sm:w-full">
        <Dashboard
          reportType={detectedReportType || reportType}
          reportData={data}
        />
      </div>
    );
  }

  // Special handling for toothSlice
  if (reportType === 'toothSlice') {
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