import { useImageStore } from "@/app/(dashboard)/OrthogonalViews/stores/imageStore";
import { useDentalStore } from "@/stores/dataStore";
import { useEffect, useState, useRef } from "react";

export function useSliceImage(view, index) {
  const getViewImages = useImageStore(state => state.getViewImages);
  const loadViewImages = useImageStore(state => state.loadViewImages);
  const sliceCounts = useImageStore(state => state.sliceCounts);
  const loading = useImageStore(state => state.loading);
  const images = getViewImages(view);
  
  // Also try to get images from the dental store if available
  const dentalData = useDentalStore(state => state.data);
  const sliceImages = dentalData?.slices?.[view] || dentalData?.sliceImages?.[view];
  
  // Auto-load images if not loaded yet
  useEffect(() => {
    const sliceCount = sliceCounts[view] || 1;
    if (sliceCount > 0 && images.length === 0 && !loading[view]) {
      console.log(`🔄 Auto-loading ${view} images, count: ${sliceCount}`);
      loadViewImages(view, sliceCount);
    }
  }, [view, sliceCounts, images.length, loading, loadViewImages]);
  
  // Return image from image store first, then from dental store
  return images?.[index] || sliceImages?.[index];
}

/**
 * useSliceRegion - returns a data URL for a cropped region of a slice image (with caching)
 */
export function useSliceRegion(view, index, region) {
  const getViewImages = useImageStore(state => state.getViewImages);
  const loadViewImages = useImageStore(state => state.loadViewImages);
  const sliceCounts = useImageStore(state => state.sliceCounts);
  const loading = useImageStore(state => state.loading);
  const images = getViewImages(view);
  const [croppedUrl, setCroppedUrl] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const cache = useRef(new Map());

  // Auto-load images if not loaded yet
  useEffect(() => {
    const sliceCount = sliceCounts[view] || 1;
    if (sliceCount > 0 && images.length === 0 && !loading[view]) {
      console.log(`🔄 Auto-loading ${view} images for region, count: ${sliceCount}`);
      loadViewImages(view, sliceCount);
    }
  }, [view, sliceCounts, images.length, loading, loadViewImages]);

  useEffect(() => {
    if (!images || !images[index] || !region) {
      setCroppedUrl(undefined);
      return;
    }

    const img = images[index];
    const key = `${view}-${index}-${region.x}-${region.y}-${region.width}-${region.height}`;

    // لو موجود في الكاش
    if (cache.current.has(key)) {
      setCroppedUrl(cache.current.get(key));
      return;
    }

    setIsLoading(true);

    function cropAndSet() {
      try {
        const sx = Math.max(0, region.x);
        const sy = Math.max(0, region.y);
        const sw = Math.min(region.width, img.width - sx);
        const sh = Math.min(region.height, img.height - sy);

        if (sw <= 0 || sh <= 0) {
          setCroppedUrl(undefined);
          setIsLoading(false);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        const url = canvas.toDataURL();
        cache.current.set(key, url); // خزنه
        setCroppedUrl(url);
        setIsLoading(false);
      } catch (error) {
        console.error('Error cropping image:', error);
        setCroppedUrl(undefined);
        setIsLoading(false);
      }
    }

    if (!img.complete) {
      img.onload = cropAndSet;
      img.onerror = () => {
        console.error('Failed to load image for cropping');
        setIsLoading(false);
      };
      return;
    }

    cropAndSet();
  }, [images, index, region, view]);

  return { croppedUrl, isLoading };
}
