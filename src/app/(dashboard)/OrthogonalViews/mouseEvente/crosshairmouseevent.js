import { useState, useCallback, useRef } from 'react';
import { CoordinateUtils } from '../../../test/calculations';

/**
 * Enhanced CrosshairMouseEvents - معالجة محسنة لأحداث الماوس
 * يحل مشاكل التداخل والتعارض في أحداث الماوس مع فصل واضح بين النقر والسحب
 */
export const useCrosshairMouseEvents = (coreState) => {
  const {
    crosshair: crosshairPositions,
    canvasSizes,
    global,
    drawnSizes,
    zooms,
    pans,
    currentSlices,
    worldPosition,
    updatePosition,
    canvasToWorld,
    getViewParams
  } = coreState;

  // ===== CONSTANTS =====
  const DRAG_THRESHOLD = 5; // البكسل المطلوب للبدء في السحب
  const CLICK_THRESHOLD = 300; // الحد الأقصى للوقت للنقر (milliseconds)
  const CROSSHAIR_THRESHOLD = 20; // المسافة للتفاعل مع الكروسهير

  // ===== REFS لتجنب التداخل =====
  const mouseStateRef = useRef({
    isMouseDown: false,
    isDragging: false,
    hasMoved: false,
    dragStartTime: 0,
    downPosition: null,
    lastMousePos: null,
    activeView: null,
    pendingClick: false
  });

  // ===== CROSSHAIR INTERACTION STATE =====
  const [dragState, setDragState] = useState({
    isDragging: false,
    dragType: null, // 'horizontal' | 'vertical' | 'both' | 'move'
    viewType: null,
    startPos: null,
    startWorldPos: null
  });

  const [cursors, setCursors] = useState({
    axial: 'crosshair',
    coronal: 'crosshair',
    sagittal: 'crosshair'
  });

  // ===== UTILITY FUNCTIONS =====

  // حساب المسافة بين نقطتين
  const getDistance = useCallback((p1, p2) => {
    if (!p1 || !p2) return 0;
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  // تحديد نوع التفاعل مع خطوط الكروسهير
  const getCrosshairLineType = useCallback((viewType, canvasPos, threshold = CROSSHAIR_THRESHOLD) => {
    const crosshairPos = crosshairPositions[viewType];
    if (!crosshairPos || !canvasPos) return null;

    const distanceToVertical = Math.abs(canvasPos.x - crosshairPos.x);
    const distanceToHorizontal = Math.abs(canvasPos.y - crosshairPos.y);

    // التحقق من التقاطع (الوسط)
    if (distanceToVertical <= threshold && distanceToHorizontal <= threshold) {
      return 'intersection';
    }

    // التحقق من الخطوط الفردية
    if (distanceToVertical <= threshold) {
      return 'vertical';
    }
    if (distanceToHorizontal <= threshold) {
      return 'horizontal';
    }

    return null;
  }, [crosshairPositions]);

  // تحديد شكل المؤشر
  const getCursorForInteraction = useCallback((hoverType, isDragging = false) => {
    if (isDragging) return 'grabbing';

    switch (hoverType) {
      case 'horizontal': return 'ns-resize';
      case 'vertical': return 'ew-resize';
      case 'intersection': return 'move';
      default: return 'crosshair';
    }
  }, []);

  // تحديث المؤشر
  const updateCursor = useCallback((viewType, hoverType, isDragging = false) => {
    const newCursor = getCursorForInteraction(hoverType, isDragging);
    setCursors(prev => ({
      ...prev,
      [viewType]: newCursor
    }));
  }, [getCursorForInteraction]);

  // تنفيذ النقر المؤجل
  const executeClick = useCallback((viewType, canvasPos) => {
    const worldPoint = canvasToWorld(canvasPos, viewType);
    updatePosition(worldPoint);
  }, [canvasToWorld, updatePosition]);

  // بدء السحب
  const startDrag = useCallback((viewType, canvasPos, lineType) => {
    setDragState({
      isDragging: true,
      dragType: lineType === 'intersection' ? 'both' : lineType,
      viewType,
      startPos: canvasPos,
      startWorldPos: { ...worldPosition }
    });
    
    mouseStateRef.current.isDragging = true;
    updateCursor(viewType, lineType, true);
  }, [worldPosition, updateCursor]);

  // ===== MOUSE EVENT HANDLERS =====

  // بداية الضغط على الماوس
  const handleMouseDown = useCallback((viewType) => (e) => {
    // For Konva events, we need to handle them differently
    if (e.evt) {
      e.evt.preventDefault();
      e.evt.stopPropagation();
    }

    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    // تحديث حالة الماوس
    mouseStateRef.current = {
      isMouseDown: true,
      isDragging: false,
      hasMoved: false,
      dragStartTime: Date.now(),
      downPosition: { ...point },
      lastMousePos: { ...point },
      activeView: viewType,
      pendingClick: false
    };

    // التحقق من التفاعل مع الكروسهير
    const lineType = getCrosshairLineType(viewType, point);
    
    if (lineType) {
      // إذا كان على خط الكروسهير، نحتاج لانتظار الحركة لتحديد النية
      mouseStateRef.current.pendingClick = true;
    } else {
      // النقر العادي - تحريك الكروسهير فوراً
      executeClick(viewType, point);
    }
  }, [getCrosshairLineType, executeClick]);

  // حركة الماوس
  const handleMouseMove = useCallback((viewType) => (e) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    const mouseState = mouseStateRef.current;

    // إذا كان الماوس مضغوطاً
    if (mouseState.isMouseDown && mouseState.activeView === viewType) {
      const distanceMoved = getDistance(mouseState.downPosition, point);
      
      // التحقق من بدء السحب
      if (!mouseState.isDragging && !mouseState.hasMoved && distanceMoved > DRAG_THRESHOLD) {
        mouseState.hasMoved = true;
        
        // إذا كان هناك نقر مؤجل وتحرك الماوس، ابدأ السحب
        if (mouseState.pendingClick) {
          const lineType = getCrosshairLineType(viewType, mouseState.downPosition);
          if (lineType) {
            startDrag(viewType, mouseState.downPosition, lineType);
            mouseState.pendingClick = false;
          }
        }
      }

      // إذا كان هناك سحب فعلي
      if (mouseState.isDragging && dragState.isDragging) {
        const worldPoint = canvasToWorld(point, viewType);
        updatePosition(worldPoint);
      }
    } else {
      // إذا لم يكن الماوس مضغوطاً، تحديث المؤشر فقط
      const lineType = getCrosshairLineType(viewType, point);
      updateCursor(viewType, lineType, false);
    }

    mouseStateRef.current.lastMousePos = point;
  }, [dragState, getCrosshairLineType, canvasToWorld, updatePosition, updateCursor, getDistance, startDrag]);

  // إنهاء الضغط على الماوس
  const handleMouseUp = useCallback((e) => {
    const mouseState = mouseStateRef.current;
    const clickDuration = Date.now() - mouseState.dragStartTime;
    
    // التحقق من النقر المؤجل
    if (mouseState.pendingClick && !mouseState.hasMoved && clickDuration < CLICK_THRESHOLD) {
      // تنفيذ النقر
      if (mouseState.downPosition && mouseState.activeView) {
        executeClick(mouseState.activeView, mouseState.downPosition);
      }
    }

    // إعادة تعيين حالة الماوس
    mouseStateRef.current = {
      isMouseDown: false,
      isDragging: false,
      hasMoved: false,
      dragStartTime: 0,
      downPosition: null,
      lastMousePos: null,
      activeView: null,
      pendingClick: false
    };

    // إعادة تعيين حالة السحب
    if (dragState.isDragging) {
      const wasViewType = dragState.viewType;
      
      setDragState({
        isDragging: false,
        dragType: null,
        viewType: null,
        startPos: null,
        startWorldPos: null
      });

      // إعادة تعيين المؤشر
      if (wasViewType) {
        updateCursor(wasViewType, null, false);
      }
    }
  }, [dragState, updateCursor, executeClick]);

  // مغادرة الماوس للمنطقة
  const handleMouseLeave = useCallback((viewType) => (e) => {
    const mouseState = mouseStateRef.current;
    
    // إذا لم يكن هناك سحب، إعادة تعيين المؤشر
    if (!mouseState.isDragging) {
      updateCursor(viewType, null, false);
    }
    
    // إذا كان هناك نقر مؤجل، ألغِه
    if (mouseState.pendingClick) {
      mouseState.pendingClick = false;
    }
  }, [updateCursor]);

  // النقر المزدوج (للتأكد من التحريك السريع)
  const handleDoubleClick = useCallback((viewType) => (e) => {
    // For Konva events, handle them differently
    if (e.evt) {
      e.evt.preventDefault();
      e.evt.stopPropagation();
    }
    
    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    // تحريك الكروسهير إلى النقطة المنقورة فوراً
    executeClick(viewType, point);
  }, [executeClick]);

  // ===== LEGACY SUPPORT HANDLERS =====

  // معالج النقر القديم (للتوافق مع الكود القديم)
  const handleViewClick = useCallback((viewType) => (e) => {
    // لا نحتاج لتنفيذ شيء هنا لأن handleMouseDown/Up يتعامل مع كل شيء
  }, []);

  // معالج MouseDown القديم
  const handleViewMouseDown = useCallback((viewType) => handleMouseDown(viewType), [handleMouseDown]);

  // معالج إنهاء السحب
  const handleCrosshairDragEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // معالج حركة السحب
  const handleCrosshairDragMove = useCallback((canvasPos) => {
    if (!dragState.isDragging) return;

    try {
      const newWorldPosition = canvasToWorld(canvasPos, dragState.viewType);
      updatePosition(newWorldPosition);
    } catch (error) {
      console.error('Error handling crosshair drag move:', error);
    }
  }, [dragState, canvasToWorld, updatePosition]);

  // ===== ENHANCED STAGE PROPS =====

  // إنشاء props محسنة للـ Stage
  const getStageProps = useCallback((viewType) => ({
    onMouseDown: handleMouseDown(viewType),
    onMouseMove: handleMouseMove(viewType),
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave(viewType),
    onDblClick: handleDoubleClick(viewType),
    style: { 
      background: "black", 
      cursor: cursors[viewType] || 'crosshair' 
    }
  }), [
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp, 
    handleMouseLeave, 
    handleDoubleClick, 
    cursors
  ]);

  // ===== RETURN OBJECT =====
  return {
    // الحالة الحالية
    dragState,
    cursors,
    
    // المعالجات المحسنة
    getStageProps,
    
    // المعالجات للتوافق مع الكود القديم
    handleViewClick,
    handleViewMouseDown,
    handleCrosshairDragEnd,
    handleCrosshairDragMove,
    handleMouseLeave,
    
    // المساعدات
    getCrosshairLineType,
    getCursorForInteraction,
    updateCursor,
    executeClick,
    
    // معلومات الحالة
    isMouseDown: () => mouseStateRef.current.isMouseDown,
    isDragging: () => mouseStateRef.current.isDragging,
    hasMoved: () => mouseStateRef.current.hasMoved,
    getActiveView: () => mouseStateRef.current.activeView,
    
    // إعدادات قابلة للتخصيص
    DRAG_THRESHOLD,
    CLICK_THRESHOLD,
    CROSSHAIR_THRESHOLD
  };
};