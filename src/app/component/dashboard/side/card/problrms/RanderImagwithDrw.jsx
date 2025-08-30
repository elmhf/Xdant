"use client"
import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';
import useImageStore from '@/stores/ImageStore';

// maskPoints: array of [x, y] (pixels) for cropping
// polygonPoints: array of [x, y] (pixels, relative to cropped image)
const RanderImagwithDrw = ({ maskPoints = [], polygonPoints = [], setPolygonPoints }) => {
  const image = useImageStore(state => state.image);
  const [croppedImgObj, setCroppedImgObj] = useState(null);
  const [cropDims, setCropDims] = useState({ width: 0, height: 0, minX: 0, minY: 0 });
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  // Crop image to mask bounding box
  useEffect(() => {
    if (!image?.data_url || !maskPoints || maskPoints.length === 0) {
      setCroppedImgObj(null);
      setCropDims({ width: 0, height: 0, minX: 0, minY: 0 });
      return;
    }
    const img = new window.Image();
    img.src = image.data_url;
    img.onload = () => {
      const xs = maskPoints.map(p => p[0]);
      const ys = maskPoints.map(p => p[1]);
      const minX = Math.max(0, Math.min(...xs));
      const minY = Math.max(0, Math.min(...ys));
      const maxX = Math.min(img.width, Math.max(...xs));
      const maxY = Math.min(img.height, Math.max(...ys));
      const cropWidth = maxX - minX;
      const cropHeight = maxY - minY;
      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      const croppedImg = new window.Image();
      croppedImg.src = canvas.toDataURL('image/png');
      croppedImg.onload = () => {
        setCroppedImgObj(croppedImg);
        setCropDims({ width: cropWidth, height: cropHeight, minX, minY });
      };
    };
  }, [image, maskPoints]);

  // Responsive: always fill container width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate scale to fit width
  const scale = cropDims.width > 0 && containerWidth > 0 ? containerWidth / cropDims.width : 1;
  const stageWidth = containerWidth;
  const stageHeight = cropDims.height * scale;

  // Handle click to add polygon point (relative to original image)
  const handleStageClick = (e) => {
    if (!setPolygonPoints) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    // Convert to original image coordinates (not cropped)
    const x = (pointer.x / scale) + cropDims.minX;
    const y = (pointer.y / scale) + cropDims.minY;
    const newPoints = [...(polygonPoints || []), [x, y]];
    console.log('Clicked at:', { x, y }, 'New polygonPoints:', newPoints);
    setPolygonPoints(newPoints);
  };

  // Debug logs
  console.log('polygonPoints:', polygonPoints);
  console.log('maskPoints:', maskPoints);

  if (!croppedImgObj || !containerWidth) return <div ref={containerRef} style={{ width: '100%', height: '300px' }} />;

  return (
    <div ref={containerRef} style={{ width: '100%', height: stageHeight }}>
      <Stage
        width={stageWidth}
        height={stageHeight}
        style={{ width: '100%', height: stageHeight }}
        onClick={setPolygonPoints ? handleStageClick : undefined}
      >
        <Layer>
          <KonvaImage image={croppedImgObj} width={stageWidth} height={stageHeight} />
          {polygonPoints && polygonPoints.length > 1 && (
            <Line
              points={polygonPoints.flat().map((v, i) => {
                // Convert from original image coordinates to cropped image coordinates
                const isX = i % 2 === 0;
                const originalCoord = v;
                const croppedCoord = isX ? (originalCoord - cropDims.minX) : (originalCoord - cropDims.minY);
                return croppedCoord * scale;
              })}
              closed
              stroke="#2563eb"
              strokeWidth={2}
              fill="rgba(37,99,235,0.15)"
            />
          )}
          {polygonPoints && polygonPoints.map(([x, y], idx) => {
            // Convert from original image coordinates to cropped image coordinates
            const croppedX = (x - cropDims.minX) * scale;
            const croppedY = (y - cropDims.minY) * scale;
            return (
              <Circle
                key={idx}
                x={croppedX}
                y={croppedY}
                radius={5}
                fill="#2563eb"
                stroke="#fff"
                strokeWidth={1}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default RanderImagwithDrw;