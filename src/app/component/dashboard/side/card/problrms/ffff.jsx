import { useContext, useEffect, useState, useRef } from "react";
import { DataContext } from "../../../dashboard";
import { Stage, Layer, Image, Line } from "react-konva";
import { memo } from "react";

const RenderImageWithProblem = memo(({ maskPoints, problems }) => {

  const { image } = useContext(DataContext);
  const [imageObj, setImageObj] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [adjustedMaskPoints, setAdjustedMaskPoints] = useState([]);
  const [cropDimensions, setCropDimensions] = useState({ width: 0, height: 0 });
  const stageRef = useRef(null);
  const divRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 150, height: 150 });

  useEffect(() => {
    if (!image) return;
    const img = new window.Image();
    img.src = image.data_url;
    img.crossOrigin = "anonymous";
    img.onload = () => setImageObj(img);
  }, [image]);

  useEffect(() => {
    setDimensions({
      width: divRef.current?.offsetWidth || 150,
      height: divRef.current?.offsetWidth || 150,
    });
  }, []);

  useEffect(() => {
    if (!imageObj || !Array.isArray(maskPoints) || maskPoints.length < 3) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Calculate crop area based on tooth's mask
    const xs = maskPoints.map(([x]) => x);
    const ys = maskPoints.map(([_, y]) => y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Crop the image
    ctx.drawImage(imageObj, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    setCropDimensions({ width: cropWidth, height: cropHeight });

    const croppedImg = new window.Image();
    croppedImg.src = canvas.toDataURL();
    croppedImg.onload = () => setCroppedImage(croppedImg);

    // Adjust each problem's mask points
    const adjustedMasks = problems.map((problem) => 
      problem.mask.flatMap(([x, y]) => [x - minX, y - minY])
    );
    setAdjustedMaskPoints(adjustedMasks);
  }, [imageObj, maskPoints, problems]); // Include dependencies

  const scaleX = dimensions.width / cropDimensions.width || 1;
  const scaleY = dimensions.height / cropDimensions.height || 1;

  return (
    <div ref={divRef} className="flex items-center justify-center w-full h-full">
      <Stage 
        ref={stageRef} 
        width={dimensions.width} 
        height={dimensions.height}
        style={{ borderRadius: '10px' }}
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
            const scaledPoints = points.map((coord, idx) => 
              idx % 2 === 0 ? coord * scaleX : coord * scaleY
            );
            return (
              <Line
                key={index}
                points={scaledPoints}
                fill="rgba(255, 0, 0, 0.3)"
                stroke="red"
                strokeWidth={2}
                shadowColor="rgba(255, 0, 0, 0.5)"
                shadowBlur={6}
                shadowOffset={{ x: 1, y: 1 }}
                closed
                lineJoin="round"
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
});

export default RenderImageWithProblem;