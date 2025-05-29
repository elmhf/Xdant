"use client";

import { useContext } from "react";
import { DataContext } from "../dashboard";

const useUpditeData = () => {
  const { data, setData, ToothEditData, setToothEditData } = useContext(DataContext);

  const EditData = ({comment},toothNumber) => {
    const updatedTeeth = data.teeth.map((tooth) => {
      let newComments = [];

    if(tooth.toothNumber==toothNumber) { 
      
    
      if (Array.isArray(tooth.comments) && tooth.comments.length > 0) {
        const lastId = tooth.comments[tooth.comments.length - 1].id;
        newComments = [...tooth.comments, { id: lastId + 1, comment }];
      } else {
        newComments = [{ id: 1, comment }];
      }
    }

    
      return  {
        ...tooth,
        ...(tooth.toothNumber == toothNumber && { comments: newComments })
      };
    });

    const updatedHistory = [...ToothEditData.hestoriqData, { ...data, teeth: updatedTeeth }];

    setToothEditData({
      ...ToothEditData,
      hestoriqData: updatedHistory,
    });

    setData(updatedHistory[updatedHistory.length - 1]);
  };

  return { EditData };
};

export default useUpditeData;
