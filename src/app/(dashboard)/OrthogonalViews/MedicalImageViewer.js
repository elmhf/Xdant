"use client"
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import { RiFullscreenFill } from 'react-icons/ri';
import { Stage, Layer, Image } from 'react-konva';
import { Group } from 'react-konva';
import { useImageStore } from './stores/imageStore';
import { ImageCalculations } from '../../test/calculations';
import { CrosshairLayer } from './hooks/crosshairActivity';
import { useCrosshairCore } from './core/viewcore';
import { useCrosshairMouseEvents } from './mouseEvente/crosshairmouseevent';
import { useZoomMouseEvents } from './mouseEvente/useZoomMouseEvents';

// Constants
const DEFAULT_CANVAS_SIZE = { width: 500, height: 200 };

// Enhanced ViewComponent with better mouse event handling
const ViewComponent = React.memo(({ 
  stateCore,
  viewType, 
  brightness,
  setBrightness,
  crosshairHook,
  sliceCounts,
  getViewImages,
  getViewLoading,
  getViewLoadingCount,
  handleSliceChange,
  setCanvasSizes,
  zoomHook
}) => {
  // All hooks at the top
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 500, height: 200 });

  // Memoize resize handler
  const handleResize = useCallback((entries) => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
      if (typeof setCanvasSizes === 'function') {
        setCanvasSizes(prev => ({
          ...prev,
          [viewType]: { width, height }
        }));
      }
    }
  }, [setCanvasSizes, viewType]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new window.ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [handleResize]);

  // Get data from hooks
  const viewImages = getViewImages(viewType);
  const currentImage = viewImages[crosshairHook.currentSlices[viewType]];
  const isLoading = getViewLoading(viewType);
  const loadedCount = getViewLoadingCount(viewType);
  const totalSlices = sliceCounts[viewType];
  
  const stageWidth = containerSize.width;
  const stageHeight = containerSize.height;
  
  // Memoize image calculations
  const imageDimensions = useMemo(() => 
    ImageCalculations.calculateImageDimensions(
      viewType, 
      stageWidth, 
      stageHeight, 
      crosshairHook.global.volumeSize,
      zoomHook.currentZooms?.[viewType] ?? 1,
      zoomHook.currentPans?.[viewType] ?? { x: 0, y: 0 }
    ),
    [viewType, stageWidth, stageHeight, crosshairHook.global.volumeSize, zoomHook.currentZooms, zoomHook.currentPans]
  );

  const { imageWidth, imageHeight, imageX, imageY } = imageDimensions;

  // Memoize crosshair coordinates
  const crosshairCoords = useMemo(() => ({
    x: crosshairHook.crosshair[viewType]?.x || 0,
    y: crosshairHook.crosshair[viewType]?.y || 0
  }), [crosshairHook.crosshair, viewType]);

  // Get enhanced stage props from the hook
  const stageProps = crosshairHook.getStageProps ? crosshairHook.getStageProps(viewType) : {};

  // Loading state
  if (isLoading) {
    return (
      <div ref={containerRef} className='w-full h-full border border-gray-600 bg-gray-800 flex flex-col'>
        <div className="flex-1 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
            <div className="text-sm">Loading {viewType} images...</div>
            <div className="text-xs text-gray-400">{loadedCount} / {totalSlices} loaded</div>
            <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(loadedCount / totalSlices) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No image state
  if (!currentImage) {
    return (
      <div ref={containerRef} className='w-full h-full border border-gray-600 bg-gray-800 flex flex-col'>
        <div className="flex-1 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-sm">No image available</div>
            <div className="text-xs text-gray-400">Slice {crosshairHook.currentSlices[viewType] + 1}</div>
          </div>
        </div>
      </div>
    );
  }

  // Main render with enhanced mouse handling
  // حساب pan النهائي (توسيط الصورة + pan التفاعلي)
  const basePan = { x: imageX, y: imageY };
  const pan = zoomHook.currentPans?.[viewType] ?? { x: 0, y: 0 };
  const finalPan = {
    x: basePan.x + pan.x,
    y: basePan.y + pan.y
  };

  return (
    <div
      ref={containerRef}
      className='w-full h-full border border-gray-600 bg-gray-800 flex flex-col'
    >
      {/* Zoom Controls */}
      <div className="absolute top-2 left-2 z-20 flex gap-2 bg-[#0d0c22]/60 rounded p-1">
        <button
          className="text-white px-2 py-1 rounded hover:bg-blue-600 bg-blue-500 text-xs"
          onClick={() => {zoomHook?.zoomIn?.(viewType);console.log(zoomHook.currentPans?.[viewType]?.x ,zoomHook.currentZooms?.[viewType] ,"ooooooookllll")}}
          title="Zoom In"
        >
          +
        </button>
        <button
          className="text-white px-2 py-1 rounded hover:bg-blue-600 bg-blue-500 text-xs"
          onClick={() => zoomHook?.zoomOut?.(viewType)}
          title="Zoom Out"
        >
          -
        </button>
        <button
          className="text-white px-2 py-1 rounded hover:bg-gray-700 bg-gray-600 text-xs"
          onClick={() => zoomHook?.resetZoom?.(viewType)}
          title="Reset Zoom"
        >
          Reset
        </button>
      </div>
      <div className="flex-1 relative" tabIndex={0}>
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          {...stageProps}
        >
          <Layer>
            <Group
              x={finalPan.x}
              y={finalPan.y}
              scaleX={zoomHook.currentZooms?.[viewType] ?? 1}
              scaleY={zoomHook.currentZooms?.[viewType] ?? 1}
            >
              <Image
                image={currentImage}
                x={0}
                y={0}
                width={imageWidth}
                height={imageHeight}
                filters={brightness !== 1 ? [Konva.Filters.Brighten] : []}
                brightness={brightness !== 1 ? (brightness - 1) / 2 : 0}
              />
       
            </Group>
            <CrosshairLayer
                x={crosshairCoords.x}
                y={crosshairCoords.y}
                width={stageWidth}
                height={stageHeight}
                viewType={viewType}
              />
          </Layer>
        </Stage>
        
        {/* World coordinates display */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-[#0d0c22] bg-opacity-75 px-2 py-1 rounded">
          <div>World Position:</div>
          <div>X: {crosshairHook.worldPosition?.x?.toFixed(2) || '0.00'} mm</div>
          <div>Y: {crosshairHook.worldPosition?.y?.toFixed(2) || '0.00'} mm</div>
          <div>Z: {crosshairHook.worldPosition?.z?.toFixed(2) || '0.00'} mm</div>
        </div>

        {/* Debug info (can be removed in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 text-xs text-gray-400 bg-[#0d0c22] bg-opacity-75 px-2 py-1 rounded">
            <div>View: {viewType}</div>
            <div>Cursor: {crosshairHook.cursors?.[viewType] || 'default'}</div>
            <div>Dragging: {crosshairHook.dragState?.isDragging ? 'Yes' : 'No'}</div>
            {crosshairHook.dragState?.isDragging && (
              <div>Drag Type: {crosshairHook.dragState.dragType}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  const keysToCompare = ['viewType', 'brightness'];
  
  for (let key of keysToCompare) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }
  
  // Deep compare for complex objects
  if (JSON.stringify(prevProps.crosshairHook.crosshair) !== JSON.stringify(nextProps.crosshairHook.crosshair)) {
    return false;
  }
  
  if (JSON.stringify(prevProps.crosshairHook.currentSlices) !== JSON.stringify(nextProps.crosshairHook.currentSlices)) {
    return false;
  }
  
  return true;
});

// Full view toggle button
const FullViewButton = React.memo(({ isFullView, onFullView, onExitFullView }) => (
  <div className="absolute top-2 right-2 z-50">
    {isFullView ? (
      <motion.button
        onClick={onExitFullView}
        className="text-white hover:text-red-400 p-2 bg-[#0d0c22] bg-opacity-50 rounded"
        title="Exit Full View"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <IoMdClose size={24} />
      </motion.button>
    ) : (
      <motion.button
        onClick={onFullView}
        className="text-white hover:text-blue-400 p-2 bg-[#0d0c22] bg-opacity-50 rounded"
        title="Enter Full View"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <RiFullscreenFill size={24} />
      </motion.button>
    )}
  </div>
));

// Enhanced Main component
const MedicalImageViewer = () => {
  // Store
  const {
    sliceCounts,
    getViewImages,
    getViewLoading,
    getViewLoadingCount,
    getVoxelSizes,
  } = useImageStore();

  const voxelSizes = getVoxelSizes() || {};

  // Use the enhanced crosshair system
  const coreState = useCrosshairCore(sliceCounts, voxelSizes);
  const mouseEvents = useCrosshairMouseEvents(coreState);
  const zoummouseEvents = useZoomMouseEvents(coreState);
  const crosshairHook = { ...coreState, ...mouseEvents };
  const zoomHook = { ...coreState, ...zoummouseEvents };

  const { brightness, setBrightness } = crosshairHook;

  // State for full view panel
  const [fullViewPanel, setFullViewPanel] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Memoize handlers
  const handleFullViewAxial = useCallback(() => setFullViewPanel('axial'), []);
  const handleFullViewCoronal = useCallback(() => setFullViewPanel('coronal'), []);
  const handleFullViewSagittal = useCallback(() => setFullViewPanel('sagittal'), []);
  const handleExitFullView = useCallback(() => setFullViewPanel(null), []);

  // Memoized view panels
  const axialViewPanel = useMemo(() => (
    <ViewComponent
      key="axial"
      viewType="axial"
      brightness={brightness}
      setBrightness={setBrightness}
      zoomHook={zoomHook}
      crosshairHook={crosshairHook}
      sliceCounts={sliceCounts}
      getViewImages={getViewImages}
      getViewLoading={getViewLoading}
      getViewLoadingCount={getViewLoadingCount}
      handleSliceChange={crosshairHook.handleSliceChange}
      setCanvasSizes={crosshairHook.setCanvasSizes}
    />
  ), [brightness, setBrightness, crosshairHook, sliceCounts, getViewImages, getViewLoading, getViewLoadingCount]);

  const coronalViewPanel = useMemo(() => (
    <ViewComponent
      key="coronal"
      zoomHook={zoomHook}

      viewType="coronal"
      brightness={brightness}
      setBrightness={setBrightness}
      crosshairHook={crosshairHook}
      sliceCounts={sliceCounts}
      getViewImages={getViewImages}
      getViewLoading={getViewLoading}
      getViewLoadingCount={getViewLoadingCount}
      handleSliceChange={crosshairHook.handleSliceChange}
      setCanvasSizes={crosshairHook.setCanvasSizes}
    />
  ), [brightness, setBrightness, crosshairHook, sliceCounts, getViewImages, getViewLoading, getViewLoadingCount]);

  const sagittalViewPanel = useMemo(() => (
    <ViewComponent
      key="sagittal"
      viewType="sagittal"
      zoomHook={zoomHook}

      brightness={brightness}
      setBrightness={setBrightness}
      crosshairHook={crosshairHook}
      sliceCounts={sliceCounts}
      getViewImages={getViewImages}
      getViewLoading={getViewLoading}
      getViewLoadingCount={getViewLoadingCount}
      handleSliceChange={crosshairHook.handleSliceChange}
      setCanvasSizes={crosshairHook.setCanvasSizes}
    />
  ), [brightness, setBrightness, crosshairHook, sliceCounts, getViewImages, getViewLoading, getViewLoadingCount]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-fit max-w-7xl mx-auto p-6 bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <div className="text-lg">Loading slices...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-fit max-w-7xl mx-auto p-6 bg-gray-900 text-red-400">
        <div className="text-center">
          <div className="text-lg font-semibold">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  // Main viewer layout
  return (
    <div className="w-full h-full bg-transparent text-white">
      {!fullViewPanel ? (
        <div className="flex flex-row gap-3 min-w-0 h-full">
          <div className="flex flex-col flex-1 gap-3 min-w-0 h-full">
            <div className="flex-1 rounded-xl overflow-hidden min-h-0 min-w-0 h-1/2 relative">
              <FullViewButton
                isFullView={false}
                onFullView={handleFullViewCoronal}
                onExitFullView={handleExitFullView}
              />
              {coronalViewPanel}
            </div>
            <div className="flex-1 rounded-xl overflow-hidden min-h-0 min-w-0 h-1/2 relative">
              <FullViewButton
                isFullView={false}
                onFullView={handleFullViewSagittal}
                onExitFullView={handleExitFullView}
              />
              {sagittalViewPanel}
            </div>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden min-h-0 min-w-0 h-full relative">
            <FullViewButton
              isFullView={false}
              onFullView={handleFullViewAxial}
              onExitFullView={handleExitFullView}
            />
            {axialViewPanel}
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="max-h-[90vh] max-w-[90vw] w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-[#0d0c22]/90 shadow-xl mx-auto relative">
            <FullViewButton
              isFullView={true}
              onExitFullView={handleExitFullView}
            />
            {fullViewPanel === "axial" && axialViewPanel}
            {fullViewPanel === "coronal" && coronalViewPanel}
            {fullViewPanel === "sagittal" && sagittalViewPanel}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalImageViewer;