import { useState, useCallback, useRef } from 'react';

export const useCrosshairMouseEvents = (coreState) => {
  const {
    crosshair: crosshairPositions,
    canvasToWorld,
    updatePosition,
    worldPosition
  } = coreState;

  // ===== REFS =====
  const mouseStateRef = useRef({
    isMouseDown: false,
    isDragging: false,
    downPosition: null,
    activeView: null
  });

  // ===== CROSSHAIR DRAG STATE =====
  const [dragState, setDragState] = useState({
    isDragging: false,
    viewType: null,
    startPos: null,
    startWorldPos: null
  });

  const [cursors, setCursors] = useState({
    axial: 'crosshair',
    coronal: 'crosshair',
    sagittal: 'crosshair'
  });

  // ===== HELPERS =====

  const getCrosshairIntersection = useCallback((viewType, canvasPos, threshold = 20) => {
    const crosshairPos = crosshairPositions[viewType];
    if (!crosshairPos || !canvasPos) return false;

    const distanceToVertical = Math.abs(canvasPos.x - crosshairPos.x);
    const distanceToHorizontal = Math.abs(canvasPos.y - crosshairPos.y);

    return distanceToVertical <= threshold && distanceToHorizontal <= threshold;
  }, [crosshairPositions]);

  const updateCursor = useCallback((viewType, isIntersection, isDragging = false) => {
    let newCursor = 'crosshair';
    if (isDragging) newCursor = 'grabbing';
    else if (isIntersection) newCursor = 'move';

    setCursors(prev => ({ ...prev, [viewType]: newCursor }));
  }, []);

  // ===== MOUSE EVENTS =====

  const handleMouseDown = useCallback((viewType) => (e) => {
    if (e.evt) {
      e.evt.preventDefault();
      e.evt.stopPropagation();
    }

    const stage = e.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;

    const isIntersection = getCrosshairIntersection(viewType, point);
    if (!isIntersection) return; // مسموح فقط من المركز

    // بداية السحب مباشرة
    mouseStateRef.current = {
      isMouseDown: true,
      isDragging: true,
      downPosition: { ...point },
      activeView: viewType
    };

    setDragState({
      isDragging: true,
      viewType,
      startPos: point,
      startWorldPos: { ...worldPosition }
    });

    updateCursor(viewType, true, true);
  }, [getCrosshairIntersection, worldPosition, updateCursor]);

  const handleMouseMove = useCallback((viewType) => (e) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;

    const mouseState = mouseStateRef.current;

    if (mouseState.isDragging && mouseState.activeView === viewType) {
      const worldPoint = canvasToWorld(point, viewType);
      updatePosition(worldPoint);
    } else {
      // فقط غير المؤشر عند المرور على المركز
      const isIntersection = getCrosshairIntersection(viewType, point);
      updateCursor(viewType, isIntersection, false);
    }
  }, [canvasToWorld, updatePosition, getCrosshairIntersection, updateCursor]);

  const handleMouseUp = useCallback(() => {
    const mouseState = mouseStateRef.current;
    if (!mouseState.isDragging) return;

    const wasViewType = dragState.viewType;

    mouseStateRef.current = {
      isMouseDown: false,
      isDragging: false,
      downPosition: null,
      activeView: null
    };

    setDragState({
      isDragging: false,
      viewType: null,
      startPos: null,
      startWorldPos: null
    });

    if (wasViewType) {
      updateCursor(wasViewType, false, false);
    }
  }, [dragState, updateCursor]);

  const handleMouseLeave = useCallback((viewType) => () => {
    const mouseState = mouseStateRef.current;
    if (!mouseState.isDragging) {
      updateCursor(viewType, false, false);
    }
  }, [updateCursor]);

  const handleDoubleClick = useCallback((viewType) => (e) => {
    if (e.evt) {
      e.evt.preventDefault();
      e.evt.stopPropagation();
    }
    const stage = e.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;

    const worldPoint = canvasToWorld(point, viewType);
    updatePosition(worldPoint);
  }, [canvasToWorld, updatePosition]);

  // ===== STAGE PROPS =====
  const getStageProps = useCallback((viewType) => ({
    onMouseDown: handleMouseDown(viewType),
    onMouseMove: handleMouseMove(viewType),
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave(viewType),
    onDblClick: handleDoubleClick(viewType),
    style: { background: "[#0d0c22]", cursor: cursors[viewType] || 'crosshair' }
  }), [handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, handleDoubleClick, cursors]);

  return {
    dragState,
    cursors,
    getStageProps
  };
};
