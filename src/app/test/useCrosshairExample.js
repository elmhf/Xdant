import React from 'react';
import { useCrosshairHook } from '../(dashboard)/OrthogonalViews/hooks/useCrosshairHook';
import { CrosshairActivity, CrosshairLayer } from '../(dashboard)/OrthogonalViews/hooks/crosshairActivity';

// مثال على كيفية استخدام الـ hook
export const CrosshairExample = ({ sliceCounts, voxelSizes }) => {
  // استخدام الـ hook
  const {
    // State
    canvasSizes,
    setCanvasSizes,
    zooms,
    setZooms,
    pans,
    setPans,
    crosshair,
    setCrosshair,
    currentSlices,
    setCurrentSlices,
    worldPosition,
    setWorldPosition,

    // Refs
    stageRefs,

    // Calculations
    global,
    drawnSizes,

    // Core functions
    updateCrosshairAndSlices,
    updateWorldAndSlices,
    handleSliceChange,
    handleViewClick,
    handleCrosshairMove,

    // Crosshair activity
    getCrosshairState,

    // Calculation helpers
    calculateImageDimensions,
    getViewParams,
    canvasToWorld,
    worldToCanvas,
    validateWorldCoordinates,

    // Initialization
    initializeCrosshair,

    // Constants
    DEFAULT_CANVAS_SIZE
  } = useCrosshairHook(sliceCounts, voxelSizes);

  // مثال على استخدام الدوال
  const handleExampleClick = (viewType) => {
    // مثال: تحريك الصليب إلى موضع معين
    const newWorldPosition = {
      x: 100, // mm
      y: 150, // mm
      z: 200  // mm
    };
    
    // التحقق من صحة الإحداثيات
    const validatedPosition = validateWorldCoordinates(newWorldPosition);
    
    // تحديث الصليب والشرائح
    updateWorldAndSlices(validatedPosition);
  };

  // مثال على حساب أبعاد الصورة
  const getImageDimensions = (viewType) => {
    const stageWidth = canvasSizes[viewType].width;
    const stageHeight = canvasSizes[viewType].height;
    
    return calculateImageDimensions(viewType, stageWidth, stageHeight);
  };

  // مثال على تحويل الإحداثيات
  const convertCoordinates = (canvasPoint, viewType) => {
    // من الكانفاس إلى العالم
    const worldPoint = canvasToWorld(canvasPoint, viewType);
    
    // من العالم إلى الكانفاس
    const backToCanvas = worldToCanvas(worldPoint, viewType);
    
    return { worldPoint, backToCanvas };
  };

  // مثال على الحصول على معاملات العرض
  const getViewParameters = (viewType) => {
    return getViewParams(viewType);
  };

  // مثال على الحصول على حالة الصليب للتفاعل
  const getCrosshairStateForView = (viewType) => {
    return getCrosshairState(viewType);
  };

  return (
    <div>
      <h2>Crosshair Hook Example</h2>
      
      {/* عرض المعلومات الحالية */}
      <div>
        <h3>Current State:</h3>
        <p>World Position: X={worldPosition.x.toFixed(2)}, Y={worldPosition.y.toFixed(2)}, Z={worldPosition.z.toFixed(2)}</p>
        <p>Crosshair Positions:</p>
        <ul>
          <li>Axial: ({crosshair.axial.x}, {crosshair.axial.y})</li>
          <li>Coronal: ({crosshair.coronal.x}, {crosshair.coronal.y})</li>
          <li>Sagittal: ({crosshair.sagittal.x}, {crosshair.sagittal.y})</li>
        </ul>
        <p>Current Slices:</p>
        <ul>
          <li>Axial: {currentSlices.axial}</li>
          <li>Coronal: {currentSlices.coronal}</li>
          <li>Sagittal: {currentSlices.sagittal}</li>
        </ul>
      </div>

      {/* أزرار التحكم */}
      <div>
        <h3>Controls:</h3>
        <button onClick={() => handleExampleClick('axial')}>
          Move Crosshair to (100, 150, 200)
        </button>
        <button onClick={() => handleSliceChange('axial', 'next')}>
          Next Axial Slice
        </button>
        <button onClick={() => handleSliceChange('axial', 'prev')}>
          Previous Axial Slice
        </button>
      </div>

      {/* مثال على Stage مع CrosshairActivity */}
      <div>
        <h3>Stage Example:</h3>
        <div style={{ width: '300px', height: '200px', border: '1px solid black' }}>
          {/* هنا يمكنك إضافة Stage مع CrosshairActivity */}
          {/* 
          <Stage
            onMouseDown={e => CrosshairActivity.onMouseDown(e, getCrosshairStateForView('axial'))}
            onMouseUp={e => CrosshairActivity.onMouseUp(e, getCrosshairStateForView('axial'))}
            onMouseMove={e => CrosshairActivity.onMouseMove(e, getCrosshairStateForView('axial'))}
            ref={stageRefs.axial}
            width={300}
            height={200}
          >
            <Layer>
              <CrosshairLayer
                x={crosshair.axial.x}
                y={crosshair.axial.y}
                width={300}
                height={200}
                viewType="axial"
              />
            </Layer>
          </Stage>
          */}
        </div>
      </div>

      {/* عرض المعلومات المحسوبة */}
      <div>
        <h3>Calculated Values:</h3>
        <p>Global Volume Size: {global.volumeSize.x} x {global.volumeSize.y} x {global.volumeSize.z}</p>
        <p>Global Spacing: {global.spacing.x} x {global.spacing.y} x {global.spacing.z} mm</p>
        <p>Drawn Sizes:</p>
        <ul>
          <li>Axial: {drawnSizes.axial.width} x {drawnSizes.axial.height}</li>
          <li>Coronal: {drawnSizes.coronal.width} x {drawnSizes.coronal.height}</li>
          <li>Sagittal: {drawnSizes.sagittal.width} x {drawnSizes.sagittal.height}</li>
        </ul>
      </div>
    </div>
  );
};

// مثال على كيفية استخدام الـ hook في مكون آخر
export const SimpleCrosshairComponent = ({ sliceCounts, voxelSizes }) => {
  const {
    crosshair,
    worldPosition,
    currentSlices,
    handleSliceChange,
    updateWorldAndSlices
  } = useCrosshairHook(sliceCounts, voxelSizes);

  return (
    <div>
      <h3>Simple Crosshair Component</h3>
      
      {/* عرض الموضع الحالي */}
      <div>
        <p>World: ({worldPosition.x.toFixed(1)}, {worldPosition.y.toFixed(1)}, {worldPosition.z.toFixed(1)})</p>
        <p>Slice: Axial={currentSlices.axial}, Coronal={currentSlices.coronal}, Sagittal={currentSlices.sagittal}</p>
      </div>

      {/* أزرار التحكم البسيطة */}
      <div>
        <button onClick={() => handleSliceChange('axial', 'next')}>Next Axial</button>
        <button onClick={() => handleSliceChange('axial', 'prev')}>Prev Axial</button>
        <button onClick={() => updateWorldAndSlices({ x: 50, y: 50, z: 50 })}>Move to (50,50,50)</button>
      </div>
    </div>
  );
}; 