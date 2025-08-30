// Zoom Activity: zoom in/out with mouse wheel

export const ZoomActivity = {
  onWheel(e, state) {
    if (!state.setZoom) return;
    e.evt.preventDefault();
    const delta = e.evt.deltaY;
    // Get pointer position relative to stage
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    // Normalize center to [0,1] (optional, or use absolute)
    const center = pointer ? { x: pointer.x, y: pointer.y } : undefined;
    if (delta < 0) {
      // Scroll up: zoom in
      if (state.zoomIn) state.zoomIn(center);
      else state.setZoom(z => z + (state.step || 0.1), center);
    } else if (delta > 0) {
      // Scroll down: zoom out
      if (state.zoomOut) state.zoomOut(center);
      else state.setZoom(z => z - (state.step || 0.1), center);
    }
  },
}; 