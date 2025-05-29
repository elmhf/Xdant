import { create } from "zustand";
import { persist } from "zustand/middleware";

const useImageStore = create(
  persist(
    (set, get) => ({
      image: null,
      analysis: null,
      DentalViewSettings: {},
      toothData: {  
        toothEditData: [],
        hestoriqData: []
      },

      setImage: (image) => set({ image }),
      getImage: () => get().image,

      setAnalysis: (analysis) => set({ analysis }),
      getAnalysis: () => get().analysis,

      setToothData: ({ toothEditData, hestoriqData }) => {
        const newToothEditData = toothEditData ?? get().toothData.toothEditData;
        const newHestoriqData = hestoriqData ?? get().toothData.hestoriqData;
        
        console.log("Setting tooth data:", { 
          toothEditData: newToothEditData, 
          hestoriqData: newHestoriqData 
        });

        set({ 
          toothData: {
            toothEditData: Array.isArray(newToothEditData) ? newToothEditData : [],
            hestoriqData: Array.isArray(newHestoriqData) ? newHestoriqData : []
          }
        });
      },

      addToHistory: (newHistoryItem) =>
        set(state => ({
          toothData: {
            ...state.toothData,
            hestoriqData: [...state.toothData.hestoriqData, newHistoryItem]
          }
        })),

      clear: () => set({ 
        image: null, 
        analysis: null,
        toothData: {
          toothEditData: [],
          hestoriqData: []
        }
      }),
    }),
    {
      name: 'image-storage',
    }
  )
);

export default useImageStore;