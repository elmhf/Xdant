'use client';
import React, { useEffect, useState, useRef, useContext } from "react";
import { Stage, Layer, Image, Line, Group } from "react-konva";
import { DataContext } from "../dashboard";

const COLOR_PALETTE = {
  tooth: { fill: 'rgba(0, 150, 255, 0.2)', stroke: '#0096FF', strokeWidth: 1.5 },
  problem: { fill: 'rgba(255, 100, 0, 0.3)', stroke: '#FF6400', strokeWidth: 2 },
  jaw: { fill: 'rgba(129, 143, 159, 0.1)', stroke: '#818F9F', strokeWidth: 1.2 },
  root: { fill: 'rgba(139, 69, 19, 0.2)', stroke: '#8B4513', strokeWidth: 1.5 },
  crown: { fill: 'rgba(255, 215, 0, 0.2)', stroke: '#FFD700', strokeWidth: 1.5 },
  endo: { fill: 'rgba(138, 43, 226, 0.2)', stroke: '#8A2BE2', strokeWidth: 1.5 }
};

const RenderProblemDrw = ({ image, tooth, ShowSetting, useFilter }) => {
  const { stageRef } = useContext(DataContext);
  const containerRef = useRef(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [imgObj, setImgObj] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastCenter = useRef(null);
  const lastDist = useRef(0);
  const imageNodeRef = useRef(null);
  const [{ brightness, contrast, saturation }] = useFilter;

  // Load image and set initial dimensions
  useEffect(() => {
    if (!image) return;

    const img = new window.Image();
    img.onload = () => {
      setImgObj(img);
      setImgSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = image;
  }, [image]);

  // Calculate container size and initial scale
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
        
        if (imgObj) {
          const scaleX = width / imgObj.naturalWidth;
          const scaleY = height / imgObj.naturalHeight;
          const newScale = Math.min(scaleX, scaleY);
          setScale(newScale);
          setPosition({ x: 0, y: 0 });
        }
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [imgObj]);

  // Apply image filters
  useEffect(() => {
    if (!imageNodeRef.current) return;

    imageNodeRef.current.cache();
    imageNodeRef.current.filters([
      function (imageData) {
        // Apply brightness
        const brightnessFactor = brightness / 100;
        for (let i = 0; i < imageData.data.length; i += 4) {
          imageData.data[i] = Math.min(255, imageData.data[i] * brightnessFactor);
          imageData.data[i + 1] = Math.min(255, imageData.data[i + 1] * brightnessFactor);
          imageData.data[i + 2] = Math.min(255, imageData.data[i + 2] * brightnessFactor);
        }

        // Apply contrast
        const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < imageData.data.length; i += 4) {
          imageData.data[i] = contrastFactor * (imageData.data[i] - 128) + 128;
          imageData.data[i + 1] = contrastFactor * (imageData.data[i + 1] - 128) + 128;
          imageData.data[i + 2] = contrastFactor * (imageData.data[i + 2] - 128) + 128;
        }

        // Apply saturation
        for (let i = 0; i < imageData.data.length; i += 4) {
          const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          imageData.data[i] = avg + (imageData.data[i] - avg) * (saturation / 100);
          imageData.data[i + 1] = avg + (imageData.data[i + 1] - avg) * (saturation / 100);
          imageData.data[i + 2] = avg + (imageData.data[i + 2] - avg) * (saturation / 100);
        }
      }
    ]);
    imageNodeRef.current.getLayer().batchDraw();
  }, [brightness, contrast, saturation]);

  // Handle wheel zoom with bounds checking
  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(0.5, Math.min(3, scale * (1 + direction * 0.1)));
    
    updateZoomAndPosition(newScale, {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    });
  };

  // Handle touch events for pinch zoom
  const handleTouchStart = (e) => {
    e.evt.preventDefault();
    const touches = e.evt.touches;
    
    if (touches.length === 2) {
      setIsDragging(false);
      const touch1 = { x: touches[0].clientX, y: touches[0].clientY };
      const touch2 = { x: touches[1].clientX, y: touches[1].clientY };
      
      lastCenter.current = {
        x: (touch1.x + touch2.x) / 2,
        y: (touch1.y + touch2.y) / 2
      };
      
      lastDist.current = Math.hypot(touch2.x - touch1.x, touch2.y - touch1.y);
    } else {
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    e.evt.preventDefault();
    const touches = e.evt.touches;
    
    if (touches.length === 2 && lastCenter.current) {
      const touch1 = { x: touches[0].clientX, y: touches[0].clientY };
      const touch2 = { x: touches[1].clientX, y: touches[1].clientY };
      
      const currentDist = Math.hypot(touch2.x - touch1.x, touch2.y - touch1.y);
      const newScale = Math.max(0.5, Math.min(3, scale * (currentDist / lastDist.current)));
      
      const newCenter = {
        x: (touch1.x + touch2.x) / 2,
        y: (touch1.y + touch2.y) / 2
      };
      
      const delta = {
        x: newCenter.x - lastCenter.current.x,
        y: newCenter.y - lastCenter.current.y
      };
      
      updateZoomAndPosition(newScale, {
        x: position.x + delta.x,
        y: position.y + delta.y
      });
      
      lastDist.current = currentDist;
      lastCenter.current = newCenter;
    }
  };

  // Update zoom and position with boundary checks
  const updateZoomAndPosition = (newScale, newPos) => {
    const scaledWidth = imgSize.width * newScale;
    const scaledHeight = imgSize.height * newScale;
    
    const maxX = Math.max(0, (scaledWidth - containerSize.width) / 2);
    const maxY = Math.max(0, (scaledHeight - containerSize.height) / 2);
    
    const boundedPos = {
      x: Math.max(-maxX, Math.min(maxX, newPos.x)),
      y: Math.max(-maxY, Math.min(maxY, newPos.y))
    };

    setScale(newScale);
    setPosition(boundedPos);
  };

  // Handle drag movements with bounds checking
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragMove = (e) => {
    if (isDragging) {
      const newPos = { x: e.target.x(), y: e.target.y() };
      const scaledWidth = imgSize.width * scale;
      const scaledHeight = imgSize.height * scale;
      
      const maxX = Math.max(0, (scaledWidth - containerSize.width) / 2);
      const maxY = Math.max(0, (scaledHeight - containerSize.height) / 2);
      
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newPos.x)),
        y: Math.max(-maxY, Math.min(maxY, newPos.y))
      });
    }
  };

  // Reset view to initial state
  const resetView = () => {
    if (containerRef.current && imgObj) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const scaleX = width / imgObj.naturalWidth;
      const scaleY = height / imgObj.naturalHeight;
      setScale(Math.min(scaleX, scaleY));
      setPosition({ x: 0, y: 0 });
    }
  };

  // Adjust mask coordinates based on scale
  const adjustCoordinates = (mask) => {
    if (!Array.isArray(mask)) return [];
    return mask.flat();
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Reset view button */}
      <button
        onClick={resetView}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '5px 10px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        <span>Reset View</span>
      </button>

      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
      >
        <Layer>
          {imgObj && (
            <Group>
              <Image
                ref={imageNodeRef}
                image={imgObj}
                width={imgSize.width}
                height={imgSize.height}
              />

              {/* Render teeth and dental elements */}
              {tooth.map((teeth, index) => {
                if (!teeth.teeth_mask) return null;
                
                return (
                  <React.Fragment key={`tooth-${index}`}>
                    {ShowSetting.showTeeth && (
                      <Line
                        points={adjustCoordinates(teeth.teeth_mask)}
                        {...COLOR_PALETTE.tooth}
                        strokeWidth={COLOR_PALETTE.tooth.strokeWidth / scale}
                        closed
                        perfectDrawEnabled={false}
                      />
                    )}

                    {teeth.problems?.filter(problem => ShowSetting.problems[`show${problem.type}`])
                      .map((problem, pIndex) => (
                        <Line
                          key={`problem-${index}-${pIndex}`}
                          points={adjustCoordinates(problem.mask)}
                          {...COLOR_PALETTE.problem}
                          strokeWidth={COLOR_PALETTE.problem.strokeWidth / scale}
                          closed
                          perfectDrawEnabled={false}
                        />
                      ))}
                    
                    {ShowSetting.showRoots && teeth.Root?.mask && (
                      <Line
                        points={adjustCoordinates(teeth.Root.mask)}
                        {...COLOR_PALETTE.root}
                        strokeWidth={COLOR_PALETTE.root.strokeWidth / scale}
                        closed
                        perfectDrawEnabled={false}
                      />
                    )}
                    
                    {ShowSetting.showCrown && teeth.Crown?.mask && (
                      <Line
                        points={adjustCoordinates(teeth.Crown.mask)}
                        {...COLOR_PALETTE.crown}
                        strokeWidth={COLOR_PALETTE.crown.strokeWidth / scale}
                        closed
                        perfectDrawEnabled={false}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default RenderProblemDrw;