"use client";
import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useParams } from "next/navigation";
import ImageCard from "@/components/features/dashboard/main/ImageXRay/ImageXRay";
import ToothDiagnosis from "@/components/features/dashboard/side/card/ToothCard";
import { useDentalStore } from "@/stores/dataStore";
import { DataContext } from "@/components/features/dashboard/dashboard";
import { useDentalSettings } from "@/components/features/dashboard/main/ImageXRay/component/CustomHook/useDentalSettings";
import { useImageStore } from "@/app/(dashboard)/OrthogonalViews/stores/imageStore";
import { useSliceRegion, useSliceImage } from "./useSliceImage";
import { useReportData } from "../../../hook/useReportData";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import Toothlabels from "@/components/features/dashboard/main/ToothLabels/Toothlabels";
import Lottie from "lottie-react";
import dataNotFound from "@/components/shared/lottie/Nodatafound.json";

// ✅ cache للمناطق العشوائية
const regionCache = new Map();
function getRandomRegion(imgWidth, imgHeight, minSize = 60, maxSize = 100) {
  const cacheKey = `${imgWidth}-${imgHeight}-${minSize}-${maxSize}`;
  if (regionCache.has(cacheKey)) return regionCache.get(cacheKey);

  const width =
    Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  const height =
    Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  const maxX = Math.max(0, imgWidth - width);
  const maxY = Math.max(0, imgHeight - height);
  const x = Math.floor(Math.random() * (maxX + 1));
  const y = Math.floor(Math.random() * (maxY + 1));

  const region = { x, y, width, height };
  regionCache.set(cacheKey, region);
  return region;
}

// ✅ رسالة وقت ما فماش سلايس
const NoSliceDataMessage = React.memo(({ view }) => (
  <motion.div
    className="bg-gray-100 rounded-lg text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-gray-500 text-lg font-medium">
      Pas de slices pour {view}
    </div>
  </motion.div>
));
NoSliceDataMessage.displayName = "NoSliceDataMessage";

// ✅ رسالة إذا السن مفقود
const MissingToothMessage = React.memo(({ toothNumber }) => (
  <motion.div
    className="relative rounded-lg flex flex-col justify-center h-full items-center text-center"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <span className="absolute top-2 left-2 font-[#0d0c22] text-3xl text-gray-800">
      Tooth Slices
    </span>
    <Lottie animationData={dataNotFound} className="w-[350px]" loop={true} />
    <p className="text-xl text-[#7564ed] font-medium opacity-50">
      There are no MPR for Missing tooth {toothNumber}
    </p>
  </motion.div>
));
MissingToothMessage.displayName = "MissingToothMessage";

// ✅ slice واحد
const CroppedSlice = React.memo(({ view, index }) => {
  const [region, setRegion] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const img = useSliceImage(view, index);

  useEffect(() => {
    if (img && img.width && img.height && !region) {
      setRegion(getRandomRegion(img.width, img.height));
    }
  }, [img, region, view, index]);

  const { croppedUrl, isLoading } = useSliceRegion(view, index, region);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const displayHeight = 140;
  const displayWidth = useMemo(
    () =>
      region
        ? Math.round(displayHeight * (region.width / region.height))
        : 140,
    [region, displayHeight]
  );

  if (!img || !region) {
    return (
      <div
        style={{ width: 140, height: displayHeight }}
        className="border-3 rounded bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse flex items-center justify-center"
      >
        <div className="text-gray-400 text-xs">
          {!img ? "Loading image..." : "Setting region..."}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ width: displayWidth, height: displayHeight }}
      className={`border-3 overflow-hidden relative cursor-pointer rounded-[0.5vw] transition-all duration-200 ${isHovered
          ? "border-[#7564ed] shadow-blue-200"
          : "border-white"
        }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="absolute top-1 right-1 pointer-events-none z-10">
        <span
          className={`text-white text-xs font-bold px-1.5 py-0.5 rounded shadow ${isHovered
              ? "bg-[#7564ed] bg-opacity-90"
              : "bg-[#0d0c22] bg-opacity-70"
            }`}
        >
          {index}
        </span>
      </span>

      {croppedUrl && !isLoading && (
        <img
          draggable={false}
          src={croppedUrl}
          alt={`${view} Slice ${index}`}
          className="w-full h-full object-cover select-none"
        />
      )}
      {(!croppedUrl || isLoading) && (
        <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-xs">
            {isLoading
              ? "Processing..."
              : croppedUrl
                ? "Loading..."
                : "No image available"}
          </div>
        </div>
      )}
    </div>
  );
});

function DraggableSliceWrapper({ view, index, dragerstate }) {
  const [isDragging, setIsDragging] = useState(false);
  const { setIfDragging, setslicedrager } = dragerstate
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  const handleDragStart = useCallback((event) => {
    setIsDragging(true);
    setIfDragging(true)
    setslicedrager({ 'view': view, 'index': index })
    console.log("ooooooooooooooooooooooo ", { 'view': view, 'index': index })
    // Set initial position based on mouse position
    setPosition({
      x: event.clientX - 70, // Center the image on cursor
      y: event.clientY - 70
    });
  }, []);

  const handleDrag = useCallback((event) => {
    if (isDragging && event.clientX && event.clientY) {
      setPosition({
        x: event.clientX - 70,
        y: event.clientY - 70
      });
    }
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setIfDragging(false)
    setslicedrager({ 'view': null, 'index': null })
  }, []);

  // Add event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  const floatingSlice = isDragging && createPortal(
    <div
      ref={dragRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
        pointerEvents: 'none',
        transform: 'scale(1.05)',
        border: '2px dashed #7564ed',
        borderRadius: '0.5vw'
      }}
    >
      <CroppedSlice view={view} index={index} />
    </div>,
    document.body
  );

  return (
    <>
      <div
        className={`transition-all duration-200 ${isDragging
            ? "opacity-40 border-2 border-dashed border-gray-400"
            : ""
          }`}
        onMouseDown={handleDragStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <CroppedSlice view={view} index={index} />
      </div>
      {floatingSlice}
    </>
  );
}

// ✅ section متاع slices
const SlicesSection = React.memo(({ view, count, start, end, dragerstate }) => {
  const numSlices = start > 0 && end > 0 ? end - start + 1 : 0;
  if (numSlices === 0) return <NoSliceDataMessage view={view} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: numSlices }).map((_, idx) => (
          <DraggableSliceWrapper
            dragerstate={dragerstate}
            key={`${view}-${start + idx}`}
            view={view}
            index={start + idx}
          />
        ))}
      </div>
    </motion.div>
  );
});
SlicesSection.displayName = "SlicesSection";


export default function ToothSlicePage() {
  // FIXED: Always call all hooks at the top level first
  const { toothId, report_id } = useParams();
  const stageRef = useRef(null);
  const [isDragging, setIfDragging] = useState(false);
  const [sliceDrager, setslicedrager] = useState({ "index": null, "view": null })
  // Get tooth slice ranges from store
  const toothNumber = parseInt(toothId, 10);
  const getToothCategory = useDentalStore(state => state.getToothCategory);
  const getToothSliceRanges = useDentalStore(state => state.getToothSliceRanges);
  const updateToothViewSliceRange = useDentalStore(state => state.updateToothViewSliceRange);
  const tooth = useDentalStore(state =>
    (state.data?.teeth || []).find(t => t.toothNumber === toothNumber)
  );

  // تحقق إذا كان السن مفقوداً
  const isMissingTooth = getToothCategory(toothNumber) === 'Missing' || getToothCategory(toothNumber) === null || getToothCategory(toothNumber) === 'Unknown' || getToothCategory(toothNumber) === 'missing' || getToothCategory(toothNumber) === 'مفقود';
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
    setData: () => { },
    image: {},
    setImg: () => { },
    toothEditData: [],
    setToothEditData: () => { },
    stageRef,
    detailsMode: false,
    comparisonMode: false,
    fullXrayMode: false,
    newLayoutMode: false,
    viewMode: false,
    selectedTooth: null,
    setSelectedTooth: () => { },
    toothNumberSelect: null,
    setToothNumberSelect: () => { }
  }), []);

  // FIXED: All conditional rendering happens after hooks

  // تحسين 14: تحسين عرض حالة التحميل والأخطاء
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7564ed]"></div>
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
              className="bg-[#7564ed] text-white px-4 py-2 rounded hover:bg-[#7564ed]"
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
        className="flex justify-center flex-row gap-5 max-h-[90vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* LEFT PANEL - مع Scroll منفصل */}
        <div className="flex flex-col h-full no-scrollbar gap-5 flex-1 min-w-[350px] max-w-[38%] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {tooth ? (
              <ToothDiagnosis isDragging={isDragging} sliceDrager={sliceDrager} idCard={toothNumber} showDiagnosisDetails={true} ToothSlicemode={true} />
            ) : (
              <div className="text-yellow-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <strong>Tooth data not loaded</strong>
                <p className="text-sm mt-1">Tooth number {toothNumber} data is being loaded from report...</p>
              </div>
            )}
          </motion.div>

          <motion.div
            className="flex-none h-[400px] w-[100%] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ImageCard
              showToolBar={false}
              settings={settings}
              SettingChange={SettingChange}
              setSettings={setSettings}
            />
          </motion.div>

          {/* تحسين: Toothlabels كشريط أزرار ثابت */}
          <div className="sticky bottom-0 z-10 bg-white shadow-lg rounded-lg p-3 mt-auto">
            <Toothlabels NumberOnlyMode={true} />
          </div>
        </div>

        {/* RIGHT PANEL - مع Scroll منفصل */}
        <motion.div
          className="flex flex-col gap-3 min-w-[350px]  no-scrollbar overflow-y-auto flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Top card for all 3 views controls/info - outside the scrollable area */}
          {!isMissingTooth && (<div className="bg-white shadow rounded-lg p-4 flex flex-col items-center mb-2">
            <span className="text-lg font-semibold text-gray-700">Tooth {toothNumber} Slice Ranges</span>


            {reportType && (
              <span className="text-sm text-gray-500 mt-1">Report Type: {reportType.toUpperCase()}</span>
            )}
            {storedRanges && (
              <div className="text-xs text-green-600 mt-1">✅ Ranges loaded from store</div>
            )}
          </div>)}

          <div className="bg-white shadow-lg rounded-lg p-5 min-w-[350px] flex-1">
            {/* إذا كان السن مفقوداً، اعرض رسالة بدلاً من الشرائح */}
            {isMissingTooth ? (
              <MissingToothMessage toothNumber={toothNumber} />
            ) : (
              /* Range controls and SlicesSection for each view */
              ['axial', 'coronal', 'sagittal'].map(view => {
                const start = sliceRanges[view].start;
                const end = sliceRanges[view].end;

                return (
                  <div key={view} className="">
                    <div className="font-[#0d0c22] text-2xl  capitalize text-gray-800 flex items-center gap-2">
                      {view} View
                    </div>

                    {start === 0 && end === 0 ? (
                      <NoSliceDataMessage view={view} />
                    ) : (<>
                      {/* <SliceRangeInfo 
                        view={view} 
                        sliceRanges={sliceRanges} 
                        sliceCounts={sliceCounts} 
                        voxelSizes={voxelSizes} 
                        dentalData={dentalData} 
                      /> */}
                      <SlicesSection
                        dragerstate={{ setslicedrager, setIfDragging }}
                        view={view}
                        count={sliceCounts[view] || storeSliceCounts[view] || 0}
                        start={start}
                        end={end}
                        toothNumber={toothNumber}
                        onRangeChange={handleRangeChange}
                      /></>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </DataContext.Provider>
  );
}