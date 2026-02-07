"use client";
import { useState, useEffect, Suspense } from "react";
import DetailsPage from "./SingUpSteps/details";
import PinVerification from "./SingUpSteps/PinVerification";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

function SignUpContent() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle URL params for redirect from login
  useEffect(() => {
    const stepParam = searchParams.get('step');
    const emailParam = searchParams.get('email');
    if (stepParam) setStep(parseInt(stepParam));
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  // Check if user is already authenticated (client-side)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://serverrouter.onrender.com';
        const response = await fetch(`${BACKEND_URL}/api/users/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // User is authenticated, redirect to home
          router.push('/');
        } else {
          // Not authenticated, show signup form
          setCheckingAuth(false);
        }
      } catch (error) {
        // Error or not authenticated, show signup form
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      {/* Main Card Container - Full Width & Height */}
      <div className="w-full h-screen bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">

          {/* Left Side - Illustration */}
          <div className="hidden md:flex md:w-1/2 bg-white items-center justify-center p-4 relative">
            {/* Logo in Top-Left */}
            <div className="absolute top-8 left-8 z-20">
              <Image
                src="/XDENTAL.png"
                alt="Xdent Logo"
                width={120}
                height={40}
                className="h-10 w-auto rounded-full overflow-hidden object-contain"
              />
            </div>

            {/* Image with Border Radius */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden">
              <Image
                src="/singup.png"
                alt="Dental Illustration"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-2/3 p-6 md:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto relative">
            {/* Top Right Login Link */}
            <div className="absolute top-6 right-6 md:top-10 md:right-10">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-black transition-colors">
                  Log in
                </Link>
              </p>
            </div>

            {/* Mobile Logo */}
            <div className="md:hidden mb-8 text-center pt-10">
              <Image
                src="/XDENTAL.png"
                alt="Xdental Logo"
                width={120}
                height={40}
                className="h-12 w-auto mx-auto object-contain"
              />
            </div>

            {/* Form Container */}
            <div className="w-full max-w-md mx-auto">
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
                  onNext={() => router.push("/create-clinic")}
                  onBack={() => setStep(0)}
                  email={email}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}