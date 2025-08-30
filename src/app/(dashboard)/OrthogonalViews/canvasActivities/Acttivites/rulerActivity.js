import React from "react";
import { Line, Text, Circle, Rect, Group } from "react-konva";

// وظيفة للتحقق من قرب النقطة من الخط
function isPointNearLine(point, line, tolerance) {
  const { p1, p2 } = line;
  
  // حساب المسافة من النقطة إلى الخط
  const A = point.x - p1.x;
  const B = point.y - p1.y;
  const C = p2.x - p1.x;
  const D = p2.y - p1.y;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return false; // الخط هو نقطة
  
  const param = dot / lenSq;
  
  let xx, yy;
  if (param < 0) {
    xx = p1.x;
    yy = p1.y;
  } else if (param > 1) {
    xx = p2.x;
    yy = p2.y;
  } else {
    xx = p1.x + param * C;
    yy = p1.y + param * D;
  }
  
  const dx = point.x - xx;
  const dy = point.y - yy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < tolerance;
}

export const RulerActivity = {
  onMouseDown(e, state) {
    if (!e.evt || e.evt.button !== 0) return; // Left click only
    const { stageSize, image, setStartPoint, setIsDrawing, startPoint } = state;
    if (!image || !stageSize) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const relative = {
      x: pointer.x / stageSize.width,
      y: pointer.y / stageSize.height,
    };
    if (!startPoint) {
      setStartPoint(relative);
      setIsDrawing(true);
    }
  },

  onMouseMove(e, state) {
    const { stageSize, image, startPoint, setMousePos, isDrawing, setLines, lines } = state;
    if (!image || !stageSize) return;
    
    // التحقق من الزر الأيمن أثناء الحركة
    if (e.evt && e.evt.buttons === 2) {
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      
      const relative = {
        x: pointer.x / stageSize.width,
        y: pointer.y / stageSize.height,
      };
      
      // البحث عن الخط القريب من موضع الماوس
      const tolerance = 20 / Math.min(stageSize.width, stageSize.height); // tolerance في الوحدات النسبية
      
      lines.forEach(line => {
        if (isPointNearLine(relative, line, tolerance)) {
          console.log('🗑️ حذف خط بالسحب الأيمن - ID:', line.id);
          setLines(prev => prev.filter(l => l.id !== line.id));
        }
      });
      return;
    }
    
    // السلوك العادي للرسم
    if (!isDrawing || !startPoint) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const relative = {
      x: pointer.x / stageSize.width,
      y: pointer.y / stageSize.height,
    };
    setMousePos(relative);
  },

  onMouseUp(e, state) {
    const {
      stageSize, image, startPoint, mousePos,
      setLines, lines, setStartPoint, setMousePos, setIsDrawing
    } = state;
    if (!image || !stageSize || !startPoint || !mousePos) return;
    if (
      mousePos.x < 0 || mousePos.x > 1 ||
      mousePos.y < 0 || mousePos.y > 1
    ) {
      setStartPoint(null);
      setMousePos(null);
      setIsDrawing(false);
      return;
    }
    setLines([
      ...lines,
      {
        p1: startPoint,
        p2: mousePos,
        id: Date.now(),
      },
    ]);
    setStartPoint(null);
    setMousePos(null);
    setIsDrawing(false);
  },

  onMouseLeave(e, state) {
    const { isDrawing, setIsDrawing, setStartPoint, setMousePos } = state;
    // إلغاء الرسم فقط إذا كان في حالة رسم
    if (isDrawing) {
      setIsDrawing(false);
      setStartPoint(null);
      setMousePos(null);
    }
  },

  render(state) {
    const {
      lines, startPoint, mousePos, image, stageSize,
      pixelSpacing, isDrawing, setLines
    } = state;
    if (!image || !stageSize) return null;

    const measureDistanceMM = (p1, p2) => {
      const x1 = p1.x * image.naturalWidth;
      const y1 = p1.y * image.naturalHeight;
      const x2 = p2.x * image.naturalWidth;
      const y2 = p2.y * image.naturalHeight;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distancePixels = Math.sqrt(dx * dx + dy * dy);
      const distanceMM = distancePixels * pixelSpacing;
      return distanceMM.toFixed(2);
    };

    // تحسين وظيفة الحذف - إزالة بالنقر المزدوج
    function handleLineDoubleClick(e, id) {
      e.evt.preventDefault();
      if (typeof setLines === 'function') {
        setLines(lines.filter(l => l.id !== id));
      }
    }

    // إزالة بالنقر الأيمن العادي
    function handleLineRightClick(e, id) {
      e.evt.preventDefault();
      if (typeof setLines === 'function') {
        setLines(lines.filter(l => l.id !== id));
      }
    }

    // منع قائمة النقر الأيمن على المسرح
    function handleStageContextMenu(e) {
      e.evt.preventDefault();
    }

    return (
      <>
        {lines.map((line, i) => {
          const sx1 = line.p1.x * stageSize.width;
          const sy1 = line.p1.y * stageSize.height;
          const sx2 = line.p2.x * stageSize.width;
          const sy2 = line.p2.y * stageSize.height;
          const distanceMM = measureDistanceMM(line.p1, line.p2);
          const midX = (sx1 + sx2) / 2;
          const midY = (sy1 + sy2) / 2;

          return (
            <Group key={line.id || i}>
              {/* الخط الرئيسي */}
              <Line
                points={[sx1, sy1, sx2, sy2]}
                stroke="#00e0ff"
                strokeWidth={3}
                lineCap="round"
                shadowColor="#00e0ff"
                shadowBlur={8}
                shadowOpacity={0.8}
                onDblClick={e => handleLineDoubleClick(e, line.id)}
                onContextMenu={e => handleLineRightClick(e, line.id)}
              />

              {/* خلفية النص */}
              <Rect
                x={midX - 35}
                y={midY - 12}
                width={70}
                height={24}
                fill="rgba(0, 0, 0, 0.8)"
                cornerRadius={4}
                stroke="#00e0ff"
                strokeWidth={1}
                onDblClick={e => handleLineDoubleClick(e, line.id)}
                onContextMenu={e => handleLineRightClick(e, line.id)}
              />

              {/* النص */}
              <Text
                x={midX}
                y={midY}
                text={`${distanceMM} mm`}
                fill="#ffffff"
                fontSize={12}
                fontStyle="bold"
                align="center"
                verticalAlign="middle"
                offsetX={35}
                offsetY={6}
                onDblClick={e => handleLineDoubleClick(e, line.id)}
                onContextMenu={e => handleLineRightClick(e, line.id)}
              />

              {/* النقطة الأولى */}
              <Circle 
                x={sx1} 
                y={sy1} 
                radius={6} 
                fill="#00e0ff" 
                stroke="#ffffff"
                strokeWidth={2}
                shadowColor="#00e0ff"
                shadowBlur={4}
                onDblClick={e => handleLineDoubleClick(e, line.id)}
                onContextMenu={e => handleLineRightClick(e, line.id)}
              />

              {/* النقطة الثانية */}
              <Circle 
                x={sx2} 
                y={sy2} 
                radius={6} 
                fill="#00e0ff" 
                stroke="#ffffff"
                strokeWidth={2}
                shadowColor="#00e0ff"
                shadowBlur={4}
                onDblClick={e => handleLineDoubleClick(e, line.id)}
                onContextMenu={e => handleLineRightClick(e, line.id)}
              />
            </Group>
          );
        })}

        {/* الخط المؤقت أثناء الرسم */}
        {startPoint && mousePos && isDrawing && (
          <>
            <Line
              points={[
                startPoint.x * stageSize.width,
                startPoint.y * stageSize.height,
                mousePos.x * stageSize.width,
                mousePos.y * stageSize.height,
              ]}
              stroke="#ffff00"
              strokeWidth={2}
              dash={[8, 4]}
              lineCap="round"
            />
            <Text
              x={(startPoint.x + mousePos.x) * stageSize.width / 2}
              y={(startPoint.y + mousePos.y) * stageSize.height / 2 - 20}
              text={`${measureDistanceMM(startPoint, mousePos)} mm`}
              fill="#ffff00"
              fontSize={14}
              fontStyle="bold"
              align="center"
              offsetX={30}
            />
            <Circle
              x={startPoint.x * stageSize.width}
              y={startPoint.y * stageSize.height}
              radius={5}
              fill="#ffff00"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </>
        )}
      </>
    );
  },
};