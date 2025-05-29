'use client';
import React from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { ZOOM_RANGE } from './constants';

const ViewControls = ({ viewState, updateViewState, onReset }) => {
  const zoom = (factor) => {
    const newScale = Math.max(ZOOM_RANGE.min, 
      Math.min(ZOOM_RANGE.max, viewState.scale * factor));
    updateViewState({ scale: newScale });
  };

  const fitToScreen = () => {
    if (viewState.containerSize.width && viewState.containerSize.height) {
      const scaleX = viewState.containerSize.width / viewState.containerSize.width;
      const scaleY = viewState.containerSize.height / viewState.containerSize.height;
      const newScale = Math.min(scaleX, scaleY);
      updateViewState({
        scale: newScale,
        position: { x: 0, y: 0 }
      });
    }
  };

  return (
    <div className="absolute top-3 right-3 z-10 flex gap-2 bg-black/70 p-2 rounded-md">
      <button
        onClick={() => zoom(1.2)}
        className="text-white p-1 hover:bg-white/20 rounded flex flex-col items-center"
        aria-label="Zoom in"
      >
        <ZoomIn size={20} />
        <span className="text-xs mt-1">تكبير</span>
      </button>
      
      <button
        onClick={() => zoom(0.8)}
        className="text-white p-1 hover:bg-white/20 rounded flex flex-col items-center"
        aria-label="Zoom out"
      >
        <ZoomOut size={20} />
        <span className="text-xs mt-1">تصغير</span>
      </button>
      
      <button
        onClick={fitToScreen}
        className="text-white p-1 hover:bg-white/20 rounded flex flex-col items-center"
        aria-label="Fit to screen"
      >
        <Maximize size={20} />
        <span className="text-xs mt-1">ملء الشاشة</span>
      </button>
      
      <button
        onClick={onReset}
        className="text-white p-1 hover:bg-white/20 rounded flex flex-col items-center"
        aria-label="Reset view"
      >
        <RotateCcw size={20} />
        <span className="text-xs mt-1">إعادة تعيين</span>
      </button>
    </div>
  );
};

export default ViewControls;