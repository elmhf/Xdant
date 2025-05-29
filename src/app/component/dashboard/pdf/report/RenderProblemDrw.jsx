'use client';
import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Image, Line, Group } from "react-konva";

const COLOR_PALETTE = {
  tooth: { fill: 'rgba(0, 150, 255, 0.2)', stroke: '#0096FF', strokeWidth: 1.5 },
  problem: { fill: 'rgba(255, 100, 0, 0.3)', stroke: '#FF6400', strokeWidth: 2 },
  jaw: { fill: 'rgba(129, 143, 159, 0.1)', stroke: '#818F9F', strokeWidth: 1.2 },
  root: { fill: 'rgba(139, 69, 19, 0.2)', stroke: '#8B4513', strokeWidth: 1.5 },
  crown: { fill: 'rgba(255, 215, 0, 0.2)', stroke: '#FFD700', strokeWidth: 1.5 },
  endo: { fill: 'rgba(138, 43, 226, 0.2)', stroke: '#8A2BE2', strokeWidth: 1.5 }
};

const RenderProblemDrw = ({ image, tooth = [], ShowSetting = {} }) => {
  const containerRef = useRef(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [imgObj, setImgObj] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scale, setScale] = useState(1);

  // Load image and set initial dimensions
  useEffect(() => {
    if (!image?.data_url) return;

    const img = new window.Image();
    img.onload = () => {
      setImgObj(img);
      setImgSize({ 
        width: img.naturalWidth, 
        height: img.naturalHeight 
      });
    };
    img.src = image.data_url;
  }, [image]);

  // Calculate container width and scale
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && imgObj) {
        const newContainerWidth = containerRef.current.clientWidth;
        setContainerWidth(newContainerWidth);
        
        // Calculate scale based on container width and image width
        const newScale = newContainerWidth / imgObj.naturalWidth;
        setScale(newScale);
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [imgObj]);

  // Adjust mask coordinates based on scale
  const adjustCoordinates = (mask) => {
    if (!Array.isArray(mask)) return [];
    return mask.flat();
  };

  // Calculate scaled height based on original aspect ratio
  const scaledHeight = imgSize.height * scale;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 'auto', // Let the height be determined by the image aspect ratio
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative'
      }}
    >
      {imgObj && (
        <Stage
          width={containerWidth}
          height={scaledHeight}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            <Group>
              <Image
                image={imgObj}
                width={imgSize.width}
                height={imgSize.height}
              />

              {/* Render teeth and dental elements */}
              {tooth.map((teeth, index) => {
                if (!teeth.teeth_mask) return null;
                
                return (
                  <React.Fragment key={`tooth-${index}`}>
                    {ShowSetting?.showTeeth && (
                      <Line
                        points={adjustCoordinates(teeth.teeth_mask)}
                        {...COLOR_PALETTE.tooth}
                        strokeWidth={COLOR_PALETTE.tooth.strokeWidth / scale}
                        closed
                        perfectDrawEnabled={false}
                      />
                    )}

                    {teeth.problems?.filter(problem => ShowSetting?.problems[`show${problem.type}`])
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
                    
                    {ShowSetting?.showRoots && teeth.Root?.mask && (
                      <Line
                        points={adjustCoordinates(teeth.Root.mask)}
                        {...COLOR_PALETTE.root}
                        strokeWidth={COLOR_PALETTE.root.strokeWidth / scale}
                        closed
                        perfectDrawEnabled={false}
                      />
                    )}
                    
                    {ShowSetting?.showCrown && teeth.Crown?.mask && (
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
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default RenderProblemDrw;