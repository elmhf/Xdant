import { create } from 'zustand';


export const useLayout = create((set,get) => ({
  currentLayout: 'DEFAULT', 
  isFullscreen: false,      

  applyLayout: (layout) => set({ currentLayout: layout }),

  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),


  getCurrentLayout: () => get().currentLayout,
}));