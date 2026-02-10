import React, { useEffect, useRef, useState } from 'react';
import {
    RenderingEngine,
    Enums,
    volumeLoader,
    setVolumesForViewports,
    getRenderingEngine,
    metaData,
} from '@cornerstonejs/core';
import {
    Enums as csToolsEnums,
    ToolGroupManager,
    CrosshairsTool,
    StackScrollTool,
    ZoomTool,
    PanTool,
} from '@cornerstonejs/tools';
import initCornerstone from '@/utils/cornerstoneInit';

// Define the IDs for the viewports and rendering engine
const RENDERING_ENGINE_ID = 'my_mpr_rendering_engine';
const TOOL_GROUP_ID = 'mpr_tool_group';

const VIEWPORT_IDS = {
    AXIAL: 'AXIAL_VIEWPORT',
    SAGITTAL: 'SAGITTAL_VIEWPORT',
    CORONAL: 'CORONAL_VIEWPORT',
};

// Metadata injection to fix "pixelRepresentation" undefined error
// Using a Custom Metadata Provider because metaData.add is not available in Cornerstone3D

const metadataCache = new Map();

function customMetaDataProvider(type, imageId) {
    const imageMetadata = metadataCache.get(imageId);
    // console.log(`[MetadataProvider] Query: type=${type}, imageId=${imageId}, found=${!!imageMetadata}`);
    if (!imageMetadata) {
        return;
    }
    return imageMetadata[type];
}

metaData.addProvider(customMetaDataProvider, 10000); // Register once with high priority

function preCacheMetaData(imageIds) {
    console.log(`[MPRViewer] Caching metadata for ${imageIds.length} images`);
    imageIds.forEach((imageId, index) => {
        // Use provided pixel spacing or default to 0.3mm (standard dental CT approximation)
        const spacing = 0.3;

        // Define Image Plane Metadata (Position & Orientation)
        const imagePlaneModule = {
            pixelSpacing: [spacing, spacing],
            rows: 512, // Standard size, can be dynamic if we loaded image first
            columns: 512,
            imageOrientationPatient: [1, 0, 0, 0, 1, 0], // Identity matrix (Axial)
            rowCosines: [1, 0, 0],
            columnCosines: [0, 1, 0],
            imagePositionPatient: [0, 0, index * spacing], // Stack along Z-axis
            sliceThickness: spacing,
        };

        // Define Image Pixel Metadata (The fix for the error)
        const imagePixelModule = {
            pixelRepresentation: 0, // 0 = Unsigned (Fixes the TypeError)
            bitsAllocated: 8,
            bitsStored: 8,
            highBit: 7,
            photometricInterpretation: 'RGB', // Changed to RGB since we are likely loading standard images
            samplesPerPixel: 3, // 3 for RGB
        };

        // Store in local cache
        metadataCache.set(imageId, {
            imagePlaneModule,
            imagePixelModule
        });
    });
    console.log(`[MPRViewer] Metadata cache populated. Keys:`, Array.from(metadataCache.keys()).slice(0, 3));
}

const MPRViewer = ({ imageIds, initialTeethPosition }) => {
    const elementRef1 = useRef(null);
    const elementRef2 = useRef(null);
    const elementRef3 = useRef(null);
    const runningRef = useRef(false);

    // eslint-disable-next-line no-unused-vars
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Guard clause for empty imageIds
        if (!imageIds || imageIds.length === 0) return;

        const setup = async () => {
            // Prevent running twice in strict mode dev
            if (runningRef.current) return;
            runningRef.current = true;

            try {
                await initCornerstone();
                setInitialized(true);

                const volumeId = 'cornerstoneStreamingImageVolume:my-volume-id'; // Unique ID for the volume

                // Inject metadata BEFORE creating the volume
                preCacheMetaData(imageIds);

                // Define the three viewports
                const viewportInput = [
                    {
                        viewportId: VIEWPORT_IDS.AXIAL,
                        type: Enums.ViewportType.ORTHOGRAPHIC,
                        element: elementRef1.current,
                        defaultOptions: {
                            orientation: Enums.OrientationAxis.AXIAL,
                        },
                    },
                    {
                        viewportId: VIEWPORT_IDS.SAGITTAL,
                        type: Enums.ViewportType.ORTHOGRAPHIC,
                        element: elementRef2.current,
                        defaultOptions: {
                            orientation: Enums.OrientationAxis.SAGITTAL,
                        },
                    },
                    {
                        viewportId: VIEWPORT_IDS.CORONAL,
                        type: Enums.ViewportType.ORTHOGRAPHIC,
                        element: elementRef3.current,
                        defaultOptions: {
                            orientation: Enums.OrientationAxis.CORONAL,
                        },
                    },
                ];

                // Create Rendering Engine
                const renderingEngine = new RenderingEngine(RENDERING_ENGINE_ID);
                renderingEngine.setViewports(viewportInput);

                // Define a Volume
                const volume = await volumeLoader.createAndCacheVolume(volumeId, {
                    imageIds,
                });

                // Load the volume
                volume.load();

                // set the volume to all viewports
                await setVolumesForViewports(
                    renderingEngine,
                    [
                        {
                            volumeId,
                        },
                    ],
                    [VIEWPORT_IDS.AXIAL, VIEWPORT_IDS.SAGITTAL, VIEWPORT_IDS.CORONAL]
                );


                // --- Tools Setup ---
                // Define a ToolGroup to manage tools for these viewports
                let toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
                if (!toolGroup) {
                    toolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);
                }

                // Add Tools to the ToolGroup
                if (toolGroup) {
                    toolGroup.addTool(CrosshairsTool.toolName, {
                        getReferenceLineColor: (viewportId) => {
                            const colors = {
                                [VIEWPORT_IDS.AXIAL]: 'rgb(200, 0, 0)', // Red
                                [VIEWPORT_IDS.SAGITTAL]: 'rgb(0, 200, 0)', // Green
                                [VIEWPORT_IDS.CORONAL]: 'rgb(0, 0, 200)', // Blue
                            };
                            return colors[viewportId] || 'rgb(200, 200, 0)';
                        },
                        viewportIndicators: false, // Optional: disable viewport indicators if desired
                    });
                    toolGroup.addTool(StackScrollTool.toolName);
                    toolGroup.addTool(ZoomTool.toolName);
                    toolGroup.addTool(PanTool.toolName);

                    // Set Tool States
                    toolGroup.setToolActive(CrosshairsTool.toolName, {
                        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
                    });
                    toolGroup.setToolActive(StackScrollTool.toolName);
                    toolGroup.setToolActive(ZoomTool.toolName, {
                        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }], // Right Click Zoom
                    });
                    toolGroup.setToolActive(PanTool.toolName, {
                        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }], // Middle Click Pan
                    });


                    // Apply the ToolGroup to all Viewports
                    toolGroup.addViewport(VIEWPORT_IDS.AXIAL, RENDERING_ENGINE_ID);
                    toolGroup.addViewport(VIEWPORT_IDS.SAGITTAL, RENDERING_ENGINE_ID);
                    toolGroup.addViewport(VIEWPORT_IDS.CORONAL, RENDERING_ENGINE_ID);
                }

                // Initial Render
                renderingEngine.render();

                // Optional: Jump to initial position if provided
                if (initialTeethPosition) {
                    // Logic to jump to specific world coordinates would go here
                    // e.g. using jumpToSlice or manipulating the camera
                    // const viewport = renderingEngine.getViewport(VIEWPORT_IDS.AXIAL);
                    // ...
                }

            } catch (error) {
                console.error("Failed to initialize MPR Viewer:", error);
            }
        };

        setup();

        // CLEANUP
        return () => {
            const renderingEngine = getRenderingEngine(RENDERING_ENGINE_ID);
            const toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);

            toolGroup?.destroy();
            renderingEngine?.destroy();
            runningRef.current = false;
        };
    }, [imageIds, initialTeethPosition]);

    if (!imageIds || imageIds.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-gray-500">
                <p>No 3D Image Data Available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-1 bg-black p-1">
            <div className="flex-none text-white text-xs p-1">
                MPR Viewer (Axial, Sagittal, Coronal) - Left: Crosshairs, Right: Zoom, Middle: Pan, Wheel: Scroll
            </div>
            <div className="grid grid-rows-2 grid-cols-2 gap-1 w-full h-full flex-1">

                {/* Top Left: AXIAL */}
                <div className="relative w-full h-full border border-gray-800 overflow-hidden">
                    <div ref={elementRef1} className="w-full h-full" onContextMenu={(e) => e.preventDefault()} />
                    <div className="absolute top-2 left-2 text-red-500 font-bold text-sm pointer-events-none">Axial</div>
                </div>

                {/* Top Right: SAGITTAL */}
                <div className="relative w-full h-full border border-gray-800 overflow-hidden">
                    <div ref={elementRef2} className="w-full h-full" onContextMenu={(e) => e.preventDefault()} />
                    <div className="absolute top-2 left-2 text-green-500 font-bold text-sm pointer-events-none">Sagittal</div>
                </div>

                {/* Bottom Left: CORONAL */}
                <div className="relative w-full h-full border border-gray-800 overflow-hidden">
                    <div ref={elementRef3} className="w-full h-full" onContextMenu={(e) => e.preventDefault()} />
                    <div className="absolute top-2 left-2 text-blue-500 font-bold text-sm pointer-events-none">Coronal</div>
                </div>

                {/* Bottom Right: 3D or Info (Placeholder for now) */}
                <div className="relative w-full h-full border border-gray-800 bg-gray-900 flex items-center justify-center text-gray-500">
                    <div>
                        <p>3D Volume Render</p>
                        <p className="text-xs">(Coming Soon)</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MPRViewer;
