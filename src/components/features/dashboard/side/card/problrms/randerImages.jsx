"use client"
import React, { useState, useEffect } from 'react';
import RanderImagWithPrroblem from './RanderImagWithPrroblem.jsx';
import { Maximize, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function RanderImages({ teeth }) {
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (fullscreenIndex === null) return;
      
      if (e.key === 'Escape') {
        closeFullscreen();
      } else if (e.key === 'ArrowLeft') {
        navigateImage(-1);
      } else if (e.key === 'ArrowRight') {
        navigateImage(1);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [fullscreenIndex, teeth?.problems?.length]);

  if (!teeth) {
    return <div className="text-red-500">No teeth data available</div>;
  }

  const problems = teeth.problems || [];
  const hasProblems = problems.length > 0;
  const isFiveImages = problems.length === 5;

  const openFullscreen = (index) => {
    console.log('Opening fullscreen for index:', index);
    setFullscreenIndex(index);
    setImageLoaded(false);
  };

  const closeFullscreen = () => {
    console.log('Closing fullscreen');
    setFullscreenIndex(null);
    setImageLoaded(false);
  };

  const navigateImage = (direction) => {
    if (!hasProblems) return;
    
    const newIndex = fullscreenIndex + direction;
    if (newIndex >= 0 && newIndex < problems.length) {
      setFullscreenIndex(newIndex);
      setImageLoaded(false);
    }
  };

  const currentProblem = fullscreenIndex !== null && hasProblems ? problems[fullscreenIndex] : null;

  return (
    <>
        <div
          className={
            // gridContainer replacement
            `flex flex-row flex-wrap gap-1 items-center justify-start`
          }
        >
          {problems.map((problem, index) => {
            return (
              <div
                key={index}
                className={
                  // gridItem replacement
                  `relative group cursor-pointer overflow-hidden rounded-xl border border-gray-200 hover:border-blue-400 transition-all duration-200 hover:shadow-lg bg-white flex items-center justify-center h-[120px]`
                }
                onClick={() => {
                  console.log('Image clicked, index:', index);
                  openFullscreen(index);
                }}
              >
                <RanderImagWithPrroblem
                  maskPoints={teeth['boundingBox'] || teeth.boundingBox}
                  height={120}
                  problems={[problem]}
                  className="w-auto h-[150px] max-w-[120px] object-contain transition-transform duration-200 group-hover:scale-105"
                />
                {/* Hover overlay with maximize icon */}
                <div className="absolute inset-0 bg-[#0d0c22]/0 group-hover:bg-[#0d0c22]/20 transition-all duration-200 flex items-center justify-center">
                  <Maximize className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={24} />
                </div>
                {/* Problem type label */}
                {problem.type && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0d0c22]/80 to-transparent p-2">
                    <span className="text-white text-xs font-medium truncate block">
                      {problem.type}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      

      {/* Enhanced Fullscreen Dialog */}
      {fullscreenIndex !== null && (
        <Dialog open={true} onOpenChange={(open) => {
          console.log('Dialog onOpenChange:', open);
          if (!open) closeFullscreen();
        }}>
          <DialogContent className="p-0 h-[95vh] w-[95vw] max-w-7xl bg-[#0d0c22]/95 backdrop-blur-lg flex flex-col ">
            {currentProblem ? (
              <>
                {/* Header with problem info and navigation */}
                <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#0d0c22]/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <DialogTitle className="text-xl md:text-2xl text-white font-bold">
                        {currentProblem.type || `Problem ${fullscreenIndex + 1}`}
                      </DialogTitle>
                      <span className="text-white/70 text-sm">
                        {fullscreenIndex + 1} of {problems.length}
                      </span>
                    </div>
                    {/* Navigation and close buttons */}
                    <div className="flex items-center space-x-2">
                      {problems.length > 1 && (
                        <>
                          <button
                            onClick={() => navigateImage(-1)}
                            disabled={fullscreenIndex === 0}
                            className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-full p-2 transition-colors"
                            aria-label="Previous image"
                          >
                            <ChevronLeft size={20} className={fullscreenIndex === 0 ? 'opacity-50' : ''} />
                          </button>
                          <button
                            onClick={() => navigateImage(1)}
                            disabled={fullscreenIndex === problems.length - 1}
                            className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-full p-2 transition-colors"
                            aria-label="Next image"
                          >
                            <ChevronRight size={20} className={fullscreenIndex === problems.length - 1 ? 'opacity-50' : ''} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={closeFullscreen}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
                        aria-label="Close"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Main image container */}
                <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-16">
                  {/* Loading spinner */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                  )}
                  <div className="relative max-w-full max-h-full flex items-center justify-center">
                    <RanderImagWithPrroblem
                      maskPoints={teeth['boundingBox']}
                      size={1000}
                      problems={[currentProblem]}
                      className={` h-[100vh] w-[100vw] object-cover transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                    />
                  </div>
                </div>
                {/* Bottom info panel */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0d0c22]/80 to-transparent p-4">
                  <div className="text-center">
                    {currentProblem.description && (
                      <p className="text-white/90 text-sm md:text-base mb-2">
                        {currentProblem.description}
                      </p>
                    )}
                    <p className="text-white/70 text-xs">
                      Press <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">←</kbd> <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">→</kbd> to navigate • <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">Esc</kbd> to close
                    </p>
                  </div>
                </div>
                {/* Click outside to close overlay */}
                <div
                  className="absolute inset-0 -z-10"
                  onClick={closeFullscreen}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <p>Loading...</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default RanderImages;