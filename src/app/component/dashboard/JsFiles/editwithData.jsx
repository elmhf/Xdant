import React, { useContext } from "react";

import { DataContext } from "../dashboard";
const useToothEdit = () => {
  const { ToothEditData, setToothEditData } = useContext(DataContext);
  

  const editwithData = (idCard) => {

    const toothNumberMatch = idCard['idcard'].match(/\d+/);
    if (!toothNumberMatch) return;
    const toothNumber = toothNumberMatch[0];

    const currentTooth = ToothEditData?.ToothEditData?.find(item => item.tooth == toothNumber);
    const newOpacity = !currentTooth?.Hedding ? "1" : "0.5";

    const parent = document.getElementById(idCard['idcard']);

    if (parent!=null) {
      parent.style.opacity = newOpacity;
      if(!currentTooth?.Hedding){
        parent.querySelector('.parent').classList.replace("ToothCaard-module__8fJNkW__collapsedCard","ToothCaard-module__8fJNkW__uncollapsedCard")
      }else{
       parent.querySelector('.parent').classList.replace("ToothCaard-module__8fJNkW__uncollapsedCard","ToothCaard-module__8fJNkW__collapsedCard")
      }
      

    }

  };

  return { editwithData };
};

export default useToothEdit;