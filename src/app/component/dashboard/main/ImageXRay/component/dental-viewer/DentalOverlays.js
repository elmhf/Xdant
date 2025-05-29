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
            {...colorPalette.tooth}
            strokeWidth={colorPalette.tooth.strokeWidth / scale}
            closed
            perfectDrawEnabled={false}
          />
        )}

        {/* رسم المشاكل */}
        {teeth.problems?.filter(problem => ShowSetting.problems[`show${problem.type}`])
          .map((problem, pIndex) => (
            <Line
              key={`problem-${index}-${pIndex}`}
              points={adjustCoordinates(problem.mask, toothCenter)}
              {...colorPalette.problem}
              strokeWidth={colorPalette.problem.strokeWidth / scale}
              closed
              perfectDrawEnabled={false}
            />
          ))}
        
        {/* رسم الجذور */}
        {ShowSetting.showRoots && teeth.Root?.mask && (
          <Line
            points={adjustCoordinates(teeth.Root.mask, toothCenter)}
            {...colorPalette.root}
            strokeWidth={colorPalette.root.strokeWidth / scale}
            closed
            perfectDrawEnabled={false}
          />
        )}
        
        {/* رسم التيجان */}
        {ShowSetting.showCrown && teeth.Crown?.mask && (
          <Line
            points={adjustCoordinates(teeth.Crown.mask, toothCenter)}
            {...colorPalette.crown}
            strokeWidth={colorPalette.crown.strokeWidth / scale}
            closed
            perfectDrawEnabled={false}
          />
        )}
      </React.Fragment>
    );
  };

  return tooth.map(renderToothElements);
};

export default DentalOverlays;