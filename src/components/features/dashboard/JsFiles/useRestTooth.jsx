"use client";

import { useContext } from "react";
import { DataContext } from "../dashboard";

const useRestTooth = () => {
  const { data, setData, ToothEditData, setToothEditData } = useContext(DataContext);

  const RestTooth = (toothNumber) => {
  
    const updatedTeeth = data.teeth.map((tooth) => {
      let oldTeeth = {};

    if(tooth.toothNumber==toothNumber) { 
    
      oldTeeth = ToothEditData.hestoriqData[0].teeth.find(
        (T) => T.toothNumber == toothNumber 
      );
    
    }

      return  { ... tooth.toothNumber==toothNumber ? oldTeeth : tooth
        
      };
    });

    const updatedHistory = [...ToothEditData.hestoriqData, { ...data, teeth: updatedTeeth }];
  
 
    setToothEditData({
      ...ToothEditData,
      hestoriqData: updatedHistory,
    });

    setData(updatedHistory[updatedHistory.length - 1]);
  };

  return { RestTooth };
};

export default useRestTooth;
