import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PinVerification({ onNext, onBack, email }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [expiresIn, setExpiresIn] = useState(null);
  const [waitTime, setWaitTime] = useState(null);
  const inputsRef = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Fetch expiresIn and waitTime on mount
  useEffect(() => {
    if (expiresIn === null && email) {
      fetch("http://localhost:5000/api/auth/verification-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.expiresIn !== undefined) setExpiresIn(data.expiresIn);
          if (data.waitTime !== undefined) setWaitTime(data.waitTime);
        });
    }
  }, [email, expiresIn]);

  // Timeline countdown for expiresIn
  useEffect(() => {
    if (expiresIn === null || expiresIn <= 0) return;
    const interval = setInterval(() => {
      setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresIn]);

  // Timeline countdown for waitTime
  useEffect(() => {
    if (waitTime === null || waitTime <= 0) return;
    const interval = setInterval(() => {
      setWaitTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [waitTime]);

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

  const handleContinue = async () => {
    if (code.join("").length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-and-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.join("") }),
      });
      const data = await res.json();
      if (res.ok) {
        onNext(); // Success: move to next step or redirect
      } else {
        setError(data.error || "Invalid code.");
      }
    } catch (err) {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setExpiresIn(data.expiresIn);
        setWaitTime(30); // After resend, always 30s before next resend
        setResendMessage(`A new code has been sent to your email. You have ${data.expiresIn} seconds to verify before your registration is cancelled.`);
      } else {
        setError(data.error || "Failed to resend code.");
        if (data.expiresIn) setExpiresIn(data.expiresIn);
        if (data.waitTime !== undefined) setWaitTime(data.waitTime);
      }
    } catch (err) {
      setError("Server error while resending code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="w-full max-w-md  mx-auto bg-white  flex flex-col items-center">
        <div className="mb-6 text-center">
          <div className="mb-2 text-2xl font-bold text-gray-900">Verify your email</div>
          <div className="text-gray-600 text-sm mb-2">
            We sent a code to <span className="font-semibold">{email}</span>
          </div>
          {expiresIn !== null && (
            <div className="text-xs text-gray-500 mt-1">
              Time left to verify: <span className="font-semibold">{expiresIn} seconds</span>
            </div>
          )}
        </div>
        <form className="flex flex-col items-center w-full" onSubmit={e => { e.preventDefault(); handleContinue(); }}>
          <div className="flex gap-4 mb-4">
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
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition"
                autoFocus={i === 0}
              />
            ))}
          </div>
          {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
          {resendMessage && <div className="text-green-600 text-xs mb-2">{resendMessage}</div>}
          <div className="mb-4 text-xs text-gray-500">
            Didn't get a code? {waitTime > 0 ? (
              <span className="text-gray-400">Resend in {waitTime}s</span>
            ) : (
              <button type="button" className="text-[#0d0c22] font-semibold hover:underline" onClick={handleResend} disabled={resendLoading}>
                {resendLoading ? "Sending..." : "Click to resend"}
              </button>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-[#0d0c22] hover:bg-white hover:text-[#0d0c22]  rounded-lg font-bold text-base py-3 mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Verifying...
              </span>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
} 