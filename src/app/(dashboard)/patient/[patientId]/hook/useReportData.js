// hooks/useReportData.js
import { useState, useCallback, useRef, useEffect } from 'react';
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
  const patientId = window.location.pathname.split('/')[2]; // Extract from /patient/[patientId]/
  console.log('🔗 URL Parameters:', { patientId, reportId: cleanReportId });

  try {
    const response = await fetch('http://localhost:5000/api/reports/get-data-with-json', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        report_id: cleanReportId,
        patient_id: patientId 
      }),
      signal: abortSignal
    });
    console.log('responsekk',response)
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        console.warn('Failed to parse error response:', parseError);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Data fetched successfully',data);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('🚫 Request aborted');
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

  for (const dataToCheck of places) {
    if (!dataToCheck) continue;

    if (dataToCheck.pano_image_url) {
      console.log('📋 Report type detected: PANO (found pano_image_url)');
      return 'pano';
    }
    
    if (dataToCheck.cbct_image_url) {
      console.log('📋 Report type detected: CBCT (found cbct_image_url)');
      return 'cbct';
    }

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
  
  if (reportType === 'pano') {
    return data.pano_image_url;
  } else if (reportType === 'cbct') {
    return data.cbct_image_url;
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

/**
 * Hook with single report caching, automatic type detection, and imageStore integration
 */
export function useReportData(options = {}) {
  const { imageCard } = options;
  const { loadPatientData } = useDentalStore();
  
  // ← إضافة imageStore hooks
  const { 
    setupFromReport,
    reset: resetImageStore,
    areAllViewsLoaded,
    getViewLoading,
    isViewLoaded,
    loadAllViews
  } = useImageStore();
  
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    reportType: null,
    // ← إضافة image loading states
    imageLoading: false,
    imageError: null,
    imagesReady: false
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
        console.log("----------------✅✅✅✅✅✅✅✅✅imageUrl   ",imageUrl)
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

  // ← جديد: Handle CBCT images using imageStore
  const handleCbctImages = useCallback(async (reportData) => {
    if (!reportData) {
      console.warn('⚠️ No report data for CBCT image handling');
      return false;
    }

    console.log('🏥 Setting up CBCT images using imageStore...');
    
    // Update state to show image loading
    setState(prev => ({
      ...prev,
      imageLoading: true,
      imageError: null,
      imagesReady: false
    }));

    try {
      // Use setupFromReport to initialize imageStore
      const result = await setupFromReport(reportData);
      
      if (result.success) {
        console.log('✅ CBCT images setup successful');
        
        // Update state
        setState(prev => ({
          ...prev,
          imageLoading: false,
          imageError: null,
          imagesReady: true
        }));
        
        return true;
      } else {
        throw new Error(result.error || 'Failed to setup CBCT images');
      }
      
    } catch (error) {
      console.error('❌ Failed to setup CBCT images:', error);
      
      setState(prev => ({
        ...prev,
        imageLoading: false,
        imageError: error.message,
        imagesReady: false
      }));
      
      return false;
    }
  }, [setupFromReport]);

  // Stable update state function
  const updateState = useCallback((newState) => {
    if (isMountedRef.current) {
      setState(newState);
    }
  }, []);

  // Main data fetching function with imageStore integration
  const fetchData = useCallback(async (reportId, options = {}) => {
    const { forceRefresh = false } = options;
    console.log('🚀 fetchData called:', { reportId, forceRefresh, currentReport: currentReportRef.current });
    
    if (!reportId) {
      console.warn('⚠️ No reportId provided');
      return null;
    }

    // إذا كان نفس التقرير والبيانات موجودة، ما نعملش fetch إضافي
    if (currentReportRef.current === reportId && state.data && !forceRefresh) {
      console.log('ℹ️ Same report with existing data, skipping fetch');
      return state.data;
    }
    
    // إذا كان تقرير جديد، نلغي الطلبات السابقة ونمسح imageStore
    if (currentReportRef.current !== reportId) {
      console.log('🔄 Different report detected, cleaning up');
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // ← Reset imageStore for new report
      resetImageStore();
      
      lastProcessedUrlRef.current = null;
    }
    
    currentReportRef.current = reportId;

    // Check cache first (unless force refresh)
    if (!forceRefresh && singleReportCache && singleReportCache.reportId === reportId) {
      const { data: cachedData, createdAt } = singleReportCache;
      const timePassed = Date.now() - createdAt;
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      
      if (timePassed < CACHE_DURATION) {
        console.log('💾 Using cached data for same report');
        
        loadDataToStore(loadPatientData, cachedData, reportId, 'cached');
        const cachedReportType = singleReportCache.metadata?.reportType;
        
        updateState({
          data: cachedData,
          loading: false,
          error: null,
          reportType: cachedReportType,
          imageLoading: false,
          imageError: null,
          imagesReady: false
        });

        // Handle images based on report type
        if (cachedReportType === 'cbct') {
          // Use imageStore for CBCT
          await handleCbctImages({ data: cachedData });
        } else {
          // Use imageCard for PANO
          const imageUrl = getImageUrl(cachedData, cachedReportType);
          if (imageUrl) {
            setTimeout(() => handleImageUrl(imageUrl), 100);
          }
        }
        
        return cachedData;
      }
    }

    // Clear cache for different report
    if (singleReportCache && singleReportCache.reportId !== reportId) {
      singleReportCache = null;
      console.log('🗑️ Previous report cache cleared');
    }

    // Set loading state
    updateState(prev => ({
      ...prev,
      loading: true,
      error: null,
      imageLoading: false,
      imageError: null,
      imagesReady: false
    }));

    // Create new abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const reportData = await fetchReportDataByPost(reportId, abortControllerRef.current.signal);
      
      if (!reportData) {
        console.log('🚫 Request was aborted');
        return null;
      }
      
      if (currentReportRef.current !== reportId || !isMountedRef.current) {
        console.log('🚫 Request obsolete or component unmounted');
        return null;
      }

      // Detect report type automatically
      const detectedReportType = detectReportType(reportData);
      console.log('📋 Auto-detected report type:', detectedReportType);

      let fetchedData = null;

      // Try to get data directly first
      if (reportData?.data) {
        fetchedData = reportData.data;
        console.log('✅ Direct data found');
      } else {
        // Fallback to URL fetching
        const reportUrl = getReportUrl(reportData, detectedReportType);
        
        if (reportUrl) {
          try {
            const { fetchJsonFromUrl } = await import('@/stores/dataStore');
            fetchedData = await fetchJsonFromUrl(reportUrl);
            console.log('✅ Data fetched from URL successfully');
          } catch (urlError) {
            console.warn('⚠️ Failed to fetch URL data:', urlError);
            fetchedData = reportData?.report || reportData;
          }
        } else {
          console.warn('⚠️ No valid URL found, using basic report data');
          fetchedData = reportData?.report || reportData;
        }
      }

      // Update cache
      singleReportCache = {
        reportId,
        data: fetchedData,
        createdAt: Date.now(),
        metadata: {
          reportType: detectedReportType,
          fetchedAt: new Date().toISOString()
        }
      };

      console.log('💾 New report cached:', reportId.slice(0, 8), 'Type:', detectedReportType);

      // Load data to store
      loadDataToStore(loadPatientData, fetchedData, reportId, 'fresh');

      // Update state if still current
      if (currentReportRef.current === reportId && isMountedRef.current) {
        updateState({
          data: fetchedData,
          loading: false,
          error: null,
          reportType: detectedReportType,
          imageLoading: false,
          imageError: null,
          imagesReady: false
        });

        // ← Handle images based on report type
        if (detectedReportType === 'cbct') {
          // Use imageStore for CBCT images
          console.log('🏥 Handling CBCT images with imageStore');
          await handleCbctImages({ data: fetchedData });
        } else {
          // Use imageCard for PANO images
          console.log('📸 Handling PANO image with imageCard');
          const imageUrl = getImageUrl(fetchedData, detectedReportType) || 
                           getImageUrl(reportData?.report, detectedReportType);
          
          if (imageUrl) {
            setTimeout(() => handleImageUrl(imageUrl), 100);
          }
        }
      }

      return fetchedData;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🚫 Fetch aborted');
        return null;
      }
      
      console.error('❌ Fetch failed:', error);
      
      if (currentReportRef.current === reportId && isMountedRef.current) {
        updateState({
          data: null,
          loading: false,
          error: error.message,
          reportType: null,
          imageLoading: false,
          imageError: null,
          imagesReady: false
        });
      }
      
      throw error;
    }
  }, [loadPatientData, handleImageUrl, handleCbctImages, updateState, resetImageStore]);

  // Retry function
  const retry = useCallback((reportId) => {
    console.log('🔄 Retry requested, clearing cache');
    singleReportCache = null;
    resetImageStore(); // ← Reset imageStore on retry
    return fetchData(reportId, { forceRefresh: true });
  }, [fetchData, resetImageStore]);

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
    resetImageStore(); // ← Reset imageStore when clearing cache
    console.log('🗑️ Cache, URL tracking, and imageStore cleared');
  }, [resetImageStore]);

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
    
    // ← Reset imageStore
    resetImageStore();
    
    // Reset state only if component is still mounted
    if (isMountedRef.current) {
      updateState({
        data: null,
        loading: false,
        error: null,
        reportType: null,
        imageLoading: false,
        imageError: null,
        imagesReady: false
      });
    }
  }, [updateState, resetImageStore]);

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
  }, [singleReportCache?.reportId, singleReportCache?.createdAt]);

  // Helper function to check report type
  const isReportType = useCallback((type) => {
    return state.reportType?.toLowerCase() === type?.toLowerCase();
  }, [state.reportType]);

  // ← New: Get image loading status from imageStore
  const getImageLoadingStatus = useCallback(() => {
    if (state.reportType === 'cbct') {
      return {
        loading: state.imageLoading || getViewLoading('axial') || getViewLoading('coronal') || getViewLoading('sagittal'),
        ready: state.imagesReady && areAllViewsLoaded(),
        error: state.imageError,
        axialLoaded: isViewLoaded('axial'),
        coronalLoaded: isViewLoaded('coronal'),
        sagittalLoaded: isViewLoaded('sagittal')
      };
    }
    return {
      loading: false,
      ready: true,
      error: null,
      axialLoaded: false,
      coronalLoaded: false,
      sagittalLoaded: false
    };
  }, [state.reportType, state.imageLoading, state.imagesReady, state.imageError, 
      getViewLoading, areAllViewsLoaded, isViewLoaded]);

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
    
    // ← Image-related state
    imageLoading: state.imageLoading,
    imageError: state.imageError,
    imagesReady: state.imagesReady,
    
    // Actions
    fetchData,
    retry,
    cancel,
    clearCache,
    reset,
    handleImageUrl,
    handleCbctImages, // ← New action
    
    // Helpers
    isLoading: state.loading,
    hasData: !!state.data,
    hasError: !!state.error,
    isIdle: !state.loading && !state.error && !state.data,
    isPanoReport: isReportType('pano'),
    isCbctReport: isReportType('cbct'),
    isReportType,
    getImageLoadingStatus, // ← New helper
    
    // ImageStore integration helpers
    areImagesLoaded: areAllViewsLoaded,
    loadAllImages: loadAllViews,
    
    // Debug
    getCacheInfo
  };
}