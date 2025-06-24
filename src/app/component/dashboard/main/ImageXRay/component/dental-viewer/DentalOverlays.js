'use client';
import React from 'react';
import { Line } from 'react-konva';

const DentalOverlays = ({ 
  tooth, 
  ShowSetting, 
  scale, 
  containerSize,
  colorPalette
}) => {
  const centerImageOffset = {
    x: containerSize.width / 2,
    y: containerSize.height / 2
  };

  const adjustCoordinates = (mask, toothCenter) => {
    if (!Array.isArray(mask)) return [];
    return mask.map(([x, y]) => [
      x + toothCenter.x - centerImageOffset.x,
      y + toothCenter.y - centerImageOffset.y
    ]).flat();
  };

  // Helper to apply shadow properties to Line elements
  const applyShadowProps = (style, currentScale) => {
    const props = {
      fill: style.fill,
      stroke: style.stroke,
      strokeWidth: style.strokeWidth / currentScale,
      perfectDrawEnabled: false,
    };

    // Apply shadow if available
    if (style.shadowColor) {
      props.shadowColor = style.shadowColor;
      props.shadowBlur = (style.shadowBlur || 3) / currentScale;
      props.shadowOffset = { x: 1 / currentScale, y: 1 / currentScale };
    }

    return props;
  };

  const renderToothElements = (teeth, index) => {
    if (!teeth.teeth_mask) return null;
    
    const toothCenter = {
      x: teeth.teeth_mask.reduce((sum, [x]) => sum + x, 0) / teeth.teeth_mask.length,
      y: teeth.teeth_mask.reduce((sum, [, y]) => sum + y, 0) / teeth.teeth_mask.length
    };

    return (
      <React.Fragment key={`tooth-${index}`}>
        {/* رسم الأسنان */}
        {ShowSetting.showTeeth && (
          <Line
            points={adjustCoordinates(teeth.teeth_mask, toothCenter)}
            {...applyShadowProps(colorPalette.tooth, scale)}
            closed
          />
        )}

        {/* رسم المشاكل */}
        {teeth.problems?.filter(problem => ShowSetting.problems[`show${problem.type}`])
          .map((problem, pIndex) => (
            <Line
              key={`problem-${index}-${pIndex}`}
              points={adjustCoordinates(problem.mask, toothCenter)}
              {...applyShadowProps(colorPalette.problem, scale)}
              closed
            />
          ))}
        
        {/* رسم الجذور */}
        {ShowSetting.showRoots && teeth.Root?.mask && (
          <Line
            points={adjustCoordinates(teeth.Root.mask, toothCenter)}
            {...applyShadowProps(colorPalette.root, scale)}
            closed
          />
        )}
        
        {/* رسم التيجان */}
        {ShowSetting.showCrown && teeth.Crown?.mask && (
          <Line
            points={adjustCoordinates(teeth.Crown.mask, toothCenter)}
            {...applyShadowProps(colorPalette.crown, scale)}
            closed
          />
        )}
      </React.Fragment>
    );
  };

  return tooth.map(renderToothElements);
};

export default DentalOverlays;