import React, { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import getStroke from "perfect-freehand";
import useUserStore from "./store/userStore";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";

// Utility function to convert stroke to SVG path
function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      return i === 0
        ? `M ${x0.toFixed(2)} ${y0.toFixed(2)}`
        : `${acc} ${arr.length > 2 && i === arr.length - 1 ? 'Z' : `L ${x1.toFixed(2)} ${y1.toFixed(2)}`}`;
    },
    ""
  );
  return d;
}

// Better stroke options for different scenarios
const getStrokeOptions = (pressure = 0.5, velocity = 1) => ({
  size: Math.max(1, Math.min(6, 3 + pressure * 2)), // Dynamic size based on pressure
  thinning: 0.7,
  smoothing: 0.8,
  streamline: 0.6,
  easing: (t) => Math.sin((t * Math.PI) / 2), // Smooth easing
  start: {
    taper: 5,
    cap: true
  },
  end: {
    taper: 5,
    cap: true
  }
});

// Helper: Convert SVG element to PNG Blob
function svgToPngBlob(svgElement, width = 400, height = 300) {
  return new Promise((resolve, reject) => {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, "image/png");
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Loading Spinner Component
const LoadingSpinner = ({ size = "w-8 h-8" }) => (
  <div className={`animate-spin rounded-full ${size} border-2 border-purple-300 border-t-purple-600`}></div>
);

export default function SignatureCard({ signature, onSave }) {
  const [editing, setEditing] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pressure, setPressure] = useState(0.5);
  const [optimisticSignature, setOptimisticSignature] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // حالة الحفظ المحلية
  const [isUploading, setIsUploading] = useState(false);

  const svgRef = useRef(null);
  const fileInputRef = useRef(null);
  const animationFrame = useRef(null);
  const lastPoint = useRef(null);
  const strokeStartTime = useRef(null);

  const changeSignature = useUserStore(state => state.changeSignature);
  const { pushNotification } = useNotification();


  // Convert screen coordinates to SVG coordinates
  const getSVGPoint = useCallback((evt) => {
    const svg = svgRef.current;
    if (!svg) return null;

    let clientX, clientY, eventPressure = 0.5;

    if (evt.type.startsWith('touch')) {
      const touch = evt.touches[0] || evt.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
      eventPressure = touch.force || 0.5;
    } else {
      clientX = evt.clientX;
      clientY = evt.clientY;
      eventPressure = evt.pressure || 0.5;
    }

    // Use SVG's built-in coordinate transformation
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    // Calculate velocity if we have a previous point
    let velocity = 1;
    if (lastPoint.current && strokeStartTime.current) {
      const timeDelta = Date.now() - strokeStartTime.current;
      const distance = Math.hypot(
        svgP.x - lastPoint.current[0],
        svgP.y - lastPoint.current[1]
      );
      velocity = Math.min(2, Math.max(0.5, distance / Math.max(timeDelta, 1)));
    }

    const point = [
      Math.max(0, Math.min(400, svgP.x)),
      Math.max(0, Math.min(300, svgP.y)),
      eventPressure,
      velocity,
      Date.now()
    ];

    lastPoint.current = point;
    return point;
  }, []);

  const startDrawing = useCallback((evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const point = getSVGPoint(evt);
    if (!point) return;

    setCurrentStroke([point]);
    setIsDrawing(true);
    strokeStartTime.current = Date.now();
    setPressure(point[2]);

    // Add slight vibration for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [getSVGPoint]);

  const continueDrawing = useCallback((evt) => {
    if (!isDrawing) return;

    evt.preventDefault();
    evt.stopPropagation();

    // Cancel previous animation frame
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    animationFrame.current = requestAnimationFrame(() => {
      const point = getSVGPoint(evt);
      if (!point) return;

      setCurrentStroke(prev => {
        if (prev.length > 0) {
          const lastPoint = prev[prev.length - 1];
          const distance = Math.hypot(
            point[0] - lastPoint[0],
            point[1] - lastPoint[1]
          );

          // Skip points that are too close to reduce noise
          if (distance < 2) return prev;

          // Limit stroke length to prevent memory issues
          if (prev.length > 1000) {
            return [...prev.slice(100), point];
          }
        }

        return [...prev, point];
      });

      setPressure(point[2]);
    });
  }, [isDrawing, getSVGPoint]);

  const finishDrawing = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    if (currentStroke.length > 0) {
      // Only save strokes with minimum length to avoid accidental dots
      if (currentStroke.length >= 3) {
        setStrokes(prev => [...prev, currentStroke]);
      } else if (currentStroke.length === 1) {
        // Handle single dots
        const point = currentStroke[0];
        setStrokes(prev => [...prev, [
          point,
          [point[0] + 0.1, point[1] + 0.1, point[2], point[3], point[4]]
        ]]);
      }
    }

    setCurrentStroke([]);
    setIsDrawing(false);
    lastPoint.current = null;
    strokeStartTime.current = null;
    setPressure(0.5);
  }, [currentStroke]);

  const clearSignature = useCallback(() => {
    setStrokes([]);
    setCurrentStroke([]);
    setPressure(0.5);
  }, []);

  const saveSignature = useCallback(async () => {
    const hasContent = strokes.length > 0 || currentStroke.length > 0;
    if (!hasContent) return;

    const svg = svgRef.current;
    if (!svg) return;

    // تفعيل حالة الحفظ فوراً
    setIsSaving(true);

    try {
      // Convert SVG to PNG Blob
      const pngBlob = await svgToPngBlob(svg, 400, 300);
      const file = new File([pngBlob], "signature.png", { type: "image/png" });

      // Show optimistic preview
      const tempUrl = URL.createObjectURL(pngBlob);
      setOptimisticSignature(tempUrl);
      setIsUploading(true);

      // Save signature using the store (upload to backend)
      const result = await changeSignature(file);

      setIsUploading(false);
      setIsSaving(false);

      if (result.success) {
        setOptimisticSignature(null); // Use backend url
        onSave(result.signatureUrl || tempUrl);
        setEditing(false);
        clearSignature();
        pushNotification('success', 'Signature enregistrée avec succès');
      } else {
        setOptimisticSignature(null);
        pushNotification('error', result.message || "Erreur lors de l'enregistrement de la signature.");
      }
    } catch (error) {
      setIsUploading(false);
      setIsSaving(false);
      setOptimisticSignature(null);
      console.error('Error saving signature:', error);
      pushNotification('error', "Une erreur s'est produite lors de l'enregistrement de la signature.");
    }
  }, [strokes, currentStroke, onSave, clearSignature, changeSignature]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      pushNotification('error', 'Veuillez choisir un fichier image valide.');
      return;
    }

    setIsSaving(true);
    setIsUploading(true);

    try {
      const result = await changeSignature(file);

      setIsSaving(false);
      setIsUploading(false);

      if (result.success) {
        onSave(result.signatureUrl);
        pushNotification('success', 'Signature téléchargée avec succès');
      } else {
        pushNotification('error', result.message || "Erreur lors du téléchargement de la signature.");
      }
    } catch (error) {
      setIsSaving(false);
      setIsUploading(false);
      console.error('Error uploading signature:', error);
      pushNotification('error', "Une erreur s'est produite lors du téléchargement de la signature.");
    }

    // Reset file input
    event.target.value = '';
  }, [changeSignature, onSave]);

  // Render all completed strokes
  const renderedStrokes = useMemo(() => {
    return strokes.map((stroke, index) => {
      if (stroke.length < 2) return null;

      const options = getStrokeOptions(
        stroke.reduce((acc, point) => acc + (point[2] || 0.5), 0) / stroke.length,
        stroke.reduce((acc, point) => acc + (point[3] || 1), 0) / stroke.length
      );

      const outlineStroke = getStroke(stroke, options);
      const pathData = getSvgPathFromStroke(outlineStroke);

      return (
        <path
          key={`stroke-${index}`}
          d={pathData}
          fill="#1e40af"
          stroke="none"
          opacity="0.9"
        />
      );
    }).filter(Boolean);
  }, [strokes]);

  // Render current stroke being drawn
  const renderedCurrentStroke = useMemo(() => {
    if (currentStroke.length < 2) return null;

    const options = getStrokeOptions(pressure);
    const outlineStroke = getStroke(currentStroke, options);
    const pathData = getSvgPathFromStroke(outlineStroke);

    return (
      <path
        d={pathData}
        fill="#3b82f6"
        stroke="none"
        opacity="0.8"
      />
    );
  }, [currentStroke, pressure]);

  const hasSignatureData = strokes.length > 0 || currentStroke.length > 0;

  return (
    <Card className="rounded-xl p-0 border-2 border-gray-200 bg-white w-full h-fit">
      <CardContent className="p-6">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Signature</h3>
          <p className="text-sm text-gray-600">Signature individuelle</p>
        </div>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {!editing ? (
          <>
            {/* Signature Display Area */}
            <div className="w-full bg-white rounded-xl   overflow-hidden">
              {/* Signature content */}
              <div className="w-full border-dashed border-2 rounded-xl border-gray-300 h-64 flex items-center justify-center bg-gray-100 overflow-hidden">
                {isSaving ? (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <LoadingSpinner size="w-12 h-12" />
                    <span className="text-[#7564ed] mt-3 font-medium">Enregistrement de la signature...</span>
                    {optimisticSignature && (
                      <img src={optimisticSignature} className="max-h-32 max-w-full object-contain opacity-60 mt-2 rounded" />
                    )}
                  </div>
                ) : isUploading ? (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <LoadingSpinner size="w-10 h-10" />
                    <span className="text-[#7564ed] mt-2">Téléchargement de la signature...</span>
                    {optimisticSignature && (
                      <img src={optimisticSignature} className="max-h-32 max-w-full object-contain opacity-60 mt-2 rounded" />
                    )}
                  </div>
                ) : optimisticSignature ? (
                  <img src={optimisticSignature} className="max-h-full max-w-full object-contain opacity-80" />
                ) : signature ? (
                  <img
                    src={signature}
                    className="max-h-full max-w-full object-contain px-8"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling?.style.setProperty('display', 'block');
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-500 px-4">
                    <div className="text-4xl mb-2">✍️</div>
                    <div className="text-sm">Aucune signature enregistrée</div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="px-0 py-4 bg-white border-t border-gray-100 flex items-end justify-end">
                <button
                  className="text-lg font-bold bg-[#EBE8FC] border-3 border-transparent hover:border-[#7564ed] cursor-pointer text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
                  onClick={() => setEditing(true)}
                  disabled={isSaving}
                >
                  {isSaving ? "Enregistrement..." : "Modifier la signature"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-full mb-4 relative rounded-xl overflow-hidden">
              {/* Loading overlay when saving */}
              {isSaving && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20 rounded-xl">
                  <div className="flex flex-col items-center">
                    <LoadingSpinner size="w-15 h-15" stroke="#7564ed" className="stroke-2" />
                  </div>
                </div>
              )}

              {/* Clear button icon positioned top right */}
              {!isSaving && hasSignatureData && (
                <button
                  onClick={clearSignature}
                  className="absolute top-2 right-2 z-10 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                  disabled={isSaving}
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              {/* Guideline overlay - not part of the saved SVG */}
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-5"
                width="100%"
                height="100%"
                viewBox="0 0 400 300"
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0 }}
              >
                <line
                  x1="40"
                  y1="150"
                  x2="360"
                  y2="150"
                  stroke="#d1d5db"
                  strokeWidth="2.5"
                  strokeDasharray="12,8"
                  opacity="0.8"
                />
              </svg>
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 400 200"
                preserveAspectRatio="xMidYMid meet"
                className={`cursor-crosshair w-full border-2 border-dashed border-gray-300 bg-white rounded-xl transition-all duration-75 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}
                onMouseDown={isSaving ? undefined : startDrawing}
                onMouseMove={isSaving ? undefined : continueDrawing}
                onMouseUp={isSaving ? undefined : finishDrawing}
                onMouseLeave={isSaving ? undefined : finishDrawing}
                onTouchStart={isSaving ? undefined : startDrawing}
                onTouchMove={isSaving ? undefined : continueDrawing}
                onTouchEnd={isSaving ? undefined : finishDrawing}
                style={{ touchAction: 'none', userSelect: 'none', display: 'block', position: 'relative', zIndex: 1 }}
              >
                {/* Rendered strokes */}
                <g>
                  {renderedStrokes}
                  {renderedCurrentStroke}
                </g>
              </svg>
              {/* Pressure indicator */}
              {isDrawing && !isSaving && (
                <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  Pression : {Math.round(pressure * 100)}%
                </div>
              )}
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-3 text-center">
                Dessinez votre signature dans la zone ci-dessus
              </div>
              <div className="flex justify-end items-center gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      setEditing(false);
                      clearSignature();
                    }}
                    disabled={isSaving}
                  >
                    Annuler
                  </Button> <Button
                    variant="outline"
                    size="sm"
                    className="text-lg font-bold bg-[#EBE8FC] border-3 border-transparent hover:border-[#7564ed] cursor-pointer text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
                    onClick={saveSignature}
                    disabled={!hasSignatureData || isSaving}
                  >
                    {isSaving ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="w-4 h-4" />
                        <span>Enregistrement...</span>
                      </div>
                    ) : (
                      "Enregistrer"
                    )}
                  </Button>

                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}