'use client';
import React, { useEffect, useState, useRef, useContext, useCallback, useMemo } from "react";
import { Stage, Layer, Image, Line, Group } from "react-konva";
import { PDFContext } from "./report";

// نظام ألوان محسن ومنظم
const COLOR_PALETTE = {
  // الأسنان - درجات طبيعية مريحة
  tooth: {
    fill: 'rgba(248, 248, 246, 0.4)',
    stroke: '#E8E6E3',
    strokeWidth: 1.2,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 3
  },

  // الفك - لون طبيعي هادئ
  jaw: {
    fill: 'rgba(235, 220, 200, 0.25)',
    stroke: '#D4C4A8',
    strokeWidth: 1.8,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowBlur: 2
  },

  // الجذر - بني طبيعي
  root: {
    fill: 'rgba(180, 140, 100, 0.3)',
    stroke: '#B48C64',
    strokeWidth: 1.5,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 2
  },

  // التاج - ذهبي أنيق
  crown: {
    fill: 'rgba(255, 223, 150, 0.35)',
    stroke: '#E6C86E',
    strokeWidth: 1.6,
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowBlur: 3
  },

  // حالات الأسنان - ألوان واضحة ومميزة
  healthy: {
    fill: 'rgba(76, 175, 80, 0.25)',
    stroke: '#4CAF50',
    strokeWidth: 1.8,
    shadowColor: 'rgba(76, 175, 80, 0.2)',
    shadowBlur: 4
  },

  treated: {
    fill: 'rgba(33, 150, 243, 0.25)',
    stroke: '#2196F3',
    strokeWidth: 1.8,
    shadowColor: 'rgba(33, 150, 243, 0.2)',
    shadowBlur: 4
  },

  missing: {
    fill: 'rgba(158, 158, 158, 0.2)',
    stroke: '#9E9E9E',
    strokeWidth: 1.5,
    lineDash: [8, 4],
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 2
  },

  suspicious: {
    fill: 'rgba(255, 152, 0, 0.3)',
    stroke: '#FF9800',
    strokeWidth: 2.2,
    shadowColor: 'rgba(255, 152, 0, 0.3)',
    shadowBlur: 5
  },

  unhealthy: {
    fill: 'rgba(244, 67, 54, 0.3)',
    stroke: '#F44336',
    strokeWidth: 2.4,
    shadowColor: 'rgba(244, 67, 54, 0.2)',
    shadowBlur: 6
  },

  // مشاكل الأسنان - ألوان مميزة لكل نوع
  caries: {
    fill: 'rgba(211, 47, 47, 0.4)',
    stroke: '#D32F2F',
    strokeWidth: 2.5,
    shadowColor: 'rgba(211, 47, 47, 0.3)',
    shadowBlur: 5
  },

  filling: {
    fill: 'rgba(25, 118, 210, 0.35)',
    stroke: '#1976D2',
    strokeWidth: 2.2,
    shadowColor: 'rgba(25, 118, 210, 0.2)',
    shadowBlur: 4
  },

  endodontic: {
    fill: 'rgba(142, 36, 170, 0.35)',
    stroke: '#8E24AA',
    strokeWidth: 2.2,
    shadowColor: 'rgba(142, 36, 170, 0.2)',
    shadowBlur: 4
  },

  implant: {
    fill: 'rgba(96, 125, 139, 0.3)',
    stroke: '#607D8B',
    strokeWidth: 2.0,
    shadowColor: 'rgba(96, 125, 139, 0.2)',
    shadowBlur: 3
  },

  extraction: {
    fill: 'rgba(183, 28, 28, 0.4)',
    stroke: '#B71C1C',
    strokeWidth: 2.6,
    lineDash: [6, 3],
    shadowColor: 'rgba(183, 28, 28, 0.3)',
    shadowBlur: 6
  }
};

// ألوان سريعة للمرجع
const DENTAL_COLORS = {
  // حالات الأسنان
  healthy: '#4CAF50',
  treated: '#2196F3',
  missing: '#9E9E9E',
  suspicious: '#FF9800',
  unhealthy: '#F44336',

  // عناصر الأسنان
  tooth: '#E8E6E3',
  jaw: '#D4C4A8',
  root: '#B48C64',
  crown: '#E6C86E',

  // المشاكل
  caries: '#D32F2F',
  filling: '#1976D2',
  endodontic: '#8E24AA',
  implant: '#607D8B',
  extraction: '#B71C1C'
};

// Hook مخصص لإدارة الصورة
const useImageLoader = (imageUrl) => {
  const [imgState, setImgState] = useState({
    imgObj: null,
    imgSize: { width: 0, height: 0 },
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!imageUrl) {
      setImgState(prev => ({ ...prev, isLoading: false, error: 'No image URL provided' }));
      return;
    }

    const img = new window.Image();

    img.onload = () => {
      setImgState({
        imgObj: img,
        imgSize: { width: img.naturalWidth, height: img.naturalHeight },
        isLoading: false,
        error: null
      });
    };

    img.onerror = () => {
      setImgState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load image'
      }));
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return imgState;
};

// Hook مخصص لإدارة حجم الحاوية والمقياس
const useContainerScale = (containerRef, imgObj) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [scale, setScale] = useState(1);

  const updateSize = useCallback(() => {
    if (containerRef.current && imgObj) {
      const newContainerWidth = containerRef.current.clientWidth;
      setContainerWidth(newContainerWidth);

      const newScale = Math.min(newContainerWidth / imgObj.naturalWidth, 1);
      setScale(newScale);
    }
  }, [imgObj]);

  useEffect(() => {
    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [updateSize]);

  return { containerWidth, scale };
};

// مكون فرعي لرسم الفك
const JawRenderer = React.memo(({ JAw, showSettings, scale }) => {
  const adjustCoordinates = useCallback((mask) => {
    if (!Array.isArray(mask)) return [];
    return mask.flat();
  }, []);

  const createLineProps = useCallback((colorConfig, currentScale) => {
    const props = {
      fill: colorConfig.fill,
      stroke: colorConfig.stroke,
      strokeWidth: colorConfig.strokeWidth / currentScale,
      perfectDrawEnabled: false,
      listening: false,
    };

    if (colorConfig.shadowColor) {
      props.shadowColor = colorConfig.shadowColor;
      props.shadowBlur = (colorConfig.shadowBlur || 3) / currentScale;
      props.shadowOffset = { x: 1 / currentScale, y: 1 / currentScale };
    }

    if (colorConfig.lineDash) {
      props.dash = colorConfig.lineDash.map(d => d / currentScale);
    }

    return props;
  }, []);

  if (!showSettings?.CBCTAnalysis?.showJaw) return null;

  return (
    <>
      {/* الفك العلوي */}
      {showSettings?.Jaw?.showUpperJaw && JAw.upperJaw?.mask?.length > 0 && (
        <Line
          points={adjustCoordinates(JAw.upperJaw.mask)}
          {...createLineProps(COLOR_PALETTE.jaw, scale)}
          closed
        />
      )}

      {/* الفك السفلي */}
      {showSettings?.Jaw?.showLowerJaw && JAw.lowerJaw?.mask?.length > 0 && (
        <Line
          points={adjustCoordinates(JAw.lowerJaw.mask)}
          {...createLineProps(COLOR_PALETTE.jaw, scale)}
          closed
        />
      )}
    </>
  );
});

// مكون فرعي لرسم المشاكل
const ProblemsRenderer = React.memo(({ problems, showSettings, scale, adjustCoordinates, createLineProps }) => {
  const getProblemColor = useCallback((problemType) => {
    if (!problemType) return COLOR_PALETTE.caries;
    const type = problemType.toLowerCase();
    return COLOR_PALETTE[type] || COLOR_PALETTE.caries;
  }, []);

  return (
    <>
      {problems?.filter(problem => showSettings?.problems?.[`show${problem.type}`])
        .map((problem, pIndex) => {
          const problemColor = getProblemColor(problem.type);
          return (
            <Line
              key={`problem-${pIndex}`}
              points={adjustCoordinates(problem.mask)}
              {...createLineProps(problemColor, scale)}
              closed
            />
          );
        })}
    </>
  );
});

// مكون فرعي لرسم السن الواحد
const ToothRenderer = React.memo(({ tooth, index, showSettings, scale }) => {
  const adjustCoordinates = useCallback((mask) => {
    if (!Array.isArray(mask)) return [];
    return mask.flat();
  }, []);

  const createLineProps = useCallback((colorConfig, currentScale) => {
    const props = {
      fill: colorConfig.fill,
      stroke: colorConfig.stroke,
      strokeWidth: colorConfig.strokeWidth / currentScale,
      perfectDrawEnabled: false,
      listening: false,
    };

    if (colorConfig.shadowColor) {
      props.shadowColor = colorConfig.shadowColor;
      props.shadowBlur = (colorConfig.shadowBlur || 3) / currentScale;
      props.shadowOffset = { x: 1 / currentScale, y: 1 / currentScale };
    }

    if (colorConfig.lineDash) {
      props.dash = colorConfig.lineDash.map(d => d / currentScale);
    }

    return props;
  }, []);

  const getToothColor = useCallback((toothData) => {
    if (toothData.condition) {
      const condition = toothData.condition.toLowerCase();
      return COLOR_PALETTE[condition] || COLOR_PALETTE.tooth;
    }
    return COLOR_PALETTE.tooth;
  }, []);

  if (!tooth.teeth_mask) return null;

  const toothColor = getToothColor(tooth);

  return (
    <React.Fragment key={`tooth-${index}`}>
      {/* محيط السن */}
      {showSettings?.CBCTAnalysis?.showTeeth && (
        <Line
          points={adjustCoordinates(tooth.teeth_mask)}
          {...createLineProps(toothColor, scale)}
          closed
        />
      )}

      {/* المشاكل */}
      <ProblemsRenderer
        problems={tooth.problems}
        showSettings={showSettings}
        scale={scale}
        adjustCoordinates={adjustCoordinates}
        createLineProps={createLineProps}
      />

      {/* الجذر */}
      {showSettings?.CBCTAnalysis?.showRoots && tooth.Root?.mask && (
        <Line
          points={adjustCoordinates(tooth.Root.mask)}
          {...createLineProps(COLOR_PALETTE.root, scale)}
          closed
        />
      )}

      {/* التاج */}
      {showSettings?.CBCTAnalysis?.showCrown && tooth.Crown?.mask && (
        <Line
          points={adjustCoordinates(tooth.Crown.mask)}
          {...createLineProps(COLOR_PALETTE.crown, scale)}
          closed
        />
      )}
    </React.Fragment>
  );
});

// المكون الرئيسي
const RenderProblemDrw = ({
  image,
  tooth = [],
  ShowSetting = {},
  Jaw
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
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-gray-500">جاري تحميل الصورة...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-500">خطأ في تحميل الصورة: {error}</div>
      </div>
    );
  }

  if (!imgObj) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-gray-500">لا توجد صورة للعرض</div>
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