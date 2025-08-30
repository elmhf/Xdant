import { useImageStore } from "@/app/(dashboard)/OrthogonalViews/stores/imageStore";
import { useEffect, useState, useRef } from "react";

export function useSliceImage(view, index) {
  const getViewImages = useImageStore(state => state.getViewImages);
  const images = getViewImages(view);
  return images && images[index];
}

/**
 * useSliceRegion - returns a data URL for a cropped region of a slice image (with caching)
 */
export function useSliceRegion(view, index, region) {
  const getViewImages = useImageStore(state => state.getViewImages);
  const images = getViewImages(view);
  const [croppedUrl, setCroppedUrl] = useState();

  const cache = useRef(new Map());

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

    function cropAndSet() {
      const sx = Math.max(0, region.x);
      const sy = Math.max(0, region.y);
      const sw = Math.min(region.width, img.width - sx);
      const sh = Math.min(region.height, img.height - sy);

      if (sw <= 0 || sh <= 0) {
        setCroppedUrl(undefined);
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
    }

    if (!img.complete) {
      img.onload = cropAndSet;
      return;
    }

    cropAndSet();
  }, [images, index, region, view]);

  return croppedUrl;
}
