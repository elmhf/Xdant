"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SignatureCard from "./SignatureCard";
import SupportAccessSection from "./SupportAccessSection";
import { useState, useEffect, useRef } from "react";
import useUserStore from "./store/userStore";
import { Edit2, LogOut } from "lucide-react";
import NameForm from "./NameForm";
import EmailForm from "./EmailForm";
import PasswordForm from "./PasswordForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";
import { apiClient } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

// --------------------------- Component ---------------------------
export default function AccountInfoCard({ firstName, lastName, email }) {
  // ======= Router =======
  const router = useRouter();

  // ======= State & Store =======
  const { userInfo, setUserInfo, changePassword, changeName, getUserInfo } = useUserStore();
  const getImageFromCache = useUserStore(state => state.getImageFromCache);
  const changePhoto = useUserStore(state => state.changePhoto);
  const deletePhoto = useUserStore(state => state.deletePhoto);
  const { pushNotification } = useNotification();
  const { t } = useTranslation();

  // Form dialog states
  const [showNameForm, setShowNameForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        pushNotification('error', result.message || t('notifications.sigSaveError'));
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
        pushNotification('error', t('notifications.imgFormatError'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        pushNotification('error', t('notifications.imgSizeError'));
        return;
      }
      setIsUploadingPhoto(true);
      // Call changePhoto API
      const result = await changePhoto(file);
      setIsUploadingPhoto(false);
      if (result.success && result.profilePhotoUrl) {
        setUserInfo({ profilePhotoUrl: result.profilePhotoUrl });
        pushNotification('success', t('notifications.photoUpdateSuccess'));
      } else {
        pushNotification('error', result.message || t('notifications.photoUpdateError'));
      }
    }
  };

  const handlePhotoDelete = async () => {
    if (!userInfo.profilePhotoUrl) return;

    const confirmed = window.confirm(t('notifications.confirmPhotoDelete'));
    if (!confirmed) return;

    setIsDeletingPhoto(true);
    const result = await deletePhoto();
    setIsDeletingPhoto(false);

    if (result.success) {
      setUserInfo({ profilePhotoUrl: null });
      pushNotification('success', t('notifications.photoDeleteSuccess'));
    } else {
      pushNotification('error', result.message || t('notifications.photoDeleteError'));
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      pushNotification('error', t('notifications.logoutError'));
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{t('profile.accountInfo')}</h2>
                <SupportAccessSection userInfo={userInfo} setUserInfo={setUserInfo}>
                  <button className="px-4 py-2 cursor-pointer text-lg text-[#7564ed] hover:bg-gray-100 rounded-2xl transition-colors font-medium whitespace-nowrap">
                    {t('profile.supportAccess')}
                  </button>
                </SupportAccessSection>
              </div>

              {/* Profile Picture */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7564ed] to-[#6a4fd8] flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                  {photoSrc ? (
                    <img src={photoSrc} alt={t('profile.title')} className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInfo?.firstName?.[0]}{userInfo?.lastName?.[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex gap-3 mb-2">
                    <button
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      disabled={isUploadingPhoto}
                      className="px-4 py-2 cursor-pointer bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <div className="animate-spin rounded-full w-4 h-4 border-2 border-white border-t-transparent"></div>
                          {t('profile.uploading')}
                        </>
                      ) : (
                        <>
                          <span>+</span> {t('profile.changePhoto')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handlePhotoDelete}
                      disabled={!userInfo.profilePhotoUrl || isDeletingPhoto}
                      className="px-4 py-2 cursor-pointer bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeletingPhoto ? (
                        <>
                          <div className="animate-spin rounded-full w-4 h-4 border-2 border-gray-700 border-t-transparent"></div>
                          {t('profile.deleting')}
                        </>
                      ) : (
                        t('profile.deletePhoto')
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">{t('profile.photoSupportFormat')}</p>
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
                  <label className="text-sm font-semibold text-gray-700">{t('profile.firstName')}</label>

                  <Input
                    value={userInfo?.firstName || ""}
                    disabled
                    className="h-12 max-w-sm text-base flex-1"
                  />

                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">{t('profile.lastName')}</label>
                  <div className="flex gap-3">
                    <Input
                      value={userInfo?.lastName || ""}
                      disabled
                      className="h-12 text-base flex-1"
                    />
                    <button
                      onClick={() => setShowNameForm(true)}
                      className="px-4 py-2 cursor-pointer text-lg text-[#7564ed] hover:bg-gray-100 rounded-2xl transition-colors font-medium whitespace-nowrap"
                    >
                      {t('common.edit')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('profile.accountSecurity')}</h2>

              {/* Email */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-semibold text-gray-700">{t('profile.email')}</label>
                <div className="flex gap-3">
                  <Input
                    value={userInfo?.email || ""}
                    disabled
                    className="h-12 text-base flex-1"
                  />
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="px-4 py-2 cursor-pointer text-lg text-[#7564ed] hover:bg-gray-100 rounded-2xl transition-colors font-medium whitespace-nowrap"
                  >
                    {t('common.edit')}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-semibold text-gray-700">{t('profile.password')}</label>
                <div className="flex gap-3">
                  <Input
                    type="password"
                    value="••••••••••"
                    disabled
                    className="h-12 text-base flex-1"
                  />
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="px-4 py-2 cursor-pointer text-lg text-[#7564ed] hover:bg-gray-100 rounded-2xl transition-colors font-medium whitespace-nowrap"
                  >
                    {t('common.edit')}
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <div className="mb-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('profile.logoutLoading')}
                    </>
                  ) : (
                    <>
                      <LogOut className="w-5 h-5" />
                      {t('common.logout')}
                    </>
                  )}
                </button>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4 ">{t('profile.editNameTitle')}</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4 ">{t('profile.changeEmailTitle')}</h2>
          <EmailForm
            onBack={() => setShowEmailForm(false)}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordForm} onOpenChange={setShowPasswordForm}>
        <DialogContent className=" bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 ">{t('profile.changePasswordTitle')}</h2>
          <PasswordForm
            onBack={() => setShowPasswordForm(false)}
            changePassword={changePassword}
          />
        </DialogContent>
      </Dialog>






    </div >
  );
}
