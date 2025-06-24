import React, { useContext } from "react";

import { DataContext } from "../dashboard";
const useToothEdit = () => {
  const { ToothEditData, setToothEditData } = useContext(DataContext);
  

  const editwithData = (idCard) => {
    // Handle either string ID or number
    const toothNumberMatch = String(idCard).match(/\d+/);
    if (!toothNumberMatch) return;
    const toothNumber = toothNumberMatch[0];

    const currentTooth = ToothEditData?.ToothEditData?.find(item => item.tooth == toothNumber);
    const newOpacity = !currentTooth?.Hedding ? "1" : "0.5";

    const parent = document.getElementById(`TooTh-Card-${toothNumber}`);

    if (parent) {
      parent.style.opacity = newOpacity;
      const parentElement = parent.querySelector('.parent');
      if (parentElement) {
        if (!currentTooth?.Hedding) {
          parentElement.classList.remove('collapsedCard');
          parentElement.classList.add('uncollapsedCard');
        } else {
          parentElement.classList.remove('uncollapsedCard');
          parentElement.classList.add('collapsedCard');
        }
      }
      

    }

  };

  return { editwithData };
};

export default useToothEdit;