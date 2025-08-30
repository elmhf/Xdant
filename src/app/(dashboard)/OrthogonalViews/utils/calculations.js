// ===== MEDICAL IMAGE VIEWER UTILITIES - COMPLETE PACKAGE =====
// Comprehensive coordinate, image, and zoom utilities for medical image viewing

// ===== CONSTANTS & CONFIGURATION =====
export const DEFAULT_CANVAS_SIZE = { width: 500, height: 200 };

export const ZOOM_CONFIG = {
  min: 0.1,
  max: 10,
  step: 0.2,
  wheelStep: 0.1,
  smoothing: true,
  maintainCrosshairPosition: true
};

export const VIEW_TYPES = {
  AXIAL: 'axial',
  CORONAL: 'coronal',
  SAGITTAL: 'sagittal'
};

// ===== COORDINATE UTILITIES =====
export const CoordinateUtils = {
  /**
   * Get view parameters for coordinate transformations
   */
  getViewParams: (view, global, imageDrawnSize, canvasSizes) => {
    const { spacing, origin, volumeSize } = global;
    
    // تحديد الأبعاد الصحيحة لكل view بناءً على الـ volume الفعلي
    const dimensionMap = {
      axial: { width: volumeSize.x, height: volumeSize.y },
      coronal: { width: volumeSize.x, height: volumeSize.z },
      sagittal: { width: volumeSize.y, height: volumeSize.z }
    };
    
    const spacingMap = {
      axial: { x: spacing.x, y: spacing.y },
      coronal: { x: spacing.x, y: spacing.z },
      sagittal: { x: spacing.y, y: spacing.z }
    };
    
    const originMap = {
      axial: { x: origin.x, y: origin.y },
      coronal: { x: origin.x, y: origin.z },
      sagittal: { x: origin.y, y: origin.z }
    };
    
    const imageOriginalSize = dimensionMap[view];
    const spacingXY = spacingMap[view];
    const originXY = originMap[view];
    
    const scaleX = imageDrawnSize.width / imageOriginalSize.width;
    const scaleY = imageDrawnSize.height / imageOriginalSize.height;
    const offsetX = (canvasSizes[view].width - imageDrawnSize.width) / 2;
    const offsetY = (canvasSizes[view].height - imageDrawnSize.height) / 2;
    
    return {
      scaleX,
      scaleY,
      offsetX,
      offsetY,
      spacing: spacingXY,
      origin: originXY,
      imageOriginalSize,
      imageDrawnSize,
      canvasSize: canvasSizes[view]
    };
  },

  /**
   * Convert canvas coordinates to world coordinates
   */
  canvasToWorld: (canvasPoint, params, zoom, pan, viewType, global, currentSlices) => {
    const xDrawn = (canvasPoint.x - params.offsetX - pan.x) / zoom;
    const yDrawn = (canvasPoint.y - params.offsetY - pan.y) / zoom;
    
    const xOriginal = xDrawn / params.scaleX;
    const yOriginal = yDrawn / params.scaleY;
    
    let correctedX = xOriginal;
    let correctedY = yOriginal;
    
    // Apply view-specific coordinate corrections
    if (viewType === 'axial') {
      correctedX = params.imageOriginalSize.width - 1 - xOriginal;
    } else if (viewType === 'coronal') {
      correctedX = params.imageOriginalSize.width - 1 - xOriginal;
      correctedY = params.imageOriginalSize.height - 1 - yOriginal;
    } else if (viewType === 'sagittal') {
      correctedY = params.imageOriginalSize.height - 1 - yOriginal;
    }
    
    const xWorld = correctedX * params.spacing.x + params.origin.x;
    const yWorld = correctedY * params.spacing.y + params.origin.y;
    
    // Calculate slice world positions
    const sliceWorldPositions = {
      axial: global.origin.z + (currentSlices.axial * global.spacing.z),
      coronal: global.origin.y + (currentSlices.coronal * global.spacing.y),
      sagittal: global.origin.x + (currentSlices.sagittal * global.spacing.x)
    };
    
    const worldCoordinates = {
      axial: { x: xWorld, y: yWorld, z: sliceWorldPositions.axial },
      coronal: { x: xWorld, y: sliceWorldPositions.coronal, z: yWorld },
      sagittal: { x: sliceWorldPositions.sagittal, y: xWorld, z: yWorld }
    };
    
    return worldCoordinates[viewType];
  },

  /**
   * Convert world coordinates to canvas coordinates
   */
  worldToCanvas: (worldPoint, params, zoom, pan, viewType) => {
    const coordinateMapping = {
      axial: { x: worldPoint.x, y: worldPoint.y },
      coronal: { x: worldPoint.x, y: worldPoint.z },
      sagittal: { x: worldPoint.y, y: worldPoint.z }
    };
    
    const { x: worldX, y: worldY } = coordinateMapping[viewType];
    
    const xOriginal = (worldX - params.origin.x) / params.spacing.x;
    const yOriginal = (worldY - params.origin.y) / params.spacing.y;
    
    let correctedX = xOriginal;
    let correctedY = yOriginal;
    
    // Apply view-specific coordinate corrections
    if (viewType === 'axial') {
      correctedX = params.imageOriginalSize.width - 1 - xOriginal;
    } else if (viewType === 'coronal') {
      correctedX = params.imageOriginalSize.width - 1 - xOriginal;
      correctedY = params.imageOriginalSize.height - 1 - yOriginal;
    } else if (viewType === 'sagittal') {
      correctedY = params.imageOriginalSize.height - 1 - yOriginal;
    }
    
    const xDrawn = correctedX * params.scaleX;
    const yDrawn = correctedY * params.scaleY;
    
    const xCanvas = xDrawn * zoom + params.offsetX + pan.x;
    const yCanvas = yDrawn * zoom + params.offsetY + pan.y;
    
    return { x: xCanvas, y: yCanvas };
  },

  /**
   * Convert world coordinates to slice index
   */
  worldToSliceIndex: (worldPoint, viewType, global) => {
    const sliceCalculations = {
      axial: Math.round((worldPoint.z - global.origin.z) / global.spacing.z),
      coronal: Math.round((worldPoint.y - global.origin.y) / global.spacing.y),
      sagittal: Math.round((worldPoint.x - global.origin.x) / global.spacing.x)
    };
    
    return sliceCalculations[viewType];
  },

  /**
   * Validate and clamp coordinates to volume bounds
   */
  validateCoordinates: (worldPoint, global) => {
    const { volumeSize, spacing, origin } = global;
    
    const maxX = origin.x + (volumeSize.x - 1) * spacing.x;
    const maxY = origin.y + (volumeSize.y - 1) * spacing.y;
    const maxZ = origin.z + (volumeSize.z - 1) * spacing.z;
    
    return {
      x: Math.max(origin.x, Math.min(maxX, worldPoint.x)),
      y: Math.max(origin.y, Math.min(maxY, worldPoint.y)),
      z: Math.max(origin.z, Math.min(maxZ, worldPoint.z))
    };
  }
};

// ===== IMAGE CALCULATIONS =====
export const ImageCalculations = {
  /**
   * Calculate image dimensions and positioning (now takes zoom and pan into account)
   */
  calculateImageDimensions: (viewType, stageWidth, stageHeight, volumeSize, zoom = 1, pan = {x:0, y:0}) => {
    const originalDimensions = {
      axial: { width: volumeSize.x, height: volumeSize.y },
      coronal: { width: volumeSize.x, height: volumeSize.z },
      sagittal: { width: volumeSize.y, height: volumeSize.z }
    };
    const viewDimensions = originalDimensions[viewType];
    const scaleX = stageWidth / viewDimensions.width;
    const scaleY = stageHeight / viewDimensions.height;
    const scale = Math.min(scaleX, scaleY);
    // Apply zoom to image size
    const imageWidth = viewDimensions.width * scale * zoom;
    const imageHeight = viewDimensions.height * scale * zoom;
    // Center the image, then apply pan
    const imageX = (stageWidth - imageWidth) / 2 + pan.x;
    const imageY = (stageHeight - imageHeight) / 2 + pan.y;
    return { imageWidth, imageHeight, imageX, imageY, scale };
  },

  /**
   * Calculate aspect ratio for view
   */
  calculateAspectRatio: (viewType, volumeSize) => {
    const dimensions = {
      axial: { width: volumeSize.x, height: volumeSize.y },
      coronal: { width: volumeSize.x, height: volumeSize.z },
      sagittal: { width: volumeSize.y, height: volumeSize.z }
    };
    
    const dim = dimensions[viewType];
    return dim.width / dim.height;
  }
};

// ===== GLOBAL CALCULATIONS =====
export const GlobalCalculations = {
  /**
   * Calculate global parameters from slice counts
   */
  calculateGlobalParams: (sliceCounts, voxelSizes) => {
    if (!sliceCounts.axial || !sliceCounts.coronal || !sliceCounts.sagittal) {
      return {
        origin: { x: 0, y: 0, z: 0 },
        spacing: { x: 0.5, y: 0.5, z: 0.7 },
        volumeSize: { x: 604, y: 604, z: 604 }
      };
    }

    // استخدام أبعاد الـ volume الفعلية من slice counts
    const actualVolumeSize = {
      x: sliceCounts.sagittal,  // عدد الشرائح الـ sagittal يمثل البعد X
      y: sliceCounts.coronal,   // عدد الشرائح الـ coronal يمثل البعد Y
      z: sliceCounts.axial      // عدد الشرائح الـ axial يمثل البعد Z
    };

    return {
      origin: { x: 0, y: 0, z: 0 },
      spacing: {
        x: voxelSizes.x_spacing_mm || 0.5,
        y: voxelSizes.y_spacing_mm || 0.5,
        z: voxelSizes.z_spacing_mm || 0.7,
      },
      volumeSize: actualVolumeSize,
    };
  },

  /**
   * Calculate center world position
   */
  calculateCenterWorld: (global) => {
    return {
      x: global.origin.x + (global.volumeSize.x * global.spacing.x) / 2,
      y: global.origin.y + (global.volumeSize.y * global.spacing.y) / 2,
      z: global.origin.z + (global.volumeSize.z * global.spacing.z) / 2
    };
  },

  /**
   * Calculate slice position in world coordinates
   */
  calculateSlicePosition: (viewType, currentSlice, global) => {
    if (!global || !global.origin || !global.spacing) {
      return 0;
    }
    
    switch(viewType) {
      case 'axial':
        return global.origin.z + (currentSlice * global.spacing.z);
      case 'coronal':
        return global.origin.y + (currentSlice * global.spacing.y);
      case 'sagittal':
        return global.origin.x + (currentSlice * global.spacing.x);
      default:
        return 0;
    }
  },

  /**
   * Calculate volume bounds
   */
  calculateVolumeBounds: (global) => {
    const { origin, spacing, volumeSize } = global;
    
    return {
      min: { ...origin },
      max: {
        x: origin.x + (volumeSize.x - 1) * spacing.x,
        y: origin.y + (volumeSize.y - 1) * spacing.y,
        z: origin.z + (volumeSize.z - 1) * spacing.z
      }
    };
  }
};

// ===== CROSSHAIR CALCULATIONS =====
export const CrosshairCalculations = {
  /**
   * Calculate distance from crosshair
   */
  calculateDistanceToCrosshair: (pointer, crosshairPosition) => {
    const distToV = Math.abs(pointer.x - crosshairPosition.x);
    const distToH = Math.abs(pointer.y - crosshairPosition.y);
    const distToCenter = Math.sqrt(
      Math.pow(pointer.x - crosshairPosition.x, 2) + 
      Math.pow(pointer.y - crosshairPosition.y, 2)
    );
    
    return { distToV, distToH, distToCenter };
  },

  /**
   * Determine axis based on distance
   */
  determineAxis: (distances) => {
    const { distToV, distToH, distToCenter } = distances;
    const centerThreshold = 10; // px
    const threshold = 8; // px
    
    if (distToCenter < centerThreshold) {
      return 'center'; // النقطة المركزية
    } else if (distToV < threshold && distToV < distToH) {
      return 'x'; // العمودي
    } else if (distToH < threshold && distToH < distToV) {
      return 'y'; // الأفقي
    }
    
    return null; // تحريك كلا المحورين
  },

  /**
   * Calculate movement delta
   */
  calculateMovementDelta: (newPosition, currentPosition, axis) => {
    let deltaX = 0;
    let deltaY = 0;
    
    if (axis === 'x') {
      deltaX = newPosition.x - currentPosition.x;
    } else if (axis === 'y') {
      deltaY = newPosition.y - currentPosition.y;
    } else if (axis === 'center') {
      deltaX = newPosition.x - currentPosition.x;
      deltaY = newPosition.y - currentPosition.y;
    } else {
      deltaX = newPosition.x - currentPosition.x;
      deltaY = newPosition.y - currentPosition.y;
    }
    
    return { x: deltaX, y: deltaY };
  },

  /**
   * Calculate precise crosshair position with zoom
   */
  calculatePreciseCrosshairPosition: (viewType, worldPosition, global, drawnSizes, canvasSizes, zooms, pans) => {
    try {
      const params = CoordinateUtils.getViewParams(viewType, global, drawnSizes[viewType], canvasSizes);
      const canvasPos = CoordinateUtils.worldToCanvas(
        worldPosition, 
        params, 
        zooms[viewType], 
        pans[viewType], 
        viewType
      );
      
      // Ensure crosshair is within visible canvas bounds
      const canvas = canvasSizes[viewType];
      const isVisible = canvasPos.x >= 0 && canvasPos.x <= canvas.width && 
                       canvasPos.y >= 0 && canvasPos.y <= canvas.height;
      
      return {
        ...canvasPos,
        isVisible,
        viewType
      };
    } catch (error) {
      console.error(`Error calculating crosshair position for ${viewType}:`, error);
      return { x: 0, y: 0, isVisible: false, viewType };
    }
  }
};

// ===== ZOOM UTILITIES =====
export const ZoomUtils = {
  /**
   * Handle wheel zoom with precise crosshair maintenance
   */
  handleWheelZoom: (viewType, e, currentState, updateFunctions) => {
    e.preventDefault();
    
    try {
      const { zooms, pans, global, drawnSizes, canvasSizes, currentSlices } = currentState;
      const { setZooms, setPans } = updateFunctions;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      
      // Calculate zoom direction and amount
      const zoomDirection = e.evt.deltaY > 0 ? -1 : 1;
      const zoomAmount = zoomDirection * ZOOM_CONFIG.wheelStep;
      
      // Get current zoom and calculate new zoom
      const currentZoom = zooms[viewType];
      const newZoom = Math.max(
        ZOOM_CONFIG.min, 
        Math.min(ZOOM_CONFIG.max, currentZoom + zoomAmount)
      );
      
      // If zoom didn't change, return
      if (newZoom === currentZoom) return;
      
      // Get world position at pointer before zoom
      const params = CoordinateUtils.getViewParams(viewType, global, drawnSizes[viewType], canvasSizes);
      const worldAtPointer = CoordinateUtils.canvasToWorld(
        pointer, 
        params, 
        currentZoom, 
        pans[viewType], 
        viewType, 
        global, 
        currentSlices
      );
      
      // Calculate new pan to maintain world position under pointer
      const newParams = { ...params };
      const expectedCanvasPos = CoordinateUtils.worldToCanvas(
        worldAtPointer, 
        newParams, 
        newZoom, 
        pans[viewType], 
        viewType
      );
      
      const panDelta = {
        x: pointer.x - expectedCanvasPos.x,
        y: pointer.y - expectedCanvasPos.y
      };
      
      const newPan = {
        x: pans[viewType].x + panDelta.x,
        y: pans[viewType].y + panDelta.y
      };
      
      // Update zoom and pan simultaneously
      setZooms(prev => ({ ...prev, [viewType]: newZoom }));
      setPans(prev => ({ ...prev, [viewType]: newPan }));
      
    } catch (error) {
      console.error('Error in wheel zoom:', error);
    }
  },

  /**
   * Handle button zoom (zoom in/out)
   */
  handleButtonZoom: (viewType, direction, currentState, updateFunctions) => {
    try {
      const { zooms, canvasSizes, crosshairPositions } = currentState;
      const { setZooms, setPans } = updateFunctions;
      
      const currentZoom = zooms[viewType];
      const zoomAmount = direction === 'in' ? ZOOM_CONFIG.step : -ZOOM_CONFIG.step;
      const newZoom = Math.max(
        ZOOM_CONFIG.min, 
        Math.min(ZOOM_CONFIG.max, currentZoom + zoomAmount)
      );
      
      if (newZoom === currentZoom) return;
      
      const zoomPoint = ZOOM_CONFIG.maintainCrosshairPosition 
        ? crosshairPositions[viewType]
        : { x: canvasSizes[viewType].width / 2, y: canvasSizes[viewType].height / 2 };
      
      ZoomUtils.zoomToPoint(viewType, zoomPoint, newZoom, currentState, updateFunctions);
      
    } catch (error) {
      console.error('Error in button zoom:', error);
    }
  },

  /**
   * Zoom to specific point with precision
   */
  zoomToPoint: (viewType, point, newZoom, currentState, updateFunctions) => {
    try {
      const { zooms, pans, global, drawnSizes, canvasSizes, currentSlices } = currentState;
      const { setZooms, setPans } = updateFunctions;
      
      const currentZoom = zooms[viewType];
      const currentPan = pans[viewType];
      
      // Get world position at the point before zoom
      const params = CoordinateUtils.getViewParams(viewType, global, drawnSizes[viewType], canvasSizes);
      const worldAtPoint = CoordinateUtils.canvasToWorld(
        point, 
        params, 
        currentZoom, 
        currentPan, 
        viewType, 
        global, 
        currentSlices
      );
      
      // Calculate where this world position should be after zoom
      const expectedCanvasPos = CoordinateUtils.worldToCanvas(
        worldAtPoint, 
        params, 
        newZoom, 
        currentPan, 
        viewType
      );
      
      // Calculate pan adjustment to keep point in same location
      const panDelta = {
        x: point.x - expectedCanvasPos.x,
        y: point.y - expectedCanvasPos.y
      };
      
      const newPan = {
        x: currentPan.x + panDelta.x,
        y: currentPan.y + panDelta.y
      };
      
      // Update zoom and pan
      setZooms(prev => ({ ...prev, [viewType]: newZoom }));
      setPans(prev => ({ ...prev, [viewType]: newPan }));
      
    } catch (error) {
      console.error('Error in zoom to point:', error);
    }
  },

  /**
   * Reset zoom to fit image
   */
  resetZoom: (viewType, currentState, updateFunctions) => {
    try {
      const { canvasSizes, drawnSizes } = currentState;
      const { setZooms, setPans } = updateFunctions;
      
      const canvas = canvasSizes[viewType];
      const imageSize = drawnSizes[viewType];
      
      // Calculate zoom to fit image in canvas
      const zoomX = canvas.width / imageSize.width;
      const zoomY = canvas.height / imageSize.height;
      const fitZoom = Math.min(zoomX, zoomY, 1); // Don't zoom in beyond 1:1
      
      // Center the image
      const centerPan = {
        x: (canvas.width - imageSize.width * fitZoom) / 2,
        y: (canvas.height - imageSize.height * fitZoom) / 2
      };
      
      setZooms(prev => ({ ...prev, [viewType]: fitZoom }));
      setPans(prev => ({ ...prev, [viewType]: centerPan }));
      
    } catch (error) {
      console.error('Error in reset zoom:', error);
    }
  },

  /**
   * Get zoom information for display
   */
  getZoomInfo: (viewType, zooms) => {
    const zoom = zooms[viewType];
    const percentage = Math.round(zoom * 100);
    const level = zoom === 1 ? '1:1' : `${percentage}%`;
    
    return {
      zoom,
      percentage,
      level,
      canZoomIn: zoom < ZOOM_CONFIG.max,
      canZoomOut: zoom > ZOOM_CONFIG.min
    };
  },

  /**
   * Smooth zoom animation
   */
  smoothZoomTo: (viewType, targetZoom, point, currentState, updateFunctions, duration = 300) => {
    if (!ZOOM_CONFIG.smoothing) {
      ZoomUtils.zoomToPoint(viewType, point, targetZoom, currentState, updateFunctions);
      return;
    }
    
    const startZoom = currentState.zooms[viewType];
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentZoom = startZoom + (targetZoom - startZoom) * easeOut;
      
      ZoomUtils.zoomToPoint(viewType, point, currentZoom, currentState, updateFunctions);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
};

// ===== UTILITY FUNCTIONS =====
export const UtilityFunctions = {
  /**
   * Clamp value between min and max
   */
  clamp: (value, min, max) => {
    return Math.max(min, Math.min(max, value));
  },

  /**
   * Check if point is within bounds
   */
  isPointInBounds: (point, bounds) => {
    return point.x >= bounds.min.x && point.x <= bounds.max.x &&
           point.y >= bounds.min.y && point.y <= bounds.max.y;
  },

  /**
   * Calculate distance between two points
   */
  calculateDistance: (point1, point2) => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + 
      Math.pow(point2.y - point1.y, 2)
    );
  },

  /**
   * Format coordinate display
   */
  formatCoordinate: (value, decimals = 2) => {
    return Number(value).toFixed(decimals);
  },

  /**
   * Convert slice index to world position
   */
  sliceToWorldPosition: (sliceIndex, viewType, global) => {
    switch(viewType) {
      case 'axial':
        return global.origin.z + (sliceIndex * global.spacing.z);
      case 'coronal':
        return global.origin.y + (sliceIndex * global.spacing.y);
      case 'sagittal':
        return global.origin.x + (sliceIndex * global.spacing.x);
      default:
        return 0;
    }
  }
};

// ===== MAIN EXPORT =====
export default {
  CoordinateUtils,
  ImageCalculations,
  GlobalCalculations,
  CrosshairCalculations,
  ZoomUtils,
  UtilityFunctions,
  ZOOM_CONFIG,
  VIEW_TYPES,
  DEFAULT_CANVAS_SIZE
};

