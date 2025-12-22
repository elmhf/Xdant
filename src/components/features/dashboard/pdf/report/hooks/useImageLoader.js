import { useState, useEffect } from 'react';

// Hook مخصص لإدارة الصورة
export const useImageLoader = (imageUrl) => {
    const [imgState, setImgState] = useState({
        imgObj: null,
        imgSize: { width: 0, height: 0 },
        isLoading: true,
        error: null
    });

    useEffect(() => {
        if (!imageUrl) {
            setImgState(prev => ({ ...prev, isLoading: false, error: 'No image URL provided' }));
            return;
        }

        const img = new window.Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            setImgState({
                imgObj: img,
                imgSize: { width: img.naturalWidth, height: img.naturalHeight },
                isLoading: false,
                error: null
            });
        };

        img.onerror = () => {
            setImgState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to load image'
            }));
        };

        img.src = imageUrl;
    }, [imageUrl]);

    return imgState;
};
