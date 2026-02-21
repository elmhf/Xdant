import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";
import { useTranslation } from "react-i18next";

export default function PasswordForm({ onBack, changePassword }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { pushNotification } = useNotification();
  const { t } = useTranslation();

  const handleSave = async () => {
    setLoading(true);
    const result = await changePassword(oldPassword, newPassword);
    setLoading(false);
    if (result.success) {
      pushNotification('success', result.message);
      setTimeout(() => {
        onBack();
      }, 1200);
    } else {
      pushNotification('error', result.message);
    }
  };

  // Password requirements: at least 6 chars, 1 letter, 1 number, 1 special (!$@%)
  const passwordMeetsRequirements = (password) => {
    return (
      password.length >= 6 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!$@%]/.test(password)
    );
  };

  const isValid =
    oldPassword &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    passwordMeetsRequirements(newPassword);

  return (
    <form className=" space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
        <span className="font-semibold text-gray-800">{t('profile.securityTitle')} :</span> {t('profile.passwordRequirementsInfo')}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="oldPassword" className="text-base font-semibold text-gray-700">
            {t('profile.currentPassword')}
          </Label>
          <Input
            id="oldPassword"
            className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7564ed]"
            type="password"
            placeholder={t('profile.currentPasswordPlaceholder')}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-base font-semibold text-gray-700">
            {t('profile.newPassword')}
          </Label>
          <Input
            id="newPassword"
            className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7564ed]"
            type="password"
            placeholder={t('profile.newPasswordPlaceholder')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-base font-semibold text-gray-700">
            {t('profile.confirmPassword')}
          </Label>
          <Input
            id="confirmPassword"
            className="h-12  w-full text-base border-2 border-gray-300 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
            type="password"
            placeholder={t('profile.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>

      {newPassword && !passwordMeetsRequirements(newPassword) && (
        <div className="p-4 rounded-xl text-base font-medium bg-red-50 text-red-800 border-2 border-red-200">
          {t('profile.passwordRequirementsInfo')}
        </div>
      )}

      {newPassword && confirmPassword && newPassword !== confirmPassword && (
        <div className="p-4 rounded-xl text-base font-medium bg-red-50 text-red-800 border-2 border-red-200">
          {t('profile.passwordMismatch')}
        </div>
      )}



      <div className="flex gap-3 pt-2 mt-auto justify-end">
        <Button
          type="button"
          variant="ghost"
          className="text-gray-600 hover:bg-gray-100 text-lg font-bold transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
          onClick={onBack}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          className="text-lg font-bold bg-[#EBE8FC] border text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
          disabled={!isValid || loading}
        >
          {loading ? t('profile.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  );
} 