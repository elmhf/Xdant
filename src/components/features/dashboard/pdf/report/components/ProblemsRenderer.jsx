import React, { memo, useCallback } from 'react';
import { Line } from 'react-konva';
import { COLOR_PALETTE } from '../constants';

// مكون فرعي لرسم المشاكل
const ProblemsRenderer = memo(({ problems, showSettings, scale, adjustCoordinates, createLineProps }) => {
    const getProblemColor = useCallback((problemType) => {
        if (!problemType) return COLOR_PALETTE.caries;
        const type = problemType.toLowerCase();
        return COLOR_PALETTE[type] || COLOR_PALETTE.caries;
    }, []);

    return (
        <>
            {problems?.filter(problem => showSettings?.problems?.[`show${problem.type}`])
                .map((problem, pIndex) => {
                    const problemColor = getProblemColor(problem.type);
                    return (
                        <Line
                            key={`problem-${pIndex}`}
                            points={adjustCoordinates(problem.mask)}
                            {...createLineProps(problemColor, scale)}
                            closed
                        />
                    );
                })}
        </>
    );
});

export default ProblemsRenderer;
