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
    
    // Default styles (no hover)
    const getLineStyle = (lineType) => {
      const baseColor = colors[lineType];
      return {
        stroke: baseColor,
        strokeWidth: 2,
        opacity: opacity,
        shadowColor: "#222",
        shadowBlur: 4,
        shadowOffset: { x: 0, y: 0 },
        shadowOpacity: 0.3,
        perfectDrawEnabled: false,
      };
    };

    const getCenterStyle = () => {
      return {
        opacity: opacity,
        shadowBlur: 6,
        shadowColor: colors.center,
        scale: 1,
        shadowOpacity: 0.4,
        perfectDrawEnabled: false,
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
          />
          
          {/* Horizontal line */}
          <Line
            points={[0, y, width, y]}
            {...getLineStyle('horizontal')}
          />

          {/* Center intersection marker */}
          <Group
            scale={{ x: getCenterStyle().scale, y: getCenterStyle().scale }}
            opacity={getCenterStyle().opacity}
          >
            {/* Outer circle */}
            <Circle
              x={x}
              y={y}
              radius={10}
              stroke={colors.center}
              strokeWidth={2}
              opacity={getCenterStyle().opacity * 0.85}
              shadowColor={getCenterStyle().shadowColor}
              shadowBlur={getCenterStyle().shadowBlur}
              shadowOffset={{ x: 0, y: 0 }}
              shadowOpacity={getCenterStyle().shadowOpacity}
              perfectDrawEnabled={false}
            />
            
            {/* Inner dot */}
            <Circle
              x={x}
              y={y}
              radius={3}
              fill={colors.center}
              opacity={getCenterStyle().opacity}
              perfectDrawEnabled={false}
            />
            
            {/* Center cross lines */}
            <Line
              points={[x - 7, y, x + 7, y]}
              stroke={colors.center}
              strokeWidth={1.2}
              opacity={getCenterStyle().opacity}
              perfectDrawEnabled={false}
            />
            <Line
              points={[x, y - 7, x, y + 7]}
              stroke={colors.center}
              strokeWidth={1.2}
              opacity={getCenterStyle().opacity}
              perfectDrawEnabled={false}
            />
          </Group>
        </>
      </>
    );
  }