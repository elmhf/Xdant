export const SliceDragActivity = {
  drag: false,
  startY: 0,
  lastIndex: 0,

  onMouseDown(e, state) {
    if (e.evt.button !== 0) return; // فقط الزر اليسار
    this.drag = true;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    this.startY = pointer.y;
    this.lastIndex = getIndexForView(
      state.mainView,
      state.crosshair,
      state.numSlicesAxial,
      state.numSlicesCoronal,
      state.numSlicesSagittal
    );
  },

  onMouseMove(e, state) {
    if (!this.drag) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const SLICE_DRAG_THRESHOLD = 20; // كل 20px تبديل slice
    const dy = pointer.y - this.startY;
    let index = this.lastIndex - Math.round(dy / SLICE_DRAG_THRESHOLD);

    const numSlices = getNumSlices(
      state.mainView,
      state.numSlicesAxial,
      state.numSlicesCoronal,
      state.numSlicesSagittal
    );

    index = Math.max(0, Math.min(numSlices - 1, index)); // بين 0 و max

    if (state.mainView === "axial") {
      state.setCrosshair((prev) => ({ ...prev, z: index / (numSlices - 1) }));
    } else if (state.mainView === "coronal") {
      state.setCrosshair((prev) => ({ ...prev, y: 1 - (index / (numSlices - 1)) }));
    } else if (state.mainView === "sagittal") {
      state.setCrosshair((prev) => ({ ...prev, x: index / (numSlices - 1) }));
    }
  },

  onMouseUp(e, state) {
    this.drag = false;
  },
};

// Helper functions

function getNumSlices(view, numSlicesAxial, numSlicesCoronal, numSlicesSagittal) {
  if (view === "axial") return numSlicesAxial;
  if (view === "coronal") return numSlicesCoronal;
  if (view === "sagittal") return numSlicesSagittal;
  return 1;
}

function getIndexForView(view, crosshair, numSlicesAxial, numSlicesCoronal, numSlicesSagittal) {
  if (view === "axial") return Math.round(crosshair.z * (numSlicesAxial - 1));
  if (view === "coronal") return Math.round((1 - crosshair.y) * (numSlicesCoronal - 1));
  if (view === "sagittal") return Math.round(crosshair.x * (numSlicesSagittal - 1));
  return 0;
}
