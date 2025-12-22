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
      reset: () => set({
        image: null,
        analysis: null,
        DentalViewSettings: {},
        toothData: {
          toothEditData: [],
          hestoriqData: []
        }
      }),
    }),
    {
      name: 'image-storage',
      serialize: (state) => {
        // We cannot persist blob URLs or File objects directly.
        // We will persist metadata if needed, but for now we rely on re-fetching.
        // This serialization is a placeholder to prevent crashing on circular refs if any.
        return JSON.stringify(state);
      },
      deserialize: (str) => JSON.parse(str),
    }
  )
);

export default useImageStore;