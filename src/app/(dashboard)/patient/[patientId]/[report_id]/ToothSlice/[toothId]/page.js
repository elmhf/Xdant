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
import { useTranslation } from 'react-i18next';
import { useImageStore } from "@/app/(dashboard)/OrthogonalViews/stores/imageStore";
import { useReportData } from "../../../hook/useReportData";
import { motion } from "framer-motion";
import Toothlabels from "@/components/features/dashboard/main/ToothLabels/Toothlabels";

import { MissingToothMessage, NoSliceDataMessage } from "@/components/features/dashboard/main/ToothSlice/EmptyMessages";
import SlicesSection from "@/components/features/dashboard/main/ToothSlice/SlicesSection";
import { Button } from "@/components/ui/button";
import SliceViewerModal from "@/components/features/dashboard/main/ToothSlice/SliceViewerModal";

export default function ToothSlicePage() {
  const { t } = useTranslation('patient');
  // FIXED: Always call all hooks at the top level first
  const { toothId, report_id } = useParams();
  const stageRef = useRef(null);
  const [isDragging, setIfDragging] = useState(false);
  const [sliceDrager, setslicedrager] = useState({ "index": null, "view": null })
  // Modal state
  const [viewingSlice, setViewingSlice] = useState(null);
  const [modalZoom, setModalZoom] = useState(1);
  const [modalRegion, setModalRegion] = useState(null);

  // Get tooth slice ranges from store
  const toothNumber = parseInt(toothId, 10);
  const getToothCategory = useDentalStore(state => state.getToothCategory);
  const getToothSliceRanges = useDentalStore(state => state.getToothSliceRanges);
  const updateToothViewSliceRange = useDentalStore(state => state.updateToothViewSliceRange);
  const updateToothApproval = useDentalStore(state => state.updateToothApproval);
  const tooth = useDentalStore(state =>
    (state.data?.teeth || []).find(t => t.toothNumber === toothNumber)
  );

  const handleCloseModal = useCallback(() => {
    setViewingSlice(null);
    setModalZoom(1);
    setModalRegion(null);
  }, []);

  const handleOpenModal = useCallback((sliceInfo) => {
    setViewingSlice(sliceInfo);
    setModalZoom(1);
    setModalRegion(null);
  }, []);

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

  // FIXED: Fetch data on mount if needed (handling direct links)
  useEffect(() => {
    if (report_id && !hasData && !loading && !error) {
      console.log('🔄 ToothSlicePage: Fetching report data for direct link...', report_id);
      fetchData(report_id);
    }
  }, [report_id, hasData, loading, error, fetchData]);

  const {
    getViewImages,
    loadAllViews,
    sliceCounts,
    voxelSizes,
    setupFromReport
  } = useImageStore();

  // FIXED: Ensure image store is initialized. If data exists but slices don't, FORCE REFRESH to get the raw report with data_url.
  const refreshAttemptedRef = useRef(false);

  useEffect(() => {
    // If we have report data, but no slices, and we haven't just tried to refresh...
    if (reportData && !loading && !error) {
      const hasSliceCounts = sliceCounts && (sliceCounts.axial > 0 || sliceCounts.coronal > 0 || sliceCounts.sagittal > 0);

      if (!hasSliceCounts) {
        if (!refreshAttemptedRef.current) {
          console.log('🔄 ToothSlicePage: Data exists but slices missing. Forcing full refresh to retrieve image data...');
          refreshAttemptedRef.current = true;
          fetchData(report_id, { forceRefresh: true });
        } else {
          console.warn('⚠️ ToothSlicePage: Slices still missing after refresh. Data might be invalid or process failed.');
        }
      }
    }
  }, [reportData, loading, error, sliceCounts, fetchData, report_id]);

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

  // Handle navigation between slices
  const handleNavigateSlice = useCallback((direction) => {
    if (!viewingSlice) return;
    const { view, index } = viewingSlice;
    // FIXED: Use full volume limits instead of range limits to allow exploring the entire scan
    const maxSlices = sliceCounts[view] || 1000;

    let newIndex = index;
    if (direction === 'prev') {
      newIndex = Math.max(0, index - 1);
    } else if (direction === 'next') {
      newIndex = Math.min(maxSlices - 1, index + 1);
    }

    if (newIndex !== index) {
      setViewingSlice({ view, index: newIndex });
      setModalZoom(1);
      setModalRegion(null);
    }
  }, [viewingSlice, sliceCounts]);

  const handleApprove = useCallback(() => {
    if (tooth) {
      updateToothApproval(toothNumber, !tooth.approved);
    }
  }, [tooth, toothNumber, updateToothApproval]);

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
          <p className="text-gray-600">{t('toothSlice.loading')}</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{t('toothSlice.error', { error })}</div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => retry(report_id)}
              className="bg-[#7564ed] text-white px-4 py-2 rounded hover:bg-[#7564ed]"
            >
              🔄 {t('toothSlice.tryAgain')}
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={clearCache}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                {t('toothSlice.clearCache')}
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
        className="flex justify-center flex-col lg:flex-row gap-5 h-auto lg:h-[calc(100vh-140px)] pb-20 lg:pb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >

        {/* LEFT PANEL - مع Scroll منفصل */}
        <div className="flex flex-col h-full no-scrollbar gap-5 flex-1 w-full lg:min-w-[350px] lg:max-w-[38%] overflow-y-auto pb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {tooth ? (
              <ToothDiagnosis isDragging={isDragging} sliceDrager={sliceDrager} idCard={toothNumber} showDiagnosisDetails={true} ToothSlicemode={true} />
            ) : (
              <div className="text-yellow-600 bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
                <strong>{t('toothSlice.dataNotLoaded')}</strong>
                <p className="text-sm mt-1">{t('toothSlice.detailsLoading', { number: toothNumber })}</p>
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
              showToolBar={true}
              settings={settings}
              SettingChange={SettingChange}
              setSettings={setSettings}
            />
          </motion.div>


          {/* Removed Toothlabels from here */}
        </div>


        {/* RIGHT PANEL - مع Scroll منفصل */}
        <motion.div
          className="flex flex-col gap-3 w-full lg:min-w-[350px] no-scrollbar overflow-y-auto flex-1 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >

          <div className="bg-white shadow-lg rounded-2xl p-5 min-w-[350px] flex-1">
            {/* إذا كان السن مفقوداً، اعرض رسالة بدلاً من الشرائح */}
            {isMissingTooth ? (
              <MissingToothMessage toothNumber={toothNumber} />
            ) : (
              /* Range controls and SlicesSection for each view */
              ['axial', 'coronal', 'sagittal'].map(view => {
                console.log("NoSliceDataMessage", sliceRanges);
                const start = sliceRanges[view].start || sliceRanges[view].min;
                const end = sliceRanges[view].end || sliceRanges[view].max;

                return (
                  <div key={view} className=" mb-5">
                    <div className="font-[800] text-3xl  capitalize text-gray-800 flex items-center gap-2">
                      {t('toothSlice.view', { view: view })}
                    </div>

                    {start > 0 && end > 0 && (
                      <div className="text-sm font-[600] text-gray-500 mt-1 mb-3">
                        {t('toothSlice.sliceRange')} <span className="text-black">{start}</span> {t('toothSlice.to')} <span className="text-black">{end}</span> {t('toothSlice.slicesCount')} <span className="text-black">{end - start + 1}</span>
                      </div>
                    )}
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
                        toothNumber={toothNumber}
                        count={sliceCounts[view] || storeSliceCounts[view] || 0}
                        start={start}
                        end={end}
                        onRangeChange={handleRangeChange}
                        onView={handleOpenModal}
                      /></>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div >

      {/* Modal for viewing slice */}
      {
        viewingSlice && (
          <SliceViewerModal
            view={viewingSlice.view}
            index={viewingSlice.index}
            toothNumber={toothNumber}
            onClose={handleCloseModal}
            onNavigate={handleNavigateSlice}
            // FIXED: Enable navigation across full volume (0 to total slices)
            canNavPrev={viewingSlice?.index > 0}
            canNavNext={viewingSlice?.index < (sliceCounts[viewingSlice?.view] || 1000) - 1}
            zoom={modalZoom}
            setZoom={setModalZoom}
            region={modalRegion}
            setRegion={setModalRegion}
          />
        )
      }

      {/* Bottom Navbar */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between max-w-[95%] mx-auto">
          {/* Left: Tooth Labels */}
          <div className="flex-1 overflow-x-auto">
            <Toothlabels NumberOnlyMode={true} />
          </div>

          {/* Right: Approve Button */}
          <div className="flex-shrink-0 ml-4">
            <Button
              variant={tooth?.approved ? "success" : "outline"}
              size="sm"
              className="text-lg font-bold bg-[#EBE8FC] border text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-2xl  flex items-center min-w-[6vw] "
              style={{ color: tooth?.approved ? '#16a34a' : undefined, backgroundColor: tooth?.approved ? '#E9FCF0' : undefined }}
              onClick={() => updateToothApproval(toothNumber, !tooth?.approved)}
            >
              {tooth?.approved ? t('toothSlice.approved') : t('toothSlice.approve')}
            </Button>
          </div>
        </div>
      </div>
    </DataContext.Provider >
  );
}
