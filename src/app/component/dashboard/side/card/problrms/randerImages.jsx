"use client"
import React, { useState, useContext, useRef, useEffect } from 'react';
import RanderImagWithPrroblem from './RanderImagWithPrroblem.jsx';
import styles from './randerImages.module.css';
import { DataContext } from '../../../dashboard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Grid, List, Maximize, Minimize } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function RanderImages({ teeth,viewModeState }) {
  const { data, setData, _, setImg } = useContext(DataContext);
  const {viewMode, setViewMode} = viewModeState;
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const dialogContentRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      dialogContentRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!teeth.problems || teeth.problems.length === 0) {
    return (
      <div className={`${styles.item} flex justify-center items-center h-[150px] w-[150px] min-h-[150px]`}>
        <RanderImagWithPrroblem 
          maskPoints={teeth['boundingBox']} 
          problems={[]} 
          size={150} 
        />
      </div>
    );
  }



  const openFullscreen = (index) => {
    setFullscreenIndex(index);
  };

  const closeFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setFullscreenIndex(null);
  };

  return (
    <div className="relative w-full h-full">


      {/* Fullscreen Dialog */}
      <Dialog open={fullscreenIndex !== null} onOpenChange={(open) => !open && closeFullscreen()}>
  <DialogContent 
    ref={dialogContentRef}
    className="p-0 h-[80vh] w-[80vh] max-w-[90vw] max-h-[90vh]"
  >
    {fullscreenIndex !== null && (
      <>
        <DialogHeader className={`p-4 ${isNativeFullscreen ? 'bg-background' : ''}`}>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {teeth.problems[fullscreenIndex]?.type || `Problem ${fullscreenIndex + 1}`}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className={`flex justify-center items-center ${isNativeFullscreen ? 
          'h-[calc(100vh-100px)]' : 
          'h-[calc(80vh-100px)]'}`}>
          <RanderImagWithPrroblem 
            maskPoints={teeth['boundingBox']} 
            size={isNativeFullscreen ? 1200 : 800} 
            problems={[teeth.problems[fullscreenIndex]]} 
            className={`${isNativeFullscreen ? 
              'max-h-[calc(100vh-100px)]' : 
              'max-h-[calc(80vh-100px)]'} w-full object-contain`}
          />
        </div>
      </>
    )}
  </DialogContent>
</Dialog>


      {/* Carousel View */}
      {viewMode === 'carousel' ? (
        <div className={`${styles.carouselContainer} h-full`}>
          <Carousel 
            className="w-full h-full"
            opts={{
              align: "center",
              loop: true,
            }}
          >
            <CarouselContent className="h-full">
              {teeth.problems.map((item, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="p-2 h-full flex flex-col items-center justify-center">
                    <div className="relative group h-full w-full max-w-md">
                      <RanderImagWithPrroblem 
                        maskPoints={teeth['boundingBox']} 
                        size={150} 
                        problems={[item]} 
                        className="rounded-lg shadow-xl transition-all duration-300 group-hover:shadow-2xl h-full w-full object-contain"
                      />
                      <button
                        onClick={() => openFullscreen(index)}
                        className="absolute top-2 left-2 bg-background/80 p-2 rounded-full hover:bg-accent"
                      >
                        <Maximize className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
                        <p className="text-white font-medium truncate">
                          {item.type || `Problem ${index+1}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {teeth.problems.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-accent text-foreground rounded-full p-3 shadow-lg backdrop-blur-sm" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-accent text-foreground rounded-full p-3 shadow-lg backdrop-blur-sm" />
              </>
            )}
          </Carousel>
        </div>
      ) : (
        /* Grid View */
        <div className="h-full overflow-y-auto" style={{display:"flex",gap:'10px',flexWrap:"wrap"}}>
          {teeth.problems.map((item, index) => (
            <div 
              key={index} 
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 relative group"
            >
              <RanderImagWithPrroblem 
                maskPoints={teeth['boundingBox']} 
                size={300} 
                problems={[item]} 
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => openFullscreen(index)}
                className="absolute top-2 left-2 bg-background/80 p-2 rounded-full hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Maximize className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white font-medium text-sm truncate">
                  {item.type || `Problem ${index+1}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RanderImages;