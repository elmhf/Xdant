"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditInfo from "./editInfo";
import SignatureCard from "./SignatureCard";
import { useState, useEffect } from "react";
import useUserStore from "./store/userStore";

// --------------------------- Component ---------------------------
export default function AccountInfoCard({ firstName, lastName, email }) {
  // ======= State & Store =======
  const [open, setOpen] = useState(false);
  const [openSignature, setOpenSignature] = useState(false);
  const { userInfo, setUserInfo, changePassword, changeName, getUserInfo } = useUserStore();
  const getImageFromCache = useUserStore(state => state.getImageFromCache);

  // ======= Effects =======
  useEffect(() => {
    getUserInfo().then(() => {
      if (userInfo.profilePhotoUrl) {
        const img = new Image();
        img.src = userInfo.profilePhotoUrl;
        img.onload = () => {
          useUserStore.getState().setImageCache(userInfo.profilePhotoUrl, img);
        };
      }
    });
  }, []);

  // ======= Handlers =======
  const handleSignatureSave = async (svgUrl, fileOrBlob) => {
    console.log(fileOrBlob," fileOrBlob ****************************++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    if (fileOrBlob) {
      const result = await useUserStore.getState().changeSignature(fileOrBlob);
      if (result.success && result.signatureUrl) {
        setUserInfo({ personalSignature: result.signatureUrl });
      } else {
        setUserInfo({ personalSignature: svgUrl });
        alert(result.message || "خطأ في حفظ التوقيع");
      }
    } else {
      setUserInfo({ personalSignature: svgUrl });
    }
  };

  // ======= Cached Profile Photo =======
  const cachedPhoto = getImageFromCache(userInfo.profilePhotoUrl);
  const photoSrc = cachedPhoto?.src || userInfo.profilePhotoUrl;

  // Helper to display '-' if value is null, undefined, or empty string
  function displayField(value) {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 font-medium">Non spécifié</span>;
    }
    return <span className="font-semibold text-gray-900">{value}</span>;
  }

  // =================== JSX ===================
  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full items-start justify-center">
      {/* === Main Profile Card === */}
      <Card className="mx-auto rounded-xl py-0  border-2 border-gray-200 w-full bg-white">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-[900] text-gray-900">Informations du compte</h2>
            <Button 
              variant="outline" 
              className="px-6 h-12 text-base font-semibold border-2 border-[#7564ed] text-[#7564ed] hover:bg-[#7564ed] hover:text-white transition-all duration-200" 
              onClick={() => setOpen(true)}
            >
              Modifier
            </Button>
          </div>

          {/* Profile Photo Section */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#7564ed]/20 shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#7564ed] to-[#6a4fd8] text-white flex items-center justify-center font-bold text-3xl shadow-xl">
                  {userInfo.firstName?.[0]}{userInfo.lastName?.[0]}
                </div>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center py-2">
                <span className="w-68 text-lg font-medium text-gray-600">Prénom</span>
                <span className="text-lg font-semibold text-gray-900">{displayField(userInfo.firstName || firstName)}</span>
              </div>
              <div className="flex items-center py-2">
                <span className="w-68 text-lg font-medium text-gray-600">Nom</span>
                <span className="text-lg font-semibold text-gray-900">{displayField(userInfo.lastName || lastName)}</span>
              </div>
              <div className="flex items-center py-2">
                <span className="w-68 text-lg font-medium text-gray-600">Adresse email</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">{displayField(userInfo.email || email)}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Vérifié
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-lg font-semibold text-blue-900">Compte actif</p>
                <p className="text-sm text-blue-700">Dernière connexion: Aujourd'hui à 14:30</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === Signature Card === */}
      <SignatureCard 
        signature={userInfo.personalSignature} 
        onSave={handleSignatureSave} 
      />

      {/* === Edit Modal === */}
      <EditInfo
        open={open}
        onOpenChange={setOpen}
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        changePassword={changePassword}
        changeName={changeName}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
