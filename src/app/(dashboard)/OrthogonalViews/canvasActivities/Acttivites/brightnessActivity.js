// Activity: Brightness adjustment by mouse drag (left-right)
let lastBrightness = null;

export const BrightnessActivity = {
  onMouseDown(e, state) {
    console.log("okkkkk")
    if (e.evt.button !== 0) return;
    console.log(state)
    console.log(state.brightness ,"state.brightness ")
    lastBrightness = state.brightness ?? 1;
    state.setIsAdjustingBrightness?.(true);
    state.setBrightness?.(lastBrightness);
    state.setLastPointerX?.(e.target.getStage().getPointerPosition()?.x ?? 0);
  },
  onMouseMove(e, state) {
    if (!state.isAdjustingBrightness) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const deltaX = pointer.x - (state.lastPointerX ?? pointer.x);
    let newBrightness = lastBrightness + deltaX / 200; // Sensitivity
    newBrightness = Math.max(0.1, Math.min(3, newBrightness));
    state.setBrightness?.(newBrightness);
  },
  onMouseUp(e, state) {
    state.setIsAdjustingBrightness?.(false);
    lastBrightness = null;
  },
  onWheel() {},
  onDblClick(e, state) {
    state.setBrightness?.(1);
  },
}; 