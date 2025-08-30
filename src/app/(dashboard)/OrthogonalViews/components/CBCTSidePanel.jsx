import React, { useRef, useEffect, useState } from 'react';
import { useImageStore } from '../stores/imageStore';
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';

function getNumSlices(view, numSlicesAxial, numSlicesCoronal, numSlicesSagittal) {
  if (view === 'axial') return numSlicesAxial;
  if (view === 'coronal') return numSlicesCoronal;
  if (view === 'sagittal') return numSlicesSagittal;
  return 1;
}

function getIndexForView(view, crosshair, numSlicesAxial, numSlicesCoronal, numSlicesSagittal) {
  if (view === 'axial') return Math.round(crosshair.z * (numSlicesAxial - 1));
  if (view === 'coronal') return Math.round((1 - crosshair.y) * (numSlicesCoronal - 1));
  if (view === 'sagittal') return Math.round(crosshair.x * (numSlicesSagittal - 1));
  return 0;
}

function getCrosshairCoords(view, crosshair, canvasWidth, canvasHeight) {
  let crossX = 0, crossY = 0;
  if (view === 'axial') {
    crossX = crosshair.x * canvasWidth;
    crossY = (1 - crosshair.y) * canvasHeight;
  } else if (view === 'coronal') {
    crossX = crosshair.x * canvasWidth;
    crossY = (1 - crosshair.z) * canvasHeight;
  } else if (view === 'sagittal') {
    crossX = (1 - crosshair.y) * canvasWidth;
    crossY = (1 - crosshair.z) * canvasHeight;
  }
  return { crossX, crossY };
}

function StoreViewCanvas({ view, crosshair, numSlicesAxial, numSlicesCoronal, numSlicesSagittal }) {
  const containerRef = useRef(null);
  const { getViewImages, getViewLoading } = useImageStore();
  const numSlices = getNumSlices(view, numSlicesAxial, numSlicesCoronal, numSlicesSagittal);
  const index = getIndexForView(view, crosshair, numSlicesAxial, numSlicesCoronal, numSlicesSagittal);
  const images = getViewImages(view);
  const isLoading = getViewLoading(view);
  const [mainImageObj, setMainImageObj] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 200, height: 200 });

  useEffect(() => {
    const img = images[index];
    if (!img) return setMainImageObj(null);
    setMainImageObj(img);
  }, [images, index]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !mainImageObj) return;
  
      const containerWidth = containerRef.current.clientWidth;
      const ratio = mainImageObj.naturalHeight / mainImageObj.naturalWidth;
  
      const newWidth = containerWidth;
      const newHeight = containerWidth * ratio;
  
      // ✅ prevent infinite loop
      if (
        Math.abs(canvasSize.width - newWidth) > 1 ||
        Math.abs(canvasSize.height - newHeight) > 1
      ) {
        setCanvasSize({ width: newWidth, height: newHeight });
      }
    };
  
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [mainImageObj, canvasSize]);
  

  const { crossX, crossY } = getCrosshairCoords(view, crosshair, canvasSize.width, canvasSize.height);

  return (
    <div ref={containerRef} className="relative w-full">
      <Stage width={canvasSize.width} height={canvasSize.height} className="rounded-xl border bg-white shadow">
        <Layer>
          {mainImageObj && (
            <KonvaImage
              image={mainImageObj}
              width={canvasSize.width}
              height={canvasSize.height}
              x={0}
              y={0}
            />
          )}
          <Line
            points={[crossX, 0, crossX, canvasSize.height]}
            stroke="#ef4444"
            strokeWidth={2}
            dash={[5, 5]}
          />
          <Line
            points={[0, crossY, canvasSize.width, crossY]}
            stroke="#ef4444"
            strokeWidth={2}
            dash={[5, 5]}
          />
          <Circle
            x={crossX}
            y={crossY}
            radius={3}
            fill="#ef4444"
          />
        </Layer>
      </Stage>

      <div className="absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded backdrop-blur-sm bg-blue-50 text-blue-700 border border-blue-200">
        {view.charAt(0).toUpperCase() + view.slice(1)} View
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded-xl">
          <div className="animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 w-8 h-8"></div>
        </div>
      )}
    </div>
  );
}


export default function MedicalView({ mainView, crosshair, setCrosshair, numSlicesAxial, numSlicesCoronal, numSlicesSagittal }) {
  const panelViews = ["axial", "coronal", "sagittal"].filter(v => v !== mainView);
  return (
    <aside  className="w-full max-h-[100%] flex flex-col items-center p-4 gap-6 bg-white border-r border-gray-200">
      {panelViews.map(view => (
        <StoreViewCanvas
          key={view}
          view={view}
          crosshair={crosshair}
          numSlicesAxial={numSlicesAxial}
          numSlicesCoronal={numSlicesCoronal}
          numSlicesSagittal={numSlicesSagittal}
          size={200}
        />
      ))}
    </aside>
  );
}
