// CrosshairActivity.js
import React from "react";
import { Line, Group, Circle } from "react-konva";

export function CrosshairLayer({
  x,
  y,
  width,
  height,
  viewType,
  showCoordinates = true,
  showGridLines = false,
  opacity = 0.8,
  interactive = true,
}) {
  // 🎨 ألوان حسب نوع الـ View
  const colors = {
    axial: {
      vertical: "#00D4FF", // Cyan
      horizontal: "#FF6B6B", // Red
      center: "#FFFFFF", // White
    },
    coronal: {
      vertical: "#A855F7", // Purple
      horizontal: "#FF6B6B", // Red
      center: "#FFFFFF",
    },
    sagittal: {
      vertical: "#A855F7", // Purple
      horizontal: "#00D4FF", // Cyan
      center: "#FFFFFF",
    },
    default: {
      vertical: "#CCCCCC",
      horizontal: "#CCCCCC",
      center: "#FFFF00",
    },
  }[viewType] || colors.default;

  // 🎯 Line Style
  const lineStyle = (color) => ({
    stroke: color,
    strokeWidth: 2,
    opacity,
    shadowColor: "#111",
    shadowBlur: 2,
    shadowOpacity: 0.25,
    perfectDrawEnabled: false,
  });

  // 🎯 Center Style
  const centerStyle = {
    shadowBlur: 6,
    shadowColor: colors.center,
    shadowOpacity: 0.4,
    perfectDrawEnabled: false,
  };

  return (
    <Group listening={interactive}>
      {/* Grid Lines */}
      {showGridLines &&
        [...Array(Math.floor(width / 50)).keys()].map((i) => (
          <Line
            key={`v-${i}`}
            points={[i * 50, 0, i * 50, height]}
            stroke="#555"
            strokeWidth={0.5}
            opacity={0.25}
            dash={[3, 5]}
          />
        ))}
      {showGridLines &&
        [...Array(Math.floor(height / 50)).keys()].map((i) => (
          <Line
            key={`h-${i}`}
            points={[0, i * 50, width, i * 50]}
            stroke="#555"
            strokeWidth={0.5}
            opacity={0.25}
            dash={[3, 5]}
          />
        ))}

      {/* Crosshair Lines */}
      <Line points={[x, 0, x, height]} {...lineStyle(colors.vertical)} />
      <Line points={[0, y, width, y]} {...lineStyle(colors.horizontal)} />

      {/* Center Marker */}
      <Group>
        <Circle
          x={x}
          y={y}
          radius={10}
          stroke={colors.center}
          strokeWidth={2}
          opacity={opacity * 0.85}
          {...centerStyle}
        />
        <Circle x={x} y={y} radius={3} fill={colors.center} opacity={opacity} />
        <Line
          points={[x - 7, y, x + 7, y]}
          stroke={colors.center}
          strokeWidth={1}
          opacity={opacity}
        />
        <Line
          points={[x, y - 7, x, y + 7]}
          stroke={colors.center}
          strokeWidth={1}
          opacity={opacity}
        />
      </Group>
    </Group>
  );
}
