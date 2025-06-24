import { memo, useEffect, useState, useRef, useCallback } from "react";
import { Stage, Layer, Image, Line } from "react-konva";
import useImageStore from "@/stores/ImageStore";

const RenderImageWithProblem = memo(({ maskPoints = [], problems = [], size = 200, className = "" }) => {
  const { getImage } = useImageStore();
  const image = getImage();
  const [imageObj, setImageObj] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [adjustedMaskPoints, setAdjustedMaskPoints] = useState([]);
  const [cropDimensions, setCropDimensions] = useState({ width: 0, height: 0 });
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: size, height: size });

  // Load main image
  useEffect(() => {
    if (!image?.data_url) return;
    
    const img = new window.Image();
    img.src = image.data_url;
    img.crossOrigin = "anonymous";
    img.onload = () => setImageObj(img);
    
    return () => {
      img.onload = null;
    };
  }, [image]);

  // Set container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: size, height: size });
    };
    
    updateDimensions();
  }, [size]);

  // Crop image and adjust mask points
  const processImage = useCallback(() => {
    if (!imageObj || !Array.isArray(maskPoints) || maskPoints.length < 3) return;

    try {
      // Calculate bounding box
      const xs = maskPoints.map(([x]) => x);
      const ys = maskPoints.map(([_, y]) => y);
      const minX = Math.max(0, Math.min(...xs));
      const minY = Math.max(0, Math.min(...ys));
      const maxX = Math.min(imageObj.width, Math.max(...xs));
      const maxY = Math.min(imageObj.height, Math.max(...ys));
      
      const cropWidth = maxX - minX;
      const cropHeight = maxY - minY;

      // Create cropped image
      const canvas = document.createElement("canvas");
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        imageObj, 
        minX, minY, cropWidth, cropHeight, 
        0, 0, cropWidth, cropHeight
      );

      setCropDimensions({ width: cropWidth, height: cropHeight });

      const croppedImg = new window.Image();
      croppedImg.src = canvas.toDataURL();
      croppedImg.onload = () => setCroppedImage(croppedImg);

      // Adjust problem masks
      const adjustedMasks = problems.map(problem => 
        problem.mask?.flatMap(([x, y]) => [x - minX, y - minY]) || []
      );
      
      setAdjustedMaskPoints(adjustedMasks);
      // console.log(adjustedMasks, "Processed problems");
    } catch (error) {
      console.error("Error processing image:", error);
    }
  }, [imageObj, maskPoints, problems]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  const scaleX = cropDimensions.width ? dimensions.width / cropDimensions.width : 1;
  const scaleY = cropDimensions.height ? dimensions.height / cropDimensions.height : 1;

  return (
    <div 
      ref={containerRef}
      className={`flex items-center justify-center ${className}`}
      style={{ borderRadius: '12px', overflow: 'hidden', width: size, height: size }}
    >
      <Stage 
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
      >
        <Layer>
          {croppedImage && (
            <Image
              image={croppedImage}
              width={dimensions.width}
              height={dimensions.height}
            />
          )}
          
          {adjustedMaskPoints.map((points, index) => {
            if (!points || points.length === 0) return null;
            
            const scaledPoints = points.map((coord, idx) => 
              idx % 2 === 0 ? coord * scaleX : coord * scaleY
            );
            
            return (
              <Line
                key={`mask-${index}`}
                points={scaledPoints}
                fill="rgba(255, 0, 0, 0.3)"
                stroke="red"
                strokeWidth={2}
                closed
                lineJoin="round"
                listening={false}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
});

RenderImageWithProblem.displayName = "RenderImageWithProblem";
export default RenderImageWithProblem;