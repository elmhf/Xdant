"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUploading from "react-images-uploading";

export default function ChangeImageModal({ open, onOpenChange, onImageChange }) {
  const [images, setImages] = useState([]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Image</DialogTitle>
        </DialogHeader>
        
        <ImageUploading
          value={images}
          onChange={(imageList) => {
            setImages(imageList);
            if (imageList[0]) {
              onImageChange(imageList[0]);
              onOpenChange(false);
            }
          }}
          maxNumber={1}
          dataURLKey="data_url"
        >
          {({ onImageUpload, dragProps }) => (
            <div 
              {...dragProps}
              onClick={onImageUpload}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {images.length > 0 ? (
                <img 
                  src={images[0].data_url} 
                  alt="New selected image"
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <p>Click or drop image here</p>
              )}
            </div>
          )}
        </ImageUploading>
      </DialogContent>
    </Dialog>
  );
}