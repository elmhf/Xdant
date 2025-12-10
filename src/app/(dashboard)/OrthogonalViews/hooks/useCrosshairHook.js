import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { CoordinateUtils, ImageCalculations } from '../utils/calculations';

// Constants
const DEFAULT_CANVAS_SIZE = { width: 500, height: 200 };


export const useCrosshairHook = (sliceCounts, voxelSizes = {}) => {
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

  // ===== CROSSHAIR INTERACTION STATE =====

  // Track which crosshair line is being dragged
  const [dragState, setDragState] = useState({
    isDragging: false,
    dragType: null, // 'horizontal' | 'vertical' | 'both'
    viewType: null,
    startPos: null,
    startWorldPos: null
  });

  // Track current cursor for each view
  const [cursors, setCursors] = useState({
    axial: 'crosshair',
    coronal: 'crosshair',
    sagittal: 'crosshair'
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


  // ===== CROSSHAIR LINE INTERACTION FUNCTIONS =====

  // Determine which crosshair line is being interacted with (more robust)
  const getCrosshairLineType = useCallback((viewType, canvasPos, threshold = 15) => {
    const crosshairPos = crosshairPositions[viewType];
    if (!crosshairPos) return null;

    // Ensure we have valid coordinates
    if (!canvasPos || typeof canvasPos.x !== 'number' || typeof canvasPos.y !== 'number') {
      return null;
    }

    const distanceToVertical = Math.abs(canvasPos.x - crosshairPos.x);
    const distanceToHorizontal = Math.abs(canvasPos.y - crosshairPos.y);

    // Check if near intersection (both lines) - smaller threshold for intersection
    if (distanceToVertical <= threshold * 0.7 && distanceToHorizontal <= threshold * 0.7) {
      return 'intersection';
    }

    // Check individual lines with proper threshold
    if (distanceToVertical <= threshold) {
      return 'vertical';
    }
    if (distanceToHorizontal <= threshold) {
      return 'horizontal';
    }

    return null;
  }, [crosshairPositions]);

  // Get appropriate cursor based on interaction type
  const getCursorForInteraction = useCallback((hoverType, isDragging = false) => {
    if (isDragging) {
      switch (hoverType) {
        case 'horizontal': return 'grabbing';
        case 'vertical': return 'grabbing';
        case 'intersection': return 'grabbing';
        default: return 'grabbing';
      }
    }

    switch (hoverType) {
      case 'horizontal': return 'ns-resize';
      case 'vertical': return 'ew-resize';
      case 'intersection': return 'move';
      default: return 'crosshair';
    }
  }, []);

  // Update cursor for specific view
  const updateCursor = useCallback((viewType, hoverType, isDragging = false) => {
    const newCursor = getCursorForInteraction(hoverType, isDragging);
    setCursors(prev => ({
      ...prev,
      [viewType]: newCursor
    }));
  }, [getCursorForInteraction]);

  // Enhanced hover handler with better state management
  // Remove hoverState and setHoverState
  // Remove handleCrosshairHover and all code that updates or uses hover
  // Remove any references to hoverType, isHovering, or hoverState in the rest of the file

  // Global mouse move handler for consistent hover detection
  const handleGlobalMouseMove = useCallback((viewType) => (e) => {
    try {
      const stage = e.target.getStage();
      if (!stage) return;

      const point = stage.getPointerPosition();
      if (!point) return;

      // Only update hover if not dragging or if dragging in this view
      if (!dragState.isDragging || dragState.viewType === viewType) {
        // Remove hoverState and setHoverState
        // Remove handleCrosshairHover and all code that updates or uses hover
        // Remove any references to hoverType, isHovering, or hoverState in the rest of the file
      }
    } catch (error) {
      console.error('Error in global mouse move:', error);
    }
  }, [dragState]);

  // Handle mouse leave for clearing hover state
  const handleMouseLeave = useCallback((viewType) => () => {
    // Remove hoverState and setHoverState
    // Remove handleCrosshairHover and all code that updates or uses hover
    // Remove any references to hoverType, isHovering, or hoverState in the rest of the file
  }, []);

  // Handle crosshair line drag start with cursor update
  const handleCrosshairDragStart = useCallback((viewType, canvasPos) => {
    const lineType = getCrosshairLineType(viewType, canvasPos);

    if (lineType) {
      setDragState({
        isDragging: true,
        dragType: lineType === 'intersection' ? 'both' : lineType,
        viewType,
        startPos: canvasPos,
        startWorldPos: { ...worldPosition }
      });

      // Update cursor to grabbing state
      updateCursor(viewType, lineType, true);

      return true; // Indicate drag started
    }
    return false;
  }, [getCrosshairLineType, worldPosition, updateCursor]);

  // Handle crosshair line drag move with immediate feedback
  const handleCrosshairDragMove = useCallback((canvasPos) => {
    if (!dragState.isDragging || !dragState.startPos) return;

    try {
      const params = CoordinateUtils.getViewParams(
        dragState.viewType,
        global,
        drawnSizes[dragState.viewType],
        canvasSizes
      );

      let newWorldPosition = { ...dragState.startWorldPos };

      // Calculate movement delta
      const deltaX = canvasPos.x - dragState.startPos.x;
      const deltaY = canvasPos.y - dragState.startPos.y;

      // Convert canvas delta to world delta based on drag type
      if (dragState.dragType === 'horizontal' || dragState.dragType === 'both') {
        // Moving horizontal line affects Y axis in world coordinates
        const worldDeltaY = deltaY / (zooms[dragState.viewType] || 1);

        switch (dragState.viewType) {
          case 'axial':
            newWorldPosition.y += worldDeltaY * global.spacing.y;
            break;
          case 'coronal':
            newWorldPosition.z += worldDeltaY * global.spacing.z;
            break;
          case 'sagittal':
            newWorldPosition.z += worldDeltaY * global.spacing.z;
            break;
        }
      }

      if (dragState.dragType === 'vertical' || dragState.dragType === 'both') {
        // Moving vertical line affects X axis in world coordinates
        const worldDeltaX = deltaX / (zooms[dragState.viewType] || 1);

        switch (dragState.viewType) {
          case 'axial':
            newWorldPosition.x += worldDeltaX * global.spacing.x;
            break;
          case 'coronal':
            newWorldPosition.x += worldDeltaX * global.spacing.x;
            break;
          case 'sagittal':
            newWorldPosition.y += worldDeltaX * global.spacing.y;
            break;
        }
      }

      // Update position immediately during drag for smooth movement
      updatePosition(newWorldPosition);
    } catch (error) {
      console.error('Error handling crosshair drag move:', error);
    }
  }, [dragState, global, drawnSizes, canvasSizes, zooms, updatePosition]);

  // Handle crosshair line drag end with cursor reset
  const handleCrosshairDragEnd = useCallback(() => {
    const wasViewType = dragState.viewType;

    setDragState({
      isDragging: false,
      dragType: null,
      viewType: null,
      startPos: null,
      startWorldPos: null
    });

    // Reset cursor based on current hover state
    if (wasViewType) {
      // Remove hoverState and setHoverState
      // Remove handleCrosshairHover and all code that updates or uses hover
      // Remove any references to hoverType, isHovering, or hoverState in the rest of the file
    }
  }, [dragState]);

  // Handle immediate view interaction on mouse down
  const handleViewMouseDown = useCallback((viewType) => (e) => {
    try {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();

      if (!point) return;

      // Check if clicking on crosshair line to start drag
      const lineType = getCrosshairLineType(viewType, point);
      if (lineType) {
        // Start dragging crosshair line
        const success = handleCrosshairDragStart(viewType, point);
        if (success) {
          e.cancelBubble = true; // Prevent other handlers
          return;
        }
      }

      // Regular view click - move crosshair to clicked position immediately
      const params = CoordinateUtils.getViewParams(viewType, global, drawnSizes[viewType], canvasSizes);
      const worldPoint = CoordinateUtils.canvasToWorld(
        point,
        params,
        zooms[viewType],
        pans[viewType],
        viewType,
        global,
        currentSlices
      );

      // Update position immediately on mouse down
      updatePosition(worldPoint);

      // Remove hoverState and setHoverState
      // Remove handleCrosshairHover and all code that updates or uses hover
      // Remove any references to hoverType, isHovering, or hoverState in the rest of the file

    } catch (error) {
      console.error('Error handling view mouse down:', error);
    }
  }, [getCrosshairLineType, handleCrosshairDragStart, global, drawnSizes, canvasSizes, zooms, pans, currentSlices, updatePosition, updateCursor]);

  // Handle view click (legacy support - now just calls mouse down handler)
  const handleViewClick = useCallback((viewType) => handleViewMouseDown(viewType), [handleViewMouseDown]);

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

  // Handle crosshair movement with delta (legacy support)
  const handleCrosshairMove = useCallback((viewType, delta) => {
    try {
      const currentPos = crosshairPositions[viewType];
      const newCanvasPos = {
        x: currentPos.x + delta.x,
        y: currentPos.y + delta.y
      };

      const params = CoordinateUtils.getViewParams(viewType, global, drawnSizes[viewType], canvasSizes);
      const newWorldPoint = CoordinateUtils.canvasToWorld(
        newCanvasPos,
        params,
        zooms[viewType],
        pans[viewType],
        viewType,
        global,
        currentSlices
      );

      // Use immediate update for legacy support
      updatePosition(newWorldPoint);
    } catch (error) {
      console.error('Error handling crosshair move:', error);
    }
  }, [crosshairPositions, global, drawnSizes, canvasSizes, zooms, pans, currentSlices, updatePosition]);

  // ===== CROSSHAIR STATE FOR ACTIVITY =====

  // Prepare crosshair state for CrosshairActivity
  const getCrosshairState = useCallback((viewType) => ({
    viewType,
    crosshair: crosshairPositions,
    canvasSizes,
    global,
    drawnSizes,
    zooms,
    pans,
    currentSlices,
    CoordinateUtils,
    updatePosition,
    // Enhanced interaction state
    dragState,
    // Enhanced interaction handlers
    handleCrosshairDragStart,
    handleCrosshairDragMove,
    handleCrosshairDragEnd,
    handleGlobalMouseMove,
    handleMouseLeave,
    getCrosshairLineType,
    getCursorForInteraction,
    updateCursor
  }), [
    crosshairPositions, canvasSizes, global, drawnSizes, zooms, pans, currentSlices, updatePosition,
    dragState, handleCrosshairDragStart,
    handleCrosshairDragMove, handleCrosshairDragEnd, handleGlobalMouseMove, handleMouseLeave,
    getCrosshairLineType, getCursorForInteraction, updateCursor
  ]);

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
      // No need to update crosshair directly, as it is derived from worldPosition, zooms, and pans
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

    // Enhanced interaction state
    dragState,
    setDragState,
    // Remove hoverState and setHoverState
    // Remove handleCrosshairHover and all code that updates or uses hover
    // Remove any references to hoverType, isHovering, or hoverState in the rest of the file
    cursors,
    setCursors,

    // Refs
    stageRefs,

    // Calculations
    global,
    drawnSizes,

    // Core functions
    updatePosition,
    handleSliceChange,
    handleViewClick,
    handleViewMouseDown, // New immediate interaction handler
    handleCrosshairMove,

    // Enhanced crosshair line interaction
    handleCrosshairDragStart,
    handleCrosshairDragMove,
    handleCrosshairDragEnd,
    handleGlobalMouseMove,
    handleMouseLeave,
    getCrosshairLineType,
    getCursorForInteraction,
    updateCursor,

    // Crosshair activity
    getCrosshairState,

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