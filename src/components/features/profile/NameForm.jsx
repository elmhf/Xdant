import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";
import { useTranslation } from "react-i18next";

export default function NameForm({ onBack, userInfo, setUserInfo, changeName }) {
  const [firstName, setFirstName] = useState(userInfo.firstName || '');
  const [lastName, setLastName] = useState(userInfo.lastName || '');
  const [loading, setLoading] = useState(false);
  const { pushNotification } = useNotification();
  const { t } = useTranslation();

  // Validation helpers
  const isAlpha = (str) => /^[A-Za-zÀ-ÿ 0-9\s'-]+$/.test(str);
  const isValidName = (name) => name.length >= 3 && isAlpha(name);

  const handleSave = async () => {
    setLoading(true);
    // Validation
    if (!isValidName(firstName) || !isValidName(lastName)) {
      pushNotification('error', t('profile.nameValidation'));
      setLoading(false);
      return;
    }
    const result = await changeName(firstName.trim(), lastName.trim());
    setLoading(false);
    if (result.success) {
      setUserInfo({ firstName: firstName.trim(), lastName: lastName.trim() });
      pushNotification('success', t('profile.nameUpdateSuccess'));
      setTimeout(() => {
        onBack();
      }, 1200);
    } else {
      pushNotification('error', result.message || t('profile.nameUpdateError'));
    }
  };

  return (
    <form className=" space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
        <span className="font-semibold text-gray-800">{t('profile.securityTitle')} :</span> {t('profile.nameRequirementsInfo')}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-base font-semibold text-gray-700">
            {t('profile.firstName')}
          </Label>
          <Input
            id="firstName"
            className="h-12 w-full text-base  focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
            placeholder={t('profile.firstNamePlaceholder')}
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-base font-semibold text-gray-700">
            {t('profile.lastName')}
          </Label>
          <Input
            id="lastName"
            className="h-12 w-full text-base  focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
            placeholder={t('profile.lastNamePlaceholder')}
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />
        </div>
      </div>



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
          disabled={!firstName.trim() || !lastName.trim() || loading}
        >
          {loading ? t('profile.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  );
} 