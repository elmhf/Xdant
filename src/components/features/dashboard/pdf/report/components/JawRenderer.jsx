import React, { memo, useCallback } from 'react';
import { Line } from 'react-konva';
import { COLOR_PALETTE } from '../constants';

// مكون فرعي لرسم الفك
const JawRenderer = memo(({ JAw, showSettings, scale }) => {
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

    if (!showSettings?.CBCTAnalysis?.showJaw) return null;

    return (
        <>
            {/* الفك العلوي */}
            {showSettings?.Jaw?.showUpperJaw && JAw.upperJaw?.mask?.length > 0 && (
                <Line
                    points={adjustCoordinates(JAw.upperJaw.mask)}
                    {...createLineProps(COLOR_PALETTE.jaw, scale)}
                    closed
                />
            )}

            {/* الفك السفلي */}
            {showSettings?.Jaw?.showLowerJaw && JAw.lowerJaw?.mask?.length > 0 && (
                <Line
                    points={adjustCoordinates(JAw.lowerJaw.mask)}
                    {...createLineProps(COLOR_PALETTE.jaw, scale)}
                    closed
                />
            )}
        </>
    );
});

export default JawRenderer;
