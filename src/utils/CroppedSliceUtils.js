"use client";
import { useSliceImage } from "@/app/(dashboard)/patient/[patientId]/[report_id]/ToothSlice/[toothId]/useSliceImage";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Trash } from 'lucide-react'; // يجب استيرادها بحرف كبير

// 🟢 Cache للـ random regions
const regionCache = new Map();

// 🟢 دالة توليد منطقة عشوائية
function getRandomRegion(imgWidth, imgHeight, minSize = 60, maxSize = 100) {
  const cacheKey = `${imgWidth}-${imgHeight}-${minSize}-${maxSize}`;

  if (regionCache.has(cacheKey)) {
    return regionCache.get(cacheKey);
  }

  const width = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  const height = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  const maxX = Math.max(0, imgWidth - width);
  const maxY = Math.max(0, imgHeight - height);
  const x = Math.floor(Math.random() * (maxX + 1));
  const y = Math.floor(Math.random() * (maxY + 1));

  const region = { x, y, width, height };
  regionCache.set(cacheKey, region);

  return region;
}

// 🟢 دالة crop مستقلة
export function cropImageToDataURL(img, region) {
  if (!img || !region) return null;

  const sx = Math.max(0, region.x);
  const sy = Math.max(0, region.y);
  const sw = Math.min(region.width, img.width - sx);
  const sh = Math.min(region.height, img.height - sy);

  if (sw <= 0 || sh <= 0) {
    console.warn("Invalid crop region, returning null");
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  return canvas.toDataURL(); // base64 string
}

// 🟢 CroppedSlice component
export const CroppedSlice = React.memo(({ view, index, onDelete ,ToothSlicemode}) => {
  const [region, setRegion] = useState(null);
  const [croppedUrl, setCroppedUrl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // نجيب الصورة الأصلية
  const img = useSliceImage(view, index);

  // نولّد region عشوائي وقت الصورة تتحمل
  useEffect(() => {
    if (img && img.width && img.height && !region) {
      const newRegion = getRandomRegion(img.width, img.height);
      setRegion(newRegion);

      // 🟢 نستعمل cropImageToDataURL مباشرة
      const cropped = cropImageToDataURL(img, newRegion);
      setCroppedUrl(cropped);
    }
  }, [img, region]);

  const displayHeight = 140;
  const displayWidth = useMemo(() => {
    return region
      ? Math.round(displayHeight * (region.width / region.height))
      : 140;
  }, [region, displayHeight]);

  // دالة التعامل مع النقر على زر الحذف
  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(view, index);
    }
  }, [onDelete, view, index]);

  // 🟢 Placeholder كان الصورة مازالت ما قصّتش
  if (!img || !region || !croppedUrl) {
    return (
      <div className="flex flex-col items-center">
        <div
          style={{ width: 140, height: displayHeight }}
          className="border-3 overflow-hidden relative rounded-[0.5vw] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse flex items-center justify-center"
        >
          <div className="text-gray-400 text-xs">Processing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        style={{ width: displayWidth, height: displayHeight }}
        className={`border-3 overflow-hidden relative cursor-pointer rounded-[0.5vw] transition-all duration-200 ${
          isHovered ? "border-[#7564ed] shadow-blue-200" : "border-white"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* رقم الشريحة */}
        <span className="absolute top-1 right-1 pointer-events-none z-10">
          <span
            className={`text-white text-xs font-bold px-1.5 py-0.5 rounded shadow transition-colors duration-200 ${
              isHovered
                ? "bg-[#7564ed] bg-opacity-90"
                : "bg-[#0d0c22] bg-opacity-70"
            }`}
          >
            {index}
          </span>
        </span>

        {/* زر الحذف - يظهر فقط عند التمرير */}
{isHovered && ToothSlicemode && (
  <button
    onClick={handleDelete}
    className="absolute bottom-2 left-2 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors duration-200 flex items-center justify-center"
    aria-label="Delete slice"
  >
    <Trash size={14} />
  </button>
)}

        {/* الصورة المقطوعة */}
        <img
        
          src={croppedUrl}
          alt={`${view} Slice ${index}`}
          className="w-full h-full object-cover select-none"
          loading="lazy"
          draggable={false} 
        />
      </div>
    </div>
  );
});