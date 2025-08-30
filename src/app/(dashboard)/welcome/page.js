"use client";
import { useState } from "react";
import ClinicDetails from "./welcomsteps/clinicDetails";
import ProfileSetup from "./welcomsteps/profileSetup";
import WelcomeSteps from "./welcomsteps/WelcomeSteps";
export default function WelcomeOnboarding() {
  const [step, setStep] = useState(0);
  return (
    <div className="w-full h-[100vh] flex items-center justify-center py-8">
      <div className="flex w-[90vw] h-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex-1 h-full flex flex-col justify-center p-8">
            <WelcomeSteps
            />
        </div>
      </div>
    </div>
  );
} 