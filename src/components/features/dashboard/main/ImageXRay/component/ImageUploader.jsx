import React from "react";
import ImageUploading from "react-images-uploading";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function ImageUploader({ onUpload }) {
  const [showInfo, setShowInfo] = React.useState(false);

  const renderInfoTooltip = () => (
    <div className="absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-sm max-w-xs">
      <h4 className="font-medium mb-2">Image Guidelines</h4>
      <ul className="text-xs space-y-1 list-disc pl-4">
        <li>Upload clear, well-lit dental scans</li>
        <li>Supported formats: JPG, PNG (max 5MB)</li>
        <li>For best results, use high-resolution images</li>
        <li>Avoid blurry or distorted images</li>
      </ul>
    </div>
  );

  return (
    <ImageUploading
      onChange={onUpload}
      maxNumber={1}
      dataURLKey="data_url"
      acceptType={["jpg", "jpeg", "png"]}
      maxFileSize={5 * 1024 * 1024}
    >
      {({ onImageUpload }) => (
        <div
          className="relative flex items-center justify-center w-full h-full rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
          onClick={onImageUpload}
        >
          <div className="text-center p-4">
            <p className="mt-2 text-sm text-gray-500">Click or drag image to upload</p>
            <p className="mt-1 text-xs text-gray-400">Supports JPG, PNG (max 5MB)</p>

            <Button
              variant="outline"
              size="sm"
              className="mt-4 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(!showInfo);
              }}
            >
              <Info className="h-4 w-4" />
              {showInfo ? 'Hide Guidelines' : 'Upload Guidelines'}
            </Button>
          </div>

          {showInfo && (
            <div
              className="absolute inset-0 bg-[#0d0c22]/80 flex items-center justify-center p-6 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(false);
              }}
            >
              {renderInfoTooltip()}
            </div>
          )}
        </div>
      )}
    </ImageUploading>
  );
}