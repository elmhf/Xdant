"use client";

import { useContext } from "react";
import { DataContext } from "../dashboard";
import { toast } from "sonner";
import useImageStore from '@/stores/ImageStore';
import { useDentalStore } from "@/stores/dataStore";
const useAnalyseImage = () => {
  const loadPatientData = useDentalStore(state => state.loadPatientData);
  const startTime = performance.now();
  const { setAnalysis, setToothData } = useImageStore();
  const { image,  setData, setToothEditData } = useContext(DataContext);
  
  const getAnalyseImage = async () => {
    // Reset states
    setData({});
    setToothEditData({ ToothEditData: [] });

    try {
      const response = await fetch("http://localhost:3003/Test", {
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
      setAnalysis(result.data);
      setToothData({
        ToothEditData: result.data2,
        hestoriqData: [result.data]
      });


   setData(result.data);
      setToothEditData({
        "toothEditData": result.data2,
        "hestoriqData": [result.data]
      });

    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Failed to analyze image");
      // Reset states on error
      setAnalysis(null);
      setToothData({ ToothEditData: [], hestoriqData: [] });
    }
  };
  const end = performance.now();
  
  return { getAnalyseImage };
};

export default useAnalyseImage;