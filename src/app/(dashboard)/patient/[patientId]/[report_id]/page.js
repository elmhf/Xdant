"use client";
import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import { useParams } from "next/navigation";
import Dashboard from "@/components/features/dashboard/dashboard";
import { useReportData } from "../hook/useReportData";
import { useToothSliceData } from "../hook/useToothSliceData";
import useImageCard from "@/components/features/dashboard/main/ImageXRay/component/useImageCard";
import ReportLoading from "@/components/shared/report-loading/ReportLoading";

export default function ReportPage() {
  const params = useParams();
  const lastProcessedId = useRef(null);
  const [imageCard, setImageCard] = useState(null);

  const reportId = params.report_id;
  const patientId = params.patientId;
  const reportType = params.report_type || "unknown";

  // Always call hooks at top level
  const imageCardHook = useImageCard();
  const reportDataHook = useReportData({ imageCard });
  const toothSliceDataHook = useToothSliceData();

  const activeHook = reportType === "toothSlice" ? toothSliceDataHook : reportDataHook;

  const {
    data,
    loading,
    error,
    fetchData,
    retry,
    clearCache,
    hasData,
    hasError,
    reportType: detectedReportType,
  } = activeHook;

  // Set imageCard when initialized
  useEffect(() => {
    if (imageCardHook && !imageCard) setImageCard(imageCardHook);
  }, [imageCardHook, imageCard]);

  // Fetch report when reportId or imageCard changes
  useEffect(() => {
    if (!reportId || reportId === lastProcessedId.current) return;
    if (!imageCard) return;

    lastProcessedId.current = reportId;
    fetchData(reportId).catch((err) => console.error("❌ Fetch failed:", err));
  }, [reportId, reportType, imageCard, fetchData]);

  // UI helpers
  const getLoadingConfig = () => {
    const map = {
      pano: { message: "Loading Panoramic Report...", icon: "🦷" },
      threeDModel: { message: "Loading 3D Model Report...", icon: "🎯" },
      cbct: { message: "Loading CBCT Report...", icon: "📄" },
      toothSlice: { message: "Loading Tooth Slice...", icon: "🦷" },
    };
    return map[reportType] || { message: "Loading Report...", icon: "📊" };
  };

  const getErrorConfig = () => {
    const map = {
      pano: { title: "Failed to Load Panoramic Report", icon: "🦷" },
      threeDModel: { title: "Failed to Load 3D Model Report", icon: "🎯" },
      cbct: { title: "Failed to Load CBCT Report", icon: "📄" },
      toothSlice: { title: "Failed to Load Tooth Slice", icon: "🦷" },
    };
    return map[reportType] || { title: "Failed to Load Report", icon: "📊" };
  };

  const getNoDataConfig = () => {
    const map = {
      pano: {
        title: "No Panoramic Report Data Available",
        description: "The panoramic report could not be loaded. This might be due to network issues or the report may not exist.",
        icon: "🦷",
      },
      threeDModel: {
        title: "No 3D Model Report Data Available",
        description: "The 3D model report could not be loaded. This might be due to network issues or the report may not exist.",
        icon: "🎯",
      },
      cbct: {
        title: "No CBCT Report Data Available",
        description: "The CBCT report could not be loaded. This might be due to network issues or the report may not exist.",
        icon: "📄",
      },
      toothSlice: {
        title: "No Tooth Slice Data Available",
        description: "The tooth slice data could not be loaded. This might be due to network issues or the tooth data may not exist.",
        icon: "🦷",
      },
    };
    return map[reportType] || {
      title: "No Report Data Available",
      description: "The report could not be loaded. This might be due to network issues or the report may not exist.",
      icon: "📊",
    };
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
    if (reportId && imageCard) fetchData(reportId);
  };

  // Rendering
  if (loading) {
    const { message, icon } = getLoadingConfig();
    return <ReportLoading message={message} reportId={reportId} imageCard={imageCard} icon={icon} />;
  }

  if (hasError) {
    const { title, icon } = getErrorConfig();
    return (
      <div className="flex w-full flex-col items-center justify-center min-h-screen gap-4 p-6 max-w-md mx-auto">
        <div className="text-red-500 text-6xl animate-bounce">{icon}</div>
        <h2 className="text-xl font-semibold text-red-600">{title}</h2>
        <p className="text-red-500 text-center text-sm bg-red-50 p-3 rounded-lg">{error}</p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
          >
            🔄 Try Again
          </button>
          {process.env.NODE_ENV === "development" && (
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

  if (hasData && data) {
    return <Dashboard reportType={detectedReportType || reportType} reportData={data} />;
  }

  if (reportType === "toothSlice") {
    const ToothSliceComponent = lazy(() => import("./ToothSlice/[toothId]/page"));
    return (
      <div className="w-full max-h-full mx-auto max-w-[90%] sm:w-full">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-600">Loading tooth slice...</p>
              </div>
            </div>
          }
        >
          <ToothSliceComponent />
        </Suspense>
      </div>
    );
  }

  const { title, description, icon } = getNoDataConfig();
  return (
    <div className="flex flex-col w-screen items-center justify-center min-h-screen gap-6 p-6">
      <div className="text-gray-400 text-6xl">{icon}</div>
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-600 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 max-w-md">{description}</p>
      </div>
      <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded font-mono">Report ID: {reportId}</div>
      <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded font-mono">Patient ID: {patientId}</div>
      <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded font-mono">Type: {reportType}</div>
      <button
        onClick={handleLoadReport}
        disabled={!imageCard}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm disabled:opacity-50"
      >
        🔄 Load Report
      </button>
      {!imageCard && <div className="text-xs text-gray-500">⏳ Waiting for image viewer to initialize...</div>}
    </div>
  );
}
