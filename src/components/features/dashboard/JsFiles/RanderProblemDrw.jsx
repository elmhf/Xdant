'use client';
import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import { Stage, Layer, Image, Line, Group, Text, Circle, Rect } from "react-konva";
import { DataContext } from "../dashboard";
import { getToothBoundingBox } from "@/utils/toothUtils";
import { toast } from "sonner";

const COLOR_PALETTE = {
  // Main structures - refined colors with balanced opacity and softer shadows
  tooth: {
    fill: 'rgba(255, 255, 255, 0.9)', // White fill for clean look
    stroke: '#000000', // Black stroke as requested
    strokeWidth: 1.5, // Clean width
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 2
  },
  crown: {
    fill: 'rgba(255, 255, 255, 0.9)',
    stroke: '#000000',
    strokeWidth: 1.5,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 2
  },
  root: {
    fill: 'rgba(255, 255, 255, 0.9)',
    stroke: '#000000',
    strokeWidth: 1.5,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 2
  },
  jaw: {
    fill: 'rgba(240, 240, 240, 0.5)',
    stroke: '#333333',
    strokeWidth: 1,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 2
  },

  // Problems/Findings - vibrant but professional colors with refined opacity
  caries: {
    fill: 'rgba(200, 50, 100, 0.1)', // Softer pinkish-red for less harshness
    stroke: 'rgba(180, 40, 90, 0.1)',
    strokeWidth: 1.5, // Thinner stroke for precision
    shadowColor: 'rgba(180, 40, 90, 0.4)',
    shadowBlur: 8
  },
  impacted: {
    fill: 'rgba(180, 80, 120, 0.55)', // Muted tone for impacted teeth
    stroke: 'rgba(160, 60, 100, 0.7)',
    strokeWidth: 1.5,
    shadowColor: 'rgba(160, 60, 100, 0.4)',
    shadowBlur: 8
  },
  lesion: {
    fill: 'rgba(200, 100, 50, 0.5)', // Warmer orange for lesions
    stroke: 'rgba(180, 80, 30, 0.7)',
    strokeWidth: 1.5,
    shadowColor: 'rgba(180, 80, 30, 0.4)',
    shadowBlur: 8
  },
  restoration: {
    fill: 'rgba(240, 240, 240, 0.95)', // Brighter, cleaner fill
    stroke: 'rgba(200, 200, 200, 0.8)',
    strokeWidth: 1, // Thinner stroke for delicate look
    shadowColor: 'rgba(200, 200, 200, 0.3)',
    shadowBlur: 4
  },
  endo: {
    fill: 'rgba(245, 245, 245, 0.85)', // Slightly softer fill
    stroke: 'rgba(220, 220, 220, 0.8)',
    strokeWidth: 1.5,
    shadowColor: 'rgba(220, 220, 220, 0.3)',
    shadowBlur: 4
  },

  // UI elements - clean and professional
  measurement: {
    fill: 'rgba(255, 200, 100, 0.9)', // Softer gold for readability
    stroke: 'rgba(255, 180, 80, 0.9)',
    strokeWidth: 1.5,
    shadowColor: 'rgba(255, 180, 80, 0.5)',
    shadowBlur: 6
  },
  drawing: {
    fill: 'rgba(255, 170, 50, 0.2)', // Less aggressive orange
    stroke: 'rgba(255, 150, 30, 0.2)',
    strokeWidth: 1.5,
    shadowColor: 'rgba(255, 150, 30, 0.5)',
    shadowBlur: 6
  },

  // Default for unknown problems
  problem: {
    fill: 'rgba(255, 120, 50, 0.05)', // Softer orange for general problems
    stroke: 'rgba(230, 100, 30, 0.1)',
    strokeWidth: 1.5,
    shadowColor: 'rgba(230, 100, 30, 1)',
    shadowBlur: 8
  },
};

// Helper to get color based on problem type
const getProblemStyle = (type) => {
  return COLOR_PALETTE[type] || COLOR_PALETTE.problem;
};

// Helper to apply shadow properties to Line elements
const applyShadowProps = (style, scale) => {
  const props = {
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: Math.max(0.5, style.strokeWidth / scale),
    perfectDrawEnabled: false,
    hitGraphEnabled: false,
    listening: false,
  };

  // Apply shadow if available
  if (style.shadowColor) {
    props.shadowColor = style.shadowColor;
    props.shadowBlur = (style.shadowBlur || 3) / scale;
    props.shadowOffset = { x: 1 / scale, y: 1 / scale };
  }

  return props;
};

const RenderProblemDrw = ({ image, tooth, ShowSetting, useFilter, activeTool, resetMeasurements, onUndoCallback, showGrid = true, zoom, isLocked, showLayers, selectedTooth, onToothClick }) => {
  const { stageRef, hoveredProblem } = useContext(DataContext);
  const containerRef = useRef(null);
  const imageNodeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const fpsCountRef = useRef(0);
  const fpsTimeRef = useRef(Date.now());
  // حالات الصورة والحاوية
  const [imgObj, setImgObj] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [currentFPS, setCurrentFPS] = useState(0);

  // حالات التحويل (Transform) مع تحسين الأداء
  const [transform, setTransform] = useState({
    scale: 1,
    x: 0,
    y: 0
  });

  // حالات التفاعل المحسنة للـ 120 FPS
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 });
  const [{ brightness, contrast, saturation }] = useFilter;

  // State for measurement tool
  const [measurementLines, setMeasurementLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLinePoints, setCurrentLinePoints] = useState([]);

  // State for drawing tools
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [currentRectangle, setCurrentRectangle] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [drawnRectangles, setDrawnRectangles] = useState([]);
  const [drawnPoints, setDrawnPoints] = useState([]);

  // Enhanced UX states

  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);

  // History system for undo functionality
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Get cursor style based on active tool
  const getCursorStyle = useCallback(() => {
    if (isDragging) return 'grabbing';
    switch (activeTool) {
      case 'pointer': return 'default';
      case 'pan': return 'grab';
      case 'linear': return 'crosshair';
      case 'rectangle': return 'crosshair';
      case 'point': return 'crosshair';
      default: return 'default';
    }
  }, [activeTool, isDragging]);

  // Save current state to history
  const saveToHistory = useCallback((action, data) => {
    const newHistoryItem = {
      id: Date.now(),
      action,
      data,
      timestamp: new Date().toISOString()
    };

    setHistory(prev => {
      // Remove any items after current index (if we're in middle of history)
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newHistoryItem];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex >= 0) {
      const lastAction = history[historyIndex];

      switch (lastAction.action) {
        case 'measurement':
          setMeasurementLines(prev => prev.slice(0, -1));
          break;
        case 'rectangle':
          setDrawnRectangles(prev => prev.slice(0, -1));
          break;
        case 'point':
          setDrawnPoints(prev => prev.slice(0, -1));
          break;
        default:
          break;
      }

      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  // Check if undo is available
  const canUndo = historyIndex >= 0;

  // Notify parent component about undo state changes
  useEffect(() => {
    if (onUndoCallback) {
      onUndoCallback(canUndo, undo);
    }
  }, [canUndo, undo, onUndoCallback]);

  // مقياس FPS المستهدف
  const TARGET_FPS = 120;
  const FRAME_TIME = 1000 / TARGET_FPS; // ~8.33ms للإطار الواحد

  // تحميل الصورة
  useEffect(() => {
    if (!image) return;

    const img = new window.Image();
    img.onload = () => {
      setImgObj(img);
    };
    img.src = image.data_url;
  }, [image]);

  // مراقبة حجم الحاوية
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateContainerSize();
    const resizeObserver = new ResizeObserver(updateContainerSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // حساب FPS الحالي
  const updateFPS = useCallback(() => {
    const now = Date.now();
    fpsCountRef.current++;

    if (now - fpsTimeRef.current >= 1000) {
      setCurrentFPS(fpsCountRef.current);
      fpsCountRef.current = 0;
      fpsTimeRef.current = now;
    }
  }, []);

  // تطبيق فلاتر الصورة مع تحسين الأداء للـ 120 FPS
  useEffect(() => {
    if (!imageNodeRef.current) return;

    const applyFilters = () => {
      if (!imageNodeRef.current) return;

      // تحسين أداء الفلاتر باستخدام Web Workers (محاكاة)
      const startTime = performance.now();

      imageNodeRef.current.cache();
      imageNodeRef.current.filters([
        function (imageData) {
          const data = imageData.data;
          const len = data.length;

          // تحسين الحلقات للأداء العالي
          const brightnessFactor = brightness / 100;
          const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          const saturationFactor = saturation / 100;

          // معالجة البيانات بكفاءة أعلى
          for (let i = 0; i < len; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // تطبيق السطوع
            r = Math.min(255, Math.max(0, r * brightnessFactor));
            g = Math.min(255, Math.max(0, g * brightnessFactor));
            b = Math.min(255, Math.max(0, b * brightnessFactor));

            // تطبيق التباين
            r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
            g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
            b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));

            // تطبيق التشبع
            const avg = (r + g + b) / 3;
            r = Math.min(255, Math.max(0, avg + (r - avg) * saturationFactor));
            g = Math.min(255, Math.max(0, avg + (g - avg) * saturationFactor));
            b = Math.min(255, Math.max(0, avg + (b - avg) * saturationFactor));

            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }
        }
      ]);

      const endTime = performance.now();

      imageNodeRef.current.getLayer()?.batchDraw();
    };

    requestAnimationFrame(applyFilters);
  }, [brightness, contrast, saturation]);

  // حساب المقياس الأدنى لملء الحاوية
  const getMinScale = useCallback(() => {
    return 0.1; // Allow zooming out further than container
  }, []);

  // حساب الموضع المحدود للصورة مع تحسين للـ 120 FPS
  const getBoundedPosition = useCallback((newScale, newX, newY) => {
    // Remove strict bounds to allow free movement
    return { x: newX, y: newY };
  }, []);

  // تحديث الموضع بنعومة عالية للـ 120 FPS
  const updateTransformSmooth = useCallback((updates) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const now = performance.now();
      updateFPS();

      setTransform(prev => {
        const newTransform = { ...prev, ...updates };
        const boundedPosition = getBoundedPosition(newTransform.scale, newTransform.x, newTransform.y);
        return {
          scale: newTransform.scale,
          x: boundedPosition.x,
          y: boundedPosition.y
        };
      });

      lastUpdateRef.current = now;
    });
  }, [getBoundedPosition, updateFPS]);

  // إعادة تعيين الصورة للوضع الافتراضي
  const resetView = useCallback(() => {
    if (!imgObj || !containerSize.width || !containerSize.height) return;

    // Calculate scale to fit image in container for reset/initial view
    const scaleX = containerSize.width / imgObj.naturalWidth;
    const scaleY = containerSize.height / imgObj.naturalHeight;
    const fitScale = Math.min(scaleX, scaleY);

    const imageWidth = imgObj.naturalWidth * fitScale;
    const imageHeight = imgObj.naturalHeight * fitScale;

    updateTransformSmooth({
      scale: fitScale,
      x: (containerSize.width - imageWidth) / 2,
      y: (containerSize.height - imageHeight) / 2
    });
  }, [imgObj, containerSize, updateTransformSmooth]);

  // معالجة اختصارات لوحة المفاتيح مع دعم 120 FPS
  useEffect(() => {
    const handleKeyDown = (e) => {
      // التحريك بالأسهم مع نعومة عالية
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        const step = e.shiftKey ? 20 : 5; // خطوات أكبر للحركة السريعة
        let deltaX = 0;
        let deltaY = 0;

        switch (e.code) {
          case 'ArrowUp':
            deltaY = step;
            break;
          case 'ArrowDown':
            deltaY = -step;
            break;
          case 'ArrowLeft':
            deltaX = step;
            break;
          case 'ArrowRight':
            deltaX = -step;
            break;
        }

        updateTransformSmooth({
          x: transform.x + deltaX,
          y: transform.y + deltaY
        });
      }
    };

    const handleKeyUp = (e) => {
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDragging, transform, updateTransformSmooth]);

  // تطبيق الوضع الافتراضي عند تحميل الصورة أو تغيير حجم الحاوية
  useEffect(() => {
    if (imgObj && containerSize.width && containerSize.height && !selectedTooth) {
      resetView();
    }
  }, [imgObj, containerSize, resetView, selectedTooth]);

  // Effect to handle tooth selection zooming and cropping
  useEffect(() => {
    // If no tooth selected, reset view (handled by above effect or explicit reset)
    // Actually, we should probably only reset if we were previously zoomed in on a tooth?
    // For now, let's keep it simple: if selectedTooth changes to null, reset.
    if (!selectedTooth) {
      if (imgObj && containerSize.width && containerSize.height) {
        resetView();
      }
      return;
    }

    if (!tooth || !imgObj || !containerSize.width || !containerSize.height) return;

    const selectedFinding = tooth.find(f => f.toothNumber == selectedTooth);
    if (!selectedFinding) {
      toast.warning(`Tooth ${selectedTooth} not found in image analysis.`);
      return;
    }

    const boundingBox = getToothBoundingBox(selectedFinding);
    if (!boundingBox) {
      toast.warning(`Position data unavailable for Tooth ${selectedTooth}.`);
      return;
    }

    const { x, y, width, height } = boundingBox;

    // Calculate scale to fit the tooth in the container with some padding
    const padding = Math.min(width, height) * 0.5; // 50% padding

    // Target display area (to center it) based on container aspect ratio
    // User requested that the image NOT be the size of the container (i.e., not full screen/huge)
    // We will target a smaller portion of the screen, e.g., 40% of the container dimensions
    const targetContainerWidth = containerSize.width * 0.4;
    const targetContainerHeight = containerSize.height * 0.6; // Allow a bit more height

    const scaleX = targetContainerWidth / (width + padding * 2);
    const scaleY = targetContainerHeight / (height + padding * 2);

    // Choose the smaller scale to ensure it fits
    let newScale = Math.min(scaleX, scaleY);

    // Ensure we don't zoom out too much (minimum 1) and don't zoom in *too* much (cap at 3)
    newScale = Math.max(1, Math.min(newScale, 3));

    // Calculate new position to center the tooth
    // formatting: center of viewport = (center of tooth) * scale + offset
    // offset = center of viewport - (center of tooth) * scale

    const toothCenterX = x + width / 2;
    const toothCenterY = y + height / 2;

    const newX = (containerSize.width / 2) - (toothCenterX * newScale);
    const newY = (containerSize.height / 2) - (toothCenterY * newScale);

    updateTransformSmooth({
      scale: newScale,
      x: newX,
      y: newY
    });

  }, [selectedTooth, tooth, imgObj, containerSize]);

  // معالجة عجلة الماوس للزوم مع دعم 120 FPS
  const handleWheel = useCallback((e) => {
    if (isLocked) return;
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage || !imgObj) return;

    const now = performance.now();
    const timeDiff = now - lastUpdateRef.current;

    // تحسين معدل الاستجابة للـ 120 FPS
    if (timeDiff < FRAME_TIME * 0.5) return; // تقليل الحد الأدنى للوقت

    const pointer = stage.getPointerPosition();
    const minScale = getMinScale();
    const maxScale = 8; // زيادة الحد الأقصى للزوم

    // حساب المقياس الجديد مع تحسين التدرج للـ 120 FPS
    const scaleBy = 1.05; // قيمة أصغر للنعومة الفائقة
    const oldScale = transform.scale;
    const newScale = e.evt.deltaY > 0
      ? Math.max(minScale, oldScale / scaleBy)
      : Math.min(maxScale, oldScale * scaleBy);

    // حساب الموضع الجديد للزوم حول نقطة الماوس
    const mousePointTo = {
      x: (pointer.x - transform.x) / oldScale,
      y: (pointer.y - transform.y) / oldScale
    };

    const newX = pointer.x - mousePointTo.x * newScale;
    const newY = pointer.y - mousePointTo.y * newScale;

    updateTransformSmooth({
      scale: newScale,
      x: newX,
      y: newY
    });
  }, [stageRef, imgObj, transform, getMinScale, updateTransformSmooth, isLocked]);

  // معالج السحب المحسن للـ 120 FPS
  const handleDragStart = useCallback((e) => {
    if (isLocked) return;
    setIsDragging(true);
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    setLastPointerPos({ x: pointer.x, y: pointer.y });
    setDragStart({
      x: pointer.x - transform.x,
      y: pointer.y - transform.y
    });
  }, [stageRef, transform, isLocked]);

  // معالج حركة السحب مع دعم 120 FPS الكامل
  const handleDragMove = useCallback((e) => {
    if (isLocked) return;
    if (!isDragging) return;

    const now = performance.now();
    const timeDiff = now - lastUpdateRef.current;

    // تحسين معدل التحديث للـ 120 FPS - إزالة القيود تقريباً
    if (timeDiff < FRAME_TIME * 0.3) return; // ~2.5ms فقط

    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();

    // حساب التغيير في الموضع مع تنعيم الحركة
    const deltaX = pointer.x - lastPointerPos.x;
    const deltaY = pointer.y - lastPointerPos.y;

    // تطبيق تنعيم للحركة
    const smoothFactor = 0.95; // تنعيم خفيف
    const smoothDeltaX = deltaX * smoothFactor;
    const smoothDeltaY = deltaY * smoothFactor;

    setLastPointerPos({ x: pointer.x, y: pointer.y });

    updateTransformSmooth({
      x: transform.x + smoothDeltaX,
      y: transform.y + smoothDeltaY
    });
  }, [isDragging, lastPointerPos, stageRef, transform, updateTransformSmooth, isLocked]);

  // معالجة نهاية السحب
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
    setLastPointerPos({ x: 0, y: 0 });
  }, []);

  // معالجة النقر والسحب على Stage مع تحسين الاستجابة
  const handleStageMouseDown = useCallback((e) => {
    if (isLocked) return;
    // Rectangle drawing tool logic
    if (activeTool === 'rectangle') {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      const transformedPos = {
        x: (pos.x - transform.x) / transform.scale,
        y: (pos.y - transform.y) / transform.scale,
      };

      setCurrentRectangle({
        x: transformedPos.x,
        y: transformedPos.y,
        width: 0,
        height: 0
      });
      setIsDrawingShape(true);
      return; // Prevent dragging when using rectangle tool
    }

    // Point drawing tool logic
    if (activeTool === 'point') {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      const transformedPos = {
        x: (pos.x - transform.x) / transform.scale,
        y: (pos.y - transform.y) / transform.scale,
      };

      const newPoint = { x: transformedPos.x, y: transformedPos.y };
      setDrawnPoints(prev => [...prev, newPoint]);
      saveToHistory('point', newPoint);
      return; // Prevent dragging when using point tool
    }

    // Measurement tool logic
    if (activeTool === 'linear') {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      const transformedPos = {
        x: (pos.x - transform.x) / transform.scale,
        y: (pos.y - transform.y) / transform.scale,
      };

      if (!isDrawing) {
        setCurrentLinePoints([transformedPos.x, transformedPos.y, transformedPos.x, transformedPos.y]);
        setIsDrawing(true);
      } else {
        const finalPoints = [...currentLinePoints.slice(0, 2), transformedPos.x, transformedPos.y];
        const p1 = { x: finalPoints[0], y: finalPoints[1] };
        const p2 = { x: finalPoints[2], y: finalPoints[3] };
        const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

        const newMeasurement = { points: finalPoints, text: `${distance.toFixed(2)} px` };
        setMeasurementLines(prev => [...prev, newMeasurement]);
        saveToHistory('measurement', newMeasurement);
        setCurrentLinePoints([]);
        setIsDrawing(false);
      }
      return; // Prevent dragging when using measurement tool
    }

    handleDragStart(e);
  }, [activeTool, isDrawing, stageRef, transform, handleDragStart, currentLinePoints, saveToHistory, isLocked]);

  const handleStageMouseMove = useCallback((e) => {


    // Measurement tool logic
    if (isDrawing && activeTool === 'linear') {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      const transformedPos = {
        x: (pos.x - transform.x) / transform.scale,
        y: (pos.y - transform.y) / transform.scale,
      };
      setCurrentLinePoints(prev => [prev[0], prev[1], transformedPos.x, transformedPos.y]);
      return;
    }

    // Rectangle drawing logic
    if (isDrawingShape && activeTool === 'rectangle' && currentRectangle) {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      const transformedPos = {
        x: (pos.x - transform.x) / transform.scale,
        y: (pos.y - transform.y) / transform.scale,
      };

      setCurrentRectangle(prev => ({
        x: prev.x,
        y: prev.y,
        width: transformedPos.x - prev.x,
        height: transformedPos.y - prev.y
      }));
      return;
    }

    if (isDragging) {
      handleDragMove(e);
    }
  }, [isDragging, handleDragMove, isDrawing, activeTool, stageRef, transform, isDrawingShape, currentRectangle, isLocked]);

  const handleStageMouseUp = useCallback(() => {
    // Finish rectangle drawing
    if (isDrawingShape && activeTool === 'rectangle' && currentRectangle) {
      if (Math.abs(currentRectangle.width) > 5 && Math.abs(currentRectangle.height) > 5) {
        setDrawnRectangles(prev => [...prev, currentRectangle]);
        saveToHistory('rectangle', currentRectangle);
      }
      setCurrentRectangle(null);
      setIsDrawingShape(false);
    }

    if (isDragging) {
      handleDragEnd();
    }
  }, [isDragging, handleDragEnd, isDrawingShape, activeTool, currentRectangle, saveToHistory, isLocked]);

  const handleStageMouseEnter = useCallback(() => {
    setIsHoveringCanvas(true);
  }, []);

  const handleStageMouseLeave = useCallback(() => {
    setIsHoveringCanvas(false);
  }, []);

  // تحويل إحداثيات القناع
  const adjustCoordinates = useCallback((mask) => {
    if (!Array.isArray(mask)) return [];
    return mask.flat();
  }, []);

  // تنظيف animation frames عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Reset measurements when resetMeasurements prop changes
  useEffect(() => {
    if (resetMeasurements) {
      setMeasurementLines([]);
      setCurrentLinePoints([]);
      setIsDrawing(false);
      setDrawnRectangles([]);
      setDrawnPoints([]);
      setCurrentRectangle(null);
      setCurrentPoint(null);
      setIsDrawingShape(false);
      // Clear history when resetting
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [resetMeasurements]);

  // Separate findings into structures and problems for layered rendering
  const structuralElements = ['tooth', 'crown', 'root', 'jaw'];

  const structures = tooth.filter(f => structuralElements.includes(f.type));
  const problems = tooth.filter(f => !structuralElements.includes(f.type));

  // Render structures first, then problems on top
  const findingsToRender = [...structures, ...problems];

  useEffect(() => {
    if (zoom) {
      setTransform(prev => ({
        ...prev,
        scale: zoom / 100
      }));
    }
  }, [zoom]);

  // إلغاء وضع الرسم عند تغيير الأداة
  useEffect(() => {
    setIsDrawing(false);
    setCurrentLinePoints([]);
    setIsDrawingShape(false);
    setCurrentRectangle(null);
  }, [activeTool]);

  // إلغاء وضع الرسم عند الضغط خارج الصورة
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDrawing(false);
        setCurrentLinePoints([]);
        setIsDrawingShape(false);
        setCurrentRectangle(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
        cursor: getCursorStyle(),
        // تحسينات أداء CSS للـ 120 FPS
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        perspective: 1000,
        transform: 'translateZ(0)', // تفعيل تسريع الأجهزة
        imageRendering: 'optimizeSpeed', // تحسين رسم الصور
        WebkitFontSmoothing: 'subpixel-antialiased'
      }}
    >
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={1}
        scaleY={1}
        x={0}
        y={0}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseEnter={handleStageMouseEnter}
        onMouseLeave={handleStageMouseLeave}
        draggable={false}
        // تحسينات الأداء القصوى لـ Konva للـ 120 FPS
        perfectDrawEnabled={false}
        listening={true}
        hitGraphEnabled={false}
        imageSmoothingEnabled={false}
      >
        <Layer
          // تحسينات إضافية للطبقة
          perfectDrawEnabled={false}
          imageSmoothingEnabled={false}
          clearBeforeDraw={true}
          hitGraphEnabled={false}
        >
          {imgObj && (
            <Group
              x={transform.x}
              y={transform.y}
              scaleX={transform.scale}
              scaleY={transform.scale}
              draggable={false}
              // تحسين الأداء للمجموعة
              perfectDrawEnabled={false}
              shadowForStrokeEnabled={false}
              hitGraphEnabled={true}
              clip={(() => {
                if (!selectedTooth || !tooth) return undefined;
                const finding = tooth.find(f => f.toothNumber == selectedTooth);
                const bb = getToothBoundingBox(finding);
                if (bb) {
                  // Add some padding to the specific clip as well effectively acting as the crop
                  const padding = Math.min(bb.width, bb.height) * 0.1;
                  return {
                    x: bb.x - padding,
                    y: bb.y - padding,
                    width: bb.width + (padding * 2),
                    height: bb.height + (padding * 2)
                  };
                }
                return undefined;
              })()}
            >
              <Image
                ref={imageNodeRef}
                image={imgObj}
                width={imgObj.naturalWidth}
                height={imgObj.naturalHeight}
                perfectDrawEnabled={false}
                imageSmoothingEnabled={true}
                pixelRatio={window.devicePixelRatio || 1}
                listening={false}
              />
              {/* إذا كانت الطبقات مفعلة، اعرض كل الرسومات */}
              {true && (
                <>
                  {/* Grid Overlay */}
                  {showGrid && imgObj && (
                    <Group listening={false}>
                      {/* Vertical lines */}
                      {[...Array(Math.ceil(imgObj.naturalWidth / 50))].map((_, i) => (
                        <Line
                          key={`grid-v-${i}`}
                          points={[i * 50, 0, i * 50, imgObj.naturalHeight]}
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth={1 / transform.scale}
                        />
                      ))}
                      {/* Horizontal lines */}
                      {[...Array(Math.ceil(imgObj.naturalHeight / 50))].map((_, i) => (
                        <Line
                          key={`grid-h-${i}`}
                          points={[0, i * 50, imgObj.naturalWidth, i * 50]}
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth={1 / transform.scale}
                        />
                      ))}
                      {/* Grid numbers */}
                      {transform.scale > 0.5 && (
                        <>
                          {[...Array(Math.ceil(imgObj.naturalWidth / 100))].map((_, i) => (
                            <Text
                              key={`grid-x-${i}`}
                              x={i * 100 + 5}
                              y={15}
                              text={`${i * 100}`}
                              fontSize={10 / transform.scale}
                              fill="rgba(255,255,255,0.6)"
                              listening={false}
                            />
                          ))}
                          {[...Array(Math.ceil(imgObj.naturalHeight / 100))].map((_, i) => (
                            <Text
                              key={`grid-y-${i}`}
                              x={5}
                              y={i * 100 + 15}
                              text={`${i * 100}`}
                              fontSize={10 / transform.scale}
                              fill="rgba(255,255,255,0.6)"
                              listening={false}
                            />
                          ))}
                        </>
                      )}
                    </Group>
                  )}
                  {/* رسم الأسنان والعناصر الطبية والفك */}
                  {findingsToRender.map((finding, index) => {
                    const style = getProblemStyle(finding.type);
                    const points = adjustCoordinates(finding.polygon || finding.teeth_mask || finding.mask);

                    return (
                      <React.Fragment key={`finding-${index}`}>
                        {ShowSetting.showTeeth && (
                          <Line
                            points={points}
                            {...applyShadowProps(style, transform.scale)}
                            closed
                            onClick={(e) => {
                              console.log('Tooth clicked:', finding.toothNumber);
                              if (onToothClick && finding.toothNumber) {
                                e.cancelBubble = true;
                                onToothClick(finding.toothNumber);
                              }
                            }}
                            onTap={(e) => {
                              if (onToothClick && finding.toothNumber) {
                                e.cancelBubble = true;
                                onToothClick(finding.toothNumber);
                              }
                            }}
                          />
                        )}
                        {selectedTooth == finding.toothNumber && (
                          (() => {
                            const boundingBox = getToothBoundingBox(finding);

                            if (!boundingBox) {
                              // console.log('Could not determine bounding box for tooth', finding.toothNumber);
                              return null;
                            }

                            const { x, y, width, height } = boundingBox;
                            console.log(x, y, width, height, "boundingBox");
                            return (
                              <Rect
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                stroke="#00ff00"
                                strokeWidth={2 / transform.scale}
                                dash={[5 / transform.scale, 5 / transform.scale]}
                                listening={false}
                              />
                            );
                          })()
                        )}
                        {finding.problems?.filter(problem => ShowSetting.problems[`show${problem.type}`])
                          .map((problem, pIndex) => {
                            const style = getProblemStyle(problem.type);
                            return (
                              <Line
                                key={`problem-${index}-${pIndex}`}
                                points={adjustCoordinates(problem.mask)}
                                {...applyShadowProps(style, transform.scale)}
                                closed
                              />
                            );
                          })}
                        {ShowSetting.showRoots && finding.Root?.mask && (
                          <Line
                            points={adjustCoordinates(finding.Root.mask)}
                            {...applyShadowProps(COLOR_PALETTE.root, transform.scale)}
                            closed
                          />
                        )}
                        {ShowSetting.showCrown && finding.Crown?.mask && (
                          <Line
                            points={adjustCoordinates(finding.Crown.mask)}
                            {...applyShadowProps(COLOR_PALETTE.crown, transform.scale)}
                            closed
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                  {/* Hover Highlight */}
                  {hoveredProblem && (() => {
                    console.log('hoveredProblem', hoveredProblem);
                    const bb = getToothBoundingBox(hoveredProblem);
                    if (bb) {
                      return (
                        <Rect
                          x={bb.x}
                          y={bb.y}
                          width={bb.width}
                          height={bb.height}
                          stroke="#FFFF00"
                          strokeWidth={3 / transform.scale}
                          fill="rgba(255, 255, 0, 0.2)"
                          listening={false}
                        />
                      );
                    }
                    return null;
                  })()}
                  {/* Measurement Lines and Text */}
                  {measurementLines.map((line, i) => {
                    const style = COLOR_PALETTE.measurement;
                    const textContent = line.text;
                    const fontSize = 14 / transform.scale;
                    const textWidth = (textContent.length * fontSize * 0.6);
                    const textHeight = fontSize * 1.2;
                    const paddingX = 8 / transform.scale;
                    const paddingY = 4 / transform.scale;
                    const textX = (line.points[0] + line.points[2]) / 2;
                    const textY = (line.points[1] + line.points[3]) / 2 - (textHeight + 10 / transform.scale);
                    return (
                      <Group key={`m-line-${i}`} listening={false}>
                        {/* Main line */}
                        <Line
                          points={line.points}
                          stroke={style.stroke}
                          strokeWidth={style.strokeWidth / transform.scale}
                          shadowColor={style.shadowColor}
                          shadowBlur={style.shadowBlur / transform.scale}
                          shadowOpacity={0.7}
                          lineCap="round"
                        />
                        {/* Endpoints */}
                        <Circle
                          x={line.points[0]}
                          y={line.points[1]}
                          radius={4 / transform.scale}
                          fill={style.stroke}
                        />
                        <Circle
                          x={line.points[2]}
                          y={line.points[3]}
                          radius={4 / transform.scale}
                          fill={style.stroke}
                        />
                        {/* Text Background */}
                        <Rect
                          x={textX - (textWidth / 2) - paddingX / 2}
                          y={textY - (textHeight / 2) - paddingY / 2}
                          width={textWidth + paddingX}
                          height={textHeight + paddingY}
                          fill="rgba(0,0,0,0.75)"
                          cornerRadius={4 / transform.scale}
                        />
                        {/* Measurement Text */}
                        <Text
                          x={textX}
                          y={textY}
                          text={textContent}
                          fontSize={fontSize}
                          fill={style.fill}
                          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          fontStyle="bold"
                          offsetX={textWidth / 2}
                          offsetY={textHeight / 2}
                        />
                      </Group>
                    )
                  })}
                  {isDrawing && (
                    <Group listening={false}>
                      <Line
                        points={currentLinePoints}
                        stroke={COLOR_PALETTE.measurement.stroke}
                        strokeWidth={2 / transform.scale}
                        dash={[6 / transform.scale, 3 / transform.scale]}
                        lineCap="round"
                      />
                      <Circle
                        x={currentLinePoints[0]}
                        y={currentLinePoints[1]}
                        radius={4 / transform.scale}
                        fill={COLOR_PALETTE.measurement.stroke}
                      />
                      <Circle
                        x={currentLinePoints[2]}
                        y={currentLinePoints[3]}
                        radius={4 / transform.scale}
                        fill={COLOR_PALETTE.measurement.stroke}
                      />
                    </Group>
                  )}
                  {/* Drawn Rectangles */}
                  {drawnRectangles.map((rect, i) => (
                    <Group key={`rect-${i}`}>
                      <Line
                        points={[
                          rect.x, rect.y,
                          rect.x + rect.width, rect.y,
                          rect.x + rect.width, rect.y + rect.height,
                          rect.x, rect.y + rect.height,
                          rect.x, rect.y
                        ]}
                        {...applyShadowProps(COLOR_PALETTE.drawing, transform.scale)}
                      />
                    </Group>
                  ))}
                  {/* Current Rectangle (being drawn) */}
                  {currentRectangle && (
                    <Line
                      points={[
                        currentRectangle.x, currentRectangle.y,
                        currentRectangle.x + currentRectangle.width, currentRectangle.y,
                        currentRectangle.x + currentRectangle.width, currentRectangle.y + currentRectangle.height,
                        currentRectangle.x, currentRectangle.y + currentRectangle.height,
                        currentRectangle.x, currentRectangle.y
                      ]}
                      {...applyShadowProps(COLOR_PALETTE.drawing, transform.scale)}
                      dash={[4 / transform.scale, 4 / transform.scale]}
                    />
                  )}
                  {/* Drawn Points */}
                  {drawnPoints.map((point, i) => {
                    const style = COLOR_PALETTE.drawing;
                    return (
                      <Circle
                        key={`point-${i}`}
                        x={point.x}
                        y={point.y}
                        radius={8}
                        fill={style.fill}
                        stroke={style.stroke}
                        strokeWidth={style.strokeWidth}
                        shadowColor={style.shadowColor}
                        shadowBlur={style.shadowBlur}
                        shadowOpacity={0.9}
                        listening={false}
                      />
                    );
                  })}
                </>
              )}
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default RenderProblemDrw;