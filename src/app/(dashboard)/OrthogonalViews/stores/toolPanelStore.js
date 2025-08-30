import create from "zustand";

const initialToolPanelState = {
  objects: { label: "Objects", id: "objects", icon: "FaLayerGroup", active: false },
  expand: { label: "Expand", id: "expand", icon: "FaExpand", active: false },
  grid: { label: "Grid", id: "grid", icon: "FaTh", active: false },
  columns: { label: "Columns", id: "columns", icon: "FaColumns", active: false },
  ruler: { label: "Ruler", id: "ruler", icon: "FaRuler", active: false },
  brightness: { label: "Brightness", id: "brightness", icon: "FiSun", active: false },
  crosshair: { label: "Crosshair", id: "crosshair", icon: "CrosshairIcon", active: false },
  info: { label: "Info", id: "info", icon: "FaInfoCircle", active: false },
};
const exclusiveTools = ["crosshair", "info", "brightness", "ruler"];

export const useToolPanelStore = create((set) => ({
  toolPanel: initialToolPanelState,
  setActiveTool: (toolKey) => set((state) => {
    if (!toolKey || !state.toolPanel[toolKey]) return {};
    const newState = { ...state.toolPanel };
    if (exclusiveTools.includes(toolKey)) {
      exclusiveTools.forEach(key => {
        if (key !== toolKey) newState[key] = { ...newState[key], active: false };
      });
    }
    newState[toolKey] = { ...newState[toolKey], active: true };
    return { toolPanel: newState };
  }),
  setInactiveTool: (toolKey) => set((state) => {
    if (!toolKey || !state.toolPanel[toolKey]) return {};
    return {
      toolPanel: {
        ...state.toolPanel,
        [toolKey]: { ...state.toolPanel[toolKey], active: false },
      }
    };
  }),
  toggleTool: (toolKey) => set((state) => {
    if (!toolKey || !state.toolPanel[toolKey]) return {};
    const currentlyActive = state.toolPanel[toolKey].active;
    const newState = { ...state.toolPanel };
    if (currentlyActive) {
      newState[toolKey] = { ...newState[toolKey], active: false };
    } else {
      if (exclusiveTools.includes(toolKey)) {
        exclusiveTools.forEach(key => {
          if (key !== toolKey) newState[key] = { ...newState[key], active: false };
        });
      }
      newState[toolKey] = { ...newState[toolKey], active: true };
    }
    return { toolPanel: newState };
  }),
  resetAllTools: () => set(() => ({ toolPanel: initialToolPanelState })),
})); 