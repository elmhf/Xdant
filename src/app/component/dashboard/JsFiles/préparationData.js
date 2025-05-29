"use client";

import { useContext } from "react";

import { DataContext } from "../dashboard";
const  préparationData =(data,thoothNumber)=>{

  const { data, setData, ToothEditData, setToothEditData } = useContext(DataContext);
               const a= {
                    "type": data['type'],
                    "subtype": "Occlusal",
                    "mask": data["mask"],
                    "depth": "2.1mm",
                    "severity": "Medium",
                    "confidence": 0.94,
                    "detectedAt": "",
                    "progression": "Stable",
                }
};