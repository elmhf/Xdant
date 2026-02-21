"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSliceImage, useSliceRegion } from "@/app/(dashboard)/patient/[patientId]/[report_id]/ToothSlice/[toothId]/useSliceImage";
import { getRandomRegion } from './utils/sliceUtils';

// ✅ slice واحد
const CroppedSlice = React.memo(({ view, index, isSelected = false }) => {
    const { t } = useTranslation();
    const [region, setRegion] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const img = useSliceImage(view, index);

    useEffect(() => {
        if (img && img.width && img.height && !region) {
            setRegion(getRandomRegion(img.width, img.height));
        }
    }, [img, region, view, index]);

    const { croppedUrl, isLoading } = useSliceRegion(view, index, region);

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    const displayHeight = 140;
    const displayWidth = useMemo(
        () =>
            region
                ? Math.round(displayHeight * (region.width / region.height))
                : 140,
        [region, displayHeight]
    );

    if (!img || !region) {
        return (
            <div
                style={{ width: 140, height: displayHeight }}
                className="border-3 rounded bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse flex items-center justify-center"
            >
                <div className="text-gray-400 text-xs">
                    {!img ? t('dashboard.toothSlice.loadingImage') : t('dashboard.toothSlice.settingRegion')}
                </div>
            </div>
        );
    }

    return (
        <div
            style={{ width: displayWidth, height: displayHeight }}
            className={`
  overflow-hidden 
  relative 
  cursor-pointer 
  rounded-[0.5vw] 
  transition-all 
  duration-200 
  ${isHovered ? "outline-[5px] outline-[#7564ed] z-20" : "z-10"}
`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className="absolute top-1 right-1 pointer-events-none z-10 flex items-center gap-1">

                <span className={`
      ${isHovered ? "bg-[#7564ed] text-white" : "text-white"}

      ${isSelected ? `${view === 'axial' ? 'bg-yellow-400 text-black' :
                        view === 'sagittal' ? 'bg-cyan-400 text-black' :
                            view === 'coronal' ? 'bg-purple-500 text-black' :
                                'bg-[#0d0c22] text-white bg-opacity-70'}` : "text-white"}
       
      text-[0.7rem] 
      font-[500] 
      px-1.5 
      py-0.5 
      rounded-[0.2vw] 
      shadow 
      flex 
      items-center 
      gap-1
    `}
                >
                    {isSelected && (<span className="text-sm">✔</span>)}
                    {index}
                </span>

            </span>

            {croppedUrl && !isLoading && (
                <img
                    draggable={false}
                    src={croppedUrl}
                    alt={`${view} Slice ${index}`}
                    className="w-full h-full object-cover select-none"
                />
            )}
            {(!croppedUrl || isLoading) && (
                <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400 text-xs">
                        {isLoading
                            ? t('dashboard.toothSlice.processing')
                            : croppedUrl
                                ? t('dashboard.toothSlice.loading')
                                : t('dashboard.toothSlice.noImage')}
                    </div>
                </div>
            )}
        </div>
    );
});
CroppedSlice.displayName = "CroppedSlice";

export default CroppedSlice;
