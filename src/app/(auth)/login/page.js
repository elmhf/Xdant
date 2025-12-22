"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PinVerification from "../signeup/SingUpSteps/PinVerification";
import { login, login2FA } from "@/utils/jwtUtils";
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import CustomOTPInput from "@/components/ui/CustomOTPInput";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [timer, setTimer] = useState(109);

  useEffect(() => {
    let interval;
    if (mfaRequired && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mfaRequired, timer]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'email':
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!validateEmail(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = "Password is required";
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, eval(field));
  };

  const handleChange = (field, value) => {
    switch (field) {
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
    }
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const allFieldsValid = Object.keys(errors).length === 0;
  const allFieldsFilled = email && password;
  const canLogin = allFieldsValid && allFieldsFilled;

  const handleLogin = async () => {
    if (!canLogin) return;


    setLoading(true);
    setPendingVerification(false);
    setLoginError("");

    try {
      const result = await login(email, password);

      if (result?.mfaRequired) {
        setMfaRequired(true);
        setTempToken(result.tempToken);
        setLoginError("");
      } else {
        startTransition(() => {
          router.push("/");
        });
      }

    } catch (err) {
      // التحقق من خطأ التحقق المعلق
      if (err.message && err.message.toLowerCase().includes("pending verification")) {
        setPendingVerification(true);
      } else {
        setLoginError(err.message || "Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      await login2FA(twoFactorCode, email, tempToken);
      startTransition(() => {
        router.push("/");
      });
    } catch (err) {
      setLoginError(err.message || "Invalid 2FA code.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for after successful verification
  const handleVerificationNext = () => {
    setPendingVerification(false);
    setLoginError("");
    // Optionally, show a success message or redirect
  };

  if (pendingVerification) {
    return (
      <PinVerification email={email} onNext={handleVerificationNext} />
    );
  }

  if (mfaRequired) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[480px] bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Enter Code</h2>
            <p className="text-gray-500 text-base mb-1">
              We sent a verification code to <span className="font-semibold text-gray-900">{email}</span>.
            </p>
            <button
              onClick={() => { setMfaRequired(false); setTwoFactorCode(""); }}
              className="text-[#7564ed] hover:text-[#6354c9] font-medium text-sm hover:underline transition-colors"
            >
              Wrong email address? Edit
            </button>
          </div>

          <form onSubmit={handle2FASubmit} className="space-y-8">
            <div className="flex justify-center">
              <CustomOTPInput value={twoFactorCode} onChange={setTwoFactorCode} error={!!loginError} />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold bg-[#7564ed] hover:bg-[#6354c9] text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-200"
              disabled={loading || twoFactorCode.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Code →"}
            </Button>

            {timer > 0 ? (
              <p className="text-gray-400 text-sm font-medium">
                Send again in {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => { setTimer(109); }}
                className="text-[#7564ed] hover:text-[#6354c9] text-sm font-medium hover:underline transition-colors"
              >
                Send code again
              </button>
            )}
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full overflow-scroll bg-white flex items-center justify-center p-4"
      suppressHydrationWarning
    >
      <div className="w-full h-[90vh] max-w-[90vw] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left Side - Text, Image, and Tags */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex flex-col items-center justify-center max-h-full relative"
        >
          <div className="absolute top-10 left-10 z-20">
            <h2 className="text-4xl font-bold mb-4 leading-tight text-gray-900 max-w-[400px]">
              Connectez-vous à votre <span className="text-[#7564ed]">espace dentaire</span>
            </h2>
          </div>

          <Image
            src="/dent.png"
            alt="Dental Graphic"
            width={1200}
            height={1200}
            className="w-full max-w-[700px] max-h-[700px] h-auto object-contain mt-20"
            priority
          />

          <div className="mt-[-250px] w-full max-w-[600px] flex flex-wrap gap-x-3 gap-y-2 justify-center px-4 relative z-10">
            {/* Problem Tags Clustered Below Image */}
            <span className="text-[18px] font-[600] px-4 py-3 rounded-md whitespace-nowrap bg-[#E4E1FF]/85 text-[#4a39c0]/85 shadow-sm transform -rotate-2">
              Endo-treated tooth  96 %
            </span>
            <span className="text-[18px] font-[600] px-4 py-3 rounded-md whitespace-nowrap bg-[#FFCCD4]/85 text-[#FF3254]/85 shadow-sm transform rotate-1">
              Impaction  100 %
            </span>
            <span className="text-[18px] font-[600] px-4 py-3 rounded-md whitespace-nowrap bg-[#FFCCD4]/85 text-[#FF3254]/85 shadow-sm transform -rotate-1">
              Periodontal bone loss  87 %
            </span>
            <span className="text-[18px] font-[600] px-4 py-3 rounded-md whitespace-nowrap bg-[#E4E1FF]/85 text-[#4a39c0]/85 shadow-sm">
              Horizontal
            </span>
            <span className="text-[18px] font-[600] px-4 py-3 rounded-md whitespace-nowrap bg-[#FFCCD4]/85 text-[#FF3254]/85 shadow-sm">
              Mild
            </span>
            <span className="text-[18px] font-[600] px-4 py-3 rounded-md whitespace-nowrap bg-[#FFCCD4]/85 text-[#FF3254]/85 shadow-sm transform rotate-2">
              Missed canal  74 %
            </span>
            <span className="text-[18px] font-[600] px-4 py-3 rounded-md whitespace-nowrap bg-[#E4E1FF]/85 text-[#4a39c0]/85 shadow-sm transform -rotate-1">
              Caries  65 %
            </span>
            <span className="text-[18px] font-[600] px-4 py-3 rounded-md whitespace-nowrap bg-[#FFCCD4]/85 text-[#FF3254]/85 shadow-sm transform rotate-3">
              Periapical Lesion 82 %
            </span>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-xl flex flex-col justify-center items-center mx-auto"
        >
          <div className="bg-white w-full  rounded-2xl p-8 ">


            <div className="text-center mb-8">

              <div className="text-4xl font-bold text-gray-900">Welcome Back</div>
            </div>

            {/* Error Banner */}
            {loginError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-medium mb-6 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {loginError}
              </motion.div>
            )}

            {/* Form */}
            <div className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  maxLength={254}
                  className={`w-full h-14 bg-white border-2 border-gray-300 rounded-xl px-4 text-base text-gray-900 placeholder-gray-400 focus:border-[#7564ed] focus:ring-4 focus:ring-[#7564ed]/10 transition-all duration-200`}
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    maxLength={128}
                    className={`w-full h-14 bg-white border-2 border-gray-300 rounded-xl px-4 pr-12 text-base text-gray-900 placeholder-gray-400 focus:border-[#7564ed] focus:ring-4 focus:ring-[#7564ed]/10 transition-all duration-200`}
                    value={password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#5c4ce3] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={canLogin ? handleLogin : undefined}
                  className={`w-full h-14 rounded-xl text-lg font-bold tracking-wide transition-all duration-300 ${canLogin && !loading
                    ? 'bg-[#5c4ce3] hover:bg-[#6354c9] text-white'
                    : 'bg-[#5c4ce3] text-white cursor-not-allowed'
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Loading...
                    </span>
                  ) : 'Log In'}
                </Button>
              </div>

              {/* Links */}
              <div className="text-center space-y-3 pt-2">
                <Link href="/forgot-password" className="text-[#7564ed] hover:text-[#6354c9] text-sm font-semibold hover:underline">
                  Forgot password?
                </Link>

                <div className="w-full border-t border-gray-100 my-4"></div>

                <div className="flex justify-center">
                  <Link
                    href="/signeup"
                    className="bg-[#42b72a] hover:bg-[#36a420] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-colors"
                  >
                    Create new account
                  </Link>
                </div>
              </div>

            </div>
            <div className="text-center mt-8 text-xs text-gray-500">
              <p>Create a Page for a celebrity, brand or business.</p>
            </div>
          </div>


        </motion.div>

      </div>
    </div>
  );
}
