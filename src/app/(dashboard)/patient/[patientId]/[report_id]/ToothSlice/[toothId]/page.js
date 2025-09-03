"use client";
import React from "react";
import { useParams } from "next/navigation";
import ImageCard from "@/app/component/dashboard/main/ImageXRay/ImageXRay";
import ToothDiagnosis from "@/app/component/dashboard/side/card/ToothCard";
import { useDentalStore } from "@/stores/dataStore";
import { DataContext } from "@/app/component/dashboard/dashboard";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useDentalSettings } from "@/app/component/dashboard/main/ImageXRay/component/CustomHook/useDentalSettings";
import { useImageStore } from "@/app/(dashboard)/OrthogonalViews/stores/imageStore";
import { useSliceRegion, useSliceImage } from "./useSliceImage";
import { useReportData } from "../../../hook/useReportData";
import { motion } from "framer-motion";

// تحسين 1: تخزين مؤقت للمناطق العشوائية لتجنب إعادة توليدها
const regionCache = new Map();

// تحسين 2: تحسين دالة توليد المناطق العشوائية
function getRandomRegion(imgWidth, imgHeight, minSize = 60, maxSize = 100) {
  const cacheKey = `${imgWidth}-${imgHeight}-${minSize}-${maxSize}`;
  
  if (regionCache.has(cacheKey)) {
    return regionCache.get(cacheKey);
  }
  
  const width = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  const height = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  const maxX = Math.max(0, imgWidth - width);
  const maxY = Math.max(0, imgHeight - height);
  const x = Math.floor(Math.random() * (maxX + 1));
  const y = Math.floor(Math.random() * (maxY + 1));
  
  const region = { x, y, width, height };
  regionCache.set(cacheKey, region);
  
  return region;
}

// FIXED: CroppedSlice component with proper hook usage
const CroppedSlice = React.memo(({ view, index }) => {
  // FIXED: Always call all hooks at the top level in the same order
  const [region, setRegion] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // FIXED: Always call these hooks
  const img = useSliceImage(view, index);
  const { croppedUrl, isLoading } = useSliceRegion(view, index, region);

  // FIXED: Use useCallback to prevent unnecessary re-renders
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // FIXED: Define displayHeight as constant
  const displayHeight = 140;
  
  // FIXED: Memoize displayWidth calculation
  const displayWidth = useMemo(() => {
    return region
      ? Math.round(displayHeight * (region.width / region.height))
      : 140;
  }, [region, displayHeight]);

  // Effect to set region when image is loaded
  useEffect(() => {
    if (img && img.width && img.height && !region) {
      console.log(`🎯 Setting region for ${view} slice ${index}, image size: ${img.width}x${img.height}`);
      setRegion(getRandomRegion(img.width, img.height));
    }
  }, [img, region, view, index]);

  // FIXED: All conditional rendering happens after hooks
  
  // Show loading state if no image yet
  if (!img) {
    return (
      <div className="flex flex-col items-center">
        <div
          style={{ width: 140, height: displayHeight }}
          className="border-3 overflow-hidden relative rounded-[0.5vw] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse flex items-center justify-center"
        >
          <div className="text-gray-400 text-xs">Loading image...</div>
        </div>
      </div>
    );
  }

  // Show loading state if no region yet
  if (!region) {
    return (
      <div className="flex flex-col items-center">
        <div
          style={{ width: 140, height: displayHeight }}
          className="border-3 overflow-hidden relative rounded-[0.5vw] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse flex items-center justify-center"
        >
          <div className="text-gray-400 text-xs">Setting region...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        style={{ width: displayWidth, height: displayHeight }}
        className={`border-3 overflow-hidden relative cursor-pointer rounded-[0.5vw] transition-all duration-200 ${
          isHovered 
            ? 'border-blue-500 shadow-blue-200' 
            : 'border-white'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* تحسين 6: تحسين عرض رقم الشريحة */}
        <span className="absolute top-1 right-1 pointer-events-none z-10">
          <span className={`text-white text-xs font-bold px-1.5 py-0.5 rounded shadow transition-colors duration-200 ${
            isHovered ? 'bg-blue-500 bg-opacity-90' : 'bg-black bg-opacity-70'
          }`}>
            {index}
          </span>
        </span>
        
        {croppedUrl && !isLoading ? (
          <img
            src={croppedUrl}
            alt={`${view} Slice ${index}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              console.error('Failed to load cropped image:', e);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        
        {/* تحسين 9: تحسين Placeholder */}
        <div
          className={`w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded flex items-center justify-center ${
            croppedUrl && !isLoading ? 'hidden' : 'block'
          }`}
          style={{ width: displayWidth, height: displayHeight }}
        >
          <div className="text-gray-400 text-xs">
            {isLoading ? 'Processing...' : croppedUrl ? 'Loading...' : 'No image available'}
          </div>
        </div>
      </div>
    </div>
  );
});

CroppedSlice.displayName = 'CroppedSlice';

// تحسين 10: تحسين مكون SlicesSection
const SlicesSection = React.memo(({ view, count, start, end, toothNumber, onRangeChange }) => {
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >

      <div className="flex flex-wrap">
        {Array.from({ length: end - start + 1 }).map((_, idx) => (
          <CroppedSlice key={`${view}-${start + idx}`} view={view} index={start + idx} />
        ))}
      </div>
    </motion.div>
  );
});

SlicesSection.displayName = 'SlicesSection';

export default function ToothSlicePage() {
  // FIXED: Always call all hooks at the top level first
  const { toothId, report_id } = useParams();
  const stageRef = useRef(null);
  
  // Get tooth slice ranges from store
  const toothNumber = parseInt(toothId, 10);
  const getToothSliceRanges = useDentalStore(state => state.getToothSliceRanges);
  const updateToothViewSliceRange = useDentalStore(state => state.updateToothViewSliceRange);
  const tooth = useDentalStore(state =>
    (state.data?.teeth || []).find(t => t.toothNumber === toothNumber)
  );

  // Get slice ranges from store or use defaults
  const storedRanges = getToothSliceRanges(toothNumber);
  const [sliceRanges, setSliceRanges] = useState(() => {
    if (storedRanges && typeof storedRanges === 'object') {
      return {
        axial: storedRanges.axial || { start: 0, end: 0 },
        coronal: storedRanges.coronal || { start: 0, end: 0 },
        sagittal: storedRanges.sagittal || { start: 0, end: 0 }
      };
    }
    return {
      axial: { start: 0, end: 0 },
      coronal: { start: 0, end: 0 },
      sagittal: { start: 0, end: 0 }
    };
  });

  // FIXED: Always call all hooks regardless of conditions
  const {
    data: reportData,
    loading,
    error,
    fetchData,
    retry,
    clearCache,
    hasData,
    hasError,
    reportType
  } = useReportData();

  const {
    getViewImages,
    loadAllViews,
    sliceCounts,
    voxelSizes,
    setupFromReport
  } = useImageStore();

  const dentalData = useDentalStore(state => state.data);
  const { settings, SettingChange, setSettings } = useDentalSettings();

  // Handle range changes
  const handleRangeChange = useCallback((view, action, value) => {
    if (action === 'reset') {
      const defaultRanges = {
        axial: { start: 0, end: 0 },
        coronal: { start: 0, end: 0 },
        sagittal: { start: 0, end: 0 }
      };
      setSliceRanges(prev => ({
        ...prev,
        [view]: defaultRanges[view]
      }));
    } else if (action === 'save') {
      // Save to store
      updateToothViewSliceRange(toothNumber, view, value);
      console.log(`💾 Saved ${view} range for tooth ${toothNumber}:`, value);
    } else if (action === 'start' || action === 'end') {
      setSliceRanges(prev => ({
        ...prev,
        [view]: {
          ...prev[view],
          [action]: Math.max(1, Math.min(value, sliceCounts[view] || 1000))
        }
      }));
    }
  }, [toothNumber, updateToothViewSliceRange, sliceCounts]);

  // Update local state when store changes
  useEffect(() => {
    const newStoredRanges = getToothSliceRanges(toothNumber);
    if (newStoredRanges && typeof newStoredRanges === 'object') {
      setSliceRanges({
        axial: newStoredRanges.axial || { start: 0, end: 0 },
        coronal: newStoredRanges.coronal || { start: 0, end: 0 },
        sagittal: newStoredRanges.sagittal || { start: 0, end: 0 }
      });
    }
  }, [getToothSliceRanges, toothNumber]);

  // Calculate toothNumber after hooks
  const storeSliceCounts = dentalData?.sliceCounts || {};

  // تحسين 13: تحسين context value
  const contextValue = useMemo(() => ({
    data: {},
    setData: () => {},
    image: {},
    setImg: () => {},
    toothEditData: [],
    setToothEditData: () => {},
    stageRef,
    detailsMode: false,
    comparisonMode: false,
    fullXrayMode: false,
    newLayoutMode: false,
    viewMode: false,
    selectedTooth: null,
    setSelectedTooth: () => {},
    toothNumberSelect: null,
    setToothNumberSelect: () => {}
  }), []);

  // FIXED: All conditional rendering happens after hooks

  // تحسين 14: تحسين عرض حالة التحميل والأخطاء
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => retry(report_id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔄 Try Again
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={clearCache}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear Cache
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={contextValue}>
      <motion.div 
        className="flex w-[90vw] flex-row gap-8 h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* LEFT PANEL */}
        <div className="flex flex-col h-[60%] no-scrollbar gap-8 flex-1 min-w-[350px] max-w-[30%]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {tooth ? (
              <ToothDiagnosis idCard={toothNumber} showDiagnosisDetails={true}  />
            ) : (
              <div className="text-yellow-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <strong>Tooth data not loaded</strong>
                <p className="text-sm mt-1">Tooth number {toothNumber} data is being loaded from report...</p>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mt-2"></div>
              </div>
            )}
          </motion.div>
          
          <motion.div 
        className="flex-none min-h-[350px] w-[100%] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ImageCard
              settings={settings}
              SettingChange={SettingChange}
              setSettings={setSettings}
            />
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <motion.div 
          className="flex flex-col gap-3 min-w-[350px] no-scrollbar overflow-auto flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Top card for all 3 views controls/info - outside the scrollable area */}
          <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center mb-2">
            <span className="text-lg font-semibold text-gray-700">Tooth {toothNumber} Slice Ranges</span>
            {reportType && (
              <span className="text-sm text-gray-500 mt-1">Report Type: {reportType.toUpperCase()}</span>
            )}
            {storedRanges && (
              <div className="text-xs text-green-600 mt-1">✅ Ranges loaded from store</div>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8 min-w-[350px] flex-1">
            {/* Range controls and SlicesSection for each view */}
            {['axial', 'coronal', 'sagittal'].map(view => {
              const start = sliceRanges[view].start;
              const end = sliceRanges[view].end;
              const numSlices = end - start + 1;
              
              // Get slice thickness from voxelSizes in the store
              const currentVoxelSizes = voxelSizes || dentalData?.voxelSizes || {};
              const sliceThickness =
                view === 'axial'
                  ? currentVoxelSizes.z_spacing_mm || 1
                  : view === 'coronal'
                  ? currentVoxelSizes.y_spacing_mm || 1
                  : currentVoxelSizes.x_spacing_mm || 1;
              const depthMM = (numSlices * sliceThickness).toFixed(2);

              return (
                <div key={view} className="mb-8">
                  <div className="font-black text-2xl mb-3 capitalize text-gray-800 flex items-center gap-2">
                    {view} View
                  </div>
                  <div className="flex gap-4 items-center text-sm mb-2">
                    <span>Slices: <strong>{numSlices}</strong> </span>
                    <span>Slice Thickness <strong>{sliceThickness} mm</strong></span>
                    <span>Tooth Depth: <strong>{depthMM} mm</strong></span>
                    {sliceCounts[view] === 0 && (
                      <span className="text-yellow-600 text-xs">⚠️ Loading slices...</span>
                    )}
                  </div>

                  {sliceCounts[view] > 0 ? (
                    <SlicesSection
                      view={view}
                      count={sliceCounts[view] || storeSliceCounts[view] || 1}
                      start={start}
                      end={end}
                      toothNumber={toothNumber}
                      onRangeChange={handleRangeChange}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p>Loading {view} slices...</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </DataContext.Provider>
  );
}