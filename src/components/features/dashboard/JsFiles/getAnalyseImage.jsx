"use client";
import { apiClient } from "@/utils/apiClient";

import { toast } from "sonner";
import useImageStore from '@/stores/ImageStore';
import { useDentalStore } from "@/stores/dataStore";
const useAnalyseImage = () => {
  const loadPatientData = useDentalStore(state => state.loadPatientData);
  const startTime = performance.now();

  const getAnalyseImage = async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const data = await apiClient("/api/teeth/Test", {
        method: "POST",
        body: JSON.stringify({ fghjk: "uidfd" }),
      });

      const result = data; // apiClient returns the parsed JSON body directly
      if (result) { // Check validity
        await loadPatientData(result.data);
      }
      await loadPatientData(result.data);
      // Update zustand store




    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Failed to analyze image");
      // Reset states on error

    }
  };
  const end = performance.now();

  // Always return an object, even on the server
  return { getAnalyseImage };
};

export default useAnalyseImage;