import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { CoordinateUtils, ImageCalculations } from '../utils/calculations';

// Constants
export const DEFAULT_CANVAS_SIZE = { width: 500, height: 200 };

export const useCrosshairCore = (sliceCounts, voxelSizes = {}) => {
  // ===== STATE MANAGEMENT =====

  // Canvas sizes for each view
  const [canvasSizes, setCanvasSizes] = useState({
    axial: DEFAULT_CANVAS_SIZE,
    coronal: DEFAULT_CANVAS_SIZE,
    sagittal: DEFAULT_CANVAS_SIZE,
  });

  // Zoom levels for each view
  const [zooms, setZooms] = useState({
    axial: 1,
    coronal: 1,
    sagittal: 1
  });

  // Pan positions for each view
  const [pans, setPans] = useState({
    axial: { x: 0, y: 0 },
    coronal: { x: 0, y: 0 },
    sagittal: { x: 0, y: 0 }
  });

  // Single source of truth - World position coordinates
  const [worldPosition, setWorldPosition] = useState({ x: 0, y: 0, z: 0 });

  // Current slice indices derived from world position
  const [currentSlices, setCurrentSlices] = useState({
    axial: 0,
    coronal: 0,
    sagittal: 0
  });

  // ===== REFS =====

  // Stage references for each view
  const stageRefs = {
    axial: useRef(null),
    coronal: useRef(null),
    sagittal: useRef(null)
  };

  // ===== CALCULATIONS =====

  // Global parameters calculation
  const global = useMemo(() => {
    const defaultGlobal = {
      origin: { x: 0, y: 0, z: 0 },
      spacing: { x: 0.5, y: 0.5, z: 0.7 },
      volumeSize: { x: 604, y: 604, z: 604 }
    };

    if (!sliceCounts.axial || !sliceCounts.coronal || !sliceCounts.sagittal) {
      return defaultGlobal;
    }

    const actualVolumeSize = {
      x: sliceCounts.sagittal || 604,
      y: sliceCounts.coronal || 604,
      z: sliceCounts.axial || 604
    };

    return {
      origin: { x: 0, y: 0, z: 0 },
      spacing: {
        x: voxelSizes?.x_spacing_mm || 0.5,
        y: voxelSizes?.y_spacing_mm || 0.5,
        z: voxelSizes?.z_spacing_mm || 0.7,
      },
      volumeSize: actualVolumeSize,
    };
  }, [voxelSizes, sliceCounts]);

  // Drawn sizes calculation
  const drawnSizes = useMemo(() => {
    const sizes = {};
    ['axial', 'coronal', 'sagittal'].forEach(viewType => {
      const { imageWidth, imageHeight } = ImageCalculations.calculateImageDimensions(
        viewType,
        canvasSizes[viewType].width,
        canvasSizes[viewType].height,
        global.volumeSize,
        zooms[viewType],
        pans[viewType]
      );
      sizes[viewType] = { width: imageWidth, height: imageHeight };
    });
    return sizes;
  }, [canvasSizes, global.volumeSize, zooms, pans]);

  // Calculate crosshair positions from world position (computed, not stored)
  const crosshairPositions = useMemo(() => {
    const positions = {};
    ['axial', 'coronal', 'sagittal'].forEach(view => {
      try {
        const params = CoordinateUtils.getViewParams(view, global, drawnSizes[view], canvasSizes);
        positions[view] = CoordinateUtils.worldToCanvas(
          worldPosition,
          params,
          zooms[view],
          pans[view],
          view
        );
      } catch (error) {
        console.error(`Error calculating crosshair position for ${view}:`, error);
        positions[view] = { x: 0, y: 0 };
      }
    });
    return positions;
  }, [worldPosition, global, drawnSizes, canvasSizes, zooms, pans]);

  // ===== CORE FUNCTIONS =====

  // Single function to update position and derived state
  const updatePosition = useCallback((newWorldPosition) => {
    try {
      // Validate and set world position
      const validated = CoordinateUtils.validateCoordinates(newWorldPosition, global);
      setWorldPosition(validated);

      // Calculate and set slice indices from world position
      const newSlices = {};
      ['axial', 'coronal', 'sagittal'].forEach(view => {
        const sliceIndex = CoordinateUtils.worldToSliceIndex(validated, view, global);
        const clampedSlice = Math.max(0, Math.min(sliceIndex, (sliceCounts[view] || 1) - 1));
        newSlices[view] = clampedSlice;
      });
      setCurrentSlices(newSlices);
    } catch (error) {
      console.error('Error updating position:', error);
    }
  }, [global, sliceCounts]);

  // Handle slice navigation
  const handleSliceChange = useCallback((view, direction) => {
    const currentSlice = currentSlices[view];
    const maxSlices = (sliceCounts[view] || 1) - 1;

    let newSlice = currentSlice;
    if (direction === 'next' && currentSlice < maxSlices) {
      newSlice = currentSlice + 1;
    } else if (direction === 'prev' && currentSlice > 0) {
      newSlice = currentSlice - 1;
    }

    if (newSlice !== currentSlice) {
      // Calculate new world position from slice
      const newWorldPosition = { ...worldPosition };

      switch (view) {
        case 'axial':
          newWorldPosition.z = global.origin.z + (newSlice * global.spacing.z);
          break;
        case 'coronal':
          newWorldPosition.y = global.origin.y + (newSlice * global.spacing.y);
          break;
        case 'sagittal':
          newWorldPosition.x = global.origin.x + (newSlice * global.spacing.x);
          break;
      }

      updatePosition(newWorldPosition);
    }
  }, [currentSlices, sliceCounts, worldPosition, global, updatePosition]);

  // ===== CALCULATION HELPERS =====

  // Calculate image dimensions for a view
  const calculateImageDimensions = useCallback((viewType, stageWidth, stageHeight) => {
    return ImageCalculations.calculateImageDimensions(
      viewType,
      stageWidth,
      stageHeight,
      global.volumeSize,
      zooms[viewType],
      pans[viewType]
    );
  }, [global.volumeSize, zooms, pans]);

  // Get view parameters for coordinate conversion
  const getViewParams = useCallback((viewType) => {
    return CoordinateUtils.getViewParams(
      viewType,
      global,
      drawnSizes[viewType],
      canvasSizes
    );
  }, [global, drawnSizes, canvasSizes]);

  // Convert canvas point to world coordinates
  const canvasToWorld = useCallback((canvasPoint, viewType) => {
    const params = getViewParams(viewType);
    return CoordinateUtils.canvasToWorld(
      canvasPoint,
      params,
      zooms[viewType],
      pans[viewType],
      viewType,
      global,
      currentSlices
    );
  }, [getViewParams, zooms, pans, global, currentSlices]);

  // Convert world point to canvas coordinates
  const worldToCanvas = useCallback((worldPoint, viewType) => {
    const params = getViewParams(viewType);
    return CoordinateUtils.worldToCanvas(worldPoint, params, zooms[viewType], pans[viewType], viewType);
  }, [getViewParams, zooms, pans]);

  // Validate world coordinates
  const validateWorldCoordinates = useCallback((worldPoint) => {
    return CoordinateUtils.validateCoordinates(worldPoint, global);
  }, [global]);

  // ===== ZOOM HELPERS =====

  // Function to increment zoom for a given view
  const incrementZoom = useCallback((viewType, step = 0.1) => {
    setZooms(prev => {
      const newZoom = Math.max(0.1, prev[viewType] + step);
      const newZooms = { ...prev, [viewType]: newZoom };

      // Optionally, recenter pan to keep crosshair at the same relative position
      setPans(pansPrev => {
        // Calculate the center of the canvas for the view
        const canvas = canvasSizes[viewType];
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        // Get the world position projected to canvas before zoom
        const params = CoordinateUtils.getViewParams(viewType, global, drawnSizes[viewType], canvasSizes);
        const crosshairCanvasBefore = CoordinateUtils.worldToCanvas(worldPosition, params, prev[viewType], pansPrev[viewType], viewType);
        // Get the world position projected to canvas after zoom
        const crosshairCanvasAfter = CoordinateUtils.worldToCanvas(worldPosition, params, newZoom, pansPrev[viewType], viewType);
        // Calculate the difference and adjust pan so crosshair stays centered
        const dx = crosshairCanvasAfter.x - crosshairCanvasBefore.x;
        const dy = crosshairCanvasAfter.y - crosshairCanvasBefore.y;
        return {
          ...pansPrev,
          [viewType]: {
            x: pansPrev[viewType].x - dx,
            y: pansPrev[viewType].y - dy
          }
        };
      });
      return newZooms;
    });
  }, [canvasSizes, drawnSizes, global, worldPosition]);

  // ===== INITIALIZATION =====

  // Initialize crosshair position when data is available
  useEffect(() => {
    if (Object.keys(sliceCounts).length > 0 && global.volumeSize.x > 0) {
      const centerWorld = {
        x: global.origin.x + (global.volumeSize.x * global.spacing.x) / 2,
        y: global.origin.y + (global.volumeSize.y * global.spacing.y) / 2,
        z: global.origin.z + (global.volumeSize.z * global.spacing.z) / 2
      };
      updatePosition(centerWorld);
    }
  }, [sliceCounts, global, updatePosition]);

  // ===== RETURN OBJECT =====

  return {
    // State
    canvasSizes,
    setCanvasSizes,
    zooms,
    setZooms,
    pans,
    setPans,
    crosshair: crosshairPositions, // Computed crosshair positions
    currentSlices,
    worldPosition,

    // Refs
    stageRefs,

    // Calculations
    global,
    drawnSizes,

    // Core functions
    updatePosition,
    handleSliceChange,

    // Calculation helpers
    calculateImageDimensions,
    getViewParams,
    canvasToWorld,
    worldToCanvas,
    validateWorldCoordinates,

    // Zoom helpers
    incrementZoom,

    // Constants
    DEFAULT_CANVAS_SIZE,

    // Legacy compatibility (deprecated)
    setCrosshair: () => console.warn('setCrosshair is deprecated, use updatePosition instead'),
    setCurrentSlices: () => console.warn('setCurrentSlices is deprecated, use updatePosition instead'),
    setWorldPosition: () => console.warn('setWorldPosition is deprecated, use updatePosition instead'),
    updateCrosshairAndSlices: updatePosition,
    updateWorldAndSlices: updatePosition,
    initializeCrosshair: () => console.warn('initializeCrosshair is deprecated, initialization happens automatically')
  };
};