"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import { useTranslation } from "react-i18next";

export default function PinVerification({ onNext, onBack, email }) {
  const { t } = useTranslation("auth");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newPin = [...pin];
    pastedData.forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) {
        newPin[index] = char;
      }
    });
    setPin(newPin);
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs[lastIndex].current.focus();
  };

  const verifyPin = async () => {
    const pinString = pin.join("");
    if (pinString.length !== 6) {
      setError(t("forgotPassword.errors.otpRequired"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiClient("/api/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({ email, code: pinString }),
      });
      onNext();
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setResending(true);
    setError("");
    try {
      await apiClient("/api/auth/resend-verification-code", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      setError(err.message || "Resend failed");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-left w-full relative">
        <p className="text-7xl font-semibold text-gray-900 mb-4">{t("pinVerification.title")}</p>
        <p className="text-gray-500 text-lg">
          {t("pinVerification.subtitle")} <span className="font-semibold text-gray-900">{email}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between gap-2 sm:gap-4">
          {pin.map((digit, index) => (
            <Input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-full h-12 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 rounded-xl bg-gray-50 focus:bg-white focus:border-[#5c4ce3] focus:ring-[#5c4ce3] transition-all"
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

        <p className="text-sm text-center text-gray-500">
          {t("pinVerification.enterOtp")}
        </p>

        <Button
          onClick={verifyPin}
          className="w-full h-12 rounded-full bg-[#0055FF] hover:bg-[#0044CC] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
          disabled={loading || pin.some((d) => !d)}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("pinVerification.verifying")}
            </span>
          ) : (
            t("pinVerification.verifyButton")
          )}
        </Button>

        <div className="space-y-4 pt-4">
          <p className="text-sm text-center text-gray-500">
            {t("pinVerification.noCode")}{" "}
            <button
              onClick={resendCode}
              disabled={resending}
              className="text-[#0055FF] font-bold hover:underline disabled:opacity-50"
            >
              {resending ? t("pinVerification.resending") : t("pinVerification.resend")}
            </button>
          </p>

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("pinVerification.backToDetails")}
          </button>
        </div>
      </div>
    </div>
  );
}