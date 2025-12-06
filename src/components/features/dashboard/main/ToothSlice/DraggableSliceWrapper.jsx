"use client";
import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDentalStore } from "@/stores/dataStore";
import CroppedSlice from './CroppedSlice';

function DraggableSliceWrapper({ view, index, dragerstate, toothNumber, onView }) {
    const [isDragging, setIsDragging] = useState(false);
    const { setIfDragging, setslicedrager } = dragerstate
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragRef = useRef(null);
    const startPos = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);

    // Get selected slices from store
    const getToothSlices = useDentalStore(state => state.getToothSlices);
    const selectedSlices = getToothSlices(toothNumber, view) || [];
    const isSelected = selectedSlices.includes(index);

    const handleDragStart = useCallback((event) => {
        // Only left click
        if (event.button !== 0) return;

        startPos.current = { x: event.clientX, y: event.clientY };
        hasMoved.current = false;

        const handleMouseMove = (moveEvent) => {
            const dx = Math.abs(moveEvent.clientX - startPos.current.x);
            const dy = Math.abs(moveEvent.clientY - startPos.current.y);
            if (dx > 5 || dy > 5) { // Threshold for drag
                hasMoved.current = true;
                if (!isDragging) {
                    setIsDragging(true);
                    setIfDragging(true);
                    setslicedrager({ 'view': view, 'index': index });
                    setPosition({
                        x: moveEvent.clientX - 70,
                        y: moveEvent.clientY - 70
                    });
                }
            }
            if (hasMoved.current) {
                setPosition({
                    x: moveEvent.clientX - 70,
                    y: moveEvent.clientY - 70
                });
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            if (hasMoved.current) {
                setIsDragging(false);
                setIfDragging(false);
                setslicedrager({ 'view': null, 'index': null });
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [view, index, isDragging, setIfDragging, setslicedrager]);

    const handleClick = (e) => {
        if (!hasMoved.current && onView) {
            onView({ view, index });
        }
    };

    const floatingSlice = isDragging && createPortal(
        <div
            ref={dragRef}
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                zIndex: 9999,
                pointerEvents: 'none',
                transform: 'scale(1.05)',
                border: '2px dashed #7564ed',
                borderRadius: '0.5vw'
            }}
        >
            <CroppedSlice view={view} index={index} isSelected={isSelected} />
        </div>,
        document.body
    );

    return (
        <>
            <div
                className={`transition-all duration-200 ${isDragging
                    ? "opacity-40 border-2 border-dashed border-gray-400"
                    : ""
                    }`}
                onMouseDown={handleDragStart}
                onClick={handleClick}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <CroppedSlice view={view} index={index} isSelected={isSelected} />
            </div>
            {floatingSlice}
        </>
    );
}

export default DraggableSliceWrapper;
