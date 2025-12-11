import React, { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import getStroke from "perfect-freehand";
import useUserStore from "./store/userStore";

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


  // Convert screen coordinates to SVG coordinates
  const getSVGPoint = useCallback((evt) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const rect = svg.getBoundingClientRect();
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

    // Convert to SVG viewBox coordinates (0-400 range for better precision)
    const x = ((clientX - rect.left) / rect.width) * 400;
    const y = ((clientY - rect.top) / rect.height) * 300;

    // Calculate velocity if we have a previous point
    let velocity = 1;
    if (lastPoint.current && strokeStartTime.current) {
      const timeDelta = Date.now() - strokeStartTime.current;
      const distance = Math.hypot(
        x - lastPoint.current[0],
        y - lastPoint.current[1]
      );
      velocity = Math.min(2, Math.max(0.5, distance / Math.max(timeDelta, 1)));
    }

    const point = [
      Math.max(0, Math.min(400, x)),
      Math.max(0, Math.min(300, y)),
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
      } else {
        setOptimisticSignature(null);
        alert(result.message || "Erreur lors de l'enregistrement de la signature.");
      }
    } catch (error) {
      setIsUploading(false);
      setIsSaving(false);
      setOptimisticSignature(null);
      console.error('Error saving signature:', error);
      alert("Une erreur s'est produite lors de l'enregistrement de la signature.");
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
      alert('Veuillez choisir un fichier image valide.');
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
      } else {
        alert(result.message || "Erreur lors du téléchargement de la signature.");
      }
    } catch (error) {
      setIsSaving(false);
      setIsUploading(false);
      console.error('Error uploading signature:', error);
      alert("Une erreur s'est produite lors du téléchargement de la signature.");
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Signature et tampon</h3>
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
            <div className="w-full h-64 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 mb-6 overflow-hidden">
              {isSaving ? (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <LoadingSpinner size="w-12 h-12" />
                  <span className="text-[#7564ed] mt-3 font-medium">Enregistrement de la signature...</span>
                  {optimisticSignature && (
                    <img src={optimisticSignature} alt="معاينة التوقيع" className="max-h-32 max-w-full object-contain opacity-60 mt-2 rounded" />
                  )}
                </div>
              ) : isUploading ? (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <LoadingSpinner size="w-10 h-10" />
                  <span className="text-[#7564ed] mt-2">Téléchargement de la signature...</span>
                  {optimisticSignature && (
                    <img src={optimisticSignature} alt="معاينة التوقيع" className="max-h-32 max-w-full object-contain opacity-60 mt-2 rounded" />
                  )}
                </div>
              ) : optimisticSignature ? (
                <img src={optimisticSignature} alt="معاينة التوقيع" className="max-h-full max-w-full object-contain opacity-80" />
              ) : signature ? (
                <img
                  src={signature}
                  alt="Signature enregistrée"
                  className="max-h-full max-w-full object-contain"
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
            <div className="flex gap-3 w-full">
              <Button
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setEditing(true)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="w-4 h-4" />
                    <span>Enregistrement...</span>
                  </div>
                ) : (
                  "Modifier"
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUploadClick}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="w-4 h-4" />
                  </div>
                ) : (
                  "Télécharger un fichier"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-full mb-4 relative rounded-xl overflow-hidden">
              {/* Loading overlay when saving */}
              {isSaving && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20 rounded-xl">
                  <div className="flex flex-col items-center">
                    <LoadingSpinner size="w-10 h-10" />
                    <span className="text-[#7564ed] mt-2 font-medium">Enregistrement de la signature...</span>
                  </div>
                </div>
              )}

              {/* Guideline overlay - not part of the saved SVG */}
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                width="100%"
                height="300"
                viewBox="0 0 400 300"
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
                height="300"
                viewBox="0 0 400 300"
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
              <div className="flex justify-between items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={clearSignature}
                  disabled={!hasSignatureData || isSaving}
                >
                  Effacer
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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