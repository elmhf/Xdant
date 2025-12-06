"use client";
import React from 'react';
import { motion } from 'framer-motion';
import DraggableSliceWrapper from './DraggableSliceWrapper';
import { NoSliceDataMessage } from './EmptyMessages';

// ✅ section متاع slices
const SlicesSection = React.memo(({ view, count, start, end, dragerstate, toothNumber, onView }) => {
    const numSlices = start > 0 && end > 0 ? end - start + 1 : 0;
    if (numSlices === 0) return <NoSliceDataMessage view={view} />;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-wrap gap-1">
                {Array.from({ length: numSlices }).map((_, idx) => (
                    <DraggableSliceWrapper
                        dragerstate={dragerstate}
                        key={`${view}-${start + idx}`}
                        view={view}
                        index={start + idx}
                        toothNumber={toothNumber}
                        onView={onView}
                    />
                ))}
            </div>
        </motion.div>
    );
});
SlicesSection.displayName = "SlicesSection";

export default SlicesSection;
