"use client"
import React,{useEffect,useState} from "react";
import RanderProblemDrw from "@/app/component/dashboard/JsFiles/RanderProblemDrw";

import ImageControls from "./ImageControls";
import ParametersPanel from "./ParametersPanel";
import { useDentalSettings } from "./CustomHook/useDentalSettings";
import { DataContext } from "../../../dashboard";
export default function ImageViewer({
  image,
  teethData,
  settings,
  showParameters,
  onToggleParameters,
  onToggleFullScreen,
  onDownload,
  onChangeImage,
  onReanalyze,
  onSettingChange,
  setSettings
}) {

  const {updateSettingProblem} = useDentalSettings();
  const { data,ToothEditData } = React.useContext(DataContext);


    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(0);
    const [saturation, setSaturation] = useState(0);
    const useFilter=[{brightness, setBrightness},{contrast, setContrast},{saturation, setSaturation}]

    useEffect(() => {
      if (data && data.problemDetective) {
        
        const detectedProblems = data.problemDetective;
        
        updateSettingProblem(detectedProblems, setSettings);
      }
    }, [data?.problemDetective, ToothEditData]);

  const hasTeethData = Array.isArray(teethData) && teethData.length > 0;
  const imageStyle = {
    filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
    transform: `scale(${settings.zoom / 100})`
  };

  return (
    <div className="relative w-full h-full group">
      <ImageControls
        onDownload={onDownload}
        onToggleFullScreen={onToggleFullScreen}
        onToggleParameters={onToggleParameters}
        onChangeImage={onChangeImage}
        onReanalyze={onReanalyze}
      />

      {showParameters && (
        <ParametersPanel
        useFilter={useFilter}
          settings={settings}
          onSettingChange={onSettingChange}
          onClose={() => onToggleParameters(false)}
          setSettings={setSettings}
        />
      )}

      {hasTeethData ? (
        <RanderProblemDrw 
        useFilter={useFilter}
          tooth={teethData} 
          image={image.data_url} 
          style={imageStyle}
          ShowSetting={settings}
          onclick={() => onToggleParameters(false)}
        />
      ) : (
        <div className="relative flex w-full h-full">
          <img 
            src={image.data_url} 
            alt="Uploaded dental scan"
            className="relative w-full"
            style={imageStyle}
          />
          <div className="absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm max-w-xs">
            <h4 className="font-medium mb-2">Status</h4>
            <ul className="text-xs space-y-1 list-disc pl-4">
              <li>No dental issues detected</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}