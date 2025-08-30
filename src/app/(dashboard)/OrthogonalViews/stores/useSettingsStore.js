// ✅ stores/useSettingsStore.js
import { create } from 'zustand';

export const useSettingsStore = create((set) => ({
  // Rotation
  rotation: 0,
  setRotation: (rotation) => set({ rotation }),

  // Layers
  layerStates: {},
  setLayerStates: (newStates) => set({ layerStates: newStates }),
  toggleLayer: (key) =>
    set((state) => ({
      layerStates: {
        ...state.layerStates,
        [key]: !state.layerStates[key],
      },
    })),

  // Legends
  legendStates: {
    entrainement: false,
    epingles: false,
    limite: false,
  },
  toggleLegend: (key) =>{
    set((state) => ({
      legendStates: {
        ...state.legendStates,
        [key]: !state.legendStates[key],
      },
    }))},

  // Display
  displayStates: {
    orientation: true,
    crossref: true,
  },
  toggleDisplay: (key) =>
    set((state) => ({
      displayStates: {
        ...state.displayStates,
        [key]: !state.displayStates[key],
      },
    })),

  activeActivities: ["crosshair"],
  setActiveActivities: (ids) => set({ activeActivities: ids }),
  addActivity: (id) =>
    set((state) => ({
      activeActivities: [...new Set([...state.activeActivities, id])],
    })),
  removeActivity: (id) =>
    set((state) => ({
      activeActivities: state.activeActivities.filter((a) => a !== id),
    })),
  toggleActivity: (id) =>{
    console.log(id)
    set((state) => ({
      activeActivities: state.activeActivities.includes(id)
        ? state.activeActivities.filter((a) => a !== id)
        : [...state.activeActivities, id],
    }))},
}));
