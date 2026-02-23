// hooks/useReportData.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';
import { useDentalStore } from '@/stores/dataStore';
import { useImageStore } from '@/app/(dashboard)/OrthogonalViews/stores/imageStore';
import useUserStore from '@/components/features/profile/store/userStore';

// Simple cache for single report
let singleReportCache = null;

// Data fetching function
async function fetchReportDataByPost(reportId, abortSignal) {
  if (!reportId) {
    throw new Error('Report ID is required');
  }

  const cleanReportId = String(reportId).trim();
  console.log('🔍 Fetching report:', cleanReportId);

  // Extract patient ID from URL robustly (handling locale prefixes like /en/patient/...)
  const pathParts = window.location.pathname.split('/');
  const patientIdx = pathParts.findIndex(p => p === 'patient') + 1;
  const patientId = patientIdx > 0 ? pathParts[patientIdx] : pathParts[2];
  console.log('🔗 URL Parameters:', { patientId, reportId: cleanReportId });

  try {
    const data = await apiClient('/api/reports/get-data-with-json', {
      method: 'POST',
      body: JSON.stringify({
        report_id: cleanReportId,
        patient_id: patientId
      }),
      signal: abortSignal
    });


    console.log('✅ Data fetched successfully', data);

    // Sync Clinic ID if available in metadata
    if (data?._meta?.clinic_id) {
      const { currentClinicId, setCurrentClinicId } = useUserStore.getState();
      if (currentClinicId !== data._meta.clinic_id) {
        console.log('🔄 Syncing clinic ID from report metadata:', data._meta.clinic_id);
        setCurrentClinicId(data._meta.clinic_id);
      }
    }

    // Setup image store data (ONLY for 3D/CBCT reports)
    const setupFromReport = useImageStore.getState().setupFromReport;
    if (setupFromReport) {
      // Detect type from fetched data
      const detectedType = detectReportType(data);
      console.log('📊 Initializing Image Store for type:', detectedType);

      if (detectedType === 'cbct' || detectedType === 'toothslice' || detectedType === '3d model ai' || detectedType === 'tooth slice') {
        // Merge report and report_data to ensure all fields (scanInfo, dimensions, URLs) are available
        const dataForStore = {
          ...(data.report || {}),
          ...(data.report_data || data.data || {}),
          data_url: data.data_url || (data.report?.data_url) || (data.report?.report_url)
        };

        console.log("✅ Data merged for imageStore:", {
          hasScanInfo: !!dataForStore.scanInfo,
          hasDimensions: !!dataForStore.scanInfo?.dimensions,
          reportType: detectedType
        });

        await setupFromReport(dataForStore);
      } else {
        console.log('⏭️ Skipping 3D Image Store setup for non-3D report type:', detectedType);
      }
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.debug('🚫 Request aborted (normal behavior when navigating)', error);
      return null;
    }
    console.error('❌ Network error:', error);
    throw error;
  }
}

// Function to detect report type based on available image URLs
function detectReportType(reportData) {
  console.log("reportTypereportTypereportTypereportTypereportTypereportData", reportData)
  if (!reportData) {
    console.warn('⚠️ No report data found for type detection');
    return 'unknown';
  }
  console.log("reportTypereportTypereportTypereportTypereportType", reportData)
  // Check in multiple places for image URLs and data
  const places = [
    reportData.data,
    reportData.report,
    reportData.fetchedData,
    reportData
  ];

  console.log('🔍 Detecting report type from data structure:', {
    hasData: !!reportData.data,
    hasReport: !!reportData.report,
    hasFetchedData: !!reportData.fetchedData,
    reportType: reportData.report?.report_type
  });

  // Check each location for image URLs
  for (const dataToCheck of places) {
    console.log("reportDatareportDatareportDatareportDatareportDatareportData", reportData.report.report_type)
    if (!dataToCheck) continue;
    // Check for report_type or raport_type field
    if (dataToCheck.report_type || dataToCheck.raport_type) {
      const typeValue = dataToCheck.report_type || dataToCheck.raport_type;
      console.log("reportDatareportDatareportDatareportDatareportDatareportDataValue", typeValue)
      const reportType = String(typeValue).toLowerCase();
      console.log('📋 Report type detected:', reportType.toUpperCase(), '(from type field)');
      return reportType;
    }
    // Check for pano image URL first
    if (dataToCheck.pano_image_url) {
      console.log('📋 Report type detected: PANO (found pano_image_url)');
      return 'pano';
    }

    // Check for CBCT image URL
    if (dataToCheck.cbct_image_url) {
      console.log('📋 Report type detected: CBCT (found cbct_image_url)');
      return 'cbct';
    }


  }

  console.warn('⚠️ Unable to detect report type. Using default: cbct');
  return 'cbct';
}

// Function to determine appropriate URL based on detected report type
function getReportUrl(reportData, detectedType) {
  if (!reportData?.report) {
    console.warn('⚠️ No report data found');
    return null;
  }

  const report = reportData.report;
  console.log('🔗 Getting URL for detected type:', detectedType?.toUpperCase());

  // URL mapping based on detected report type
  const urlMap = {
    'pano': report.pano_image_url || report.report_url,
    'cbct': report.cbct_report_url || report.report_url,
  };

  const url = urlMap[detectedType] || report.report_url;

  if (url) {
    console.log(`🔗 ${detectedType?.toUpperCase() || 'DEFAULT'} report - using URL:`, url.substring(0, 50) + '...');
  }

  return url;
}

// Function to get the appropriate image URL based on report type
function getImageUrl(data, reportType) {
  if (!data || !reportType) return null;

  const places = [data, data.report, data.data];
  console.log('🔍 Getting image URL for detected type:', places);

  for (const source of places) {
    if (!source) continue;

    if (reportType === 'pano' && source.pano_image_url) {
      console.log('✅ Found PANO image URL:', source.pano_image_url);
      return source.pano_image_url;
    } else if (reportType === 'cbct' && source.cbct_image_url) {
      console.log('✅ Found CBCT image URL:', source.cbct_image_url);
      return source.cbct_image_url;
    }
  }

  return null;
}

// Data validation function
function validateDataForStore(data, reportId) {
  if (!data) {
    console.error('❌ No data to load to store for report:', reportId);
    return false;
  }

  if (typeof data !== 'object') {
    console.error('❌ Data is not an object for report:', reportId, 'Type:', typeof data);
    return false;
  }

  console.log('✅ Data validation passed for store loading:', reportId);
  return true;
}

// Store loading function with proper error handling
function loadDataToStore(loadPatientData, data, reportId, source = 'fresh') {
  if (!validateDataForStore(data, reportId)) {
    return false;
  }

  try {
    console.log(`🏪 Loading ${source} data to store for report:`, reportId);
    loadPatientData(data);
    console.log(`✅ ${source} data loaded to store successfully`);
    return true;
  } catch (storeError) {
    console.error(`❌ Failed to load ${source} data to store:`, storeError);
    return false;
  }
}

// Function to get slice ranges for a specific tooth and view
function getToothSliceRanges(data, toothNumber, view = null) {
  if (!data || !toothNumber) {
    console.warn('⚠️ Missing data or toothNumber for slice ranges');
    return null;
  }

  // Find the tooth in the teeth array
  const tooth = findToothByNumber(data, toothNumber);

  if (!tooth) {
    console.warn(`⚠️ Tooth ${toothNumber} not found in data`);
    return null;
  }

  if (!tooth.sliceRanges) {
    console.warn(`⚠️ No slice ranges found for tooth ${toothNumber}`);
    return null;
  }

  // If specific view is requested, return only that view
  if (view) {
    const normalizedView = view.toLowerCase();
    const validViews = ['axial', 'sagittal', 'coronal'];

    if (!validViews.includes(normalizedView)) {
      console.warn(`⚠️ Invalid view '${view}'. Valid views: ${validViews.join(', ')}`);
      return null;
    }

    const sliceRange = tooth.sliceRanges[normalizedView];
    if (!sliceRange) {
      console.warn(`⚠️ No ${normalizedView} slice range found for tooth ${toothNumber}`);
      return null;
    }

    console.log(`📍 Slice range for tooth ${toothNumber} (${normalizedView}):`, sliceRange);
    return {
      view: normalizedView,
      start: sliceRange.start,
      end: sliceRange.end,
      range: sliceRange.end - sliceRange.start + 1
    };
  }

  // Return all available slice ranges
  console.log(`📍 All slice ranges for tooth ${toothNumber}:`, tooth.sliceRanges);
  return tooth.sliceRanges;
}

// Function to get all slice ranges for all teeth
function getAllTeethSliceRanges(data, view = null) {
  if (!data) {
    console.warn('⚠️ No data provided for getAllTeethSliceRanges');
    return {};
  }

  const teeth = findAllTeeth(data);
  if (!teeth || teeth.length === 0) {
    console.warn('⚠️ No teeth found in data');
    return {};
  }

  const allRanges = {};

  teeth.forEach(tooth => {
    if (!tooth.toothNumber) return;

    const ranges = getToothSliceRanges(data, tooth.toothNumber, view);
    if (ranges) {
      allRanges[tooth.toothNumber] = ranges;
    }
  });

  console.log(`📍 Slice ranges for all teeth${view ? ` (${view} view)` : ''}:`, allRanges);
  return allRanges;
}

// Function to find tooth by number in data
function findToothByNumber(data, toothNumber) {
  if (!data || !toothNumber) return null;

  // Check in multiple possible locations
  const places = [
    data.teeth,
    data.data?.teeth,
    data.report?.teeth,
    data.fetchedData?.teeth
  ];

  for (const teethArray of places) {
    if (Array.isArray(teethArray)) {
      const tooth = teethArray.find(t => t.toothNumber === toothNumber || String(t.toothNumber) === String(toothNumber));
      if (tooth) {
        return tooth;
      }
    }
  }

  return null;
}

// Function to find all teeth in data
function findAllTeeth(data) {
  if (!data) return [];

  // Check in multiple possible locations
  const places = [
    data.teeth,
    data.data?.teeth,
    data.report?.teeth,
    data.fetchedData?.teeth
  ];

  for (const teethArray of places) {
    if (Array.isArray(teethArray) && teethArray.length > 0) {
      return teethArray;
    }
  }

  return [];
}

// Function to get slice range boundaries for a view
function getViewSliceBoundaries(data, view) {
  if (!data || !view) return null;

  const allRanges = getAllTeethSliceRanges(data, view);
  const ranges = Object.values(allRanges);

  if (ranges.length === 0) return null;

  const starts = ranges.map(r => r.start);
  const ends = ranges.map(r => r.end);

  return {
    view: view.toLowerCase(),
    minStart: Math.min(...starts),
    maxEnd: Math.max(...ends),
    totalRange: Math.max(...ends) - Math.min(...starts) + 1,
    teethCount: ranges.length
  };
}

// Function to check if a slice number is within any tooth's range for a view
function isSliceInToothRange(data, sliceNumber, view) {
  if (!data || typeof sliceNumber !== 'number' || !view) return [];

  const allRanges = getAllTeethSliceRanges(data, view);
  const matchingTeeth = [];

  Object.entries(allRanges).forEach(([toothNumber, range]) => {
    if (sliceNumber >= range.start && sliceNumber <= range.end) {
      matchingTeeth.push({
        toothNumber: parseInt(toothNumber),
        range: range,
        relativePosition: sliceNumber - range.start + 1
      });
    }
  });

  return matchingTeeth;
}

/**
 * Hook with single report caching and automatic type detection
 */
export function useReportData(options = {}) {
  const { imageCard } = options;
  const { loadPatientData } = useDentalStore();

  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    reportType: null
  });

  const abortControllerRef = useRef(null);
  const currentReportRef = useRef(null);
  const lastProcessedUrlRef = useRef(null);
  const isMountedRef = useRef(true);

  // Handle image URL processing
  const handleImageUrl = useCallback(async (imageUrl) => {
    if (!imageUrl || !imageCard?.handleUrlUpload || imageUrl === lastProcessedUrlRef.current) {
      return false;
    }

    console.log('🖼️ Processing image URL from hook:', imageUrl.substring(0, 50) + '...');
    lastProcessedUrlRef.current = imageUrl;

    try {
      if (typeof imageCard.handleUrlUpload === 'function') {
        console.log("🖼️ Processing image URL:", imageUrl);
        await imageCard.handleUrlUpload(imageUrl);
        console.log('✅ Image URL processed successfully by hook');
        return true;
      } else {
        console.warn('⚠️ handleUrlUpload is not a function');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to process image URL in hook:', error);
      return false;
    }
  }, [imageCard]);

  // Stable update state function
  const updateState = useCallback((newState) => {
    if (isMountedRef.current) {
      setState(prevState => {
        if (typeof newState === 'function') {
          return newState(prevState);
        }
        return { ...prevState, ...newState };
      });
    }
  }, []);

  // Slice range functions
  const getToothSliceRange = useCallback((toothNumber, view = null) => {
    return getToothSliceRanges(state.data, toothNumber, view);
  }, [state.data]);

  const getAllSliceRanges = useCallback((view = null) => {
    return getAllTeethSliceRanges(state.data, view);
  }, [state.data]);

  const getSliceBoundaries = useCallback((view) => {
    return getViewSliceBoundaries(state.data, view);
  }, [state.data]);

  const findTeethInSlice = useCallback((sliceNumber, view) => {
    return isSliceInToothRange(state.data, sliceNumber, view);
  }, [state.data]);

  const getTooth = useCallback((toothNumber) => {
    return findToothByNumber(state.data, toothNumber);
  }, [state.data]);

  const getAllTeeth = useCallback(() => {
    return findAllTeeth(state.data);
  }, [state.data]);

  // Main data fetching function
  const fetchData = useCallback(async (reportId, options = {}) => {
    const { forceRefresh = false } = options;

    if (!reportId) {
      console.warn('⚠️ No reportId provided');
      updateState({ data: null, loading: false, error: 'No report ID provided', reportType: null });
      return null;
    }

    // 1. Check module-level cache first (fastest)
    const now = Date.now();
    const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

    if (!forceRefresh &&
      singleReportCache &&
      singleReportCache.reportId === reportId &&
      (now - singleReportCache.createdAt) < CACHE_TTL) {
      console.log('🚀 Loading from module-level cache:', reportId);

      // Restore to store if store is empty
      const store = useDentalStore.getState();
      if (!store.hasData() || store.getCurrentReportId() !== reportId) {
        loadDataToStore(loadPatientData, singleReportCache.data, reportId, 'cache-restore');
      }

      updateState({
        data: singleReportCache.data,
        loading: false,
        error: null,
        reportType: singleReportCache.reportType
      });

      return singleReportCache.data;
    }

    // 2. Check store for existing data (Zustand persist cache)
    const store = useDentalStore.getState();
    const currentStoreReportId = store.getCurrentReportId ? store.getCurrentReportId() : null;

    if (!forceRefresh && currentStoreReportId === reportId && store.hasData()) {
      console.log('✅ Report already loaded in store, skipping fetch');
      const storeData = store.data;
      updateState({
        data: storeData,
        loading: false,
        error: null,
        reportType: store.reportType || detectReportType(storeData)
      });
      return storeData;
    }

    // 3. If different report or force refresh, reset and fetch
    console.log('🌐 Fetching fresh report data:', { reportId, forceRefresh });

    if (currentStoreReportId !== reportId || forceRefresh) {
      if (store.resetData) store.resetData();
      if (store.setCurrentReportId) store.setCurrentReportId(reportId);
    }

    // Cancel old request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    currentReportRef.current = reportId;

    // Set loading state
    updateState({
      loading: true,
      error: null
    });

    try {
      // Fetch new data
      const reportData = await fetchReportDataByPost(reportId, abortControllerRef.current.signal);

      // Handle aborted request
      if (!reportData) {
        console.debug('🚫 Request was aborted (normal behavior)');
        return null;
      }

      // Check if request is still current (user didn't switch away)
      if (currentReportRef.current !== reportId || !isMountedRef.current) {
        console.log('🚫 Request obsolete or component unmounted');
        return null;
      }

      // Detect report type automatically
      const detectedReportType = detectReportType(reportData);
      console.log('📋 Auto-detected report type:', detectedReportType);

      let fetchedData = null;

      // Normalize data structure
      if (reportData?.data) {
        fetchedData = reportData.data;
      } else {
        // Fallback or URL fetching logic if needed4


        const reportUrl = getReportUrl(reportData, detectedReportType);
        if (reportUrl) {
          try {
            const { fetchJsonFromUrl } = await import('@/stores/dataStore');
            fetchedData = await fetchJsonFromUrl(reportUrl);
          } catch (e) {
            fetchedData = reportData?.report || reportData;
          }
        } else {
          fetchedData = reportData?.report || reportData;
        }
      }

      // Load data to store
      const success = loadDataToStore(loadPatientData, fetchedData, reportId, 'fresh');

      if (success) {
        // Ensure report ID is set again (just in case)
        if (store.setCurrentReportId) store.setCurrentReportId(reportId);

        // Update hook state
        updateState({
          data: fetchedData,
          loading: false,
          error: null,
          reportType: detectedReportType
        });

        // Process image URL
        const imageUrl = getImageUrl(reportData, detectedReportType) ||
          getImageUrl(reportData?.report, detectedReportType);

        console.log('🖼️ Resolved Image URL:', imageUrl);

        if (imageUrl) {
          console.log('⏳ Triggering handleImageUrl with delay...');
          setTimeout(() => {
            console.log('🚀 Executing delayed handleImageUrl for:', imageUrl);
            handleImageUrl(imageUrl);
          }, 100);
        } else {
          console.warn('⚠️ No image URL found to process');
        }
      }

      // Populate cache
      singleReportCache = {
        reportId: reportId,
        data: fetchedData,
        reportType: detectedReportType,
        createdAt: Date.now()
      };

      return fetchedData;

    } catch (error) {
      if (error.name === 'AbortError') return null;

      console.error('❌ Fetch failed:', error);
      if (isMountedRef.current) {
        updateState({
          data: null,
          loading: false,
          error: error.message,
          reportType: null
        });
      }
      throw error;
    }
  }, [loadPatientData, handleImageUrl, updateState]);

  // Retry function
  const retry = useCallback((reportId) => {
    console.log('🔄 Retry requested, clearing cache');
    singleReportCache = null;
    return fetchData(reportId, { forceRefresh: true });
  }, [fetchData]);

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      console.log('🚫 Cancelling current request');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Clear cache and reset URL tracking
  const clearCache = useCallback(() => {
    singleReportCache = null;
    lastProcessedUrlRef.current = null;
    console.log('🗑️ Cache and URL tracking cleared');
  }, []);

  // Reset state and URL tracking
  const reset = useCallback(() => {
    console.log('🔄 Resetting hook state');

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Reset refs
    currentReportRef.current = null;
    lastProcessedUrlRef.current = null;

    // Reset state only if component is still mounted
    if (isMountedRef.current) {
      updateState({
        data: null,
        loading: false,
        error: null,
        reportType: null
      });
    }
  }, [updateState]);

  // Sync image URL when data or imageCard changes
  useEffect(() => {
    if (!state.data || !imageCard || state.loading) return;

    // Process image URL from current data
    const imageUrl = getImageUrl(state.data, state.reportType) ||
      getImageUrl(state.data?.report, state.reportType);

    if (imageUrl && imageUrl !== lastProcessedUrlRef.current) {
      console.log('🔄 Syncing image to card:', imageUrl);
      handleImageUrl(imageUrl);
    }
  }, [state.data, state.reportType, imageCard, state.loading, handleImageUrl]);

  // Get cache information
  const getCacheInfo = useCallback(() => {
    if (singleReportCache) {
      return {
        hasCache: true,
        reportId: singleReportCache.reportId,
        type: singleReportCache.metadata?.reportType,
        age: Date.now() - singleReportCache.createdAt
      };
    }
    return { hasCache: false };
  }, []);

  // Helper function to check report type
  const isReportType = useCallback((type) => {
    return state.reportType?.toLowerCase() === type?.toLowerCase();
  }, [state.reportType]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,
    reportType: state.reportType,

    // Actions
    fetchData,
    retry,
    cancel,
    clearCache,
    reset,
    handleImageUrl,

    // Slice Range Functions
    getToothSliceRange,
    getAllSliceRanges,
    getSliceBoundaries,
    findTeethInSlice,
    getTooth,
    getAllTeeth,

    // Helpers
    isLoading: state.loading,
    hasData: !!state.data,
    hasError: !!state.error,
    isIdle: !state.loading && !state.error && !state.data,
    isPanoReport: isReportType('pano'),
    isCbctReport: isReportType('cbct'),
    isReportType,

    // Debug
    getCacheInfo
  };
}