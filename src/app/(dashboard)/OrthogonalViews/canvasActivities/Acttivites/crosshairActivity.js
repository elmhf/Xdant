// CrosshairActivity.js

import { WeakMap } from "core-js"; // إذا لازمو في مشروعك
const dragState = new WeakMap();

import React, { useState } from 'react';
import { Line, Group, Circle, Rect, Text } from 'react-konva';

export function CrosshairLayer({ 
    x, 
    y, 
    width, 
    height, 
    viewType, 
    showCoordinates = true,
    showGridLines = false,
    opacity = 0.7,
    interactive = true 
  }) {
    // State for hover effects
    const [hoveredElement, setHoveredElement] = useState(null);
    
    // Professional medical color scheme
    const getViewColors = (view) => {
      switch (view) {
        case 'axial':
          return {
            vertical: '#00D4FF',    // Cyan for axial vertical
            horizontal: '#FF6B6B',  // Red for axial horizontal
            center: '#FFFFFF'       // White center
          };
        case 'coronal':
          return {
            vertical: '#A855F7',    // Purple for coronal vertical
            horizontal: '#FF6B6B',  // Red for coronal horizontal
            center: '#FFFFFF'       // White center
          };
        case 'sagittal':
          return {
            vertical: '#A855F7',    // Purple for sagittal vertical
            horizontal: '#00D4FF',  // Cyan for sagittal horizontal
            center: '#FFFFFF'       // White center
          };
        default:
          return {
            vertical: '#FFFFFF',
            horizontal: '#FFFFFF',
            center: '#FFFF00'
          };
      }
    };
  
    const colors = getViewColors(viewType);
    
    // Get enhanced styles for hover effects
    const getLineStyle = (lineType) => {
      const isHovered = hoveredElement === lineType;
      const baseColor = colors[lineType];
      
      return {
        stroke: baseColor,
        strokeWidth: isHovered ? 2.5 : 1.5,
        opacity: isHovered ? Math.min(opacity + 0.3, 1) : opacity,
        shadowColor: isHovered ? baseColor : "rgba(0, 0, 0, 0.5)",
        shadowBlur: isHovered ? 8 : 2,
        shadowOffset: { x: 1, y: 1 }
      };
    };
    
    const getCenterStyle = () => {
      const isHovered = hoveredElement === 'center';
      return {
        opacity: isHovered ? Math.min(opacity + 0.3, 1) : opacity,
        shadowBlur: isHovered ? 12 : 2,
        shadowColor: isHovered ? colors.center : "rgba(0, 0, 0, 0.5)",
        scale: isHovered ? 1.2 : 1
      };
    };
  
    return (
      <>
        {/* Optional grid lines for precision */}
        {showGridLines && (
          <>
            {/* Vertical grid lines */}
            {Array.from({ length: Math.floor(width / 50) }, (_, i) => (
              <Line
                key={`v-grid-${i}`}
                points={[i * 50, 0, i * 50, height]}
                stroke="#444444"
                strokeWidth={0.5}
                opacity={0.3}
                dash={[2, 4]}
              />
            ))}
            {/* Horizontal grid lines */}
            {Array.from({ length: Math.floor(height / 50) }, (_, i) => (
              <Line
                key={`h-grid-${i}`}
                points={[0, i * 50, width, i * 50]}
                stroke="#444444"
                strokeWidth={0.5}
                opacity={0.3}
                dash={[2, 4]}
              />
            ))}
          </>
        )}
  
        {/* Main crosshair lines */}
        <>
          {/* Vertical line */}
          <Line
            points={[x, 0, x, height]}
            {...getLineStyle('vertical')}
            onMouseEnter={() => setHoveredElement('vertical')}
            onMouseLeave={() => setHoveredElement(null)}
          />
          
          {/* Horizontal line */}
          <Line
            points={[0, y, width, y]}
            {...getLineStyle('horizontal')}
            onMouseEnter={() => setHoveredElement('horizontal')}
            onMouseLeave={() => setHoveredElement(null)}
          />
  
          {/* Center intersection marker */}
          <Group
            onMouseEnter={() => setHoveredElement('center')}
            onMouseLeave={() => setHoveredElement(null)}
            {...getCenterStyle()}
          >
            {/* Outer circle */}
            <Circle
              x={x}
              y={y}
              radius={8}
              stroke={colors.center}
              strokeWidth={1.5}
              opacity={getCenterStyle().opacity * 0.8}
              shadowColor={getCenterStyle().shadowColor}
              shadowBlur={getCenterStyle().shadowBlur}
              shadowOffset={{ x: 1, y: 1 }}
            />
            
            {/* Inner dot */}
            <Circle
              x={x}
              y={y}
              radius={2}
              fill={colors.center}
              opacity={getCenterStyle().opacity}
            />
            
            {/* Center cross lines */}
            <Line
              points={[x - 6, y, x + 6, y]}
              stroke={colors.center}
              strokeWidth={1}
              opacity={getCenterStyle().opacity}
            />
            <Line
              points={[x, y - 6, x, y + 6]}
              stroke={colors.center}
              strokeWidth={1}
              opacity={getCenterStyle().opacity}
            />
          </Group>
        </>
      </>
    );
  }

export const CrosshairActivity = {
  onMouseDown(e, state) {
    if (e.evt.button !== 0) return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const { crosshair, viewType } = state;
    const crossX = crosshair[viewType].x;
    const crossY = crosshair[viewType].y;

    const distToCenter = Math.sqrt(
      Math.pow(pointer.x - crossX, 2) + Math.pow(pointer.y - crossY, 2)
    );
    const threshold = 10;

    // Check if near vertical or horizontal line
    const distToVertical = Math.abs(pointer.x - crossX);
    const distToHorizontal = Math.abs(pointer.y - crossY);
    const lineThreshold = 7; // slightly smaller for lines

    if (distToCenter < threshold) {
      dragState.set(stage, {
        drag: "center",
        startX: pointer.x,
        startY: pointer.y
      });
    } else if (distToVertical < lineThreshold) {
      dragState.set(stage, {
        drag: "vertical",
        startX: pointer.x
      });
    } else if (distToHorizontal < lineThreshold) {
      dragState.set(stage, {
        drag: "horizontal",
        startY: pointer.y
      });
    } else {
      dragState.delete(stage);
    }
  },

  onMouseMove(e, state) {
    const stage = e.target.getStage();
    const s = dragState.get(stage);
    if (!s || !s.drag) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    let delta = { x: 0, y: 0 };
    if (s.drag === "center") {
      delta = {
        x: pointer.x - s.startX,
        y: pointer.y - s.startY
      };
      s.startX = pointer.x;
      s.startY = pointer.y;
    } else if (s.drag === "vertical") {
      delta = {
        x: pointer.x - s.startX,
        y: 0
      };
      s.startX = pointer.x;
    } else if (s.drag === "horizontal") {
      delta = {
        x: 0,
        y: pointer.y - s.startY
      };
      s.startY = pointer.y;
    }

    // Call unified update
    updateCrosshairFromDelta(state, delta);
  },

  onMouseUp(e) {
    const stage = e.target.getStage();
    const s = dragState.get(stage);
    if (s) s.drag = false;
  }
};

// Helper to update both crosshair + slice live
function updateCrosshairFromDelta(state, delta) {
  const {
    viewType,
    crosshair,
    setCrosshair,
    global,
    canvasSizes,
    drawnSizes,
    zooms,
    pans,
    currentSlices,
    updateWorldAndSlices,
    CoordinateUtils
  } = state;

  // Compute new canvas position
  const newCanvas = {
    x: crosshair[viewType].x + (delta.x || 0),
    y: crosshair[viewType].y + (delta.y || 0)
  };

  // Always use the latest canvasSizes and drawnSizes
  const params = CoordinateUtils.getViewParams(
    viewType,
    global,
    drawnSizes[viewType],
    canvasSizes
  );

  const newWorldPoint = CoordinateUtils.canvasToWorld(
    newCanvas,
    params,
    zooms[viewType],
    pans[viewType],
    viewType,
    global,
    currentSlices
  );

  const validatedWorld = CoordinateUtils.validateCoordinates(newWorldPoint, global);

  // Debug log to verify correct conversion
  
  
  
  
  

  // Update world + slices + crosshair
  if (typeof updateWorldAndSlices === "function") {
    updateWorldAndSlices(validatedWorld);
  }
}