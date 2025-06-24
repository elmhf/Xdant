"use client";
import { Stage, Layer, Image as KonvaImage, Line, Group } from "react-konva";
import React, { useState, useRef, useEffect } from "react";

const AddPoint = ({ imageUrl }) => {
  const [image, setImage] = useState(null);
  const [points, setPoints] = useState([]);
  const imageRef = useRef(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = "/4.png"; // Change to imageUrl if you're passing it as a prop
    img.onload = () => {
      setImage(img);
    };
  }, []);

  const handleClick = (e) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    const imageNode = imageRef.current;
    const imagePos = imageNode.getAbsolutePosition();

    const x = pointerPosition.x;
    const y = pointerPosition.y;

    setPoints((prevPoints) => [...prevPoints, { x, y }]);
    
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Stage onClick={handleClick} width={500} height={500}>
        <Layer>
          {/* Image */}
          {image && (
            <KonvaImage
              ref={imageRef}
              image={image}
              x={0}
              y={0}
              width={500}
              height={500}
            />
          )}

          {/* Draw polygon based on points */}
          {points.length > 1 && (
            <Line
              points={points.flatMap((point) => [point.x, point.y])} // Flatten array of points into [x1, y1, x2, y2, ...]
              stroke="blue"
              strokeWidth={2}
              fill="rgba(0, 0, 255, 0.2)" // Optional: Add a fill color for the polygon
              closed // Close the polygon (connect the last point to the first)
              lineJoin="round" // Smooth the edges
              shadowColor="rgba(0, 0, 255, 0.5)"
              shadowBlur={8}
            />
          )}

          {/* Draw points as circles */}
          {points.map((point, index) => (
            <Group key={index}>
              <Line
                points={[point.x, point.y, point.x, point.y]} // Draw points as lines (single pixel lines)
                stroke="blue"
                strokeWidth={6}
                lineCap="round"
                shadowColor="rgba(0, 0, 255, 0.5)"
                shadowBlur={8}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default AddPoint;
