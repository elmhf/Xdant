"use client"
import React,{useEffect,useState} from "react";
import RanderProblemDrw from "@/app/component/dashboard/JsFiles/RanderProblemDrw";
import Toolbar from '@/app/component/comp/quickToolsIage';

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

  const [activeTool, setActiveTool] = useState(null);
  const [resetMeasurements, setResetMeasurements] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [undoFunction, setUndoFunction] = useState(null);

  const handleHelperToolToggle = (toolId) => {
    if (!setSettings) return;
    switch (toolId) {
      case 'grid':
        setSettings(s => ({ ...s, showGrid: !s.showGrid }));
        break;
      case 'layers':
        setSettings(s => ({ ...s, showLayers: !s.showLayers }));
        break;
      case 'lock':
        setSettings(s => ({ ...s, isLocked: !s.isLocked }));
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    // Reset zoom to 100%
    if (setSettings) {
      setSettings(s => ({ ...s, zoom: 100 }));
    }
    // Reset active tool
    setActiveTool(null);
    // Reset helper tools to default state
    if (setSettings) {
      setSettings(s => ({ 
        ...s, 
        showGrid: false, 
        showLayers: true, 
        isLocked: false 
      }));
    }
    // Trigger measurement reset
    setResetMeasurements(true);
    // Reset the flag after a short delay
    setTimeout(() => setResetMeasurements(false), 100);
  };

  const handleUndo = () => {
    if (undoFunction) {
      undoFunction();
    }
  };

  const handleUndoCallback = (canUndoState, undoFunc) => {
    setCanUndo(canUndoState);
    setUndoFunction(() => undoFunc);
  };

  // Listen for undo state changes from drawing component
  useEffect(() => {
    // This effect will be used to sync undo state
  }, []);

  useEffect(() => {
    if (data && data.problemDetective) {
      console.log("Detected problems:", data);
      const detectedProblems = data.problemDetective;
      
      updateSettingProblem(detectedProblems, setSettings);
    }
  }, [data?.problemDetective, ToothEditData]);

  const hasTeethData = Array.isArray(teethData) && teethData.length > 0;
  
  // Debug log for image data
  useEffect(() => {
    if (image) {
      console.log('Image data check:', {
        hasDataUrl: !!image.data_url,
        dataUrlType: typeof image.data_url,
        dataUrlLength: image.data_url?.length,
        fullImageObject: image
      });
    }
  }, [image]);

  const imageStyle = {
    filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
    transform: `scale(${settings.zoom / 100})`
  };

  console.log('ImageViewer - Received image:', image); // Debug log
console.log(settings,"settings")
  return (
    <div className="relative w-full h-full group">

      {hasTeethData ? (
        <div className="relative w-full h-full">
          <div className="absolute w-full top-2 left-1/2 -translate-x-1/2 z-20">
            <Toolbar 
              onDownload={onDownload} 
              onReanalyze={onReanalyze} 
              onZoom={settings && setSettings ? (z => setSettings(s => ({ ...s, zoom: z }))) : undefined}
              onToolSelect={setActiveTool}
              selectedTool={activeTool}
              onHelperToolToggle={handleHelperToolToggle}
              showGrid={settings?.showGrid}
              showLayers={settings?.showLayers}
              isLocked={settings?.isLocked}
              zoomValue={settings?.zoom || 100}
              onReset={handleReset}
              onUndo={handleUndo}
              canUndo={canUndo}
            />
          </div>
          <RanderProblemDrw 
            useFilter={useFilter}
            tooth={teethData} 
            image={image}
            style={imageStyle}
            ShowSetting={settings}
            onclick={() => onToggleParameters(false)}
            activeTool={activeTool}
            resetMeasurements={resetMeasurements}
            onUndoCallback={handleUndoCallback}
            showGrid={settings?.showGrid}
            zoom={settings?.zoom || 100}
            isLocked={settings?.isLocked}
            showLayers={settings?.showLayers}
          />
        </div>
      ) : (
        <div className="relative flex w-full h-full">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
            <Toolbar 
              onDownload={onDownload} 
              onReanalyze={onReanalyze} 
              onZoom={settings && setSettings ? (z => setSettings(s => ({ ...s, zoom: z }))) : undefined}
              onToolSelect={setActiveTool}
              selectedTool={activeTool}
              onHelperToolToggle={handleHelperToolToggle}
              showGrid={settings?.showGrid}
              showLayers={settings?.showLayers}
              isLocked={settings?.isLocked}
              zoomValue={settings?.zoom || 100}
              onReset={handleReset}
              onUndo={handleUndo}
              canUndo={canUndo}
            />
          </div>
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