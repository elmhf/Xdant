"use client"
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { DataContext } from "../../../dashboard";
import { Stage, Layer, Image, Line, Circle, Group } from "react-konva";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { RefreshCw, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import dynamic from 'next/dynamic';

const useImageLoader = (imageUrl) => {
  const [imageObj, setImageObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!imageUrl) return;

    setLoading(true);
    setError(null);
    
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
      setImageObj(img);
      setLoading(false);
    };

    img.onerror = () => {
      setError("Failed to load image");
      setLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return { imageObj, loading, error };
};

const useImageProcessor = (imageObj, maskPoints) => {
  const [processedData, setProcessedData] = useState({
    croppedImage: null,
    dimensions: { width: 0, height: 0 },
    minX: 0,
    minY: 0,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!imageObj || !Array.isArray(maskPoints) || maskPoints.length === 0) {
      setProcessedData(prev => ({
        ...prev,
        croppedImage: null,
        dimensions: { width: 0, height: 0 },
        minX: 0,
        minY: 0
      }));
      return;
    }

    const processImage = async () => {
      try {
        setProcessedData(prev => ({ ...prev, loading: true, error: null }));
        
        const xs = maskPoints.map(point => point[0]);
        const ys = maskPoints.map(point => point[1]);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        const cropWidth = maxX - minX;
        const cropHeight = maxY - minY;

        if (cropWidth <= 0 || cropHeight <= 0) {
          throw new Error("Invalid crop dimensions");
        }

        const canvas = document.createElement("canvas");
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) throw new Error("Could not get canvas context");

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          imageObj, 
          minX, minY, cropWidth, cropHeight, 
          0, 0, cropWidth, cropHeight
        );

        const croppedImg = new window.Image();
        croppedImg.src = canvas.toDataURL('image/png', 1.0);

        await new Promise((resolve, reject) => {
          croppedImg.onload = resolve;
          croppedImg.onerror = () => reject(new Error("Failed to load cropped image"));
        });

        setProcessedData({
          croppedImage: croppedImg,
          dimensions: { width: cropWidth, height: cropHeight },
          minX,
          minY,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error("Image processing error:", error);
        setProcessedData({
          croppedImage: null,
          dimensions: { width: 0, height: 0 },
          minX: 0,
          minY: 0,
          loading: false,
          error: error.message
        });
      }
    };

    processImage();
  }, [imageObj, maskPoints]);

  return processedData;
};

const RanderImagwithDrw = ({ maskPoints, size, setMask }) => {
  const { image } = useContext(DataContext);
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [containerSize, setContainerSize] = useState(size);
  const [points, setPoints] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { maskProblem, setmaskProblem } = setMask || {};
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { imageObj, loading: imageLoading, error: imageError } = useImageLoader(image?.data_url);
  const processedData = useImageProcessor(imageObj, Array.isArray(maskPoints) ? maskPoints : []);
  const { croppedImage, dimensions, minX, minY, loading: processing } = processedData;

  // دالة مساعدة لتحويل maskProblem إلى مصفوفة نقاط
  const normalizeMaskProblem = useCallback((maskProblem) => {
    if (!maskProblem) return [];
    
    // إذا كان مصفوفة بالفعل
    if (Array.isArray(maskProblem)) {
      return maskProblem;
    }
    
    // إذا كان كائنًا يحتوي على خاصية mask
    if (maskProblem.mask && Array.isArray(maskProblem.mask)) {
      return maskProblem.mask;
    }
    
    // إذا كان كائنًا به x و y
    if (maskProblem.x !== undefined && maskProblem.y !== undefined) {
      return [[maskProblem.x, maskProblem.y]];
    }
    
    // في حالة عدم التطابق مع أي من الأنواع السابقة
    return [];
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    try {
      const normalizedMask = normalizeMaskProblem(maskProblem);
      
      if (!normalizedMask.length) {
        setPoints([]);
        return;
      }

      const newPoints = normalizedMask.map(point => {
        const x = Array.isArray(point) ? point[0] : point.x;
        const y = Array.isArray(point) ? point[1] : point.y;
        
        return [
          (x - minX) * (containerSize / dimensions.width),
          (y - minY) * (containerSize / dimensions.height)
        ];
      });
      
      setPoints(newPoints);
    } catch (error) {
      console.error("Error processing mask points:", error);
      setPoints([]);
    }
  }, [maskProblem, minX, minY, dimensions, containerSize, isClient, normalizeMaskProblem]);

  const handleClick = useCallback((e) => {
    if (!isClient) return;
    
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    if (!pointerPosition) return;
    
    const stageX = (pointerPosition.x - stage.x()) / zoom;
    const stageY = (pointerPosition.y - stage.y()) / zoom;
    
    const newPoint = [stageX, stageY];
    const newPoints = [...points, newPoint];
    setPoints(newPoints);
    
    if (setmaskProblem) {
      const originalPoints = newPoints.map(point => [
        point[0] * (dimensions.width / containerSize) + minX,
        point[1] * (dimensions.height / containerSize) + minY
      ]);
      setmaskProblem(originalPoints, "orsize");
    }
  }, [points, zoom, dimensions, containerSize, minX, minY, setmaskProblem, isClient]);

  const handleResetPoints = useCallback(() => {
    if (!isClient) return;
    if (points.length === 0) {
      toast.info("No drawing to reset");
      return;
    }
    
    setPoints([]);
    if (setmaskProblem) {
      setmaskProblem([]);
    }
    toast.success("Drawing reset successfully");
  }, [points, setmaskProblem, isClient]);

  const toggleFullscreen = useCallback(() => {
    if (!isClient) return;
    if (!isFullscreen) {
      const elem = containerRef.current;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen, isClient]);

  const handleZoom = useCallback((direction) => {
    if (!isClient) return;
    setZoom(prev => {
      const newZoom = direction === 'in' 
        ? Math.min(prev + 0.25, 3) 
        : Math.max(prev - 0.25, 0.5);
      
      if (stageRef.current) {
        const stage = stageRef.current;
        const pointer = stage.getPointerPosition();
        if (pointer) {
          const mousePointTo = {
            x: (pointer.x - stage.x()) / prev,
            y: (pointer.y - stage.y()) / prev
          };
          
          const newPos = {
            x: pointer.x - mousePointTo.x * newZoom,
            y: pointer.y - mousePointTo.y * newZoom
          };
          
          stage.position(newPos);
          stage.batchDraw();
        }
      }
      
      return newZoom;
    });
  }, [isClient]);

  const resetZoom = useCallback(() => {
    if (!isClient) return;
    setZoom(1);
    if (stageRef.current) {
      stageRef.current.position({ x: 0, y: 0 });
      stageRef.current.batchDraw();
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    const updateSize = () => {
      if (containerRef.current) {
        const size = Math.min(
          containerRef.current.offsetWidth || 150,
          containerRef.current.offsetHeight || 150
        );
        setContainerSize(size);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('resize', updateSize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isClient]);

  const isLoading = imageLoading || processing;
  const hasError = imageError || processedData.error;

  if (!isClient) {
    return (
      <div 
        className="image-container" 
        style={{      
          borderRadius: '10px', 
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading image viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="image-container"
      style={{      
        borderRadius: '10px', 
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
          <div className="animate-pulse flex flex-col items-center">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-gray-600">Loading image...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
          <div className="text-center p-4">
            <p className="text-red-500 font-medium">Error loading image</p>
            <p className="text-sm text-gray-600 mt-1">{imageError || processedData.error}</p>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      <div className="absolute top-2 left-2 z-10 flex gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-md shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleResetPoints}
              disabled={points.length === 0}
              className="hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Reset Drawing</p>
          </TooltipContent>
        </Tooltip>



        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen}
              className="hover:bg-gray-100"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {zoom !== 1 && (
        <div className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
          {Math.round(zoom * 100)}%
        </div>
      )}

      <Stage 
        ref={stageRef}
        onClick={handleClick}
        width={containerSize} 
        height={containerSize}
        scaleX={zoom}
        scaleY={zoom}
        draggable={zoom > 1}
        style={{ 
          backgroundColor: '#f8fafc',
          cursor: 'crosshair'
        }}
      >
        <Layer>
          {croppedImage && (
            <Group
              x={0}
              y={0}
              width={containerSize / zoom}
              height={containerSize / zoom}
            >
              <Image
                image={croppedImage}
                width={containerSize / zoom}
                height={containerSize / zoom}
              />
              
              <Line
                points={points.flat()}
                strokeWidth={2 / zoom}
                fill={'rgba(59, 130, 246, 0.3)'}
                stroke={'rgba(59, 130, 246, 0.8)'}
                closed
                lineJoin="round"
                lineCap="round"
              />
              
              {points.map((point, index) => (
                <Circle
                  key={index}
                  x={point[0]}
                  y={point[1]}
                  radius={5 / zoom}
                  fill='rgba(59, 130, 246, 0.8)'
                  stroke='white'
                  strokeWidth={1 / zoom}
                  draggable
                  onDragMove={(e) => {
                    const newPoints = [...points];
                    newPoints[index] = [e.target.x(), e.target.y()];
                    setPoints(newPoints);
                    
                    if (setmaskProblem) {
                      const originalPoints = newPoints.map(point => [
                        point[0] * (dimensions.width / containerSize) + minX,
                        point[1] * (dimensions.height / containerSize) + minY
                      ]);
                      setmaskProblem(originalPoints, "orsize");
                    }
                  }}
                />
              ))}
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default dynamic(() => Promise.resolve(RanderImagwithDrw), {
  ssr: false
});