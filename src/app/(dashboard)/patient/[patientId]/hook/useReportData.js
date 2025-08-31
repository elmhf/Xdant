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
  const patientId = window.location.pathname.split('/')[2];
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
    
    console.log('Response:', response);
    
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
    console.log('✅ Data fetched successfully', data);
    
    // Setup image store data
    const setupFromReport = useImageStore.getState().setupFromReport;
    if (setupFromReport) {
      console.log("✅ Data fetched successfully")
      await setupFromReport(data);
    }
    
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
  
  for (const source of places) {
    if (!source) continue;
    
    if (reportType === 'pano' && source.pano_image_url) {
      return source.pano_image_url;
    } else if (reportType === 'cbct' && source.cbct_image_url) {
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

  // Main data fetching function
  const fetchData = useCallback(async (reportId, options = {}) => {
    const { forceRefresh = false } = options;
    console.log('🚀 fetchData called:', { reportId, forceRefresh, currentReport: currentReportRef.current });
    
    if (!reportId) {
      console.warn('⚠️ No reportId provided');
      updateState({ data: null, loading: false, error: 'No report ID provided', reportType: null });
      return null;
    }

    // If same report and data exists, skip fetch unless force refresh
    if (currentReportRef.current === reportId && state.data && !forceRefresh) {
      console.log('ℹ️ Same report with existing data, skipping fetch');
      return state.data;
    }
    
    // If different report, cancel previous requests
    if (currentReportRef.current !== reportId) {
      console.log('🔄 Different report detected, cleaning up');
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
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
          reportType: cachedReportType
        });

        // Process image URL from cache
        const imageUrl = getImageUrl(cachedData, cachedReportType);
        if (imageUrl) {
          setTimeout(() => handleImageUrl(imageUrl), 100);
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
    updateState({
      loading: true,
      error: null
    });

    // Create new abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const reportData = await fetchReportDataByPost(reportId, abortControllerRef.current.signal);
      
      // Handle aborted request
      if (!reportData) {
        console.log('🚫 Request was aborted');
        return null;
      }
      
      // Check if request is still current
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
          reportType: detectedReportType
        });

        // Process image URL
        const imageUrl = getImageUrl(fetchedData, detectedReportType) || 
                         getImageUrl(reportData?.report, detectedReportType);
        
        if (imageUrl) {
          setTimeout(() => handleImageUrl(imageUrl), 100);
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