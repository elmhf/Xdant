import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import useUserStore from "./store/userStore";

export default function ProfilePictureForm({ onBack, userInfo, setUserInfo }) {
  const [preview, setPreview] = useState(userInfo.profilePhotoUrl || "https://randomuser.me/api/portraits/men/1.jpg");
  const [tempImage, setTempImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const changePhoto = useUserStore(state => state.changePhoto);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérification du type et de la taille
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        alert('Veuillez choisir une image au format PNG ou JPG uniquement');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('La taille de l\'image ne doit pas dépasser 10 mégaoctets');
        return;
      }
      setTempImage(URL.createObjectURL(file));
      setIsUploading(true);
      // Call changePhoto API
      const result = await changePhoto(file);
      setIsUploading(false);
      if (result.success && result.profilePhotoUrl) {
        setPreview(result.profilePhotoUrl);
        setUserInfo({ profilePhotoUrl: result.profilePhotoUrl });
        setTempImage(null);
        onBack();
      } else {
        alert(result.message || "Erreur lors du téléchargement de la photo");
      }
    }
  };

  const handleCancel = () => {
    setTempImage(null);
  };

  return (
    <div className="p-6 pt-2 space-y-6">
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
        <span className="font-semibold text-gray-800">Info :</span> Choisissez une photo de profil claire avec un fond neutre et un visage bien visible.
      </div>
      
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <img
            src={tempImage || preview}
            alt="Aperçu du profil"
            className="w-32 h-32 rounded-full object-cover border-4 border-[#7564ed]/20 shadow-xl"
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <Button
          className="w-full h-12 text-base font-semibold border-2 border-[#7564ed] text-[#7564ed] hover:bg-[#7564ed] hover:text-white transition-all duration-200"
          variant="outline"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          disabled={isUploading}
        >
          <span className="text-2xl mr-2">+</span>
          Choisir une nouvelle photo
        </Button>
        
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 w-full">
          <h4 className="font-semibold text-gray-800 mb-3">Recommandations :</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-[#7564ed] mr-2">•</span>
              <span>Format accepté : <span className="font-semibold">PNG</span> ou <span className="font-semibold">JPG</span></span>
            </li>
            <li className="flex items-start">
              <span className="text-[#7564ed] mr-2">•</span>
              <span>Taille maximale : <span className="font-semibold">10MB</span></span>
            </li>
            <li className="flex items-start">
              <span className="text-[#7564ed] mr-2">•</span>
              <span>Choisissez une photo nette, fond neutre, visage bien visible</span>
            </li>
          </ul>
        </div>
      </div>
      
      {isUploading && (
        <div className="flex gap-3 items-center justify-center p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="animate-spin rounded-full w-6 h-6 border-2 border-[#7564ed] border-t-transparent"></div>
          <span className="text-[#7564ed] font-semibold">Téléchargement en cours...</span>
        </div>
      )}
      
    </div>
  );
} 