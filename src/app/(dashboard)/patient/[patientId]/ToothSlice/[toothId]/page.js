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

const CroppedSlice = React.memo(({ view, index }) => {
  const img = useSliceImage(view, index);
  const [region, setRegion] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // تحسين 4: استخدام useCallback لتحسين الأداء
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  useEffect(() => {
    if (img && img.width && img.height && !region) {
      setRegion(getRandomRegion(img.width, img.height));
    }
  }, [img, region]);

  const croppedUrl = useSliceRegion(view, index, region);

  // تحسين 5: تحسين حسابات الأبعاد
  const displayHeight = 140;
  const displayWidth = useMemo(() => {
    return region
      ? Math.round(displayHeight * (region.width / region.height))
      : 140;
  }, [region, displayHeight]);

  return (
    <div className="flex flex-col items-center">
      <div
        style={{ width: displayWidth, height: displayHeight }}
        className={` border-3 overflow-hidden relative cursor-pointer rounded-[0.5vw] transition-all duration-200 ${
          isHovered 
            ? 'border-blue-500  shadow-blue-200' 
            : 'border-white'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* تحسين 6: تحسين عرض رقم الشريحة */}
        <span 
          className="absolute top-1 right-1 pointer-events-none z-10"
        >
          <span className={`text-white text-xs font-bold px-1.5 py-0.5 rounded shadow transition-colors duration-200 ${
            isHovered ? 'bg-blue-500 bg-opacity-90' : 'bg-black bg-opacity-70'
          }`}>
            {index}
          </span>
        </span>
        
        {croppedUrl ? (
          <img
            src={croppedUrl}
            alt={`${view} Slice ${index}`}
            className="w-full h-full object-cover"
            loading="lazy" // تحسين 7: Lazy loading للصور
            onError={(e) => {
              // تحسين 8: معالجة أخطاء تحميل الصور
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        
        {/* تحسين 9: تحسين Placeholder */}
        <div
          className={`w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded flex items-center justify-center ${
            croppedUrl ? 'hidden' : 'block'
          }`}
          style={{ width: displayWidth, height: displayHeight }}
        >
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      </div>
    </div>
  );
});

CroppedSlice.displayName = 'CroppedSlice';

// تحسين 10: تحسين مكون SlicesSection
const SlicesSection = React.memo(({ view, count, start, end }) => {
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, }}
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
  const { toothId } = useParams();
  const toothNumber = parseInt(toothId, 10);
  const stageRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // تحسين 11: إضافة معالجة الأخطاء
  const [sliceRanges, setSliceRanges] = useState({
    axial: { start: 50, end: 70 },
    coronal: { start: 20, end: 59 },
    sagittal: { start: 100, end: 129 }
  });

  const tooth = useDentalStore(state =>
    (state.data?.teeth || []).find(t => t.toothNumber === toothNumber)
  );

  const {
    getViewImages,
    loadAllViews,
    sliceCounts
  } = useImageStore();

  const { settings, SettingChange, setSettings } = useDentalSettings();

  // تحسين 12: تحسين fetch data مع معالجة الأخطاء
  const fetchSlicesCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني timeout
      
      const res = await fetch("http://localhost:5000/slices-count", {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      await loadAllViews(data);
    } catch (err) {
      console.error("Failed to fetch slice counts", err);
      setError(err.message || "Failed to load slice data");
    } finally {
      setLoading(false);
    }
  }, [loadAllViews]);

  useEffect(() => {
    fetchSlicesCount();
  }, [fetchSlicesCount]);

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

  // تحسين 14: تحسين عرض حالة التحميل والأخطاء
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading tooth slices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <button 
            onClick={fetchSlicesCount}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
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
        transition={{ duration: 0.5}}
      >
        {/* LEFT PANEL */}
        <div className="flex flex-col h-[60%] no-scrollbar gap-8 flex-1 min-w-[350px] max-w-[30%]">
          <motion.div
            initial={{ opacity: 0,  }}
            animate={{ opacity: 1,}}
            transition={{ duration: 0.5}}
          >
            {tooth ? (
              <ToothDiagnosis idCard={toothNumber} showDiagnosisDetails={true} />
            ) : (
              <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-200">
                <strong>Tooth not found</strong>
                <p className="text-sm mt-1">Tooth number {toothNumber} could not be found in the system.</p>
              </div>
            )}
          </motion.div>
          
          <motion.div 
            className="min-h-[350px]"
            initial={{ opacity: 0,  }}
            animate={{ opacity: 1, }}
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
          className="flex flex-col gap-3 min-w-[350px]  no-scrollbar overflow-auto flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Top card for all 3 views controls/info - outside the scrollable area */}
          <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center mb-2">
            {/* You can add controls or info for all 3 views here */}
            <span className="text-lg font-semibold text-gray-700">All Views Controls / Info</span>
          </div>

          
          <div className="bg-white shadow-lg rounded-lg p-8 min-w-[350px] flex-1 ">
            {/* Range controls and SlicesSection for each view */}
            {['axial', 'coronal', 'sagittal'].map(view => {
              const start = sliceRanges[view].start;
              const end = sliceRanges[view].end;
              const numSlices = end - start + 1;
              // Get slice thickness from voxelSizes in the store
              const voxelSizes = useImageStore.getState().voxelSizes;
              const sliceThickness =
                view === 'axial'
                  ? voxelSizes.z_spacing_mm
                  : view === 'coronal'
                  ? voxelSizes.y_spacing_mm
                  : voxelSizes.x_spacing_mm;
              const depthMM = (numSlices * sliceThickness).toFixed(2);

              return (
                <div key={view} className="mb-8">
                <div className="font-black text-2xl mb-3 capitalize text-gray-800 flex items-center gap-2">
                  {view} View
                </div>
                  <div className="flex gap-4 items-center text-sm mb-2">
                    <span>Slices: <strong>{numSlices}</strong> </span>
                    <span>Slice Thickness <strong>{sliceThickness} mm:</strong></span>
                    <span>Tooth Depth:<strong> {depthMM} mm</strong></span>
                  </div>
  
                  <SlicesSection
                    view={view}
                    count={sliceCounts[view] || 1}
                    start={start}
                    end={end}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </DataContext.Provider>
  );
}
