import React, { useState, useRef } from "react";
import { apiClient } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";
import { useTranslation } from "react-i18next";

export default function EmailForm({ onBack, userInfo, setUserInfo }) {
  const [step, setStep] = useState(1); // 1: password, 2: email, 3: code
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputsRef = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [password, setPassword] = useState("");
  const { pushNotification } = useNotification();
  const { t } = useTranslation();

  // Step 1: Verify password
  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      pushNotification('error', t('profile.passwordRequired'));
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient("/api/auth/verify-password", {
        method: "POST",
        body: JSON.stringify({ email: userInfo.email, password }),
      });

      if (data.valid === true) {
        setStep(2);
      } else {
        pushNotification('error', t('profile.incorrectPassword'));
      }
    } catch (e) {
      pushNotification('error', t('profile.networkError'));
    }
    setLoading(false);
  };

  // Step 2: Send email
  const handleSendEmail = async () => {
    if (!email.trim()) {
      pushNotification('error', t('profile.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient("/api/auth/send-email-update-code", {
        method: "POST",
        body: JSON.stringify({ newEmail: email }),
      });

      pushNotification('success', t('profile.emailCodeSent'));
      setStep(3);
    } catch (e) {
      pushNotification('error', e.message || t('profile.emailUpdateError'));
    }
    setLoading(false);
  };

  // Step 3: Verify code
  const handleVerifyCode = async () => {
    if (code.join("").length < 6) {
      pushNotification('error', t('profile.otpInstructions'));
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient("/api/auth/verify-email-update-code", {
        method: "POST",
        body: JSON.stringify({ code: code.join("") }),
      });

      pushNotification('success', t('profile.emailUpdateSuccess'));
      setUserInfo({ email });
      setTimeout(() => {
        onBack();
      }, 1200);
    } catch (e) {
      pushNotification('error', e.message || t('profile.invalidEmailCode'));
    }
    setLoading(false);
  };

  // OTP input logic
  const handleChange = (i, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[i] = value;
    setCode(newCode);
    if (value && i < 5) {
      inputsRef[i + 1].current.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputsRef[i - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (pasted.length) {
      setCode((prev) => prev.map((_, i) => pasted[i] || ""));
      setTimeout(() => {
        const idx = pasted.length < 6 ? pasted.length : 5;
        inputsRef[idx].current.focus();
      }, 10);
    }
  };

  return (
    <div className=" space-y-6">
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); handleVerifyPassword(); }}>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
            <span className="font-semibold text-gray-800">{t('profile.securityTitle')} :</span> {t('profile.verifyIdentityMsg')}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                {t('profile.password')}
              </Label>
              <Input
                id="password"
                className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
                type="password"
                placeholder={t('profile.currentPasswordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              disabled={!password || loading}
            >
              {loading ? t('profile.verifying') : t('profile.verifyPassword')}
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); handleSendEmail(); }}>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
            <span className="font-semibold text-gray-800">{t('profile.securityTitle')} :</span> {t('profile.newEmailPlaceholder')}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                {t('profile.newEmail')}
              </Label>
              <Input
                id="email"
                className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
                type="email"
                placeholder={t('profile.newEmailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              disabled={!email || loading}
            >
              {loading ? t('profile.uploading') : t('profile.sendCode')}
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(); }}>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
            <span className="font-semibold text-gray-800">{t('profile.securityTitle')} :</span> {t('profile.otpInstructions')}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                {t('profile.validateCode')}
              </Label>
              <div className="flex gap-3 justify-center mb-4" dir="ltr">
                {code.map((digit, i) => (
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
                    className="w-full h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20 outline-none transition bg-white"
                    autoFocus={i === 0}
                    disabled={loading}
                  />
                ))}
              </div>
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
              disabled={code.join("").length < 6 || loading}
            >
              {loading ? t('profile.verifying') : t('profile.validateCode')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
} 