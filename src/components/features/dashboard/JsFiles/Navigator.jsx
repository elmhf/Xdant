'use client';
import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navigator = ({
    image,
    transform,
    containerSize,
    onTransformChange,
    onClose,
    maxWidth = 180,
    maxHeight = 120
}) => {
    const { t } = useTranslation();
    const navCanvasRef = useRef(null);

    // Calculate navigator dimensions maintained aspect ratio
    const navSize = useMemo(() => {
        if (!image || !image.naturalWidth) return { width: 0, height: 0, ratio: 1 };

        const imageRatio = image.naturalWidth / image.naturalHeight;
        let width = maxWidth;
        let height = width / imageRatio;

        if (height > maxHeight) {
            height = maxHeight;
            width = height * imageRatio;
        }

        return {
            width,
            height,
            ratio: width / image.naturalWidth
        };
    }, [image, maxWidth, maxHeight]);

    // Calculate viewport rectangle relative to navigator coordinates
    const viewportRect = useMemo(() => {
        if (!containerSize.width || !navSize.width || !transform.scale) return null;

        // The transform (x, y) is where the image (0,0) is in container coordinates
        // We want to find what part of the image is at container (0,0) to container (width, height)

        // Top-left of container in image coords:
        const imgX1 = -transform.x / transform.scale;
        const imgY1 = -transform.y / transform.scale;

        // Bottom-right of container in image coords:
        const imgX2 = (containerSize.width - transform.x) / transform.scale;
        const imgY2 = (containerSize.height - transform.y) / transform.scale;

        return {
            x: imgX1 * navSize.ratio,
            y: imgY1 * navSize.ratio,
            width: (imgX2 - imgX1) * navSize.ratio,
            height: (imgY2 - imgY1) * navSize.ratio
        };
    }, [transform, containerSize, navSize]);

    // Handle click/drag on navigator to pan main view
    const handleNavInteraction = useCallback((e) => {
        if (!onTransformChange || !image || !navCanvasRef.current) return;

        const rect = navCanvasRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convert navigator click to image center point
        const imgCenterX = clickX / navSize.ratio;
        const imgCenterY = clickY / navSize.ratio;

        // New transform (x,y) to center this image point in the container
        const newX = (containerSize.width / 2) - (imgCenterX * transform.scale);
        const newY = (containerSize.height / 2) - (imgCenterY * transform.scale);

        onTransformChange({ x: newX, y: newY });
    }, [navSize, containerSize, transform.scale, onTransformChange, image]);

    const handleMouseDown = (e) => {
        handleNavInteraction(e);
        // Add mousemove listener for dragging
        const handleMouseMove = (mmE) => handleNavInteraction(mmE);
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    if (!image || !navSize.width) return null;

    return (
        <div className="absolute bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#1e1e2e]/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden group">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-white/5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('dashboard.navigator')}</span>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-500 hover:text-white"
                    >
                        <X size={12} />
                    </button>
                </div>

                {/* Map Area */}
                <div
                    ref={navCanvasRef}
                    className="relative cursor-crosshair select-none m-2"
                    style={{ width: navSize.width, height: navSize.height }}
                    onMouseDown={handleMouseDown}
                >
                    {/* Background Image Thumbnail */}
                    <img
                        src={image.src}
                        alt={t('dashboard.thumbnailAlt')}
                        className="w-full h-full object-contain opacity-60 grayscale brightness-75"
                        draggable={false}
                    />

                    {/* Viewport Bounding Box */}
                    {viewportRect && (
                        <div
                            className="absolute border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] pointer-events-none transition-none"
                            style={{
                                left: Math.max(0, Math.min(navSize.width, viewportRect.x)),
                                top: Math.max(0, Math.min(navSize.height, viewportRect.y)),
                                width: Math.min(navSize.width - viewportRect.x, viewportRect.width),
                                height: Math.min(navSize.height - viewportRect.y, viewportRect.height),
                                boxShadow: 'inset 0 0 0 1000px rgba(255,255,255,0.1)'
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navigator;
