"use client"
import { useState, useCallback, useContext, useRef } from "react";
import { toast } from "sonner";
import useAnalyseImage from "@/components/features/dashboard/JsFiles/getAnalyseImage";
import useImageStore from "@/stores/ImageStore";
import { DataContext } from "@/components/features/dashboard/dashboard";

export default function useImageCard() {
  // Safe destructure with fallback and warning
  const context = useContext(DataContext);
  const stageRef = context?.stageRef;
  if (!stageRef) {
    console.warn('stageRef is undefined! Make sure you are inside <DataContext.Provider value={{ stageRef }}>');
  }

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

  // دالة محسنة لجلب الصورة من URL
  const fetchImageFromUrl = useCallback(async (url) => {
    try {
      // التحقق من صحة الـ URL
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided');
      }

      // إضافة headers للتعامل مع CORS
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'image/*',
        }
      });

      // التحقق من نجاح الطلب
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // التحقق من نوع المحتوى
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL does not point to a valid image');
      }

      const blob = await response.blob();

      // التحقق من حجم الـ blob
      if (blob.size === 0) {
        throw new Error('Received empty image file');
      }

      // إنشاء اسم ملف مناسب
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const fileName = lastPart.includes('.') ? lastPart : `image_${Date.now()}.jpg`;

      // إنشاء ملف جديد من الـ blob
      const file = new File([blob], fileName, {
        type: blob.type || 'image/jpeg',
        lastModified: Date.now()
      });

      // إنشاء data URL للعرض
      const data_url = URL.createObjectURL(blob);

      return {
        file,
        data_url,
        originalUrl: url,
        size: blob.size,
        type: blob.type || 'image/jpeg',
        name: fileName
      };

    } catch (error) {
      console.error('Error fetching image from URL:', error);
      throw new Error(`Failed to fetch image: ${error.message}`);
    }
  }, []);

  // دالة لتنظيف الـ URLs
  const cleanupImageUrl = useCallback((data_url) => {
    if (data_url && data_url.startsWith('blob:')) {
      URL.revokeObjectURL(data_url);
    }
  }, []);

  // دالة لرفع الصور من URL
  const handleUrlUpload = useCallback(async (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      setState(prev => ({ ...prev, error: 'Invalid image URL' }));
      toast.error("Please provide a valid image URL");
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const imageData = await fetchImageFromUrl(imageUrl);

      // تحويل البيانات لنفس الصيغة المتوقعة في handleUpload
      const imageList = [{
        file: imageData.file,
        data_url: imageData.data_url,
        name: imageData.name,
        size: imageData.size,
        originalUrl: imageData.originalUrl
      }];
      console.log(imageList, "imageListimageList");
      // حفظ المرجع للاستخدام في handleReanalyze
      imageListRef.current = imageList;

      if (imageList[0]) {
        setImage(imageList[0]);
      }

      const formData = new FormData();
      formData.append("file", imageList[0].file);

      setState(prev => ({
        ...prev,
        images: imageList,
        error: null,
        isLoading: false
      }));

      toast.success("Your dental scan has been processed successfully");

    } catch (err) {
      console.error("Image URL upload failed:", err);
      setState(prev => ({
        ...prev,
        error: err.message || 'Failed to analyze image from URL. Please try again.',
        isLoading: false
      }));
      toast.error(err.message || "Failed to analyze image from URL. Please try again.");
    }
  }, [fetchImageFromUrl, getAnalyseImage, setImage]);

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
        setImage(imageList[0]);
      }

      const formData = new FormData();
      formData.append("file", imageList[0].file);

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
  }, [getAnalyseImage, setImage]);

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

  // إضافة دالة لإعادة تعيين الحالة مع تنظيف URLs
  const resetState = useCallback(() => {
    // تنظيف جميع blob URLs الموجودة
    state.images.forEach(image => {
      if (image.data_url) {
        cleanupImageUrl(image.data_url);
      }
    });

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
  }, [state.images, cleanupImageUrl]);

  // دالة لحذف صورة معينة
  const removeImage = useCallback((index) => {
    setState(prev => {
      const newImages = [...prev.images];
      const removedImage = newImages[index];

      // تنظيف URL للصورة المحذوفة
      if (removedImage?.data_url) {
        cleanupImageUrl(removedImage.data_url);
      }

      newImages.splice(index, 1);

      // تحديث imageListRef
      imageListRef.current = newImages;

      return {
        ...prev,
        images: newImages
      };
    });

    toast.success('Image removed successfully');
  }, [cleanupImageUrl]);

  // دالة للتحقق من نوع الصورة
  const validateImageType = useCallback((file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type.toLowerCase());
  }, []);

  // دالة للتحقق من حجم الصورة
  const validateImageSize = useCallback((file, maxSizeInMB = 10) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }, []);

  return {
    ...state,
    handleUpload,
    handleUrlUpload, // دالة جديدة لرفع الصور من URL
    handleReanalyze,
    toggleFullScreen,
    handleSettingChange,
    handleDownload,
    downloadImageWithAnnotations,
    setShowParameters,
    resetState,
    removeImage, // دالة جديدة لحذف الصور
    fetchImageFromUrl, // تصدير الدالة للاستخدام الخارجي
    cleanupImageUrl, // دالة تنظيف URLs
    validateImageType, // دالة التحقق من نوع الصورة
    validateImageSize // دالة التحقق من حجم الصورة
  };
}