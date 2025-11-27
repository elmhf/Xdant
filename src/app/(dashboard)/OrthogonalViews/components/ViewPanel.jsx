"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useImageStore } from "../stores/imageStore";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "react-resizable-panels";
import Konva from "konva";
import "konva/lib/shapes/Image";
import { RulerActivity } from "../canvasActivities/Acttivites/rulerActivity";
import { getActivityById } from "../canvasActivities/activityManager";
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { motion } from "framer-motion";

// Remove all unused variables, constants, and helpers

export default function ViewPanel({
  crosshairHook,
  view,
  canvasSize: propCanvasSize,   // { width, height } from parent
  zoom,
  pan,          // pan object { x, y }
  numSlicesAxial,
  numSlicesCoronal,
  numSlicesSagittal,
  paths,
  setPaths,
  smoothedPaths,
  animationFrame,
  isFullView = false,
  onFullView = () => {},
  onExitFullView = () => {}
}) {
  const containerRef = useRef();
  const layerRef = useRef();
  const imageRef = useRef();
  const resizeTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);

  // State
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [imageObj, setImageObj] = useState(null);
  const [brightness, setBrightness] = useState(1);
  const [isAdjustingBrightness, setIsAdjustingBrightness] = useState(false);
  const [lastPointerX, setLastPointerX] = useState(null);
  const [lines, setLines] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [, setRenderTick] = useState(0);
  // Use getter and setter from crosshairHook for canvasSize
  const canvasSize = crosshairHook.getCanvasSize(view);
  const setCanvasSize = (value) => crosshairHook.setCanvasSizeByView(view, value);
  const [isResizing, setIsResizing] = useState(false);

  // Calculate drawn size
  const calculateDrawnSize = useCallback((imgObj, containerSize) => {
    if (!imgObj || !containerSize.width || !containerSize.height) {
      return { width: containerSize.width || 400, height: containerSize.height || 400 };
    }
    const imgW = imgObj.naturalWidth || imgObj.width || 1;
    const imgH = imgObj.naturalHeight || imgObj.height || 1;
    const scaleX = containerSize.width / imgW;
    const scaleY = containerSize.height / imgH;
    const minScale = Math.min(scaleX, scaleY);
    return {
      width: Math.round(imgW * minScale),
      height: Math.round(imgH * minScale)
    };
  }, []);

  const drawnSize = useMemo(() => {
    return calculateDrawnSize(imageObj, canvasSize);
  }, [imageObj, canvasSize, calculateDrawnSize]);

  const updateCanvasSize = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const newSize = {
      width: container.clientWidth,
      height: container.clientHeight,
    };
    setCanvasSize(newSize);
  }, [setCanvasSize]);

  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      setIsResizing(true);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        updateCanvasSize();
        resizeTimeoutRef.current = setTimeout(() => {
          setIsResizing(false);
        }, 100);
      });
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    updateCanvasSize();
    return () => {
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateCanvasSize]);

  const rotation = useSettingsStore((state) => state.rotation);
  const activeActivities = useSettingsStore((s) => s.activeActivities);

  const { getViewImages, getViewLoading, getViewLoadingCount } = useImageStore();
  const images = getViewImages(view);
  const index = 0; // Placeholder, update as needed
  const numSlices = 1; // Placeholder, update as needed
  const isLoading = getViewLoading(view);
  const loadedCount = getViewLoadingCount(view);
  const percent = Math.round((loadedCount / (numSlices || 1)) * 100);

  const stageWidth = canvasSize?.width || 400;
  const stageHeight = canvasSize?.height || 400;
  const imageX = canvasSize.width / 2;
  const imageY = canvasSize.height / 2;

  useEffect(() => {
    const img = images[index];
    if (!img) return setImageObj(null);
    setImageObj(img);
  }, [images, index]);

  useEffect(() => {
    if (!imageRef.current || !imageObj || isResizing) return;
    const updateFrame = requestAnimationFrame(() => {
      if (imageRef.current && imageObj) {
        imageRef.current.cache();
        imageRef.current.getLayer()?.batchDraw();
      }
    });
    return () => cancelAnimationFrame(updateFrame);
  }, [imageObj, brightness, drawnSize, rotation, isResizing]);

  return (
    <div className="w-full h-full overflow-hidden flex flex-col relative"
      style={{
        minHeight: '200px',
        minWidth: '200px',
      }}
    >
      {/* Canvas */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div
          ref={containerRef}
          className="relative flex items-center justify-center w-full h-full"
          style={{
            overflow: 'hidden',
            boxSizing: 'border-box',
            padding: '6px',
            width: '100%',
            height: '100%',
          }}
        >
          <Stage
            width={stageWidth}
            height={stageHeight}
            className="rounded-[0.8vw] overflow-hidden cursor-crosshair border border-gray-700 bg-[#0d0c22]"
            style={{
              transition: isResizing ? 'none' : 'all 0.1s ease-out',
            }}
          >
            <Layer ref={layerRef}>
              {imageObj && !isResizing && (
                <KonvaImage
                  ref={imageRef}
                  image={imageObj}
                  width={drawnSize.width}
                  height={drawnSize.height}
                  x={imageX}
                  y={imageY}
                  rotation={rotation}
                  offsetX={drawnSize.width / 2}
                  offsetY={drawnSize.height / 2}
                  filters={[Konva.Filters.Brighten]}
                  brightness={brightness - 1}
                  perfectDrawEnabled={false}
                  listening={false}
                />
              )}
              {/* Crosshair Layer removed */}
            </Layer>
          </Stage>
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute top-2 right-2 flex flex-col items-center justify-center z-50 bg-[#0d0c22]/40 rounded-lg px-3 py-2">
              <svg className="animate-spin h-6 w-6 text-white mb-1" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              <span className="text-white font-bold text-base">{percent}%</span>
            </div>
          )}
          {/* Bottom right view icon */}
          <img
            src={`/${view.charAt(0).toUpperCase() + view.slice(1)}view.png`}
            alt={view}
            title={view.charAt(0).toUpperCase() + view.slice(1)}
            style={{
              opacity: 0.9,
              position: 'absolute',
              right: 12,
              bottom: 12,
              width: 48,
              height: 48,
              borderRadius: 8,
              background: '#222',
              padding: 4,
              zIndex: 10,
              boxShadow: '0 2px 8px #0008',
            }}
          />
          {/* Full view toggle button */}
          <div className="absolute top-2 right-2 z-50">
            {isFullView ? (
              <motion.button
                onClick={onExitFullView}
                className="text-white hover:text-red-400 p-2"
                title="Exit Full View"
                whileHover={{
                  scale: 1.1,
                  rotate: 90,
                  transition: { duration: 0.3, ease: "easeInOut" }
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 1 }}
                animate={{ scale: 1 }}
              >
                <IoMdClose size={24} />
              </motion.button>
            ) : (
              <motion.button
                onClick={onFullView}
                className="text-white hover:text-blue-400 p-2"
                title="Enter Full View"
                whileHover={{
                  scale: 1.1,
                  y: -2,
                  transition: { duration: 0.3, ease: "easeInOut" }
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 1 }}
                animate={{ scale: 1 }}
              >
                <RiFullscreenFill size={24} />
              </motion.button>
            )}
          </div>
          {/* Debug button for logging sizes */}
          <div className="absolute top-2 left-2 z-50">
            <button
              onClick={() => {
                console.log('=== SIZE DEBUG INFO ===');
                console.log('Canvas Size:', canvasSize);
                console.log('Stage Size:', { width: stageWidth, height: stageHeight });
                console.log('Image Object:', imageObj ? {
                  naturalWidth: imageObj.naturalWidth,
                  naturalHeight: imageObj.naturalHeight,
                  width: imageObj.width,
                  height: imageObj.height
                } : 'No image');
                console.log('Drawn Size:', drawnSize);
                console.log('Image Position:', { x: imageX, y: imageY });
                console.log('Container Ref:', containerRef.current ? {
                  clientWidth: containerRef.current.clientWidth,
                  clientHeight: containerRef.current.clientHeight,
                  offsetWidth: containerRef.current.offsetWidth,
                  offsetHeight: containerRef.current.offsetHeight
                } : 'No container ref');
                console.log('Is Resizing:', isResizing);
                console.log('========================');
              }}
              className="text-white hover:text-green-400 p-2 bg-gray-800 rounded"
              title="Debug Sizes"
            >
              📏
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}