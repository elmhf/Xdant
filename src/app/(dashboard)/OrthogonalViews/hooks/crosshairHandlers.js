
// getCrosshairLineType
export function getCrosshairLineType(crosshairPositions, viewType, canvasPos, threshold = 15) {
  const crosshairPos = crosshairPositions[viewType];
  if (!crosshairPos) return null;
  if (!canvasPos || typeof canvasPos.x !== 'number' || typeof canvasPos.y !== 'number') {
    return null;
  }
  const distanceToVertical = Math.abs(canvasPos.x - crosshairPos.x);
  const distanceToHorizontal = Math.abs(canvasPos.y - crosshairPos.y);
  if (distanceToVertical <= threshold * 0.7 && distanceToHorizontal <= threshold * 0.7) {
    return 'intersection';
  }
  if (distanceToVertical <= threshold) {
    return 'vertical';
  }
  if (distanceToHorizontal <= threshold) {
    return 'horizontal';
  }
  return null;
}

// getCursorForInteraction
export function getCursorForInteraction(hoverType, isDragging = false) {
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
}

// updateCursor
export function updateCursor(setCursors, getCursorForInteraction, viewType, hoverType, isDragging = false) {
  const newCursor = getCursorForInteraction(hoverType, isDragging);
  setCursors(prev => ({
    ...prev,
    [viewType]: newCursor
  }));
}

// handleGlobalMouseMove
export function handleGlobalMouseMove(dragState, viewType) {
  return (e) => {
    try {
      const stage = e.target.getStage();
      if (!stage) return;
      const point = stage.getPointerPosition();
      if (!point) return;
      if (!dragState.isDragging || dragState.viewType === viewType) {
        // No hover logic needed
      }
    } catch (error) {
      console.error('Error in global mouse move:', error);
    }
  };
}

// handleMouseLeave
export function handleMouseLeave() {
  return () => {
    // No hover logic needed
  };
}

// handleCrosshairDragStart
export function handleCrosshairDragStart(
    crosshairPositions,                    // ✅ add this
    getCrosshairLineType,
    setDragState,
    updateCursor,
    viewType,
    canvasPos,
    worldPosition
  ) {
    if (typeof setDragState !== 'function') {
      console.error('setDragState is not a function!', setDragState);
      return;
    }
  
    const lineType = getCrosshairLineType(crosshairPositions, viewType, canvasPos); // ✅ fix here
    if (lineType) {
        console.log(lineType,'pointer')

      setDragState({
        isDragging: true,
        dragType: lineType === 'intersection' ? 'both' : lineType,
        viewType,
        startPos: canvasPos,
        startWorldPos: { ...worldPosition }
      });
      updateCursor(viewType, lineType, true);
      return true;
    }
  
    return false;
  }

// handleCrosshairDragMove
export function handleCrosshairDragMove(dragState, CoordinateUtils, global, drawnSizes, canvasSizes, zooms, updatePosition) {
  return (canvasPos) => {
    if (!dragState || !dragState.isDragging || !dragState.startPos) return;
    try {
      const params = CoordinateUtils.getViewParams(
        dragState.viewType, 
        global, 
        drawnSizes[dragState.viewType], 
        canvasSizes
      );
      let newWorldPosition = { ...dragState.startWorldPos };
      const deltaX = canvasPos.x - dragState.startPos.x;
      const deltaY = canvasPos.y - dragState.startPos.y;
      if (dragState.dragType === 'horizontal' || dragState.dragType === 'both') {
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
      updatePosition(newWorldPosition);
    } catch (error) {
      console.error('Error handling crosshair drag move:', error);
    }
  };
}

// handleCrosshairDragEnd
export function handleCrosshairDragEnd(setDragState, dragState) {
  const wasViewType = dragState.viewType;
  setDragState({
    isDragging: false,
    dragType: null,
    viewType: null,
    startPos: null,
    startWorldPos: null
  });
  // No hover logic needed
}

// handleViewMouseDown
export function handleViewMouseDown(getCrosshairLineType, handleCrosshairDragStart, CoordinateUtils, global, drawnSizes, canvasSizes, zooms, pans, currentSlices, updatePosition, updateCursor) {
  return (viewType) => (e) => {
    try {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      if (!point) return;
      const lineType = getCrosshairLineType(viewType, point);
      if (lineType) {
        const success = handleCrosshairDragStart(viewType, point);
        if (success) {
          e.cancelBubble = true;
          return;
        }
      }
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
      updatePosition(worldPoint);
    } catch (error) {
      console.error('Error handling view mouse down:', error);
    }
  };
}

// handleViewClick
export function handleViewClick(handleViewMouseDown) {
  return (viewType) => handleViewMouseDown(viewType);
}

// handleCrosshairMove
export function handleCrosshairMove(crosshairPositions, viewType, delta, CoordinateUtils, global, drawnSizes, canvasSizes, zooms, pans, currentSlices, updatePosition) {
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
    updatePosition(newWorldPoint);
  } catch (error) {
    console.error('Error handling crosshair move:', error);
  }
} 



// === CrosshairActivity: all mouse event handlers as an object ===
export const CrosshairActivity = {
  onMouseDown(e, state) {
    console.log("onMouseDown")
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    console.log(pointer,state.viewType,'pointer')
    handleCrosshairDragStart(
        state.crosshair, // ✅ pass actual positions
        getCrosshairLineType,
        state.setDragState,
        (vt, type, drag) => updateCursor(state.setCursors, state.getCursorForInteraction, vt, type, drag),
        state.viewType,
        pointer,
        state.worldPosition
      );
  },
  onMouseMove(e, state) {
    console.log("oooooooooo")
    // Guard against undefined dragState
    const { dragState } = state;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    console.log("8888",dragState)
    if (!dragState || !dragState.isDragging || !dragState.startPos) return;
    handleCrosshairDragMove(
      dragState,
      state.CoordinateUtils,
      state.global,
      state.drawnSizes,
      state.canvasSizes,
      state.zooms,
      state.updatePosition
    )(pointer);
  },
  onMouseUp(e, state) {
    handleCrosshairDragEnd(state.setDragState, state.dragState);
  },
  onMouseLeave(e, state) {
    // Optionally reset drag state or cursor here if needed
  },
  onWheel(e, state) {
    // Implement wheel/zoom logic if needed
  },
  onDblClick(e, state) {
    // Implement double click logic if needed
  },
  onClick(e, state) {
    // Implement click logic if needed
  }
}; 
