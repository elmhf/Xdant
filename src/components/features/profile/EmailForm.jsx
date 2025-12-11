import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmailForm({ onBack, userInfo, setUserInfo }) {
  const [step, setStep] = useState(1); // 1: password, 2: email, 3: code
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputsRef = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [password, setPassword] = useState("");

  // Step 1: Verify password
  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      setError("Le mot de passe est obligatoire.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-password", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userInfo.email, password }),
      });
      const data = await res.json();
      if (res.ok && data.valid === true) {
        setStep(2);
      } else {
        setError("Mot de passe incorrect.");
      }
    } catch (e) {
      setError("Erreur réseau");
    }
    setLoading(false);
  };

  // Step 2: Send email
  const handleSendEmail = async () => {
    if (!email.trim()) {
      setError("L'adresse email est obligatoire.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-email-update-code", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Un code de vérification a été envoyé à votre nouvelle adresse e-mail.");
        setStep(3);
      } else {
        setError(data.message || "Erreur lors de l'envoi du code de vérification.");
      }
    } catch (e) {
      setError("Erreur réseau");
    }
    setLoading(false);
  };

  // Step 3: Verify code
  const handleVerifyCode = async () => {
    if (code.join("").length < 6) {
      setError("Veuillez saisir le code à 6 chiffres.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-email-update-code", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.join("") }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Adresse e-mail modifiée avec succès.");
        setUserInfo({ email });
        setTimeout(() => {
          onBack();
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
    const newCode = [...code];
    newCode[i] = value;
    setCode(newCode);
    setError("");
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
            <span className="font-semibold text-gray-800">Sécurité :</span> Pour modifier votre adresse email, nous devons vérifier votre identité en saisissant votre mot de passe actuel.
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                Mot de passe
              </Label>
              <Input
                id="password"
                className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl text-base font-medium bg-red-50 text-red-800 border-2 border-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2 mt-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100 text-lg font-bold transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
              onClick={onBack}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="text-lg font-bold bg-[#EBE8FC] border text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
              disabled={!password || loading}
            >
              {loading ? "Vérification..." : "Vérifier"}
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); handleSendEmail(); }}>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
            <span className="font-semibold text-gray-800">Info :</span> Veuillez saisir votre nouvelle adresse email. Un code de vérification sera envoyé à cette adresse.
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                Nouvelle adresse email
              </Label>
              <Input
                id="email"
                className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
                type="email"
                placeholder="Entrez votre nouvelle adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="flex gap-3 pt-2 mt-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100 text-lg font-bold transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
              onClick={onBack}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="text-lg font-bold bg-[#EBE8FC] border text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
              disabled={!email || loading}
            >
              {loading ? "Envoi..." : "Envoyer le code"}
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(); }}>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
            <span className="font-semibold text-gray-800">Vérification :</span> Saisissez le code à 6 chiffres envoyé à votre nouvelle adresse email.
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Code de vérification
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

          <div className="flex gap-3 pt-2 mt-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100 text-lg font-bold transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
              onClick={onBack}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="text-lg font-bold bg-[#EBE8FC] border text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
              disabled={code.join("").length < 6 || loading}
            >
              {loading ? "Vérification..." : "Valider le code"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
} 