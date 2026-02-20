"use client"
import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import RanderProblemDrw from "@/components/features/dashboard/JsFiles/RanderProblemDrw";
import { useDentalSettings } from "./CustomHook/useDentalSettings";
import QuickToolsVertical from '@/components/shared/comp/quickToolsVertical';
import { DataContext } from "../../../dashboard";
import { ChevronLeft, ChevronRight, X, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next"; // Assuming react-i18next for useTranslation

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
  onSettingChange, // This prop seems to be replaced by SettingChange in the snippet, but keeping for now
  setSettings,
  showToolBar
}) {
  const { updateSettingProblem } = useDentalSettings();
  const { data, ToothEditData, toothNumberSelect, setToothNumberSelect, isPanoType } = useContext(DataContext);
  const { t } = useTranslation(); // Added useTranslation

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const useFilter = [{ brightness, setBrightness }, { contrast, setContrast }, { saturation, setSaturation }]

  const [activeTool, setActiveTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#FF5050"); // Default Red-ish
  const [resetMeasurements, setResetMeasurements] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [undoFunction, setUndoFunction] = useState(null);

  // Sort teethData to ensure consistent navigation order
  const sortedTeeth = useMemo(() => {
    if (!teethData) return [];
    return [...teethData].sort((a, b) => a.toothNumber - b.toothNumber);
  }, [teethData]);

  const currentIndex = useMemo(() => {
    if (!toothNumberSelect || !sortedTeeth.length) return -1;
    return sortedTeeth.findIndex(t => t.toothNumber == toothNumberSelect);
  }, [toothNumberSelect, sortedTeeth]);

  const handleNext = (e) => {
    e?.stopPropagation();
    if (!sortedTeeth.length) return;
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % sortedTeeth.length;
    setToothNumberSelect(sortedTeeth[nextIndex].toothNumber);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (!sortedTeeth.length) return;
    const prevIndex = currentIndex <= 0 ? sortedTeeth.length - 1 : currentIndex - 1;
    setToothNumberSelect(sortedTeeth[prevIndex].toothNumber);
  };

  const handleResetView = (e) => { // Renamed from handleReset to avoid conflict with existing handleReset
    e?.stopPropagation();
    setToothNumberSelect(null);
  };

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
    // Reset zoom only — keep brightness, grid, layers, lock as-is
    if (setSettings) {
      setSettings(s => ({ ...s, zoom: 100 }));
    }
    // Reset active tool back to default
    setActiveTool(null);
    // Clear drawn annotations (measurements, rectangles, freehand paths)
    setResetMeasurements(true);
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

  // Listen for ESC key to exit Draw Mode
  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.key === 'Escape') {
        setActiveTool(null);
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, []);

  // Listen for undo state changes from drawing component

  useEffect(() => {
    if (data && data.problemDetective) {
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

  const containerRef = useRef(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const imageStyle = {
    filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
    transform: `scale(${settings.zoom / 100})`
  };


  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-[0.7vw] w-full h-full group bg-black">
      {hasTeethData ? (
        <div className="flex flex-col w-full h-full bg-black">
          {/* Main Canvas Area */}
          <div className="relative flex-1 w-full overflow-hidden">
            {showToolBar && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30">
                <QuickToolsVertical
                  onToolSelect={setActiveTool}
                  selectedTool={activeTool}
                  onZoom={settings && setSettings ? (z => setSettings(s => ({ ...s, zoom: z }))) : undefined}
                  onReset={handleReset}
                  onToggleFullScreen={toggleFullScreen}
                  onHelperToolToggle={handleHelperToolToggle}
                  onDownload={onDownload}
                  onUndo={handleUndo}
                  showLayers={settings?.showLayers}
                  showGrid={settings?.showGrid}
                  isLocked={settings?.isLocked}
                  canUndo={canUndo}
                  selectedColor={selectedColor}
                  onColorChange={setSelectedColor}
                />
              </div>
            )}

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
              selectedTooth={toothNumberSelect}
              onToothClick={setToothNumberSelect}
              selectedColor={selectedColor}
            />
          </div>

          {/* Persistent Bottom Navigation Bar */}
          {isPanoType && (
            <div className="h-12 bg-[#000000] flex items-center justify-center px-6 z-40">
              {/* Left: Reset / Info */}
              <div className={`flex items-center ${!toothNumberSelect ? 'opacity-50' : 'opacity-100'} gap-4`}>
                <button
                  onClick={handleResetView}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-200 border border-white/5 hover:bg-white/10 text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-lg font-semibold">
                    {t('Toate imaginile') || 'All Images'}
                  </span>
                </button>
              </div>

              {/* Center: Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-full hover:bg-white/10 text-white transition-colors disabled:opacity-30 active:scale-95"
                  disabled={!sortedTeeth.length}
                  title="Previous Tooth"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="px-6 text-white font-semibold text-lg min-w-[140px] gap-1 text-center flex flex-row items-center justify-center">
                  <span className="text-white font-semibold text-lg leading-tight">
                    {toothNumberSelect
                      ? `${t('Tooth') || 'Tooth'} ${toothNumberSelect}`
                      : (t('Overview') || 'Overview')
                    }
                  </span>
                  {toothNumberSelect && (
                    <span className=" opacity-50">
                      {currentIndex + 1} of {sortedTeeth.length}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="p-2 rounded-full hover:bg-white/10 text-white transition-colors disabled:opacity-30 active:scale-95"
                  disabled={!sortedTeeth.length}
                  title="Next Tooth"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Right: Spacer */}
              <div className="w-[100px] flex justify-end"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex w-full h-full">
          {showToolBar && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30">
              <QuickToolsVertical
                onToolSelect={setActiveTool}
                selectedTool={activeTool}
                onZoom={settings && setSettings ? (z => setSettings(s => ({ ...s, zoom: z }))) : undefined}
                onReset={handleReset}
                onToggleFullScreen={toggleFullScreen}
                onHelperToolToggle={handleHelperToolToggle}
                onDownload={onDownload}
                onUndo={handleUndo}
                showLayers={settings?.showLayers}
                showGrid={settings?.showGrid}
                isLocked={settings?.isLocked}
                canUndo={canUndo}
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
              />
            </div>
          )}
          <img
            src={image.data_url}
            alt="Uploaded dental scan"
            className="relative w-full"
            style={imageStyle}
          />
          <div className="absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-sm max-w-xs">
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
