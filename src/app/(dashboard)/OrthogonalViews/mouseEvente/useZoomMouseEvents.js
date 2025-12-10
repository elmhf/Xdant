import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CoordinateUtils, ImageCalculations } from '../utils/calculations';

/**
 * Enhanced ZoomMouseEvents - معالجة محسنة لأحداث الماوس للتكبير/التصغير والتحريك
 * يحتوي على معالجة العجلة والسحب للتحريك (Pan) مع دعم التكبير المركز
 * تم إضافة تحسينات شاملة لـ mouse events والتحريك
 * مع دعم touch events للأجهزة اللوحية
 */
export const useZoomMouseEvents = (coreState) => {
  const {
    canvasSizes,
    zooms,
    setZooms,
    pans,
    setPans,
    global,
    currentSlices,
    worldPosition,
    setWorldPosition
  } = coreState;

  // ===== CONSTANTS =====
  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 10;
  const WHEEL_ZOOM_STEP = 0.05;
  const DRAG_THRESHOLD = 5;
  const PAN_SENSITIVITY = 1;
  const DOUBLE_CLICK_THRESHOLD = 300; // مللي ثانية
  const MOMENTUM_DECAY = 0.95; // تباطؤ الزخم
  const MOMENTUM_THRESHOLD = 0.1; // حد أدنى للزخم
  const SMOOTH_ZOOM_STEPS = 5; // خطوات التكبير السلس
  const TOUCH_ZOOM_SENSITIVITY = 0.01; // حساسية التكبير باللمس

  // ===== REFS =====
  const mouseStateRef = useRef({
    isMouseDown: false,
    isDragging: false,
    hasMoved: false,
    downPosition: null,
    lastMousePos: null,
    activeView: null,
    dragStartTime: 0,
    initialPan: null,
    velocity: { x: 0, y: 0 },
    lastMoveTime: 0,
    clickCount: 0,
    lastClickTime: 0,
    panHistory: [], // تاريخ الحركة للزخم
    isRightClick: false,
    isPinching: false,
    initialPinchDistance: 0,
    initialPinchZoom: 1,
    touchStartTime: 0
  });

  const animationRef = useRef(null);
  const momentumRef = useRef(null);

  // ===== STATE =====
  const [zoomState, setZoomState] = useState({
    isZooming: false,
    zoomCenter: null,
    viewType: null,
    isSmoothZooming: false
  });

  const [panState, setPanState] = useState({
    isAnimating: false,
    hasMomentum: false,
    smoothTransition: false
  });

  const [cursors, setCursors] = useState({
    axial: 'grab',
    coronal: 'grab',
    sagittal: 'grab'
  });

  // ===== ENHANCED UTILITY FUNCTIONS =====

  // حساب الأبعاد المرسومة للصورة
  const getImageDrawnSize = useCallback((viewType) => {
    const canvasSize = canvasSizes[viewType];
    if (!canvasSize || !global?.volumeSize) {
      return { width: 400, height: 400 };
    }

    const { imageWidth, imageHeight } = ImageCalculations.calculateImageDimensions(
      viewType,
      canvasSize.width,
      canvasSize.height,
      global.volumeSize
    );

    return { width: imageWidth, height: imageHeight };
  }, [canvasSizes, global]);

  // الحصول على معاملات العرض
  const getViewParams = useCallback((viewType) => {
    const imageDrawnSize = getImageDrawnSize(viewType);
    return CoordinateUtils.getViewParams(viewType, global, imageDrawnSize, canvasSizes);
  }, [global, canvasSizes, getImageDrawnSize]);

  // تحويل من إحداثيات الكانفاس إلى العالم
  const canvasToWorld = useCallback((canvasPoint, viewType) => {
    const params = getViewParams(viewType);
    const zoom = zooms[viewType];
    const pan = pans[viewType];

    return CoordinateUtils.canvasToWorld(
      canvasPoint,
      params,
      zoom,
      pan,
      viewType,
      global,
      currentSlices
    );
  }, [getViewParams, zooms, pans, global, currentSlices]);

  // تحويل من إحداثيات العالم إلى الكانفاس
  const worldToCanvas = useCallback((worldPoint, viewType) => {
    const params = getViewParams(viewType);
    const zoom = zooms[viewType];
    const pan = pans[viewType];

    return CoordinateUtils.worldToCanvas(worldPoint, params, zoom, pan, viewType);
  }, [getViewParams, zooms, pans]);

  // حساب المسافة بين نقطتين
  const getDistance = useCallback((p1, p2) => {
    if (!p1 || !p2) return 0;
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  // حساب السرعة
  const calculateVelocity = useCallback((currentPos, lastPos, deltaTime) => {
    if (!currentPos || !lastPos || deltaTime === 0) return { x: 0, y: 0 };

    return {
      x: (currentPos.x - lastPos.x) / deltaTime,
      y: (currentPos.y - lastPos.y) / deltaTime
    };
  }, []);

  // تقييد قيمة الزوم
  const clampZoom = useCallback((zoom) => {
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  }, []);

  // تحديث المؤشر بناءً على الحالة
  const updateCursor = useCallback((viewType, state = 'grab') => {
    const cursorMap = {
      'grab': 'grab',
      'grabbing': 'grabbing',
      'zooming': 'zoom-in',
      'panning': 'move',
      'crosshair': 'crosshair'
    };

    const newCursor = cursorMap[state] || 'grab';
    setCursors(prev => ({
      ...prev,
      [viewType]: newCursor
    }));
  }, []);

  // الحصول على نقطة مركز الكانفاس
  const getCanvasCenter = useCallback((viewType) => {
    const canvasSize = canvasSizes[viewType];
    if (!canvasSize) return { x: 0, y: 0 };

    return {
      x: canvasSize.width / 2,
      y: canvasSize.height / 2
    };
  }, [canvasSizes]);

  // حساب مركز الصورة الحالي
  const getImageCenter = useCallback((viewType) => {
    const canvas = canvasSizes[viewType];
    if (!canvas || !global?.volumeSize) return getCanvasCenter(viewType);

    const { imageWidth, imageHeight, imageX, imageY } = ImageCalculations.calculateImageDimensions(
      viewType,
      canvas.width,
      canvas.height,
      global.volumeSize,
      zooms[viewType],
      pans[viewType]
    );

    return {
      x: imageX + imageWidth / 2,
      y: imageY + imageHeight / 2
    };
  }, [canvasSizes, global, zooms, pans, getCanvasCenter]);

  // ===== ENHANCED ZOOM FUNCTIONS =====

  // التكبير السلس
  const smoothZoom = useCallback((viewType, targetZoom, focusPoint, steps = SMOOTH_ZOOM_STEPS) => {
    const currentZoom = zooms[viewType];
    const zoomDiff = targetZoom - currentZoom;
    const zoomStep = zoomDiff / steps;

    setZoomState(prev => ({ ...prev, isSmoothZooming: true }));

    let currentStep = 0;
    const animate = () => {
      if (currentStep >= steps) {
        setZoomState(prev => ({ ...prev, isSmoothZooming: false }));
        return;
      }

      const newZoom = currentZoom + (zoomStep * currentStep);
      updateZoomWithFocus(viewType, newZoom, focusPoint);
      currentStep++;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [zooms]);

  // تحديث الزوم مع الحفاظ على نقطة التركيز (محسن)
  const updateZoomWithFocus = useCallback((viewType, newZoom, focusPoint = null) => {
    const clampedZoom = clampZoom(newZoom);
    const currentZoom = zooms[viewType];
    const currentPan = pans[viewType];

    if (clampedZoom === currentZoom) return;

    if (!focusPoint) {
      focusPoint = getCanvasCenter(viewType);
    }

    const worldFocus = canvasToWorld(focusPoint, viewType);

    setZooms(prev => ({ ...prev, [viewType]: clampedZoom }));

    // تحديث الإزاحة للحفاظ على نقطة التركيز
    const updatePanForZoom = () => {
      const newCanvasPosition = worldToCanvas(worldFocus, viewType);
      const deltaX = focusPoint.x - newCanvasPosition.x;
      const deltaY = focusPoint.y - newCanvasPosition.y;

      setPans(prev => ({
        ...prev,
        [viewType]: {
          x: currentPan.x + deltaX,
          y: currentPan.y + deltaY
        }
      }));
    };

    // استخدام setTimeout لضمان التحديث بعد تحديث الزوم
    setTimeout(updatePanForZoom, 0);
  }, [zooms, pans, clampZoom, getCanvasCenter, setZooms, setPans, canvasToWorld, worldToCanvas]);

  // ===== ENHANCED PAN FUNCTIONS =====

  // تحديث الإزاحة مع التحقق من الحدود
  const updatePan = useCallback((viewType, deltaX, deltaY, smooth = false) => {
    if (smooth) {
      setPanState(prev => ({ ...prev, smoothTransition: true }));
      setTimeout(() => setPanState(prev => ({ ...prev, smoothTransition: false })), 300);
    }

    setPans(prev => {
      const newPan = {
        x: prev[viewType].x + deltaX,
        y: prev[viewType].y + deltaY
      };

      // يمكن إضافة تحديد الحدود هنا إذا لزم الأمر
      // const bounds = calculatePanBounds(viewType);
      // newPan.x = Math.max(bounds.minX, Math.min(bounds.maxX, newPan.x));
      // newPan.y = Math.max(bounds.minY, Math.min(bounds.maxY, newPan.y));

      return {
        ...prev,
        [viewType]: newPan
      };
    });
  }, [setPans]);

  // تطبيق الزخم للتحريك
  const applyMomentum = useCallback((viewType, velocity) => {
    if (Math.abs(velocity.x) < MOMENTUM_THRESHOLD && Math.abs(velocity.y) < MOMENTUM_THRESHOLD) {
      setPanState(prev => ({ ...prev, hasMomentum: false }));
      return;
    }

    setPanState(prev => ({ ...prev, hasMomentum: true }));

    const animate = () => {
      velocity.x *= MOMENTUM_DECAY;
      velocity.y *= MOMENTUM_DECAY;

      if (Math.abs(velocity.x) < MOMENTUM_THRESHOLD && Math.abs(velocity.y) < MOMENTUM_THRESHOLD) {
        setPanState(prev => ({ ...prev, hasMomentum: false }));
        return;
      }

      updatePan(viewType, velocity.x, velocity.y);
      momentumRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [updatePan]);

  // إيقاف الزخم
  const stopMomentum = useCallback(() => {
    if (momentumRef.current) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
    setPanState(prev => ({ ...prev, hasMomentum: false }));
  }, []);

  // ===== ENHANCED MOUSE EVENT HANDLERS =====

  // معالج عجلة الماوس المحسن
  const handleWheel = useCallback((viewType) => (e) => {
    // Konva event
    if (e && e.evt && typeof e.evt.preventDefault === 'function') {
      e.evt.preventDefault();
      if (typeof e.evt.stopPropagation === 'function') e.evt.stopPropagation();
    }
    // DOM event
    else if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    // إذا لم يوجد preventDefault، تجاهل ولا تعمل شيء

    // إيقاف الزخم عند التكبير
    stopMomentum();

    let point = null;

    if (e.evt) {
      const stage = e.target.getStage();
      if (stage) {
        point = stage.getPointerPosition();
      }
    } else {
      const rect = e.target.getBoundingClientRect();
      point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    if (!point) {
      point = getCanvasCenter(viewType);
    }

    const deltaY = e.deltaY || e.evt?.deltaY || 0;
    const zoomDirection = deltaY > 0 ? -1 : 1;
    const currentZoom = zooms[viewType];
    const newZoom = currentZoom + (zoomDirection * WHEEL_ZOOM_STEP);

    updateZoomWithFocus(viewType, newZoom, point);
    updateCursor(viewType, 'zooming');

    // إعادة تعيين المؤشر بعد فترة
    setTimeout(() => updateCursor(viewType, 'grab'), 100);

    if (setWorldPosition) {
      const worldPoint = canvasToWorld(point, viewType);
      if (worldPoint) {
        setWorldPosition(worldPoint);
      }
    }
  }, [zooms, updateZoomWithFocus, getCanvasCenter, canvasToWorld, setWorldPosition, updateCursor, stopMomentum]);

  // معالج بداية الضغط المحسن
  const handleMouseDown = useCallback((viewType) => (e) => {
    if (e.evt) {
      if (typeof e.evt.preventDefault === 'function') e.evt.preventDefault();
      if (typeof e.evt.stopPropagation === 'function') e.evt.stopPropagation();
    }

    // إيقاف الزخم
    stopMomentum();

    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    const currentTime = Date.now();
    const isRightClick = e.evt?.button === 2;

    // تحديث حالة الماوس
    mouseStateRef.current = {
      ...mouseStateRef.current,
      isMouseDown: true,
      isDragging: false,
      hasMoved: false,
      downPosition: { ...point },
      lastMousePos: { ...point },
      activeView: viewType,
      dragStartTime: currentTime,
      initialPan: { ...pans[viewType] },
      velocity: { x: 0, y: 0 },
      lastMoveTime: currentTime,
      panHistory: [{ pos: point, time: currentTime }],
      isRightClick
    };

    updateCursor(viewType, 'grab');
  }, [pans, updateCursor, stopMomentum]);

  // معالج حركة الماوس المحسن
  const handleMouseMove = useCallback((viewType) => (e) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    const mouseState = mouseStateRef.current;
    const currentTime = Date.now();

    if (mouseState.isMouseDown && mouseState.activeView === viewType) {
      const distanceMoved = getDistance(mouseState.downPosition, point);

      // بدء السحب
      if (!mouseState.isDragging && distanceMoved > DRAG_THRESHOLD) {
        mouseState.isDragging = true;
        mouseState.hasMoved = true;
        updateCursor(viewType, 'grabbing');
      }

      // تنفيذ السحب
      if (mouseState.isDragging && mouseState.lastMousePos) {
        const deltaTime = currentTime - mouseState.lastMoveTime;
        const deltaX = (point.x - mouseState.lastMousePos.x) * PAN_SENSITIVITY;
        const deltaY = (point.y - mouseState.lastMousePos.y) * PAN_SENSITIVITY;

        // حساب السرعة
        mouseState.velocity = calculateVelocity(point, mouseState.lastMousePos, deltaTime);

        // تحديث تاريخ الحركة للزخم
        mouseState.panHistory.push({ pos: point, time: currentTime });
        if (mouseState.panHistory.length > 5) {
          mouseState.panHistory.shift();
        }

        updatePan(viewType, deltaX, deltaY);
        mouseState.lastMoveTime = currentTime;
      }
    }

    // تحديث موضع العالم
    if (setWorldPosition) {
      const worldPoint = canvasToWorld(point, viewType);
      if (worldPoint) {
        setWorldPosition(worldPoint);
      }
    }

    mouseState.lastMousePos = point;
  }, [getDistance, updatePan, updateCursor, canvasToWorld, setWorldPosition, calculateVelocity]);

  // معالج إنهاء الضغط المحسن
  const handleMouseUp = useCallback((e) => {
    const mouseState = mouseStateRef.current;
    const wasViewType = mouseState.activeView;
    const wasDragging = mouseState.isDragging;

    // تطبيق الزخم إذا كان هناك سحب
    if (wasDragging && wasViewType && mouseState.panHistory.length > 1) {
      const recentHistory = mouseState.panHistory.slice(-3);
      const avgVelocity = recentHistory.reduce((acc, curr, idx) => {
        if (idx === 0) return acc;
        const prev = recentHistory[idx - 1];
        const deltaTime = curr.time - prev.time;
        const vel = calculateVelocity(curr.pos, prev.pos, deltaTime);
        return {
          x: acc.x + vel.x,
          y: acc.y + vel.y
        };
      }, { x: 0, y: 0 });

      avgVelocity.x /= (recentHistory.length - 1);
      avgVelocity.y /= (recentHistory.length - 1);

      // تطبيق الزخم إذا كانت السرعة كافية
      if (Math.abs(avgVelocity.x) > MOMENTUM_THRESHOLD || Math.abs(avgVelocity.y) > MOMENTUM_THRESHOLD) {
        applyMomentum(wasViewType, avgVelocity);
      }
    }

    // إعادة تعيين حالة الماوس
    mouseStateRef.current = {
      ...mouseStateRef.current,
      isMouseDown: false,
      isDragging: false,
      hasMoved: false,
      downPosition: null,
      lastMousePos: null,
      activeView: null,
      dragStartTime: 0,
      initialPan: null,
      velocity: { x: 0, y: 0 },
      panHistory: [],
      isRightClick: false
    };

    if (wasViewType) {
      updateCursor(wasViewType, 'grab');
    }
  }, [updateCursor, calculateVelocity, applyMomentum]);

  // معالج مغادرة الماوس المحسن
  const handleMouseLeave = useCallback((viewType) => (e) => {
    const mouseState = mouseStateRef.current;

    if (mouseState.isDragging) {
      // تطبيق الزخم عند المغادرة
      if (mouseState.panHistory.length > 1) {
        const lastTwo = mouseState.panHistory.slice(-2);
        const deltaTime = lastTwo[1].time - lastTwo[0].time;
        const velocity = calculateVelocity(lastTwo[1].pos, lastTwo[0].pos, deltaTime);
        applyMomentum(viewType, velocity);
      }

      mouseState.isDragging = false;
      mouseState.isMouseDown = false;
      updateCursor(viewType, 'grab');
    }
  }, [updateCursor, calculateVelocity, applyMomentum]);

  // معالج النقر المزدوج المحسن
  const handleDoubleClick = useCallback((viewType) => (e) => {
    if (e.evt) {
      if (typeof e.evt.preventDefault === 'function') e.evt.preventDefault();
      if (typeof e.evt.stopPropagation === 'function') e.evt.stopPropagation();
    }

    stopMomentum();

    const currentTime = Date.now();
    const mouseState = mouseStateRef.current;

    // تحديث عداد النقرات
    if (currentTime - mouseState.lastClickTime < DOUBLE_CLICK_THRESHOLD) {
      mouseState.clickCount += 1;
    } else {
      mouseState.clickCount = 1;
    }

    mouseState.lastClickTime = currentTime;

    // إعادة تعيين الزوم في النقر المزدوج
    if (mouseState.clickCount === 2) {
      resetZoom(viewType);
      mouseState.clickCount = 0;
    }
  }, [stopMomentum]);

  // معالج النقر العادي المحسن
  const handleClick = useCallback((viewType) => (e) => {
    const mouseState = mouseStateRef.current;

    if (mouseState.hasMoved) return;

    let point = null;

    if (e.evt) {
      const stage = e.target.getStage();
      if (stage) {
        point = stage.getPointerPosition();
      }
    }

    if (point && setWorldPosition) {
      const worldPoint = canvasToWorld(point, viewType);
      if (worldPoint) {
        setWorldPosition(worldPoint);
      }
    }
  }, [canvasToWorld, setWorldPosition]);

  // ===== TOUCH EVENTS للأجهزة اللوحية =====

  const handleTouchStart = useCallback((viewType) => (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const touches = e.touches || e.evt?.touches;
    if (!touches) return;

    const stage = e.target.getStage();
    if (!stage) return;

    stopMomentum();

    if (touches.length === 1) {
      // لمسة واحدة - تحريك
      const touch = touches[0];
      const point = { x: touch.clientX, y: touch.clientY };

      mouseStateRef.current = {
        ...mouseStateRef.current,
        isMouseDown: true,
        isDragging: false,
        hasMoved: false,
        downPosition: point,
        lastMousePos: point,
        activeView: viewType,
        touchStartTime: Date.now(),
        panHistory: [{ pos: point, time: Date.now() }]
      };
    } else if (touches.length === 2) {
      // لمستان - تكبير
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = getDistance(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      );

      mouseStateRef.current = {
        ...mouseStateRef.current,
        isPinching: true,
        initialPinchDistance: distance,
        initialPinchZoom: zooms[viewType]
      };
    }
  }, [stopMomentum, getDistance, zooms]);

  const handleTouchMove = useCallback((viewType) => (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const touches = e.touches || e.evt?.touches;
    if (!touches) return;

    const mouseState = mouseStateRef.current;

    if (touches.length === 1 && mouseState.isMouseDown) {
      // تحريك بلمسة واحدة
      const touch = touches[0];
      const point = { x: touch.clientX, y: touch.clientY };

      const distanceMoved = getDistance(mouseState.downPosition, point);

      if (!mouseState.isDragging && distanceMoved > DRAG_THRESHOLD) {
        mouseState.isDragging = true;
        mouseState.hasMoved = true;
      }

      if (mouseState.isDragging && mouseState.lastMousePos) {
        const deltaX = (point.x - mouseState.lastMousePos.x) * PAN_SENSITIVITY;
        const deltaY = (point.y - mouseState.lastMousePos.y) * PAN_SENSITIVITY;

        updatePan(viewType, deltaX, deltaY);

        mouseState.panHistory.push({ pos: point, time: Date.now() });
        if (mouseState.panHistory.length > 5) {
          mouseState.panHistory.shift();
        }
      }

      mouseState.lastMousePos = point;
    } else if (touches.length === 2 && mouseState.isPinching) {
      // تكبير بلمستين
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = getDistance(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      );

      const scale = distance / mouseState.initialPinchDistance;
      const newZoom = mouseState.initialPinchZoom * scale;

      // نقطة التركيز بين اللمستين
      const centerPoint = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };

      updateZoomWithFocus(viewType, newZoom, centerPoint);
    }
  }, [getDistance, updatePan, updateZoomWithFocus]);

  const handleTouchEnd = useCallback((viewType) => (e) => {
    const mouseState = mouseStateRef.current;

    if (mouseState.isDragging && mouseState.panHistory.length > 1) {
      // تطبيق الزخم
      const recentHistory = mouseState.panHistory.slice(-3);
      const avgVelocity = recentHistory.reduce((acc, curr, idx) => {
        if (idx === 0) return acc;
        const prev = recentHistory[idx - 1];
        const deltaTime = curr.time - prev.time;
        const vel = calculateVelocity(curr.pos, prev.pos, deltaTime);
        return {
          x: acc.x + vel.x,
          y: acc.y + vel.y
        };
      }, { x: 0, y: 0 });

      avgVelocity.x /= (recentHistory.length - 1);
      avgVelocity.y /= (recentHistory.length - 1);

      if (Math.abs(avgVelocity.x) > MOMENTUM_THRESHOLD || Math.abs(avgVelocity.y) > MOMENTUM_THRESHOLD) {
        applyMomentum(viewType, avgVelocity);
      }
    }

    // إعادة تعيين الحالة
    mouseStateRef.current = {
      ...mouseStateRef.current,
      isMouseDown: false,
      isDragging: false,
      hasMoved: false,
      isPinching: false,
      panHistory: []
    };
  }, [calculateVelocity, applyMomentum]);

  // ===== BASIC ZOOM FUNCTIONS =====

  const zoomIn = useCallback((viewType, focusPoint = null) => {
    const currentZoom = zooms[viewType];
    const newZoom = currentZoom + ZOOM_STEP;
    const centerPoint = focusPoint || getImageCenter(viewType);
    updateZoomWithFocus(viewType, newZoom, centerPoint);
  }, [zooms, updateZoomWithFocus, getImageCenter]);

  const zoomOut = useCallback((viewType, focusPoint = null) => {
    const currentZoom = zooms[viewType];
    const newZoom = currentZoom - ZOOM_STEP;
    const centerPoint = focusPoint || getImageCenter(viewType);
    updateZoomWithFocus(viewType, newZoom, centerPoint);
  }, [zooms, updateZoomWithFocus, getImageCenter]);

  const resetZoom = useCallback((viewType) => {
    stopMomentum();
    setZooms(prev => ({ ...prev, [viewType]: 1 }));
    setPans(prev => ({ ...prev, [viewType]: { x: 0, y: 0 } }));
  }, [setZooms, setPans, stopMomentum]);

  // ===== KEYBOARD SHORTCUTS =====

  const handleKeyDown = useCallback((viewType) => (e) => {
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoomIn(viewType);
    } else if (e.key === '-') {
      e.preventDefault();
      zoomOut(viewType);
    } else if (e.key === '0') {
      e.preventDefault();
      resetZoom(viewType);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      updatePan(viewType, 0, -10);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      updatePan(viewType, 0, 10);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      updatePan(viewType, -10, 0);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      updatePan(viewType, 10, 0);
    }
  }, [zoomIn, zoomOut, resetZoom, updatePan]);

  // ===== CONTEXT MENU =====

  const handleContextMenu = useCallback((viewType) => (e) => {
    e.preventDefault();
    // يمكن إضافة قائمة سياق مخصصة هنا
  }, []);

  // ===== ENHANCED STAGE PROPS =====

  const getStageProps = useCallback((viewType) => ({
    onWheel: handleWheel(viewType),
    onMouseDown: handleMouseDown(viewType),
    onMouseMove: handleMouseMove(viewType),
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave(viewType),
    onDblClick: handleDoubleClick(viewType),
    onClick: handleClick(viewType),
    onKeyDown: handleKeyDown(viewType),
    onContextMenu: handleContextMenu(viewType),
    onTouchStart: handleTouchStart(viewType),
    onTouchMove: handleTouchMove(viewType),
    onTouchEnd: handleTouchEnd(viewType),
    tabIndex: 0,
    style: {
      background: "[#0d0c22]",
      cursor: cursors[viewType],
      outline: 'none',
      touchAction: 'none', // منع التمرير الافتراضي في اللمس
      userSelect: 'none' // منع تحديد النص
    }
  }), [
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleDoubleClick,
    handleClick,
    handleKeyDown,
    handleContextMenu,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    cursors
  ]);

  // ===== ZOOM CONTROLS =====

  const getZoomControls = useCallback((viewType) => ({
    zoomIn: () => zoomIn(viewType),
    zoomOut: () => zoomOut(viewType),
    resetZoom: () => resetZoom(viewType),
    currentZoom: zooms[viewType],
    canZoomIn: zooms[viewType] < MAX_ZOOM,
    canZoomOut: zooms[viewType] > MIN_ZOOM,
    zoomPercentage: Math.round(zooms[viewType] * 100),
    smoothZoom: (targetZoom, focusPoint) => smoothZoom(viewType, targetZoom, focusPoint)
  }), [zoomIn, zoomOut, resetZoom, zooms, smoothZoom]);

  // ===== PAN CONTROLS =====

  const getPanControls = useCallback((viewType) => ({
    panUp: () => updatePan(viewType, 0, -20),
    panDown: () => updatePan(viewType, 0, 20),
    panLeft: () => updatePan(viewType, -20, 0),
    panRight: () => updatePan(viewType, 20, 0),
    centerPan: () => setPans(prev => ({ ...prev, [viewType]: { x: 0, y: 0 } })),
    currentPan: pans[viewType],
    isAnimating: panState.isAnimating,
    hasMomentum: panState.hasMomentum,
    stopMomentum: () => stopMomentum()
  }), [updatePan, pans, panState, stopMomentum, setPans]);

  // ===== INITIALIZATION =====

  const initializePans = useCallback(() => {
    const viewTypes = ['axial', 'coronal', 'sagittal'];
    viewTypes.forEach(viewType => {
      if (!pans[viewType] || (pans[viewType].x === undefined && pans[viewType].y === undefined)) {
        setPans(prev => ({
          ...prev,
          [viewType]: { x: 0, y: 0 }
        }));
      }
    });
  }, [pans, setPans]);

  // ===== CLEANUP =====

  useEffect(() => {
    return () => {
      // تنظيف الـ animations عند إلغاء التحميل
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (momentumRef.current) {
        cancelAnimationFrame(momentumRef.current);
      }
    };
  }, []);

  // تهيئة الـ pans
  useEffect(() => {
    initializePans();
  }, [initializePans]);

  // ===== DEBUGGING HELPERS =====

  const getDebugInfo = useCallback(() => ({
    mouseState: mouseStateRef.current,
    zoomState,
    panState,
    cursors,
    zooms,
    pans
  }), [zoomState, panState, cursors, zooms, pans]);

  // ===== ADVANCED FEATURES =====

  // حساب حدود الإزاحة (Pan Bounds)
  const calculatePanBounds = useCallback((viewType) => {
    const canvas = canvasSizes[viewType];
    const imageSize = getImageDrawnSize(viewType);
    const zoom = zooms[viewType];

    if (!canvas || !imageSize) return null;

    const scaledImageWidth = imageSize.width * zoom;
    const scaledImageHeight = imageSize.height * zoom;

    const maxPanX = Math.max(0, (scaledImageWidth - canvas.width) / 2);
    const maxPanY = Math.max(0, (scaledImageHeight - canvas.height) / 2);

    return {
      minX: -maxPanX,
      maxX: maxPanX,
      minY: -maxPanY,
      maxY: maxPanY
    };
  }, [canvasSizes, getImageDrawnSize, zooms]);

  // تطبيق حدود الإزاحة
  const applyPanBounds = useCallback((viewType) => {
    const bounds = calculatePanBounds(viewType);
    if (!bounds) return;

    const currentPan = pans[viewType];
    const clampedPan = {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, currentPan.x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, currentPan.y))
    };

    if (clampedPan.x !== currentPan.x || clampedPan.y !== currentPan.y) {
      setPans(prev => ({
        ...prev,
        [viewType]: clampedPan
      }));
    }
  }, [calculatePanBounds, pans, setPans]);

  // تكبير إلى منطقة محددة
  const zoomToRect = useCallback((viewType, rect) => {
    const canvas = canvasSizes[viewType];
    if (!canvas || !rect) return;

    const zoomX = canvas.width / rect.width;
    const zoomY = canvas.height / rect.height;
    const targetZoom = Math.min(zoomX, zoomY) * 0.9; // هامش 10%

    const centerPoint = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };

    smoothZoom(viewType, targetZoom, centerPoint);
  }, [canvasSizes, smoothZoom]);

  // تكبير لملائمة الصورة
  const fitToView = useCallback((viewType) => {
    const canvas = canvasSizes[viewType];
    const imageSize = getImageDrawnSize(viewType);

    if (!canvas || !imageSize) return;

    const zoomX = canvas.width / imageSize.width;
    const zoomY = canvas.height / imageSize.height;
    const targetZoom = Math.min(zoomX, zoomY) * 0.95; // هامش 5%

    const centerPoint = getCanvasCenter(viewType);

    smoothZoom(viewType, targetZoom, centerPoint);
    setPans(prev => ({ ...prev, [viewType]: { x: 0, y: 0 } }));
  }, [canvasSizes, getImageDrawnSize, getCanvasCenter, smoothZoom, setPans]);

  // ===== RETURN OBJECT =====
  return {
    // الحالة الحالية
    zoomState,
    panState,
    currentZooms: zooms,
    currentPans: pans,
    cursors,

    // المعالجات المحسنة
    getStageProps,

    // وظائف التكبير/التصغير
    zoomIn,
    zoomOut,
    resetZoom,
    updateZoomWithFocus,
    smoothZoom,

    // وظائف التحريك
    updatePan,
    applyMomentum,
    stopMomentum,

    // المعالجات الأساسية
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleDoubleClick,
    handleClick,
    handleKeyDown,
    handleContextMenu,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // أدوات التحكم
    getZoomControls,
    getPanControls,

    // معلومات الحالة
    isMouseDown: () => mouseStateRef.current.isMouseDown,
    isDragging: () => mouseStateRef.current.isDragging,
    hasMoved: () => mouseStateRef.current.hasMoved,
    getActiveView: () => mouseStateRef.current.activeView,
    isPinching: () => mouseStateRef.current.isPinching,

    // وظائف الإحداثيات
    canvasToWorld,
    worldToCanvas,
    getViewParams,
    getImageDrawnSize,
    getCanvasCenter,
    getImageCenter,

    // وظائف متقدمة
    calculatePanBounds,
    applyPanBounds,
    zoomToRect,
    fitToView,

    // التهيئة والتنظيف
    initializePans,
    getDebugInfo,

    // الإعدادات القابلة للتخصيص
    ZOOM_STEP,
    MIN_ZOOM,
    MAX_ZOOM,
    WHEEL_ZOOM_STEP,
    DRAG_THRESHOLD,
    PAN_SENSITIVITY,
    DOUBLE_CLICK_THRESHOLD,
    MOMENTUM_DECAY,
    MOMENTUM_THRESHOLD,
    SMOOTH_ZOOM_STEPS,
    TOUCH_ZOOM_SENSITIVITY
  };
};