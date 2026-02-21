import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";

export default function ClinicPhoneForm({ value, onSave, onBack }) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState(value);
  const [loading, setLoading] = useState(false);
  const { pushNotification } = useNotification();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      pushNotification('error', t('company.profile.phoneRequired'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      pushNotification('success', t('company.profile.phoneSuccess'));
      setTimeout(() => {
        onSave(phone);
      }, 800);
    }, 600);
  };

  return (
    <form className="p-6 pt-2 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-base font-medium text-gray-700">
          {t('company.phoneLabel')}
        </Label>
        <Input
          id="phone"
          className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
          placeholder={t('company.profile.phonePlaceholder')}
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="flex gap-4 pt-4 w-full justify-end">
        <Button
          type="button"
          variant="ghost"
          className="text-lg font-semibold border text-gray-600 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
          onClick={onBack}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
          disabled={!phone || loading}
        >
          {loading ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  );
} 