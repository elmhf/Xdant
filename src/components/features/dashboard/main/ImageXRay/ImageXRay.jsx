"use client";
import React, { useEffect, useMemo } from "react";
import { DataContext } from "../../dashboard";
import useImageCard from "./component/useImageCard";
import ImageViewer from "./component/ImageViewer";
import LoadingState from "./component/states/LoadingState";
import ErrorState from "./component/states/ErrorState";
import { useDentalSettings } from "./component/CustomHook/useDentalSettings";
import useImageStore from "@/stores/ImageStore";
import { useDentalStore } from "@/stores/dataStore";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton component for image placeholder
const ImageSkeleton = () => (
    <div className="flex justify-center p-0 max-w-[100%] ">
      <Skeleton className="min-h-[350px] w-[1200px] max-w-[90%] max-h-[90%] rounded-xl" />
    </div>
);

export default function ImageCard({ settings, SettingChange, setSettings ,showToolBar=true}) {
  const {
    images,
    isLoading,
    error,
    isFullScreen,
    showParameters,
    handleUpload,
    handleReanalyze,
    toggleFullScreen,
    setShowParameters,
    downloadImageWithAnnotations
  } = useImageCard();
  
  const { getImage } = useImageStore();
  console.log(getImage(),"getImage***")
  const data = useDentalStore(state => state.data);

  if (error) return <ErrorState error={error} onRetry={handleReanalyze} />;
  if (!getImage()) return <ImageSkeleton />;

  return (
    <>
      <ImageViewer
        showToolBar={showToolBar}
        image={getImage()}
        teethData={data?.teeth}
        settings={settings}
        showParameters={showParameters}
        onToggleParameters={() => setShowParameters(!showParameters)}
        onToggleFullScreen={toggleFullScreen}
        onDownload={downloadImageWithAnnotations}
        onChangeImage={handleUpload}
        onReanalyze={handleReanalyze}
        onSettingChange={SettingChange}
        setSettings={setSettings}
      />
    </>
  );
}