import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OtpVerification({ email, otpKey, onVerified, onBack }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const inputsRef = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Gestion du focus et de la saisie
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

  const handleVerify = async () => {
    if (code.join("").length < 6) {
      setError("Veuillez saisir le code à 6 chiffres.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    onVerified(code);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-md mx-auto bg-white flex flex-col items-center">
        <div className="mb-6 text-center">
          <div className="mb-2 text-2xl font-bold text-gray-900">Vérification de l'e-mail</div>
          <div className="text-gray-600 text-sm mb-2">
            Un code a été envoyé à <span className="font-semibold">{email}</span>
          </div>
        </div>
        <form className="flex flex-col items-center w-full" onSubmit={e => { e.preventDefault(); handleVerify(); }}>
          <div className="flex gap-4 mb-4">
            {code.map((digit, i) => (
              <Input
                key={i}
                ref={inputsRef[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition"
                autoFocus={i === 0}
                disabled={loading}
              />
            ))}
          </div>
          {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
          {success && <div className="text-green-600 text-xs mb-2">{success}</div>}
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onBack}
              disabled={loading}
            >
              Retour
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-base py-3"
              disabled={loading}
            >
              {loading ? "Vérification..." : "Continuer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 