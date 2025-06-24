"use client";
import React,{useEffect, useMemo} from "react";
import { DataContext } from "../../dashboard";
import useImageCard from "./component/useImageCard";
import ImageUploader from "./component/ImageUploader";
import ImageViewer from "./component/ImageViewer";
import FullScreenViewer from "./component/FullScreenViewer";
import LoadingState from "./component/states/LoadingState";
import ErrorState from "./component/states/ErrorState";
import { useDentalSettings } from "./component/CustomHook/useDentalSettings";
import useImageStore from "@/stores/ImageStore";
import { useDentalStore } from "@/stores/dataStore";

export default function ImageCard({ settings, SettingChange ,setSettings}) {

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
    handleSettingChange,
    handleDownload,downloadImageWithAnnotations
  } = useImageCard();
const { getImage } = useImageStore();
  console.log(getImage(),"images")
  const data = useDentalStore(state => state.data);

  console.log(data?.teeth,"data?.teeth")
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={handleReanalyze} />;
  if (!getImage()) return <ImageUploader onUpload={handleUpload} />;




  return (
    <>
      <ImageViewer
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
      
      {isFullScreen && (
        <FullScreenViewer
          image={getImage()}
          teethData={data?.teeth}
          settings={settings}
          onClose={toggleFullScreen}
          onDownload={handleDownload}
        />
      )}
    </>
  );
}