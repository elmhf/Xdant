



"use client";
import useAnalyseImage from "@/app/component/dashboard/JsFiles/getAnalyseImage";
import { useContext } from "react";
import { DataContext } from "../dashboard";
import { toast } from "sonner";
import useImageStore from '@/stores/ImageStore';

const useAnalyseImage = () => {
  const startTime = performance.now();
  const { setAnalysis, setToothData } = useImageStore();
  const { setData, setToothEditData } = useContext(DataContext);
  
  const getAnalyseImage = async () => {

  };
  return { getAnalyseImage };
};

export default useAnalyseImage;