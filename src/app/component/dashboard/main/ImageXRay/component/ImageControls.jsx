"use client"
import { useState,useContext } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Maximize2, PanelLeftOpen, EllipsisVertical, RefreshCw } from "lucide-react";
import useAnalyseImage from "../../../JsFiles/getAnalyseImage";
import ImageUploading from "react-images-uploading";
import useImageCard from "./useImageCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


import { DataContext } from "@/app/component/dashboard/dashboard";
export default function ImageControls({
  
  onDownload,
  onToggleFullScreen,
  onToggleParameters,
  onChangeImage,
  onReanalyze,
  isLoading,
}) {

  const {stageRef}=useContext(DataContext);
  
    const { handleUpload } = useImageCard();
  const { getAnalyseImage } = useAnalyseImage();
  const [images, setImages] = useState([]);

  const handleImageChange = (imageList) => {
    setImages(imageList);
    if (imageList.length > 0) {
      handleUpload(imageList[0]);
      if (onChangeImage) {
        onChangeImage(imageList[0]);
      }
    }
  };

  return (
    <>
      {/* Parameters panel toggle button */}


      {/* Right control buttons group */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Fullscreen button */}
        <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className=" bg-white/80 backdrop-blur-sm hover:bg-gray-100"
            onClick={onToggleParameters}
          >
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" >Show Parameters</TooltipContent>
      </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/80 backdrop-blur-sm hover:bg-gray-100"
              onClick={onToggleFullScreen}
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" >Full Screen</TooltipContent>
        </Tooltip>

        {/* Download button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/80 backdrop-blur-sm hover:bg-gray-100"
              onClick={()=>{onDownload(stageRef)}}
            >
              <Download className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" >Download</TooltipContent>
        </Tooltip>
        
        {/* Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/80 backdrop-blur-sm hover:bg-gray-100"
            >
              <EllipsisVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <ImageUploading
              onChange={handleImageChange}
              value={images}
              maxNumber={1}
              dataURLKey="data_url"
              acceptType={["jpg", "jpeg", "png"]}
              maxFileSize={5 * 1024 * 1024}
            >
              {({ onImageUpload }) => (
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={onImageUpload}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Change Image</span>
                </DropdownMenuItem>
              )}
            </ImageUploading>

            <DropdownMenuItem 
              onClick={() => {
                getAnalyseImage();
                if (onReanalyze) {
                  onReanalyze();
                }
              }}
              className="flex items-center gap-2 cursor-pointer"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Re-analyze</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}