"use client";
import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import { useParams } from "next/navigation";
import Dashboard from "@/components/features/dashboard/dashboard";
import { useReportData } from "../hook/useReportData";
import { useToothSliceData } from "../hook/useToothSliceData";
import useImageCard from "@/components/features/dashboard/main/ImageXRay/component/useImageCard";
import ReportLoading from "@/components/shared/report-loading/ReportLoading";
import ErrorConnect from "@/components/shared/ErrorConnect";

export default function ReportPage() {
  const params = useParams();
  const lastProcessedId = useRef(null);
  const [imageCard, setImageCard] = useState(null);

  const reportId = params.report_id;
  const patientId = params.patientId;
  const paramsReportType = params.report_type || "unknown";
  console.log("reportTypereportTypereportTypereportTypereportType", paramsReportType);
  // Always call hooks at top level
  const imageCardHook = useImageCard();
  const reportDataHook = useReportData({ imageCard });
  const toothSliceDataHook = useToothSliceData();

  const activeHook = paramsReportType === "toothSlice" ? toothSliceDataHook : reportDataHook;

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
    detectReportType,
  } = activeHook;
  console.log("reportTypereportTypereportTypereportTypereportType", detectedReportType, data);
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
  }, [reportId, paramsReportType, imageCard, fetchData]);

  // UI helpers
  const getLoadingConfig = () => {
    const map = {
      pano: { message: "Loading Panoramic Report...", icon: "🦷" },
      threeDModel: { message: "Loading 3D Model Report...", icon: "🎯" },
      cbct: { message: "Loading CBCT Report...", icon: "📄" },
      toothSlice: { message: "Loading Tooth Slice...", icon: "🦷" },
    };
    return map[paramsReportType] || { message: "Loading Report...", icon: "📊" };
  };

  const getErrorConfig = () => {
    const map = {
      pano: { title: "Failed to Load Panoramic Report", icon: "🦷" },
      threeDModel: { title: "Failed to Load 3D Model Report", icon: "🎯" },
      cbct: { title: "Failed to Load CBCT Report", icon: "📄" },
      toothSlice: { title: "Failed to Load Tooth Slice", icon: "🦷" },
    };
    return map[paramsReportType] || { title: "Failed to Load Report", icon: "📊" };
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
    return map[paramsReportType] || {
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


  // Rendering
  if (loading) {
    const { message, icon } = getLoadingConfig();
    return <ReportLoading message={message} reportId={reportId} imageCard={imageCard} icon={icon} />;
  }

  if (hasError) {

    return (
      <ErrorConnect onRetry={handleRetry} onClearCache={handleClearCache} />
    );
  }


  if (hasData && data) {
    return <Dashboard reportType={detectedReportType || paramsReportType} reportData={data} />;
  }

  if (paramsReportType === "toothSlice") {
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
    <div className="flex flex-col w-full items-center justify-center min-h-[80vh] gap-4 p-8">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2 shadow-sm border border-slate-100">
        <div className="text-4xl text-slate-300 opacity-80 grayscale">{icon}</div>
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
