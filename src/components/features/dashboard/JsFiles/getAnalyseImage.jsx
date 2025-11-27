"use client";

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
      const response = await fetch("http://localhost:5000/api/teeth/Test", {
         method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ fghjk: "uidfd" }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
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