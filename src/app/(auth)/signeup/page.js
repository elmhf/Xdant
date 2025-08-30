"use client";
import { useState } from "react";
import DetailsPage from "./SingUpSteps/details";
import PinVerification from "./SingUpSteps/PinVerification";
import { useRouter } from "next/navigation";

export default function SingUp() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const router = useRouter();

  return (
    <div className="w-full h-full flex  items-center justify-center">
      <div className="flex w-[100vw] h-screen  max-w-screen bg-white  overflow-hidden">
        <div className="flex-1 h-full flex flex-col justify-center p-8">
          {step === 0 && (
            <DetailsPage
              onNext={() => setStep(1)}
              isFirstStep={step === 0}
              isLastStep={step === 1}
              email={email}
              setEmail={setEmail}
            />
          )}
          {step === 1 && (
            <PinVerification
              onNext={() => router.push("/welcome")}
              onBack={() => setStep(0)}
              email={email}
            />
          )}
        </div>
      </div>
    </div>
  );
}