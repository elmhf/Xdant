import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUserStore from "@/components/features/profile/store/userStore";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";

export default function ClinicInfoForm({ values, onSave, onBack }) {
  const { t } = useTranslation();
  const currentClinicId = useUserStore(state => state.currentClinicId);
  const [form, setForm] = useState({
    clinic_name: values.clinic_name || "",
    country: values.country || "",
    neighbourhood: values.neighbourhood || "",
    city: values.city || "",
    street_address: values.street_address || "",
    postal_code: values.postal_code || "",
    website: values.website || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { pushNotification } = useNotification();

  // Validation helper for alphabetic only
  const isAlphabetic = (str) => /^[A-Za-zÀ-ÿ\s'-]+$/.test(str);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === 'clinic_name') {
      setError(""); // Clear error when user starts typing
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clinic_name || form.clinic_name.trim().length < 3) {
      setError(t('company.profile.nameError'));
      return;
    }
    if (!isAlphabetic(form.clinic_name)) {
      setError(t('company.profile.nameAlphaError'));
      return;
    }
    // Check if any data has changed
    const hasChanges =
      form.clinic_name !== values.clinic_name ||
      form.country !== values.country ||
      form.neighbourhood !== values.neighbourhood ||
      form.city !== values.city ||
      form.street_address !== values.street_address ||
      form.postal_code !== values.postal_code ||
      form.website !== values.website;

    if (!hasChanges) {
      setError(t('company.profile.noChanges'));
      return;
    }

    setError("");
    setLoading(true);
    try {
      const data = await apiClient("/api/clinics/update-info", {
        method: "POST",
        body: JSON.stringify({
          clinicId: currentClinicId,
          clinic_name: form.clinic_name,
          street_address: form.street_address,
          neighbourhood: form.neighbourhood,
          city: form.city,
          postal_code: form.postal_code,
          country: form.country,
          website: form.website
        }),
      });
      pushNotification('success', t('company.profile.saveSuccess'));
      setTimeout(() => {
        onSave(form);
      }, 800);
    } catch (e) {
      pushNotification('error', e.message || t('company.profile.saveError'));
    }

    setLoading(false);
  };

  return (
    <form className="p-6 pt-2 space-y-6" onSubmit={handleSubmit}>
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
        <span className="font-semibold text-gray-800">{t('common.info')} :</span> {t('company.profile.infoHelper')}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clinic_name" className="text-base font-medium text-gray-700">
            {t('company.companyName')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="clinic_name"
            className={`h-12 w-full text-base rounded-xl ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20'}`}
            name="clinic_name"
            value={form.clinic_name}
            onChange={handleChange}
            required
            placeholder={t('company.profile.namePlaceholder')}
          />
          {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-base font-medium text-gray-700">
            {t('company.website')}
          </Label>
          <Input
            id="website"
            className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder={t('company.profile.websitePlaceholder')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-base font-medium text-gray-700">
              {t('company.country')}
            </Label>
            <Input
              id="country"
              className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder={t('company.profile.countryPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighbourhood" className="text-base font-medium text-gray-700">
              {t('company.stateRegion')}
            </Label>
            <Input
              id="neighbourhood"
              className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
              name="neighbourhood"
              value={form.neighbourhood}
              onChange={handleChange}
              placeholder={t('company.profile.regionPlaceholder')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-base font-medium text-gray-700">
              {t('company.city')}
            </Label>
            <Input
              id="city"
              className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder={t('company.profile.cityPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code" className="text-base font-medium text-gray-700">
              {t('company.zipCode')}
            </Label>
            <Input
              id="postal_code"
              className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
              name="postal_code"
              value={form.postal_code}
              onChange={handleChange}
              placeholder={t('company.profile.zipPlaceholder')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="street_address" className="text-base font-medium text-gray-700">
            {t('company.addressLabel')}
          </Label>
          <Input
            id="street_address"
            className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
            name="street_address"
            value={form.street_address}
            onChange={handleChange}
            placeholder={t('company.profile.addressPlaceholder')}
          />
        </div>
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
          disabled={loading}
        >
          {loading ? t('company.profile.saving') || t('common.loading') : t('common.save')}
        </Button>
      </div>
    </form>
  );
} 