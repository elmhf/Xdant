"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDentalStore } from "@/stores/dataStore";
import { useSliceImage, useSliceRegion } from "@/app/(dashboard)/patient/[patientId]/[report_id]/ToothSlice/[toothId]/useSliceImage";
import { getRandomRegion } from './utils/sliceUtils';

// ✅ Modal for viewing larger slice
// ✅ Modal for viewing larger slice with Zoom & Pan
const SliceViewerModal = React.memo(({ view, index, onClose, toothNumber, onNavigate, canNavPrev, canNavNext, zoom, setZoom, region, setRegion }) => {
    const img = useSliceImage(view, index);
    // Removed local zoom/region states to persist them from parent
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);

    // Store actions for selection
    const addToothSlice = useDentalStore(state => state.addToothSlice);
    const removeToothSlice = useDentalStore(state => state.removeToothSlice);
    const getToothSlices = useDentalStore(state => state.getToothSlices);

    // Check if current slice is selected
    const selectedSlices = getToothSlices(toothNumber, view) || [];
    const isSelected = selectedSlices.includes(index);

    // Measure container dimensions
    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            });
        }

        // Prevent background scrolling
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    // Re-use logic to get region (consistent with random region)
    useEffect(() => {
        if (img && img.width && img.height && !region) {
            setRegion(getRandomRegion(img.width, img.height));
        }
    }, [img, region, setRegion]);

    const xConstraint = (dimensions.width * (zoom - 1)) / 2;
    const yConstraint = (dimensions.height * (zoom - 1)) / 2;

    const { croppedUrl } = useSliceRegion(view, index, region);

    // Handle wheel for zoom - prevent default to stop page scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onWheel = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.deltaY < 0) {
                setZoom(prev => Math.min(prev + 0.1, 5));
            } else {
                setZoom(prev => Math.max(prev - 0.1, 1));
            }
        };

        container.addEventListener('wheel', onWheel, { passive: false });
        return () => container.removeEventListener('wheel', onWheel);
    }, [setZoom]);

    const handleSelectionChange = () => {
        if (isSelected) {
            removeToothSlice(toothNumber, view, index);
        } else {
            addToothSlice(toothNumber, view, index);
        }
    };

    if (!view || !index) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#7564ed5e] backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl w-[900px] max-w-[95vw] h-[80vh] flex flex-col overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-6 pb-2">
                    <div>
                        <h3 className="text-2xl font-bold capitalize text-gray-900 mb-1">
                            {view === 'axial' ? 'Vue axiale' :
                                view === 'sagittal' ? 'Vue sagittale' :
                                    view === 'coronal' ? 'Vue coronale' : `${view} View`}
                        </h3>
            
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden relative">

                    {/* Image Container */}
                    <div
                        className="flex-1 bg-gray-100 m-4 mr-0 rounded-lg overflow-hidden relative flex items-center justify-center cursor-default group"
                        ref={containerRef}
                    >
                        {croppedUrl ? (
                            <motion.div
                                drag
                                dragMomentum={false}
                                dragElastic={0.2}
                                dragConstraints={{
                                    left: -xConstraint,
                                    right: xConstraint,
                                    top: -yConstraint,
                                    bottom: yConstraint
                                }}
                                animate={{ scale: zoom }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{ cursor: "grab" }}
                                onDragStart={(e) => { e.target.style.cursor = "grabbing"; }}
                                onDragEnd={(e) => { e.target.style.cursor = "grab"; }}
                                className="flex items-center justify-center w-full h-full relative"
                            >
                                <img
                                    src={croppedUrl}
                                    alt={`Slice ${index}`}
                                    className="w-full h-full object-contain pointer-events-none select-none"
                                />
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                                <span>Loading...</span>
                            </div>
                        )}

                        {/* Slice Number Badge inside image */}
                        <span className="absolute top-2 right-2 text-[#f43f5e] font-bold text-lg drop-shadow-md z-10 pointer-events-none">
                            {index}
                        </span>

                        {/* Zoom Hint (visible on hover if zoom is 1) */}
                        {zoom === 1 && (
                            <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                                Scroll to zoom
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        {onNavigate && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
                                    disabled={!canNavPrev}
                                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition-all z-20 ${canNavPrev ? 'hover:bg-white text-gray-800' : 'opacity-50 cursor-not-allowed text-gray-400'}`}
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
                                    disabled={!canNavNext}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition-all z-20 ${canNavNext ? 'hover:bg-white text-gray-800' : 'opacity-50 cursor-not-allowed text-gray-400'}`}
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Right Zoom Slider */}
                    <div className="w-14 flex flex-col items-center py-4 bg-white px-2 border-l border-gray-100 min-h-full justify-center">
                        <div className="h-full py-8 flex flex-col items-center justify-center">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="0.1"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="h-full w-2 appearance-none bg-gray-200 rounded-lg outline-none cursor-pointer slider-vertical"
                                style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical', height: '100%' }}
                                title="Zoom Level"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-white">
                    <label className="flex items-center gap-2 cursor-pointer w-fit select-none">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-gray-800 border-gray-800' : 'border-gray-400 bg-white'}`}>
                            {isSelected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={handleSelectionChange}
                        />
                        <span className="text-gray-700 font-medium">Choisi</span>
                    </label>
                </div>

            </motion.div>
        </div>
    );
});
SliceViewerModal.displayName = "SliceViewerModal";

export default SliceViewerModal;
