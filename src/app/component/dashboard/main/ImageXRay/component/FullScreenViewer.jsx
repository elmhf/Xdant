import React from "react";
import RanderProblemDrw from "@/app/component/dashboard/JsFiles/RanderProblemDrw";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function FullScreenViewer({
  image,
  teethData,
  settings,
  onClose,
  onDownload
}) {
  const hasTeethData = Array.isArray(teethData) && teethData.length > 0;
  const imageStyle = {
    filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
    transform: `scale(${settings.zoom / 100})`
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={onDownload}
            >
              <Download className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download Image</TooltipContent>
        </Tooltip>
        
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/20 hover:bg-white/30 text-white"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      {hasTeethData ? (
        <RanderProblemDrw 
          tooth={teethData} 
          image={image.data_url} 
          className="max-w-full max-h-full"
          style={imageStyle}
        />
      ) : (
        <img 
          src={image.data_url} 
          alt="Uploaded dental scan"
          className="max-w-full max-h-full object-contain"
          style={imageStyle}
        />
      )}
    </div>
  );
}