// hooks/useToothSliceData.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { useDentalStore } from '@/stores/dataStore';
import { useImageStore } from '@/app/(dashboard)/OrthogonalViews/stores/imageStore';

// Simple cache for tooth slice data
let toothSliceCache = null;

// Data fetching function for tooth slice
async function fetchToothSliceData(toothId, abortSignal) {
  if (!toothId) {
    throw new Error('Tooth ID is required');
  }

  const cleanToothId = String(toothId).trim();
  console.log('🦷 Fetching tooth slice data:', cleanToothId);

  // Extract patient ID and report ID from URL path
  const pathSegments = window.location.pathname.split('/');
  const patientId = pathSegments[2]; // Extract from /patient/[patientId]/
  const reportId = pathSegments[3]; // Extract from /[report_id]/
  
  // Fallback to query parameters if not in path
  const urlParams = new URLSearchParams(window.location.search);
  const fallbackReportId = urlParams.get('reportId') || urlParams.get('report_id') || cleanToothId;
  
  const finalReportId = reportId || fallbackReportId;
  
  console.log('🔗 URL Parameters:', { patientId, reportId: finalReportId, toothId: cleanToothId });

  try {
    // Use the same API endpoint as useReportData to get all data including slices
    const response = await fetch('http://localhost:5000/api/reports/get-data-with-json', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        report_id: finalReportId,
        patient_id: patientId,
        tooth_id: cleanToothId 
      }),
      signal: abortSignal
    });

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

    const reportData = await response.json();
    console.log('✅ Tooth slice report data fetched successfully:', reportData);

    // Extract slices data from the report data
    const slicesData = reportData.data?.slices || reportData.slices || {};
    console.log('✅ Slices data extracted from report:', slicesData);

    // Get tooth data from dental store or from the report data
    const dentalStore = useDentalStore.getState();
    const toothData = dentalStore.data?.teeth?.find(t => t.toothNumber === parseInt(cleanToothId, 10)) ||
                     reportData.data?.tooth ||
                     { toothNumber: parseInt(cleanToothId, 10) };

    // Combine all data
    const combinedData = {
      tooth: toothData,
      slices: slicesData,
      toothId: cleanToothId,
      reportType: 'toothSlice',
      reportData: reportData,
      fetchedAt: new Date().toISOString()
    };

    console.log('✅ Tooth slice data combined successfully');
    return combinedData;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('🚫 Tooth slice request aborted');
      return null;
    }
    console.error('❌ Tooth slice fetch error:', error);
    throw error;
  }
}

// Function to validate tooth slice data
function validateToothSliceData(data, toothId) {
  if (!data) {
    console.error('❌ No tooth slice data to validate for tooth:', toothId);
    return false;
  }
  
  if (!data.tooth) {
    console.error('❌ No tooth data found for tooth:', toothId);
    return false;
  }
  
  if (!data.slices) {
    console.error('❌ No slices data found for tooth:', toothId);
    return false;
  }
  
  console.log('✅ Tooth slice data validation passed for tooth:', toothId);
  return true;
}

// Store loading function for tooth slice data
function loadToothSliceDataToStore(loadPatientData, data, toothId) {
  if (!validateToothSliceData(data, toothId)) {
    return false;
  }

  try {
    console.log('🏪 Loading tooth slice data to store for tooth:', toothId);
    
    // Load the tooth data and slices data to the dental store
    const storeData = {
      teeth: [data.tooth],
      slices: data.slices,
      sliceImages: data.slices?.images || data.slices?.urls || {},
      sliceCounts: data.slices?.counts || {},
      voxelSizes: data.slices?.voxelSizes || {}
    };
    
    loadPatientData(storeData);
    
    // Load slices data to image store if it has the method
    const imageStore = useImageStore.getState();
    if (imageStore.loadAllViews && data.slices) {
      imageStore.loadAllViews(data.slices);
    }
    
    console.log('✅ Tooth slice data loaded to stores successfully');
    return true;
  } catch (storeError) {
    console.error('❌ Failed to load tooth slice data to stores:', storeError);
    return false;
  }
}

/**
 * Hook for tooth slice data with caching and integration with useReportData system
 */
export function useToothSliceData(options = {}) {
  const { autoFetch = true } = options;
  const { loadPatientData } = useDentalStore();
  
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    reportType: 'toothSlice'
  });
  
  const abortControllerRef = useRef(null);
  const currentToothIdRef = useRef(null);
  const isMountedRef = useRef(true);

  // Stable update state function
  const updateState = useCallback((newState) => {
    if (isMountedRef.current) {
      setState(newState);
    }
  }, []);

  // Main data fetching function for tooth slice
  const fetchData = useCallback(async (toothId, options = {}) => {
    const { forceRefresh = false } = options;
    console.log('🚀 fetchToothSliceData called:', { toothId, forceRefresh, currentTooth: currentToothIdRef.current });
    
    if (!toothId) {
      console.warn('⚠️ No toothId provided');
      return null;
    }

    // If same tooth with existing data, skip fetch
    if (currentToothIdRef.current === toothId && state.data && !forceRefresh) {
      console.log('ℹ️ Same tooth with existing data, skipping fetch');
      return state.data;
    }
    
    // If different tooth, cancel previous requests
    if (currentToothIdRef.current !== toothId) {
      console.log('🔄 Different tooth detected, cleaning up');
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
    
    currentToothIdRef.current = toothId;

    // Check cache first (unless force refresh)
    if (!forceRefresh && toothSliceCache && toothSliceCache.toothId === toothId) {
      const { data: cachedData, createdAt } = toothSliceCache;
      const timePassed = Date.now() - createdAt;
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      
      if (timePassed < CACHE_DURATION) {
        console.log('💾 Using cached tooth slice data for same tooth');
        
        loadToothSliceDataToStore(loadPatientData, cachedData, toothId);
        
        updateState({
          data: cachedData,
          loading: false,
          error: null,
          reportType: 'toothSlice'
        });
        
        return cachedData;
      }
    }

    // Clear cache for different tooth
    if (toothSliceCache && toothSliceCache.toothId !== toothId) {
      toothSliceCache = null;
      console.log('🗑️ Previous tooth cache cleared');
    }

    // Set loading state
    updateState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    // Create new abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const toothSliceData = await fetchToothSliceData(toothId, abortControllerRef.current.signal);
      
      // Handle aborted request
      if (!toothSliceData) {
        console.log('🚫 Tooth slice request was aborted');
        return null;
      }
      
      // Check if request is still current
      if (currentToothIdRef.current !== toothId || !isMountedRef.current) {
        console.log('🚫 Tooth slice request obsolete or component unmounted');
        return null;
      }

      // Update cache
      toothSliceCache = {
        toothId,
        data: toothSliceData,
        createdAt: Date.now()
      };

      console.log('💾 New tooth slice cached:', toothId);

      // Load data to stores
      loadToothSliceDataToStore(loadPatientData, toothSliceData, toothId);

      // Update state if still current
      if (currentToothIdRef.current === toothId && isMountedRef.current) {
        updateState({
          data: toothSliceData,
          loading: false,
          error: null,
          reportType: 'toothSlice'
        });
      }

      return toothSliceData;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🚫 Tooth slice fetch aborted');
        return null;
      }
      
      console.error('❌ Tooth slice fetch failed:', error);
      
      if (currentToothIdRef.current === toothId && isMountedRef.current) {
        updateState({
          data: null,
          loading: false,
          error: error.message,
          reportType: 'toothSlice'
        });
      }
      
      throw error;
    }
  }, [loadPatientData, updateState]);

  // Retry function
  const retry = useCallback((toothId) => {
    console.log('🔄 Retry requested for tooth slice, clearing cache');
    toothSliceCache = null;
    return fetchData(toothId, { forceRefresh: true });
  }, [fetchData]);

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      console.log('🚫 Cancelling current tooth slice request');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    toothSliceCache = null;
    console.log('🗑️ Tooth slice cache cleared');
  }, []);

  // Reset state
  const reset = useCallback(() => {
    console.log('🔄 Resetting tooth slice hook state');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    currentToothIdRef.current = null;
    
    if (isMountedRef.current) {
      updateState({
        data: null,
        loading: false,
        error: null,
        reportType: 'toothSlice'
      });
    }
  }, [updateState]);

  // Get cache information
  const getCacheInfo = useCallback(() => {
    if (toothSliceCache) {
      return {
        hasCache: true,
        toothId: toothSliceCache.toothId,
        age: Date.now() - toothSliceCache.createdAt
      };
    }
    return { hasCache: false };
  }, []);

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
    
    // Helpers
    isLoading: state.loading,
    hasData: !!state.data,
    hasError: !!state.error,
    isIdle: !state.loading && !state.error && !state.data,
    isToothSlice: true,
    
    // Debug
    getCacheInfo
  };
}
