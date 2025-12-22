import React, { memo, useCallback } from 'react';
import { Line } from 'react-konva';
import { COLOR_PALETTE } from '../constants';
import ProblemsRenderer from './ProblemsRenderer';

// مكون فرعي لرسم السن الواحد
const ToothRenderer = memo(({ tooth, index, showSettings, scale }) => {
    const adjustCoordinates = useCallback((mask) => {
        if (!Array.isArray(mask)) return [];
        return mask.flat();
    }, []);

    const createLineProps = useCallback((colorConfig, currentScale) => {
        const props = {
            fill: colorConfig.fill,
            stroke: colorConfig.stroke,
            strokeWidth: colorConfig.strokeWidth / currentScale,
            perfectDrawEnabled: false,
            listening: false,
        };

        if (colorConfig.shadowColor) {
            props.shadowColor = colorConfig.shadowColor;
            props.shadowBlur = (colorConfig.shadowBlur || 3) / currentScale;
            props.shadowOffset = { x: 1 / currentScale, y: 1 / currentScale };
        }

        if (colorConfig.lineDash) {
            props.dash = colorConfig.lineDash.map(d => d / currentScale);
        }

        return props;
    }, []);

    const getToothColor = useCallback((toothData) => {
        if (toothData.condition) {
            const condition = toothData.condition.toLowerCase();
            return COLOR_PALETTE[condition] || COLOR_PALETTE.tooth;
        }
        return COLOR_PALETTE.tooth;
    }, []);

    if (!tooth.teeth_mask) return null;

    const toothColor = getToothColor(tooth);

    return (
        <React.Fragment key={`tooth-${index}`}>
            {/* محيط السن */}
            {showSettings?.CBCTAnalysis?.showTeeth && (
                <Line
                    points={adjustCoordinates(tooth.teeth_mask)}
                    {...createLineProps(toothColor, scale)}
                    closed
                />
            )}

            {/* المشاكل */}
            <ProblemsRenderer
                problems={tooth.problems}
                showSettings={showSettings}
                scale={scale}
                adjustCoordinates={adjustCoordinates}
                createLineProps={createLineProps}
            />

            {/* الجذر */}
            {showSettings?.CBCTAnalysis?.showRoots && tooth.Root?.mask && (
                <Line
                    points={adjustCoordinates(tooth.Root.mask)}
                    {...createLineProps(COLOR_PALETTE.root, scale)}
                    closed
                />
            )}

            {/* التاج */}
            {showSettings?.CBCTAnalysis?.showCrown && tooth.Crown?.mask && (
                <Line
                    points={adjustCoordinates(tooth.Crown.mask)}
                    {...createLineProps(COLOR_PALETTE.crown, scale)}
                    closed
                />
            )}
        </React.Fragment>
    );
});

export default ToothRenderer;
