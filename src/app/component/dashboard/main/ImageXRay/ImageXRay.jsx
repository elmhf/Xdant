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
export default function ImageCard() {

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
  console.log(images,"images")
    const { settings, SettingChange ,updateSettingProblem,setSettings} = useDentalSettings();
  const { data,ToothEditData } = React.useContext(DataContext);
  console.log(data?.teeth,"data?.teeth")
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={handleReanalyze} />;
  if (!images.length) return <ImageUploader onUpload={handleUpload} />;




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
          image={images[0]}
          teethData={data?.teeth}
          settings={imageSettings}
          onClose={toggleFullScreen}
          onDownload={handleDownload}
        />
      )}
    </>
  );
}