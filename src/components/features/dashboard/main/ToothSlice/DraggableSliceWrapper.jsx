"use client";
import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDentalStore } from "@/stores/dataStore";
import CroppedSlice from './CroppedSlice';

function DraggableSliceWrapper({ view, index, dragerstate, toothNumber, onView }) {
    const [isDragging, setIsDragging] = useState(false);
    const { setIfDragging, setslicedrager } = dragerstate
    // Remove position state to avoid re-renders
    // const [position, setPosition] = useState({ x: 0, y: 0 });
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

            if (!hasMoved.current && (dx > 5 || dy > 5)) { // Threshold for drag start
                hasMoved.current = true;
                setIsDragging(true);
                setIfDragging(true);
                setslicedrager({ 'view': view, 'index': index });
            }

            if (hasMoved.current && dragRef.current) {
                // Direct DOM manipulation for performance
                dragRef.current.style.transform = `translate(${moveEvent.clientX - 70}px, ${moveEvent.clientY - 70}px) scale(1.05)`;
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
    }, [view, index, setIfDragging, setslicedrager]);

    const handleClick = (e) => {
        if (!hasMoved.current && onView) {
            onView({ view, index });
        }
    };

    // Use a ref callback to set initial position when the portal mounts
    const setInitialPosition = useCallback((node) => {
        if (node && startPos.current) {
            dragRef.current = node;
            // Set initial position
            node.style.transform = `translate(${startPos.current.x - 70}px, ${startPos.current.y - 70}px) scale(1.05)`;
        }
    }, []);

    const floatingSlice = isDragging && createPortal(
        <div
            ref={setInitialPosition}
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 9999,
                pointerEvents: 'none',
                // transform is set via JS
                border: '2px dashed #7564ed',
                borderRadius: '0.5vw',
                willChange: 'transform' // Hint for browser optimization
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
