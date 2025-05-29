"use client";

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image, Rect, Line } from "react-konva";
import useImage from "use-image";

const ImageCropper = ({ img, teethData }) => {
  const [image] = useImage(img);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [scaleFactor, setScaleFactor] = useState(1);


  const onChange = async (imageList) =>  {
    setImage(imageList);

    await handleUpload()
  };
  const handleUpload = async () => {

    if (image.length === 0) {
      setMessage("الرجاء اختيار صورة أولاً!");
      return;
    }

    const formData = new FormData();
    formData.append("file", image[0].file); // إضافة الصورة إلى FormData
    getAnalyseImage(formData);


  };
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && image) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
        
        const scaleX = width / image.width;
        const scaleY = height / image.height;
        setScaleFactor(Math.min(scaleX, scaleY));
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [image]);

  if (!image || !teethData) return null;

  // تعديل الإحداثيات حسب نسبة التحجيم
  const adjustCoordinates = (coords) => {
    return coords.map(([x, y]) => [x * scaleFactor, y * scaleFactor]);
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Stage width={containerSize.width} height={containerSize.height}>
        <Layer>
          {/* عرض الصورة مع التحجيم */}
          <Image
            image={image}
            width={image.width * scaleFactor}
            height={image.height * scaleFactor}
          />

          {/* رسم كل الأسنان من القائمة */}
          {teethData.map((tooth, index) => {
            // تعديل إحداثيات السن
            const { x1, y1, x2, y2 } = tooth.boundingBox;
            const adjustedToothCoords = {
              x: x1 * scaleFactor,
              y: y1 * scaleFactor,
              width: (x2 - x1) * scaleFactor,
              height: (y2 - y1) * scaleFactor,
            };

            return (
              <React.Fragment key={index}>
                {/* رسم منطقة السن */}
                <Rect
                  {...adjustedToothCoords}
                  stroke={tooth.category === "Healthy" ? "green" : "red"}
                  strokeWidth={2 * scaleFactor}
                  fillEnabled={false}
                />

                {/* رسم الأقنعة المرتبطة بالسن */}
                {tooth.problems.map((problem, problemIndex) => {
                  const scaledMask = adjustCoordinates(problem.mask);
                  return (
                    <Line
                      key={problemIndex}
                      points={scaledMask.flat()}
                      fill="rgba(255, 0, 0, 0.5)"
                      closed
                      stroke="red"
                      strokeWidth={2 * scaleFactor}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageCropper;