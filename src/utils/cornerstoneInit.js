import {
    init as csRenderInit,
    imageLoader,
    metaData,
    volumeLoader,
} from '@cornerstonejs/core';
import {
    init as csToolsInit,
    addTool,
    CrosshairsTool,
    StackScrollTool,
    ZoomTool,
    PanTool,
} from '@cornerstonejs/tools';
import { cornerstoneStreamingImageVolumeLoader } from '@cornerstonejs/streaming-image-volume-loader';

/**
 * Custom Image Loader for "web:" scheme
 * Loading JPG images as RGB for Cornerstone3D
 */
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

function webImageLoader(imageId) {
    const url = imageId.substring(4); // remove 'web:' prefix

    return {
        promise: new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'Anonymous'; // Important for CORS
            image.src = url;

            image.onload = () => {
                // Extract pixel data
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                const imageData = ctx.getImageData(0, 0, image.width, image.height);
                const pixelData = imageData.data; // Uint8ClampedArray (RGBA)

                // Convert RGBA to RGB if needed, or just usage RGBA.
                // Cornerstone3D supports RGB.

                const imageLoadObject = {
                    promise: Promise.resolve({
                        imageId,
                        minPixelValue: 0,
                        maxPixelValue: 255,
                        slope: 1,
                        intercept: 0,
                        windowCenter: 127,
                        windowWidth: 255,
                        getPixelData: () => pixelData, // Returns Uint8ClampedArray
                        rows: image.height,
                        columns: image.width,
                        height: image.height,
                        width: image.width,
                        color: true,
                        columnPixelSpacing: 1.0, // default
                        rowPixelSpacing: 1.0, // default
                        sizeInBytes: pixelData.byteLength,
                    }),
                };
                resolve(imageLoadObject);
            };

            image.onerror = (err) => {
                reject(err);
            };
        }),
        cancelFn: () => { },
    };
}

/**
 * Initializes Cornerstone libraries and registers tools.
 * Should be called once at application startup or component mount.
 */
export default async function initCornerstone() {
    // Register the loader and metadata provider BEFORE init if possible, or right after.
    // Cornerstone3D init handles webgl context, etc.

    // Register Web Image Loader
    imageLoader.registerImageLoader('web', webImageLoader);

    // Register Volume Loader
    volumeLoader.registerUnknownVolumeLoader(cornerstoneStreamingImageVolumeLoader);
    volumeLoader.registerVolumeLoader('cornerstoneStreamingImageVolume', cornerstoneStreamingImageVolumeLoader);

    await csRenderInit();
    await csToolsInit();

    // Add tools to Cornerstone3D
    addTool(CrosshairsTool);
    addTool(StackScrollTool);
    addTool(ZoomTool);
    addTool(PanTool);
}
