import { useState, useEffect, useCallback } from 'react';

// Hook مخصص لإدارة حجم الحاوية والمقياس
export const useContainerScale = (containerRef, imgObj) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const [scale, setScale] = useState(1);

    const updateSize = useCallback(() => {
        if (containerRef.current && imgObj) {
            const newContainerWidth = containerRef.current.clientWidth;
            setContainerWidth(newContainerWidth);

            const newScale = Math.min(newContainerWidth / imgObj.naturalWidth, 1);
            setScale(newScale);
        }
    }, [imgObj, containerRef]);

    useEffect(() => {
        updateSize();

        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [updateSize, containerRef]);

    return { containerWidth, scale };
};
