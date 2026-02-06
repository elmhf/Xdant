"use client"
import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/utils/apiClient';

const SECRET_KEY = "chams_dont_steal_me";

// استخدام Web Crypto API بدلاً من crypto-js
const generateHash = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 80);
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';

const generateCDNUrl = async (view, index, w = 500, q = 80) => {
  const raw = `${view}-${index}-${w}-${q}-${SECRET_KEY}`;
  const sig = await generateHash(raw);
  return `${BACKEND_URL}/cdn-slice?view=${view}&index=${index}&w=${w}&q=${q}&s=${sig}`;
};

const views = ['axial', 'coronal', 'sagittal'];

function useViewSlices(view, numSlices) {
  const [images, setImages] = useState([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const canvasRef = useRef();

  useEffect(() => {
    setImages([]);
    setLoadingCount(0);
    let isMounted = true;
    let loaded = 0;
    const imgs = [];

    const loadImages = async () => {
      for (let i = 0; i < numSlices; i++) {
        try {
          const img = new window.Image();
          const url = await generateCDNUrl(view, i);
          img.src = url;
          img.onload = () => {
            loaded++;
            imgs[i] = img;
            if (isMounted) {
              setImages((prev) => {
                const next = [...prev];
                next[i] = img;
                return next;
              });
              setLoadingCount(loaded);
            }
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
          };
        } catch (error) {
          console.error('Error generating URL:', error);
        }
      }
    };

    if (numSlices > 0) {
      loadImages();
    }
    return () => { isMounted = false; };
  }, [view, numSlices]);

  return {
    images,
    loadingCount,
    canvasRef,
  };
}

export default function CBCTProgressiveViewer() {
  const [crosshair, setCrosshair] = useState({ x: 0.5, y: 0.5, z: 0.5 });

  // إعدادات الـ zoom والـ pan لكل مشهد
  const [viewStates, setViewStates] = useState({
    axial: { zoom: 1, panX: 0, panY: 0 },
    coronal: { zoom: 1, panX: 0, panY: 0 },
    sagittal: { zoom: 1, panX: 0, panY: 0 }
  });

  // عدد الشرائح من السيرفر
  const [numSlicesAxial, setNumSlicesAxial] = useState(1);
  const [numSlicesCoronal, setNumSlicesCoronal] = useState(1);
  const [numSlicesSagittal, setNumSlicesSagittal] = useState(1);

  // جلب عدد الشرائح من السيرفر عند أول تحميل بدون توقيع
  useEffect(() => {
    apiClient('/slices-count')
      .then(data => {
        setNumSlicesAxial(data.axial || 1);
        setNumSlicesCoronal(data.coronal || 1);
        setNumSlicesSagittal(data.sagittal || 1);
      })
      .catch((err) => {
        setNumSlicesAxial(1);
        setNumSlicesCoronal(1);
        setNumSlicesSagittal(1);
      });
  }, []);

  // استعمل العدد الصحيح لكل view
  const axialState = useViewSlices('axial', numSlicesAxial);
  const coronalState = useViewSlices('coronal', numSlicesCoronal);
  const sagittalState = useViewSlices('sagittal', numSlicesSagittal);

  // حساب الفهارس لكل محور (مع إصلاح الترتيب)
  const indexAxial = Math.round(crosshair.z * (numSlicesAxial - 1));
  const indexCoronal = Math.round((1 - crosshair.y) * (numSlicesCoronal - 1));
  const indexSagittal = Math.round(crosshair.x * (numSlicesSagittal - 1));

  // معالجات الـ sliders (مع إصلاح الحساب)
  const handleSliderAxial = (e) => {
    const z = Number(e.target.value) / (numSlicesAxial - 1);
    setCrosshair((prev) => ({ ...prev, z }));
  };

  const handleSliderCoronal = (e) => {
    const y = 1 - (Number(e.target.value) / (numSlicesCoronal - 1));
    setCrosshair((prev) => ({ ...prev, y }));
  };

  const handleSliderSagittal = (e) => {
    const x = Number(e.target.value) / (numSlicesSagittal - 1);
    setCrosshair((prev) => ({ ...prev, x }));
  };

  // دالة تحديث حالة المشهد
  const updateViewState = (view, updates) => {
    setViewStates(prev => ({
      ...prev,
      [view]: { ...prev[view], ...updates }
    }));
  };

  // دالة إعادة تعيين الـ zoom والـ pan
  const resetView = (view) => {
    setViewStates(prev => ({
      ...prev,
      [view]: { zoom: 1, panX: 0, panY: 0 }
    }));
  };

  // معالج النقر على الـ canvas مع مراعاة الـ zoom والـ pan
  function handleCanvasClick(e, view, canvasRef) {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left);
    const canvasY = (e.clientY - rect.top);

    // تحويل إحداثيات الـ canvas إلى إحداثيات الصورة مع مراعاة الـ zoom والـ pan
    const viewState = viewStates[view];
    const canvas = canvasRef.current;

    // حساب موضع الصورة الفعلي على الـ canvas
    const imageWidth = canvas.width * viewState.zoom;
    const imageHeight = canvas.height * viewState.zoom;
    const imageX = (canvas.width - imageWidth) / 2 + viewState.panX;
    const imageY = (canvas.height - imageHeight) / 2 + viewState.panY;

    // تحويل النقرة إلى إحداثيات نسبية على الصورة
    const relativeX = (canvasX - imageX) / imageWidth;
    const relativeY = (canvasY - imageY) / imageHeight;

    // التأكد من أن الإحداثيات ضمن حدود الصورة
    if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
      return; // النقرة خارج الصورة
    }

    // التأكد من أن القيم في النطاق المحدد
    const clampedX = Math.max(0, Math.min(1, relativeX));
    const clampedY = Math.max(0, Math.min(1, relativeY));

    if (view === 'axial') {
      setCrosshair((prev) => ({
        ...prev,
        x: clampedX,
        y: 1 - clampedY
      }));
    } else if (view === 'coronal') {
      setCrosshair((prev) => ({
        ...prev,
        x: clampedX,
        z: 1 - clampedY
      }));
    } else if (view === 'sagittal') {
      setCrosshair((prev) => ({
        ...prev,
        y: 1 - clampedX,
        z: 1 - clampedY
      }));
    }
  }

  return (
    <div className="flex flex-row gap-4 w-full justify-center items-start p-4 bg-gray-900 min-h-screen">
      {/* Axial View */}
      <ViewerPanel
        title="AXIAL"
        currentSlice={indexAxial}
        maxSlice={numSlicesAxial - 1}
        canvasRef={axialState.canvasRef}
        image={axialState.images[indexAxial]}
        crosshair={crosshair}
        onCanvasClick={(e) => handleCanvasClick(e, 'axial', axialState.canvasRef)}
        onSliderChange={handleSliderAxial}
        loadingCount={axialState.loadingCount}
        numSlices={numSlicesAxial}
        view="axial"
        viewState={viewStates.axial}
        updateViewState={updateViewState}
        resetView={resetView}
      />

      {/* Coronal View */}
      <ViewerPanel
        title="CORONAL"
        currentSlice={indexCoronal}
        maxSlice={numSlicesCoronal - 1}
        canvasRef={coronalState.canvasRef}
        image={coronalState.images[indexCoronal]}
        crosshair={crosshair}
        onCanvasClick={(e) => handleCanvasClick(e, 'coronal', coronalState.canvasRef)}
        onSliderChange={handleSliderCoronal}
        loadingCount={coronalState.loadingCount}
        numSlices={numSlicesCoronal}
        view="coronal"
        viewState={viewStates.coronal}
        updateViewState={updateViewState}
        resetView={resetView}
      />

      {/* Sagittal View */}
      <ViewerPanel
        title="SAGITTAL"
        currentSlice={indexSagittal}
        maxSlice={numSlicesSagittal - 1}
        canvasRef={sagittalState.canvasRef}
        image={sagittalState.images[indexSagittal]}
        crosshair={crosshair}
        onCanvasClick={(e) => handleCanvasClick(e, 'sagittal', sagittalState.canvasRef)}
        onSliderChange={handleSliderSagittal}
        loadingCount={sagittalState.loadingCount}
        numSlices={numSlicesSagittal}
        view="sagittal"
        viewState={viewStates.sagittal}
        updateViewState={updateViewState}
        resetView={resetView}
      />

      {/* عرض إجمالي الإحداثيات في الأسفل */}
      <div className="mt-6 bg-gray-800 p-4 rounded-2xl shadow-lg">
        <h4 className="text-white font-bold text-center mb-3">Global Coordinates</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-red-900 p-3 rounded">
            <div className="text-red-200 font-bold">X-Axis</div>
            <div className="text-white text-lg">{crosshair.x.toFixed(3)}</div>
            <div className="text-red-300 text-xs">Left ↔ Right</div>
          </div>
          <div className="bg-green-900 p-3 rounded">
            <div className="text-green-200 font-bold">Y-Axis</div>
            <div className="text-white text-lg">{crosshair.y.toFixed(3)}</div>
            <div className="text-green-300 text-xs">Anterior ↔ Posterior</div>
          </div>
          <div className="bg-blue-900 p-3 rounded">
            <div className="text-blue-200 font-bold">Z-Axis</div>
            <div className="text-white text-lg">{crosshair.z.toFixed(3)}</div>
            <div className="text-blue-300 text-xs">Superior ↔ Inferior</div>
          </div>
        </div>

        {/* معلومات إضافية عن الفهارس */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
          <div className="text-red-300">
            <div>Sagittal Slice: {indexSagittal}</div>
            <div>({numSlicesSagittal > 1 ? ((indexSagittal / (numSlicesSagittal - 1)) * 100).toFixed(1) : 0}%)</div>
          </div>
          <div className="text-green-300">
            <div>Coronal Slice: {indexCoronal}</div>
            <div>({numSlicesCoronal > 1 ? ((indexCoronal / (numSlicesCoronal - 1)) * 100).toFixed(1) : 0}%)</div>
          </div>
          <div className="text-blue-300">
            <div>Axial Slice: {indexAxial}</div>
            <div>({numSlicesAxial > 1 ? ((indexAxial / (numSlicesAxial - 1)) * 100).toFixed(1) : 0}%)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون لوحة العارض مع إضافة أزرار التحكم بالـ zoom
function ViewerPanel({
  title,
  currentSlice,
  maxSlice,
  canvasRef,
  image,
  crosshair,
  onCanvasClick,
  onSliderChange,
  loadingCount,
  numSlices,
  view,
  viewState,
  updateViewState,
  resetView
}) {
  return (
    <div className="flex flex-col items-center gap-3 bg-gray-800 p-4 rounded-2xl shadow-lg w-[400px]">
      <h3 className="text-white font-bold text-center text-lg">
        {title}
        <br />
        <span className="text-sm text-gray-300">
          Slice: {currentSlice} / {maxSlice}
        </span>
      </h3>

      {/* أزرار التحكم بالـ zoom */}
      <div className="flex gap-2 items-center">
        <button
          onClick={() => updateViewState(view, { zoom: Math.min(viewState.zoom * 1.2, 5) })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          title="Zoom In"
        >
          🔍+
        </button>
        <button
          onClick={() => updateViewState(view, { zoom: Math.max(viewState.zoom / 1.2, 0.1) })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          title="Zoom Out"
        >
          🔍-
        </button>
        <button
          onClick={() => resetView(view)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
          title="Reset View"
        >
          🔄
        </button>
        <span className="text-white text-xs ml-2">
          {(viewState.zoom * 100).toFixed(0)}%
        </span>
      </div>

      {!image ? (
        <div className="text-white bg-gray-700 w-80 h-80 flex items-center justify-center rounded">
          Loading slices...
        </div>
      ) : (
        <ViewCanvas
          canvasRef={canvasRef}
          image={image}
          crosshair={crosshair}
          onClick={onCanvasClick}
          view={view}
          viewState={viewState}
          updateViewState={updateViewState}
          setCrosshair={setCrosshair}
        />
      )}

      <input
        type="range"
        min={0}
        max={maxSlice}
        value={currentSlice}
        onChange={onSliderChange}
        className="w-full h-2 bg-gray-700 rounded-2xl appearance-none cursor-pointer"
        disabled={!image}
        style={{
          background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${maxSlice > 0 ? (currentSlice / maxSlice) * 100 : 0}%, #374151 ${maxSlice > 0 ? (currentSlice / maxSlice) * 100 : 0}%, #374151 100%)`
        }}
      />

      <div className="text-xs text-gray-400">
        Loaded: {loadingCount} / {numSlices}
        {loadingCount < numSlices && (
          <span className="ml-2 text-yellow-400">
            ({numSlices > 0 ? Math.round((loadingCount / numSlices) * 100) : 0}%)
          </span>
        )}
      </div>

      {/* عرض الإحداثيات لكل مشهد */}
      <div className="text-xs text-green-400 bg-gray-700 p-2 rounded text-center">
        {view === 'axial' && (
          <div>
            <div>Axial View (Top-Down):</div>
            <div>L/R: {crosshair.x.toFixed(3)} | A/P: {crosshair.y.toFixed(3)}</div>
            <div>S/I slice: {crosshair.z.toFixed(3)}</div>
          </div>
        )}
        {view === 'coronal' && (
          <div>
            <div>Coronal View (Front-Back):</div>
            <div>L/R: {crosshair.x.toFixed(3)} | S/I: {crosshair.z.toFixed(3)}</div>
            <div>A/P slice: {crosshair.y.toFixed(3)}</div>
          </div>
        )}
        {view === 'sagittal' && (
          <div>
            <div>Sagittal View (Side):</div>
            <div>A/P: {crosshair.y.toFixed(3)} | S/I: {crosshair.z.toFixed(3)}</div>
            <div>L/R slice: {crosshair.x.toFixed(3)}</div>
          </div>
        )}
      </div>

      {/* معلومات الـ zoom والـ pan */}
      <div className="text-xs text-blue-300 bg-gray-700 p-2 rounded text-center w-full">
        <div>Zoom: {(viewState.zoom * 100).toFixed(0)}%</div>
        <div>Pan: X:{viewState.panX.toFixed(0)}, Y:{viewState.panY.toFixed(0)}</div>
      </div>
    </div>
  );
}

// مكون الـ Canvas المحسن مع دعم الـ zoom والـ pan
function ViewCanvas({ canvasRef, image, crosshair, onClick, view, viewState, updateViewState, setCrosshair }) {
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isDraggingCrosshair, setIsDraggingCrosshair] = useState(false);

  // معالج بداية السحب
  const handleMouseDown = (e) => {
    if (e.button === 0) { // الزر الأيسر للنقر
      // لا نبدأ السحب، نترك النقر يعمل
      return;
    }
    if (e.button === 2 || e.ctrlKey) { // الزر الأيمن أو Ctrl + النقر للسحب
      e.preventDefault();
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  // معالج السحب
  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      updateViewState(view, {
        panX: viewState.panX + deltaX,
        panY: viewState.panY + deltaY
      });

      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  // معالج انتهاء السحب
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // حساب موضع crosshair الحالي على الـ canvas (نفس منطق الرسم)
  function getCrosshairCanvasCoords() {
    const canvas = canvasRef.current;
    if (!canvas) return { crossX: 0, crossY: 0 };
    const imageWidth = canvas.width * viewState.zoom;
    const imageHeight = canvas.height * viewState.zoom;
    const imageX = (canvas.width - imageWidth) / 2 + viewState.panX;
    const imageY = (canvas.height - imageHeight) / 2 + viewState.panY;
    let crossX, crossY;
    switch (view) {
      case 'axial':
        crossX = crosshair.x * imageWidth + imageX;
        crossY = (1 - crosshair.y) * imageHeight + imageY;
        break;
      case 'coronal':
        crossX = crosshair.x * imageWidth + imageX;
        crossY = (1 - crosshair.z) * imageHeight + imageY;
        break;
      case 'sagittal':
        crossX = (1 - crosshair.y) * imageWidth + imageX;
        crossY = (1 - crosshair.z) * imageHeight + imageY;
        break;
      default:
        crossX = 0; crossY = 0;
    }
    return { crossX, crossY };
  }

  // عند الضغط على الـ canvas
  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const { crossX, crossY } = getCrosshairCanvasCoords();
    // إذا كان الضغط قريب من crosshair (أقل من 12px)
    if (Math.hypot(mouseX - crossX, mouseY - crossY) < 12) {
      setIsDraggingCrosshair(true);
    } else {
      // إذا لم يكن قريب من crosshair، نفذ onClick العادي (لتغيير crosshair بالنقر)
      onClick(e);
    }
  };

  // أثناء السحب
  const handleCanvasMouseMove = (e) => {
    if (!isDraggingCrosshair) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const canvas = canvasRef.current;
    const imageWidth = canvas.width * viewState.zoom;
    const imageHeight = canvas.height * viewState.zoom;
    const imageX = (canvas.width - imageWidth) / 2 + viewState.panX;
    const imageY = (canvas.height - imageHeight) / 2 + viewState.panY;
    // تحويل موضع الفأرة إلى إحداثيات نسبية
    const relativeX = (mouseX - imageX) / imageWidth;
    const relativeY = (mouseY - imageY) / imageHeight;
    const clampedX = Math.max(0, Math.min(1, relativeX));
    const clampedY = Math.max(0, Math.min(1, relativeY));
    // تحديث crosshair حسب نوع view
    if (view === 'axial') {
      setCrosshair((prev) => ({ ...prev, x: clampedX, y: 1 - clampedY }));
    } else if (view === 'coronal') {
      setCrosshair((prev) => ({ ...prev, x: clampedX, z: 1 - clampedY }));
    } else if (view === 'sagittal') {
      setCrosshair((prev) => ({ ...prev, y: 1 - clampedX, z: 1 - clampedY }));
    }
  };

  // عند الإفلات
  const handleCanvasMouseUp = () => {
    setIsDraggingCrosshair(false);
  };

  // إضافة event listeners للسحب
  useEffect(() => {
    if (isDraggingCrosshair) {
      window.addEventListener('mousemove', handleCanvasMouseMove);
      window.addEventListener('mouseup', handleCanvasMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleCanvasMouseMove);
      window.removeEventListener('mouseup', handleCanvasMouseUp);
    };
  }, [isDraggingCrosshair, view, viewState]);

  // إضافة event listeners للسحب
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, lastMousePos, view, viewState, updateViewState]);

  // إضافة event listeners للسحب
  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // مسح الـ canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // حساب أبعاد الصورة مع الـ zoom
    const imageWidth = canvas.width * viewState.zoom;
    const imageHeight = canvas.height * viewState.zoom;
    const imageX = (canvas.width - imageWidth) / 2 + viewState.panX;
    const imageY = (canvas.height - imageHeight) / 2 + viewState.panY;

    // رسم الصورة مع الـ zoom والـ pan
    ctx.drawImage(image, imageX, imageY, imageWidth, imageHeight);

    // رسم الـ crosshair بإحداثيات صحيحة مع مراعاة الـ zoom والـ pan
    let crossX, crossY;

    switch (view) {
      case 'axial':
        crossX = crosshair.x * imageWidth + imageX;
        crossY = (1 - crosshair.y) * imageHeight + imageY;
        break;
      case 'coronal':
        crossX = crosshair.x * imageWidth + imageX;
        crossY = (1 - crosshair.z) * imageHeight + imageY;
        break;
      case 'sagittal':
        crossX = (1 - crosshair.y) * imageWidth + imageX;
        crossY = (1 - crosshair.z) * imageHeight + imageY;
        break;
      default:
        return;
    }

    // رسم الـ crosshair فقط إذا كان ضمن حدود الـ canvas
    if (crossX >= 0 && crossX <= canvas.width && crossY >= 0 && crossY <= canvas.height) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;

      ctx.beginPath();
      // خط عمودي
      ctx.moveTo(crossX, 0);
      ctx.lineTo(crossX, canvas.height);
      // خط أفقي
      ctx.moveTo(0, crossY);
      ctx.lineTo(canvas.width, crossY);
      ctx.stroke();

      // رسم نقطة تقاطع
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(crossX, crossY, 3, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();
    }
  }, [image, crosshair, view, viewState]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={320}
      className="rounded border-2 border-gray-600 hover:border-red-400 transition-colors duration-200"
      style={{
        cursor: isDraggingCrosshair ? 'grabbing' : isDragging ? 'grabbing' : 'crosshair',
        userSelect: 'none'
      }}
      onClick={onClick}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleMouseMove}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}