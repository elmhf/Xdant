"use client"
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import useUserStore from "../profile/store/userStore";

export default function ClinicImagesCard({ canEditClinic = true }) {
  const [logoFile, setLogoFile] = useState(null);
  const [stampFile, setStampFile] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState(null);
  const [stampLoading, setStampLoading] = useState(false);
  const [stampError, setStampError] = useState(null);
  
  // إضافة state لفرض إعادة الرندر
  const [logoRefreshKey, setLogoRefreshKey] = useState(0);
  const [stampRefreshKey, setStampRefreshKey] = useState(0);

  const { 
    changeClinicLogo, 
    changeClinicStamp,
    getCurrentClinic, 
    getCurrentClinicLogo, 
    loadCurrentClinicLogo,
    getCurrentClinicStamp,
    loadCurrentClinicStamp,
    currentClinicId,
    fetchMyClinics,
    clinicsInfo
  } = useUserStore();

  // Get cache functions from store
  const getImageFromCache = useUserStore(state => state.getImageFromCache);
  const setImageCache = useUserStore(state => state.setImageCache);

  // Get current clinic data
  const currentClinic = getCurrentClinic();
  const logoUrl = currentClinic?.logoUrl || currentClinic?.logo_url;
  const stampUrl = currentClinic?.stampUrl || currentClinic?.stamp_url;
  
  console.log(logoUrl,"logoUrl");
  console.log(stampUrl,"stampUrl");
  
  // Get cached images with refresh key
  const cachedLogo = useUserStore.getState().getImageFromCache(logoUrl);
  const cachedStamp = useUserStore.getState().getImageFromCache(stampUrl);
  
  console.log(cachedLogo,"cachedLogo");
  console.log(cachedStamp,"cachedStamp");
  
  // Image sources with cache fallback and refresh key
  const logoSrc = cachedLogo?.src || (logoUrl && logoUrl !== "null" && logoUrl !== "undefined" ? `${logoUrl}?v=${logoRefreshKey}` : null);
  const stampSrc = cachedStamp?.src || (stampUrl && stampUrl !== "null" && stampUrl !== "undefined" ? `${stampUrl}?v=${stampRefreshKey}` : null);

  // Fetch clinics if not loaded
  useEffect(() => {
    if (!clinicsInfo || clinicsInfo.length === 0) {
      console.log("No clinics loaded, fetching...");
      fetchMyClinics();
    }
  }, [clinicsInfo, fetchMyClinics]);

  // Load current clinic images to cache on component mount
  useEffect(() => {
    const loadImagesToCache = async () => {
      if (currentClinic) {
        // Handle Logo
        if (logoUrl && logoUrl !== "null" && logoUrl !== "undefined") {
          console.log("Loading logo to cache:", logoUrl);
          
          // Always reload to cache to ensure fresh data
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = `${logoUrl}?v=${Date.now()}`;
          img.onload = () => {
            useUserStore.getState().setImageCache(logoUrl, img);
          };
          img.onerror = () => {
            console.error("Failed to load logo to cache:", logoUrl);
          };
        }

        // Handle Stamp
        if (stampUrl && stampUrl !== "null" && stampUrl !== "undefined" && stampUrl.trim() !== "") {
          console.log("Loading stamp to cache:", stampUrl);
          
          // Validate URL format
          try {
            new URL(stampUrl);
          } catch (error) {
            console.error("Invalid stamp URL format:", stampUrl);
            return;
          }
          
          // Always reload to cache to ensure fresh data
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = `${stampUrl}?v=${Date.now()}`;
          img.onload = () => {
            useUserStore.getState().setImageCache(stampUrl, img);
          };
          img.onerror = () => {
            console.error("Failed to load stamp to cache:", stampUrl);
          };
        }
      }
    };

    loadImagesToCache();
  }, [currentClinic, logoUrl, stampUrl, logoRefreshKey, stampRefreshKey]);

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear previous errors
    setLogoError(null);

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setLogoError("Veuillez sélectionner un fichier image valide (JPG, PNG, GIF, WEBP)");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setLogoError("La taille du fichier doit être inférieure à 5MB");
      return;
    }

    // Validate file name
    if (!file.name || file.name.trim() === '') {
      setLogoError("Nom de fichier invalide");
      return;
    }

    // Validate that file is actually an image
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      
      // Check minimum dimensions
      if (img.width < 50 || img.height < 50) {
        setLogoError("L'image doit avoir une taille minimale de 50x50 pixels");
        return;
      }
      
      // Check maximum dimensions
      if (img.width > 2000 || img.height > 2000) {
        setLogoError("L'image ne doit pas dépasser 2000x2000 pixels");
        return;
      }

      setLogoFile(file);
      setLogoLoading(true);

      try {
        const result = await changeClinicLogo(currentClinicId, file);
        if (result.success) {
          // إزالة الصورة القديمة من الكاش
          if (logoUrl) {
            useUserStore.getState().removeImageFromCache(logoUrl);
          }
          
          // إنشاء URL جديد للصورة
          const newImageUrl = URL.createObjectURL(file);
          
          // تحديث الكاش مع الصورة الجديدة
          const newImg = new Image();
          newImg.crossOrigin = "anonymous";
          newImg.src = newImageUrl;
          newImg.onload = () => {
            useUserStore.getState().setImageCache(result.logoUrl, newImg);
            // تحديث refresh key لفرض إعادة الرندر
            setLogoRefreshKey(prev => prev + 1);
          };
          
          // Update clinic info in store
          const updatedClinic = { 
            ...currentClinic, 
            logoUrl: result.logoUrl, 
            logo_url: result.logoUrl 
          };
          
          // تحديث معلومات العيادة في الـ store
          useUserStore.getState().setClinicsInfo(
            useUserStore.getState().clinicsInfo.map(clinic => 
              clinic.id === currentClinicId ? updatedClinic : clinic
            )
          );
          
          // فرض إعادة تحميل معلومات العيادة الحالية
          await fetchMyClinics();
          
          console.log("Logo changed successfully");
        } else {
          setLogoError(result.message || "Échec du changement de logo");
          console.error("Error changing logo:", result.message);
        }
      } catch (error) {
        setLogoError("Erreur réseau lors du téléchargement");
        console.error("Network error for logo:", error);
      } finally {
        setLogoLoading(false);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setLogoError("Le fichier sélectionné n'est pas une image valide");
    };
    
    img.src = objectUrl;
  };

  const handleStampUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear previous errors
    setStampError(null);

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setStampError("Veuillez sélectionner un fichier image valide (JPG, PNG, GIF, WEBP)");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setStampError("La taille du fichier doit être inférieure à 5MB");
      return;
    }

    // Validate file name
    if (!file.name || file.name.trim() === '') {
      setStampError("Nom de fichier invalide");
      return;
    }

    // Validate that file is actually an image
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      
      // Check minimum dimensions
      if (img.width < 50 || img.height < 50) {
        setStampError("L'image doit avoir une taille minimale de 50x50 pixels");
        return;
      }
      
      // Check maximum dimensions
      if (img.width > 2000 || img.height > 2000) {
        setStampError("L'image ne doit pas dépasser 2000x2000 pixels");
        return;
      }

      setStampFile(file);
      setStampLoading(true);

      try {
        const result = await changeClinicStamp(currentClinicId, file);
        if (result.success) {
          // إزالة الصورة القديمة من الكاش
          if (stampUrl) {
            useUserStore.getState().removeImageFromCache(stampUrl);
          }
          
          // إنشاء URL جديد للصورة
          const newImageUrl = URL.createObjectURL(file);
          
          // تحديث الكاش مع الصورة الجديدة
          const newImg = new Image();
          newImg.crossOrigin = "anonymous";
          newImg.src = newImageUrl;
          newImg.onload = () => {
            useUserStore.getState().setImageCache(result.stampUrl, newImg);
            // تحديث refresh key لفرض إعادة الرندر
            setStampRefreshKey(prev => prev + 1);
          };
          
          // Update clinic info in store
          const updatedClinic = { 
            ...currentClinic, 
            stampUrl: result.stampUrl, 
            stamp_url: result.stampUrl 
          };
          
          // تحديث معلومات العيادة في الـ store
          useUserStore.getState().setClinicsInfo(
            useUserStore.getState().clinicsInfo.map(clinic => 
              clinic.id === currentClinicId ? updatedClinic : clinic
            )
          );
          
          // فرض إعادة تحميل معلومات العيادة الحالية
          await fetchMyClinics();
          
          console.log("Stamp changed successfully");
        } else {
          setStampError(result.message || "Échec du changement de cachet");
          console.error("Error changing stamp:", result.message);
        }
      } catch (error) {
        setStampError("Erreur réseau lors du téléchargement");
        console.error("Network error for stamp:", error);
      } finally {
        setStampLoading(false);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setStampError("Le fichier sélectionné n'est pas une image valide");
    };
    
    img.src = objectUrl;
  };

  return (
    <Card className="w-full rounded-xl border-2 border-gray-200 bg-white">
      <CardContent className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-[900] text-gray-900">Images de la clinique</h2>
        </div>
        
        {/* Logo and Stamp in flex row */}
        <div className="flex gap-8">
          {/* Logo Section */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Logo</h3>
            <div className="flex gap-4">
              
              {/* Hidden file input for logo */}
              {canEditClinic && (
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  key={logoRefreshKey} // إضافة key لفرض إعادة الرندر
                />
              )}
              
              {/* Upload Area */}
              <div className="flex-1">
                <label
                  htmlFor={canEditClinic ? "logo-upload" : undefined}
                  className={`w-full h-56 border-2 border-dashed rounded-xl flex items-center justify-center transition-all duration-200 bg-white relative overflow-hidden ${
                    canEditClinic ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    logoLoading 
                      ? 'border-[#7c5cff] cursor-not-allowed bg-[#7c5cff]/5' 
                      : logoError 
                        ? 'border-red-300 hover:border-red-400 hover:bg-red-50' 
                        : 'border-gray-300 hover:border-[#7c5cff] hover:bg-[#7c5cff]/5'
                  }`}
                >
                  {logoLoading ? (
                    <div className="text-[#7c5cff] text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7c5cff] mx-auto mb-3"></div>
                      <div className="text-base font-semibold">Téléchargement...</div>
                    </div>
                  ) : logoSrc ? (
                    <div className="relative w-full h-full flex items-center justify-center group">
                      <img 
                        key={`logo-${logoRefreshKey}`} // إضافة key فريد
                        src={logoSrc} 
                        alt="Logo preview" 
                        className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.error("Error loading logo image:", e);
                          console.error("Logo URL that failed:", logoUrl);
                        }}
                        onLoad={(e) => {
                          console.log("Logo image loaded successfully:", logoUrl);
                        }}
                      />
                      {/* Hover overlay */}
                      {canEditClinic && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl">
                          <span className="text-[#7c5cff] font-bold text-lg">Changer le logo</span>
                      </div>
                      )}
                      {logoError && (
                        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 text-sm p-2 text-center rounded-t-xl">
                          {logoError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center">
                      <div className="text-4xl mb-3 font-bold">+</div>
                      <div className="text-lg font-semibold">Télécharger le logo</div>
                      {logoError && (
                        <div className="text-red-600 text-sm mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                          {logoError}
                        </div>
                      )}
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Stamp Section */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Cachet</h3>
            <div className="flex gap-4">
              
              {/* Hidden file input for stamp */}
              {canEditClinic && (
                <input
                  type="file"
                  id="stamp-upload"
                  accept="image/*"
                  onChange={handleStampUpload}
                  className="hidden"
                  key={stampRefreshKey} // إضافة key لفرض إعادة الرندر
                />
              )}
              
              {/* Upload Area */}
              <div className="flex-1">
                <label
                  htmlFor={canEditClinic ? "stamp-upload" : undefined}
                  className={`w-full h-56 border-2 border-dashed rounded-xl flex items-center justify-center transition-all duration-200 bg-white relative overflow-hidden ${
                    canEditClinic ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    stampLoading 
                      ? 'border-[#7c5cff] cursor-not-allowed bg-[#7c5cff]/5' 
                      : stampError 
                        ? 'border-red-300 hover:border-red-400 hover:bg-red-50' 
                        : 'border-gray-300 hover:border-[#7c5cff] hover:bg-[#7c5cff]/5'
                  }`}
                >
                  {stampLoading ? (
                    <div className="text-[#7c5cff] text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7c5cff] mx-auto mb-3"></div>
                      <div className="text-base font-semibold">Téléchargement...</div>
                    </div>
                  ) : stampSrc ? (
                    <div className="relative w-full h-full flex items-center justify-center group">
                      <img 
                        key={`stamp-${stampRefreshKey}`} // إضافة key فريد
                        src={stampSrc} 
                        alt="Stamp preview" 
                        className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.error("Error loading stamp image:", e);
                          console.error("Stamp URL that failed:", stampUrl);
                        }}
                        onLoad={(e) => {
                          console.log("Stamp image loaded successfully:", stampUrl);
                        }}
                      />
                      {/* Hover overlay */}
                      {canEditClinic && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl">
                          <span className="text-[#7c5cff] font-bold text-lg">Changer le cachet</span>
                      </div>
                      )}
                      {stampError && (
                        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 text-sm p-2 text-center rounded-t-xl">
                          {stampError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center">
                      <div className="text-4xl mb-3 font-bold">+</div>
                      <div className="text-lg font-semibold">Télécharger le cachet</div>
                      {stampError && (
                        <div className="text-red-600 text-sm mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                          {stampError}
                        </div>
                      )}
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 