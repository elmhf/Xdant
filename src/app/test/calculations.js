// Coordinate and image calculation utilities extracted from page.js

// Enhanced CoordinateUtils with proper medical coordinate system
export const CoordinateUtils = {
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
  canvasToWorld: (canvasPoint, params, zoom, pan, viewType, global, currentSlices) => {
    const xDrawn = (canvasPoint.x - params.offsetX - pan.x) / zoom;
    const yDrawn = (canvasPoint.y - params.offsetY - pan.y) / zoom;
    const xOriginal = xDrawn / params.scaleX;
    const yOriginal = yDrawn / params.scaleY;
    let correctedX = xOriginal;
    let correctedY = yOriginal;
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
  worldToSliceIndex: (worldPoint, viewType, global) => {
    const sliceCalculations = {
      axial: Math.round((worldPoint.z - global.origin.z) / global.spacing.z),
      coronal: Math.round((worldPoint.y - global.origin.y) / global.spacing.y),
      sagittal: Math.round((worldPoint.x - global.origin.x) / global.spacing.x)
    };
    return sliceCalculations[viewType];
  },
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

// Enhanced ImageCalculations utility
export const ImageCalculations = {
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
  const imageWidth = viewDimensions.width * scale * zoom;
  const imageHeight = viewDimensions.height * scale * zoom;
  const imageX = (stageWidth - imageWidth) / 2 + pan.x;
  const imageY = (stageHeight - imageHeight) / 2 + pan.y;
  return { imageWidth, imageHeight, imageX, imageY, scale };
}
};

// Global calculations utility
export const GlobalCalculations = {
// حساب الأبعاد العالمية بناءً على slice counts
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

// حساب الموضع المركزي للعالم
calculateCenterWorld: (global) => {
  return {
    x: global.origin.x + (global.volumeSize.x * global.spacing.x) / 2,
    y: global.origin.y + (global.volumeSize.y * global.spacing.y) / 2,
    z: global.origin.z + (global.volumeSize.z * global.spacing.z) / 2
  };
},

// حساب موضع الشريحة في الإحداثيات العالمية
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
}
};

// Crosshair calculations utility
export const CrosshairCalculations = {
// حساب المسافة من الصليب
calculateDistanceToCrosshair: (pointer, crosshairPosition) => {
  const distToV = Math.abs(pointer.x - crosshairPosition.x);
  const distToH = Math.abs(pointer.y - crosshairPosition.y);
  const distToCenter = Math.sqrt(
    Math.pow(pointer.x - crosshairPosition.x, 2) + Math.pow(pointer.y - crosshairPosition.y, 2)
  );
  
  return { distToV, distToH, distToCenter };
},

// تحديد المحور بناءً على المسافة
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

// حساب دلتا الحركة
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
}
};

// Add this at the top of the file
export const DEFAULT_CANVAS_SIZE = { width: 500, height: 200 };

// Export all utilities for easy importing
export default {
CoordinateUtils,
ImageCalculations,
GlobalCalculations,
CrosshairCalculations,
}; 