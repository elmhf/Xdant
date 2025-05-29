"use client";
import { useContext } from "react";
import { DataContext } from "../dashboard";
import useImageStore from "@/stores/ImageStore"; // تأكد من تصحيح المسار حسب هيكل مشروعك

const useEditData = () => {
  // استخدام Context API
  const contextData = useContext(DataContext);
  const { data, setData, ToothEditData, setToothEditData } = contextData || {};

  // استخدام Zustand store
  const { 
    analysis, 
    setAnalysis, 
    addToHistory 
  } = useImageStore();

  // دالة موحدة تقوم بتحديث كلا الحالتين
  const EditData = (newData, toothNumber) => {
    const startTime = performance.now();

    // تحديث Context API state
    if (data && data.teeth && setData && setToothEditData) {
      const updatedTeeth = data.teeth.map((tooth) => {
        if (tooth.toothNumber === toothNumber) {
          const newProblem = {
            type: newData.type,
            subtype: "",
            mask: newData.mask[0],
            depth: "",
            severity: "",
            confidence: '',
            detectedAt: "",
            progression: "",
            comment: [],
          };
   
      
          return {
            ...tooth,
            problems: [...(tooth.problems || []), newProblem],
          };
        }
        return tooth;
      });
      
   
      let newProblemDetective;
      
      if (!data.problemDetective.includes(newData.type)) {
        newProblemDetective = [...data.problemDetective, newData.type];
        
      } else {
        newProblemDetective = data.problemDetective;
      }
      
      // Create new history list (immutable)
      const updatedHistory = [...ToothEditData.hestoriqData, { ...data,  problemDetective: newProblemDetective,teeth: updatedTeeth }];

      // Update context states safely
      setToothEditData({
        ...ToothEditData,
        hestoriqData: updatedHistory,
      });

      setData(updatedHistory[updatedHistory.length - 1]);
    }

    // تحديث Zustand state
    if (analysis && analysis.teeth && setAnalysis) {
      // Update the teeth array with the new problem
      const updatedTeeth = analysis.teeth.map((tooth) => {
        if (tooth.toothNumber === toothNumber) {
          // Create new problem object
          const newProblem = {
            type: newData.type,
            subtype: "",
            mask: newData.mask[0],
            depth: "",
            severity: "",
            confidence: '',
            detectedAt: "",
            progression: "",
            comment: [],
          };
          
          // Return new tooth object with updated problems array
          return {
            ...tooth,
            problems: [...(tooth.problems || []), newProblem],
          };
        }
        return tooth;
      });
      
      // Create updated analysis object
      const updatedAnalysis = {
        ...analysis,
        teeth: updatedTeeth
      };
      
      // Add to history before updating current state
      addToHistory(analysis);
      
      // Update current analysis state
      setAnalysis(updatedAnalysis);
    }
    
    const endTime = performance.now();
    
  };

  return { EditData };
};

export default useEditData;