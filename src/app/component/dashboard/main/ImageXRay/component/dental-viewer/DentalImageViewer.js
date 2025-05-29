'use client';
import { useContext } from "react";
import { useState } from "react";
import ImageViewer from "./ImageViewer";
import DentalOverlays from "./DentalOverlays";
import ViewControls from "./ViewControls";
import { DataContext } from "@/app/component/dashboard/dashboard";

export default function DentalImageViewer({ image, tooth, ShowSetting }) {
  const { stageRef } = useContext(DataContext);


  const [viewState, setViewState] = useState({
    scale: 1,
    position: { x: 0, y: 0 },
    isDragging: false });

  const updateViewState = (newState) => {
    setViewState(prev => ({ ...prev, ...newState }));
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <ViewControls 
        viewState={viewState}
        updateViewState={updateViewState}
      />
      
      <ImageViewer
        image={image}
        stageRef={stageRef}
        viewState={viewState}
        updateViewState={updateViewState}
      >
        <DentalOverlays
          tooth={tooth}
          ShowSetting={ShowSetting}
          scale={viewState.scale}
        />
      </ImageViewer>
    </div>
  );
}