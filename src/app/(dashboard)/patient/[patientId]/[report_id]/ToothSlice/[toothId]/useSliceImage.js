import { useImageStore } from "@/app/(dashboard)/OrthogonalViews/stores/imageStore";
import { useDentalStore } from "@/stores/dataStore";
import { useEffect, useState, useRef, useMemo } from "react";

export function useSliceImage(view, index) {
  // FIXED: Always call all hooks in the same order, no conditional calls
  const getViewImages = useImageStore(state => state.getViewImages);
  const isViewLoaded = useImageStore(state => state.isViewLoaded)
  const loadViewImages = useImageStore(state => state.loadViewImages);
  const sliceCounts = useImageStore(state => state.sliceCounts);
  const loading = useImageStore(state => state.loading);
  const dentalData = useDentalStore(state => state.data);

  // FIXED: Always call these hooks, regardless of conditions
  const images = getViewImages(view);
  const sliceImages = dentalData?.slices?.[view] || dentalData?.sliceImages?.[view];

  // FIXED: Memoize the result to avoid unnecessary re-renders
  const resultImage = useMemo(() => {
    return images?.[index] || sliceImages?.[index];
  }, [images, sliceImages, index]);
  // Auto-load images if not loaded yet
  useEffect(() => {
    const sliceCount = sliceCounts[view] || 1;
    if (sliceCount > 0 && images.length === 0 && !loading[view]) {

      loadViewImages(view, sliceCount);
    }
  }, []);

  return resultImage;
}

/**
 * useSliceRegion - returns a data URL for a cropped region of a slice image (with caching)
 */
export function useSliceRegion(view, index, region) {

  // FIXED: Always call all hooks at the top level
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

      loadViewImages(view, sliceCount);
    }
  }, [view, sliceCounts, images.length, loading, loadViewImages]);

  useEffect(() => {
    // FIXED: Handle early returns properly without breaking hooks rule
    if (!images || !images[index] || !region) {
      setCroppedUrl(undefined);
      setIsLoading(false);
      return;
    }

    const img = images[index];
    const key = `${view}-${index}-${region.x}-${region.y}-${region.width}-${region.height}`;

    // Check cache first
    if (cache.current.has(key)) {
      setCroppedUrl(cache.current.get(key));
      setIsLoading(false);
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
        cache.current.set(key, url);
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
        setCroppedUrl(undefined);
        setIsLoading(false);
      };
    } else {
      cropAndSet();
    }
  }, [images, index, region, view]);

  return { croppedUrl, isLoading };
}