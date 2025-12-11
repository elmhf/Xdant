"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SignatureCard from "./SignatureCard";
import SupportAccessSection from "./SupportAccessSection";
import { useState, useEffect, useRef } from "react";
import useUserStore from "./store/userStore";
import { Edit2 } from "lucide-react";
import NameForm from "./NameForm";
import EmailForm from "./EmailForm";
import PasswordForm from "./PasswordForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// --------------------------- Component ---------------------------
export default function AccountInfoCard({ firstName, lastName, email }) {
  // ======= State & Store =======
  const { userInfo, setUserInfo, changePassword, changeName, getUserInfo } = useUserStore();
  const getImageFromCache = useUserStore(state => state.getImageFromCache);
  const changePhoto = useUserStore(state => state.changePhoto);

  // Form dialog states
  const [showNameForm, setShowNameForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // File input ref
  const fileInputRef = useRef(null);

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
    console.log(fileOrBlob, " fileOrBlob ****************************++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
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

  const handlePhotoChange = async (e) => {
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
      setIsUploadingPhoto(true);
      // Call changePhoto API
      const result = await changePhoto(file);
      setIsUploadingPhoto(false);
      if (result.success && result.profilePhotoUrl) {
        setUserInfo({ profilePhotoUrl: result.profilePhotoUrl });
      } else {
        alert(result.message || "Erreur lors du téléchargement de la photo");
      }
    }
  };

  // ======= Cached Profile Photo =======
  const cachedPhoto = getImageFromCache(userInfo.profilePhotoUrl);
  const photoSrc = cachedPhoto?.src || userInfo.profilePhotoUrl;

  // =================== JSX ===================
  return (
    <div className="w-full ">
      {/* Main Content - Row Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Profile Card */}
        <Card className="rounded-xl border-2 border-gray-200 bg-white w-full h-fit">
          <CardContent className="p-6">
            {/* My Profile Section */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account info</h3>

              {/* Profile Picture */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7564ed] to-[#6a4fd8] flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                  {photoSrc ? (
                    <img src={photoSrc} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInfo?.firstName?.[0]}{userInfo?.lastName?.[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex gap-3 mb-2">
                    <button
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      disabled={isUploadingPhoto}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <div className="animate-spin rounded-full w-4 h-4 border-2 border-white border-t-transparent"></div>
                          Téléchargement...
                        </>
                      ) : (
                        <>
                          <span>+</span> Changer l'image
                        </>
                      )}
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                      Supprimer l'image
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Nous supportons les PNG, JPEG et GIF de moins de 10MB</p>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Prénom</label>
                  <div className="flex gap-3">
                    <Input
                      value={userInfo?.firstName || ""}
                      disabled
                      className="h-11 text-base bg-gray-50 flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Nom</label>
                  <div className="flex gap-3">
                    <Input
                      value={userInfo?.lastName || ""}
                      disabled
                      className="h-11 text-base bg-gray-50 flex-1"
                    />
                    <button
                      onClick={() => setShowNameForm(true)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      Modifier le nom
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Sécurité du compte</h3>

              {/* Email */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-900">Email</label>
                <div className="flex gap-3">
                  <Input
                    value={userInfo?.email || ""}
                    disabled
                    className="h-11 text-base bg-gray-50 flex-1"
                  />
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Changer l'email
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-900">Mot de passe</label>
                <div className="flex gap-3">
                  <Input
                    type="password"
                    value="••••••••••"
                    disabled
                    className="h-11 text-base bg-gray-50 flex-1"
                  />
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Changer le mot de passe
                  </button>
                </div>
              </div>

              {/* Support Access Button */}
              <div className="flex items-start justify-between py-4 border-t border-gray-200">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Accès au support</h4>
                  <p className="text-sm text-gray-600">Gérer les paramètres de sécurité et l'accès au support</p>
                </div>
                <SupportAccessSection userInfo={userInfo} setUserInfo={setUserInfo}>
                  <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
                    Gérer
                  </button>
                </SupportAccessSection>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Card */}
        <SignatureCard
          signature={userInfo.personalSignature}
          onSave={handleSignatureSave}
        />
      </div>

      {/* Form Dialogs */}

      <Dialog open={showNameForm} onOpenChange={setShowNameForm}>
        <DialogContent className=" bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 ">Modifier le nom</h2>
          <NameForm
            onBack={() => setShowNameForm(false)}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            changeName={changeName}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailForm} onOpenChange={setShowEmailForm}>
        <DialogContent className=" bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 ">Changer l'email</h2>
          <EmailForm
            onBack={() => setShowEmailForm(false)}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordForm} onOpenChange={setShowPasswordForm}>
        <DialogContent className=" bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 ">Changer le mot de passe</h2>
          <PasswordForm
            onBack={() => setShowPasswordForm(false)}
            changePassword={changePassword}
          />
        </DialogContent>
      </Dialog>






    </div >
  );
}
