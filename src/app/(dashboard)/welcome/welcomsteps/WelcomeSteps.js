import { useState } from "react";
import { useRouter } from "next/navigation";
import ClinicDetails from "./clinicDetails";
import OtpVerification from "./OtpVerification";
import ProfileSetup from "./profileSetup";

export default function WelcomeSteps() {
  const [step, setStep] = useState(1); // 1: details, 2: otp, 3: profile
  const [clinicData, setClinicData] = useState({});
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Step 1: ClinicDetails
  const handleClinicDetailsNext = async (data) => {
    setError("");
    setLoading(true);
    setClinicData(data);
    setEmail(data.email);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-email-otp-code", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, otpKey: "clinic_creation" }),
      });
      const apiData = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        setError(apiData.message || "Erreur lors de l'envoi du code OTP.");
      }
    } catch (e) {
      setError("Erreur réseau");
    }
    setLoading(false);
  };

  // Step 2: OtpVerification
  const handleOtpVerified = async (code) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/clinics/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicData,
          code: code.join(""),
          otpKey: "clinic_creation"
        }),
      });
      const apiData = await res.json();
      if (res.ok) {
        router.push("/");
      } else {
        setError(apiData.message || "Erreur lors de la création de la clinique.");
        setStep(1);
      }
    } catch (e) {
      setError("Erreur réseau");
      setStep(1);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-6 py-2 rounded shadow">{error}</div>}
      {step === 1 && (
        <ClinicDetails
          onNext={handleClinicDetailsNext}
        />
      )}
      {step === 2 && (
        <OtpVerification
          email={email}
          otpKey="clinic_creation"
          onVerified={handleOtpVerified}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
} 