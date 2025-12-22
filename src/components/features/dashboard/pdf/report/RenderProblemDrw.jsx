'use client';
import React, { useRef, useContext, useMemo } from "react";
import { Stage, Layer, Image, Group } from "react-konva";
import { PDFContext } from "./report";
import { COLOR_PALETTE, DENTAL_COLORS } from "./constants";
import { useImageLoader } from "./hooks/useImageLoader";
import { useContainerScale } from "./hooks/useContainerScale";
import JawRenderer from "./components/JawRenderer";
import ToothRenderer from "./components/ToothRenderer";

// المكون الرئيسي
const RenderProblemDrw = ({
  image,
  tooth = [],
  ShowSetting = {},
  Jaw,
  staticImage
}) => {
  const { contextPDFRef } = useContext(PDFContext);
  const containerRef = useRef(null);

  // تنظيف بيانات الفك
  const JAw = useMemo(() =>
    Jaw || { upperJaw: { mask: [] }, lowerJaw: { mask: [] } }
    , [Jaw]);

  // استخدام الـ Hooks المخصصة
  const { imgObj, imgSize, isLoading, error } = useImageLoader(image?.data_url);
  const { containerWidth, scale } = useContainerScale(containerRef, imgObj);

  // حساب الارتفاع المقيس
  const scaledHeight = useMemo(() =>
    imgSize.height * scale
    , [imgSize.height, scale]);

  // معالجة حالات التحميل والأخطاء
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-2xl">
        <div className="text-gray-500">جاري تحميل الصورة...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-2xl border border-red-200">
        <div className="text-red-500">خطأ في تحميل الصورة: {error}</div>
      </div>
    );
  }

  if (!imgObj) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-2xl">
        <div className="text-gray-500">لا توجد صورة للعرض</div>
      </div>
    );
  }

  // Render Static Image for PDF Export
  if (staticImage) {
    return (
      <div
        className="w-full overflow-hidden bg-gray-50 relative rounded-xl shadow-lg border border-gray-200"
        style={{ minHeight: '200px', backgroundColor: '#fafafa' }}
      >
        <img
          src={staticImage}
          alt="Dental Analysis"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden bg-gray-50 relative rounded-xl shadow-lg border border-gray-200"
      style={{
        minHeight: '200px',
        backgroundColor: '#fafafa'
      }}
    >
      <Stage
        ref={(el) => {
          if (contextPDFRef?.current) {
            contextPDFRef.current[1] = el;
          }
        }}
        width={containerWidth}
        height={scaledHeight}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer>
          <Group>
            {/* الصورة الأساسية */}
            <Image
              image={imgObj}
              width={imgSize.width}
              height={imgSize.height}
            />

            {/* رسم الفك */}
            <JawRenderer
              JAw={JAw}
              showSettings={ShowSetting}
              scale={scale}
            />

            {/* رسم الأسنان */}
            {tooth.map((toothData, index) => (
              <ToothRenderer
                key={`tooth-${index}`}
                tooth={toothData}
                index={index}
                showSettings={ShowSetting}
                scale={scale}
              />
            ))}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};

export default RenderProblemDrw;
export { COLOR_PALETTE, DENTAL_COLORS };