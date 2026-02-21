import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUserStore from "@/components/features/profile/store/userStore";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ClinicEmailForm({ value, onSave, onBack }) {
  const { t } = useTranslation();
  const currentClinicId = useUserStore(state => state.currentClinicId);
  const [step, setStep] = useState(1); // 1: email, 2: otp
  const [email, setEmail] = useState(value);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputsRef = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const { pushNotification } = useNotification();

  // Step 1: Send OTP to new email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      pushNotification('error', t('company.profile.invalidEmail'));
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient("/api/auth/send-email-otp-code", {
        method: "POST",
        body: JSON.stringify({ newEmail: email, otpKey: "clinicUpdateEmail" }),
      });

      pushNotification('success', t('company.profile.emailOtpSent'));
      setStep(2);
    } catch (e) {
      // apiClient handles toast errors, but if we want custom message in pushNotification:
      // However, usually apiClient throws ApiError. 
      // We can rely on apiClient's toast or keep using pushNotification if we extract message.
      // Assuming apiClient errors are handled, we might just log or set generic error if needed.
      // But preserving existing UX:
      pushNotification('error', e.message || t('company.profile.networkError'));
    }

    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.join("").length < 6) {
      pushNotification('error', t('company.profile.enterOtp'));
      return;
    }
    setLoading(true);
    try {
      await apiClient("/api/clinics/update-email", {
        method: "POST",
        body: JSON.stringify({ code: otp.join(""), otpKey: "clinicUpdateEmail", clinicData: { email, clinicId: currentClinicId } }),
      });

      pushNotification('success', t('company.profile.emailVerified'));
      setTimeout(() => {
        onSave(email);
      }, 1200);

    } catch (e) {
      const message = e.data?.message || e.message || t('company.profile.otpIncorrect');
      pushNotification('error', message);
    }
    setLoading(false);
  };

  // OTP input logic
  const handleChange = (i, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[i] = value;
    setOtp(newOtp);
    if (value && i < 5) {
      inputsRef[i + 1].current.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputsRef[i - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (pasted.length) {
      setOtp((prev) => prev.map((_, i) => pasted[i] || ""));
      setTimeout(() => {
        const idx = pasted.length < 6 ? pasted.length : 5;
        inputsRef[idx].current.focus();
      }, 10);
    }
  };

  return (
    <form className="p-6 pt-2 space-y-6" onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp}>
      {step === 1 && (
        <>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
            {t('company.profile.emailHelper')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium text-gray-700">
              {t('company.emailHeader')}
            </Label>
            <Input
              id="email"
              className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="space-y-4">
            <Label className="block text-base font-medium text-gray-700 mb-4">
              {t('company.profile.verificationCode')}
            </Label>
            <div className="flex gap-3 justify-center mb-4" dir="ltr">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={inputsRef[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className="w-full h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20 outline-none transition bg-white"
                  autoFocus={i === 0}
                  disabled={loading}
                />
              ))}
            </div>
          </div>
        </>
      )}

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
          {loading
            ? (step === 1 ? t('company.profile.sending') : t('company.profile.verifying'))
            : (step === 1 ? t('company.profile.sendCode') : t('company.profile.validateCode'))
          }
        </Button>
      </div>
    </form>
  );
} 