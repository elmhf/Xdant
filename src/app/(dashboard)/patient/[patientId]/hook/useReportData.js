// hooks/useReportData.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';
import { useDentalStore } from '@/stores/dataStore';
import { useImageStore } from '@/app/(dashboard)/OrthogonalViews/stores/imageStore';

// Simple cache for single report
let singleReportCache = null;

// Data fetching function
async function fetchReportDataByPost(reportId, abortSignal) {
  if (!reportId) {
    throw new Error('Report ID is required');
  }

  const cleanReportId = String(reportId).trim();
  console.log('🔍 Fetching report:', cleanReportId);

  // Extract patient ID from URL
  const patientId = window.location.pathname.split('/')[2];
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

    // Setup image store data
    const setupFromReport = useImageStore.getState().setupFromReport;
    if (setupFromReport) {
      console.log("✅ Data fetched successfully", data.report)
      await setupFromReport(data.report);
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
  if (!reportData) {
    console.warn('⚠️ No report data found for type detection');
    return 'unknown';
  }

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
    if (!dataToCheck) continue;

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

    // Check for report_type field
    if (dataToCheck.report_type) {
      const reportType = String(dataToCheck.report_type).toLowerCase();
      console.log('📋 Report type detected:', reportType.toUpperCase(), '(from report_type field)');
      return reportType;
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
    const store = useDentalStore.getState();
    const currentStoreReportId = store.getCurrentReportId();

    console.log('🚀 fetchData called:', { reportId, forceRefresh, currentStoreReportId });

    if (!reportId) {
      console.warn('⚠️ No reportId provided');
      updateState({ data: null, loading: false, error: 'No report ID provided', reportType: null });
      return null;
    }

    // 1. Check if we already have this report loaded effectively
    if (!forceRefresh && currentStoreReportId === reportId && store.hasData()) {
      console.log('✅ Report already loaded in store, skipping fetch');
      // Sync state with store data
      const storeData = store.data;
      updateState({
        data: storeData,
        loading: false,
        error: null,
        reportType: storeData.reportType
      });
      return storeData;
    }

    // 2. If different report or force refresh, reset store
    if (currentStoreReportId !== reportId || forceRefresh) {
      console.log('🔄 Switching reports: Clearing old data...');

      // Reset store
      if (store.resetData) store.resetData();

      // Update current report ID immediately to prevent race conditions
      if (store.setCurrentReportId) store.setCurrentReportId(reportId);

      // Clear local cache variables
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      lastProcessedUrlRef.current = null;
      singleReportCache = null;
    }

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
        // Fallback or URL fetching logic if needed
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
        if (imageUrl) {
          setTimeout(() => handleImageUrl(imageUrl), 100);
        }
      }

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