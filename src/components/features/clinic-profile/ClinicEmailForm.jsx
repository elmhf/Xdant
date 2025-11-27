import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUserStore from "@/components/features/profile/store/userStore";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ClinicEmailForm({ value, onSave, onBack }) {
  const currentClinicId = useUserStore(state => state.currentClinicId);
  const [step, setStep] = useState(1); // 1: email, 2: otp
  const [email, setEmail] = useState(value);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const inputsRef = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Step 1: Send OTP to new email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Adresse e-mail invalide.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-email-otp-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ newEmail: email, otpKey: "clinicUpdateEmail" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Un code de vérification a été envoyé à votre nouvelle adresse e-mail.");
        setStep(2);
      } else {
        setError(data.message || "Erreur lors de l'envoi du code de vérification.");
      }
    } catch (e) {
      setError("Erreur réseau");
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.join("").length < 6) {
      setError("Veuillez saisir le code à 6 chiffres.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/clinics//update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ code: otp.join(""), otpKey: "clinicUpdateEmail", clinicData: { email, clinicId: currentClinicId } }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Adresse e-mail modifiée avec succès.");
        setTimeout(() => {
          setSuccess("");
          onSave(email);
        }, 1200);
      } else {
        setError(data.message || "Code incorrect ou expiré.");
      }
    } catch (e) {
      setError("Erreur réseau");
    }
    setLoading(false);
  };

  // OTP input logic
  const handleChange = (i, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[i] = value;
    setOtp(newOtp);
    setError("");
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
            Pour garantir le sérieux et la sécurité de votre clinique, veuillez utiliser une <span className="font-semibold">adresse e-mail professionnelle</span> (par exemple, contact@votreclinique.com) et évitez d'utiliser une adresse personnelle ou celle que vous utilisez pour votre compte utilisateur. Cela permet de séparer votre activité professionnelle de vos accès personnels.
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold text-gray-700">
              Adresse e-mail
            </Label>
            <Input
              id="email"
              className="h-12  w-full text-base border-2 border-gray-300 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
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
            <Label className="block text-base font-semibold text-gray-700 mb-4">
              Code de vérification
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
                  className="w-full h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20 outline-none transition bg-white"
                  autoFocus={i === 0}
                  disabled={loading}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="p-4 rounded-xl text-base font-medium bg-red-50 text-red-800 border-2 border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl text-base font-medium bg-green-50 text-green-800 border-2 border-green-200">
          {success}
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          className="flex-1 h-12 text-base font-semibold bg-[#7564ed] hover:bg-[#6a4fd8] text-white border-2 border-[#7564ed]"
          disabled={loading}
        >
          {loading ? (step === 1 ? "Envoi..." : "Vérification...") : (step === 1 ? "Envoyer le code" : "Valider le code")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={onBack}
          disabled={loading}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
} 