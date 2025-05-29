import React, { useRef, useState, useEffect, memo } from "react";
import { Stage, Layer, Rect, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

const ImageCropper = memo(({ img, teethData }) => {
  const [image] = useImage(img || teethData.scan.imageUrl);
  const [scale, setScale] = useState(1); // Define a scale state

  useEffect(() => {
    if (image) {
      const scaleX = 500 / image.width; // Adjust based on your Stage width
      const scaleY = 500 / image.height; // Adjust based on your Stage height
      setScale(Math.min(scaleX, scaleY));
    }
  }, [image]);

  return (
    <div className="w-full h-full" style={{ width: "100%", height: "500px" }}>
      <Stage width={500} height={500}>
        <Layer>
          {image && <KonvaImage image={image} scaleX={scale} scaleY={scale} />}

          {teethData.teeth.map((tooth) => {
            const { x1, y1, x2, y2 } = tooth.boundingBox;
            const scaledCoords = {
              x: x1 * scale,
              y: y1 * scale,
              width: (x2 - x1) * scale,
              height: (y2 - y1) * scale,
            };

            return (
              <React.Fragment key={tooth.toothNumber}>
                <Rect
                  {...scaledCoords}
                  stroke={tooth.category === "Healthy" ? "#10B981" : "#EF4444"}
                  strokeWidth={2 * scale}
                  fillEnabled={false}
                />

                {tooth.problems?.map((problem, idx) => (
                  <Line
                    key={idx}
                    points={problem.mask.flatMap(([x, y]) => [x * scale, y * scale])}
                    fill="rgba(239, 68, 68, 0.3)"
                    closed
                    stroke="#EF4444"
                    strokeWidth={1.5 * scale}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
});

export default ImageCropper;