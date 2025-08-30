import { create } from "zustand";
import { persist } from "zustand/middleware";

const useImageStore = create(

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
    }),
    {
      name: 'image-storage',
    }
  
);

export default useImageStore;