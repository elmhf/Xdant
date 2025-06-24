"use client"
import { useState, useCallback, useContext, useRef } from "react";
import { toast } from "sonner";
import useAnalyseImage from "@/app/component/dashboard/JsFiles/getAnalyseImage";
import useImageStore from "@/stores/ImageStore";
import { DataContext } from "../../../dashboard";

export default function useImageCard() {
  const { image, setImg } = useContext(DataContext);
  const { stageRef } = useContext(DataContext);
  
  // استخدام useRef لحفظ المراجع المستقرة
  const imageListRef = useRef([]);
  
  const [state, setState] = useState({
    images: [],
    isLoading: false,
    error: null,
    isFullScreen: false,
    showParameters: false,
    imageSettings: {
      brightness: 100,
      contrast: 100,
      zoom: 100
    }
  });

  const { setImage } = useImageStore();
  const { getAnalyseImage } = useAnalyseImage();

  // تحسين handleUpload - إزالة dependencies غير ضرورية
  const handleUpload = useCallback(async (imageList) => {
    if (!Array.isArray(imageList) || imageList.length === 0 || !imageList[0]?.file) {
      setState(prev => ({ ...prev, error: 'Invalid image file' }));
      toast.error("Please select a valid image file (JPG, PNG)");
      return;
    }

    try {
      setState(prev => ({ ...prev, images: imageList, isLoading: true }));
      
      // حفظ المرجع للاستخدام في handleReanalyze
      imageListRef.current = imageList;
      
      if (imageList[0]) {
        console.log(imageList[0], "imageList[0]");
        setImage(imageList[0]);
        setImg(imageList[0]);
      }

      const formData = new FormData();
      formData.append("file", imageList[0].file);
      
      await getAnalyseImage(formData);
      toast.success("Your dental scan has been processed successfully");
      setState(prev => ({ ...prev, error: null, isLoading: false }));
      
    } catch (err) {
      console.error("Image upload failed:", err);
      setState(prev => ({
        ...prev,
        error: err.message || 'Failed to analyze image. Please try again.',
        isLoading: false
      }));
      toast.error(err.message || "Failed to analyze image. Please try again.");
    }
  }, [getAnalyseImage, setImage, setImg]); // إزالة dependencies غير مستقرة

  // تحسين downloadImageWithAnnotations
  const downloadImageWithAnnotations = useCallback(() => {
    if (!stageRef?.current) {
      console.error('Stage reference is not available');
      toast.error('Unable to download image. Stage not available.');
      return;
    }

    try {
      const dataUrl = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `dental-scan-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image. Please try again.');
    }
  }, [stageRef]);

  // تحسين handleReanalyze - استخدام useRef بدلاً من state
  const handleReanalyze = useCallback(() => {
    if (imageListRef.current.length > 0) {
      handleUpload(imageListRef.current);
    } else {
      toast.error('No image available to reanalyze');
    }
  }, [handleUpload]);

  // تحسين الدوال البسيطة - إزالة useCallback غير الضروري
  const toggleFullScreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullScreen: !prev.isFullScreen }));
  }, []);

  // تحسين handleSettingChange
  const handleSettingChange = useCallback((setting, value) => {
    setState(prev => ({
      ...prev,
      imageSettings: {
        ...prev.imageSettings,
        [setting]: value
      }
    }));
  }, []);

  // تحسين handleDownload
  const handleDownload = useCallback(() => {
    if (!state.images.length) {
      toast.error('No image available to download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = state.images[0].data_url;
      link.download = `dental-scan-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Original image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading original image:', error);
      toast.error('Failed to download image. Please try again.');
    }
  }, [state.images]);

  // دالة مُحسنة لتحديث showParameters
  const setShowParameters = useCallback((show) => {
    setState(prev => ({ ...prev, showParameters: show }));
  }, []);

  // إضافة دالة لإعادة تعيين الحالة
  const resetState = useCallback(() => {
    setState({
      images: [],
      isLoading: false,
      error: null,
      isFullScreen: false,
      showParameters: false,
      imageSettings: {
        brightness: 100,
        contrast: 100,
        zoom: 100
      }
    });
    imageListRef.current = [];
  }, []);

  return {
    ...state,
    handleUpload,
    handleReanalyze,
    toggleFullScreen,
    handleSettingChange,
    handleDownload,
    downloadImageWithAnnotations,
    setShowParameters,
    resetState // دالة جديدة مفيدة
  };
}