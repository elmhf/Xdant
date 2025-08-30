// Draw Activity: Enhanced freehand drawing for React-Konva
export const DrawActivity = {
  onMouseDown(e, state) {
    console.log("okkkkkkkkk")
    if (e.evt.button !== 0) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    if (!state.paths) state.paths = [];
    state.drawingRef.current = true;
    // Initialize new path with timestamp
    const newPath = [{
      x: pointer.x,
      y: pointer.y,
      timestamp: Date.now()
    }];
    state.paths.push(newPath);
    if (state.setPaths) state.setPaths([...state.paths]);
  },

  onMouseMove(e, state) {
    if (!state.drawingRef.current) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    if (!state.paths || state.paths.length === 0) return;
    const currentPath = state.paths[state.paths.length - 1];
    const lastPoint = currentPath[currentPath.length - 1];
    // Only add point if moved enough distance (for smoother lines)
    const dx = pointer.x - lastPoint.x;
    const dy = pointer.y - lastPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 2) {
      currentPath.push({
        x: pointer.x,
        y: pointer.y,
        timestamp: Date.now()
      });
      if (state.setPaths) state.setPaths([...state.paths]);
    }
  },

  onMouseUp(e, state) {
    state.drawingRef.current = false;
    // Example: manipulate the Layer directly using layerRef
    if (state.layerRef && state.layerRef.current) {
      state.layerRef.current.opacity(1);
      state.layerRef.current.draw();
    }
  },

  startAnimation(state) {
    if (state.animationRef && state.animationRef.current) return;
    
    state.animationRef = { current: true };
    
    const animate = () => {
      if (!state.animationRef.current) return;
      
      // Trigger re-render for fade effect
      if (state.forceUpdate) {
        state.forceUpdate();
      }
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  },

  // Stop animation loop
  stopAnimation(state) {
    if (state.animationRef) {
      state.animationRef.current = false;
    }
  },

  // Clear all paths
  clear(state) {
    state.paths = [];
    if (state.setPaths) state.setPaths([]);
  }
};