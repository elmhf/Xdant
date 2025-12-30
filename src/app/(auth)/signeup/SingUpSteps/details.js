"use client";
import { apiClient } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import Link from "next/link";

// Mock function for demonstration
const signUp = async (email, password, firstName, lastName, phone) => {
  return apiClient("/api/auth/send-verification-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, firstName, lastName, phone }),
  });
};

export default function DetailsPage({ onNext, isFirstStep, isLastStep, email, setEmail }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,50}$/;
    return nameRegex.test(name.trim());
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const validatePhone = (phone) => !!phone.trim();


  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = "First name is required";
        } else if (!validateName(value)) {
          newErrors.firstName = "First name must be 2-50 characters, letters only";
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = "Last name is required";
        } else if (!validateName(value)) {
          newErrors.lastName = "Last name must be 2-50 characters, letters only";
        } else {
          delete newErrors.lastName;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!validateEmail(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (value && !validatePhone(value)) {
          newErrors.phone = "Please enter a valid phone number";
        } else {
          delete newErrors.phone;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = "Password is required";
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
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
    let sanitizedValue = value;

    if (field === 'firstName' || field === 'lastName') {
      sanitizedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    } else if (field === 'phone') {
      sanitizedValue = value.replace(/[^+\d\s\-\(\)]/g, '');
    }

    switch (field) {
      case 'firstName': setFirstName(sanitizedValue); break;
      case 'lastName': setLastName(sanitizedValue); break;
      case 'email': setEmail(sanitizedValue); break;
      case 'phone': setPhone(sanitizedValue); break;
      case 'password': setPassword(sanitizedValue); break;
      case 'confirmPassword': setConfirmPassword(sanitizedValue); break;
    }

    if (touched[field]) {
      validateField(field, sanitizedValue);
    }
  };

  const allFieldsValid = Object.keys(errors).length === 0;
  const allFieldsFilled = firstName && lastName && email && password && confirmPassword;
  const canContinue = allFieldsValid && allFieldsFilled;

  const handleNext = async () => {
    if (!canContinue) return;

    setLoading(true);

    try {
      await signUp(email, password, firstName, lastName, phone);

      // Success - proceed to next page
      setLoading(false);
      onNext();

    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading(false);
    }
  };


  // Google Login/Signup Logic
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/auth/google-url');
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No URL returned from backend");
        setLoading(false);
      }
    } catch (error) {
      console.error("Google login error:", error);
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center relative p-4">
      {/* Top Right Link */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10">
        <span className="text-gray-500 text-sm font-medium">Already have an account? </span>
        <Link href="/login" className="text-gray-900 font-bold text-sm hover:underline">
          Log in
        </Link>
      </div>

      <div className="w-full max-w-[500px] space-y-6">

        {/* Header */}
        <div className="text-center w-full mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-5 tracking-tight">Sign up</h1>
          <div className="text-sm  justify-start text-left font-semibold text-gray-900 mb-2">
            Sign up with Open account
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* First and Last Name */}
          <div className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="firstName" className="font-semibold text-gray-700">
                First name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter first name"
                maxLength={50}
                className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.firstName ? 'border-red-500' : 'border-gray-200'}`}
                value={firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="lastName" className="font-semibold text-gray-700">
                Last name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter last name"
                maxLength={50}
                className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.lastName ? 'border-red-500' : 'border-gray-200'}`}
                value={lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
              />
            </div>
          </div>

          {/* Email and Phone */}
          <div className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email" className="font-semibold text-gray-700">
                Email address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                maxLength={254}
                className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); handleChange('email', e.target.value); }}
                onBlur={() => handleBlur('email')}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="phone" className="font-semibold text-gray-700">
                Phone
              </Label>
              <div className="flex">
                <div className="flex items-center justify-center px-3 border-2 border-r-0 border-gray-200 rounded-l-xl bg-white text-gray-700 font-medium min-w-[80px] h-[50px]">
                  +216
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone"
                  maxLength={15}
                  className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 text-gray-900 placeholder-gray-400 rounded-l-none focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                  value={phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold text-gray-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                maxLength={128}
                className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-semibold text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                maxLength={128}
                className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
                value={confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="button"
              onClick={canContinue ? handleNext : undefined}
              className={`w-full h-12 rounded-full text-base font-semibold tracking-wide transition-all duration-300 ${canContinue && !loading
                  ? 'bg-[#0055FF] hover:bg-[#0044CC] text-white shadow-lg shadow-blue-500/20'
                  : 'bg-[#0055FF] opacity-70 text-white cursor-not-allowed'
                }`}
              disabled={!canContinue || loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating Account...
                </span>
              ) : 'Continue'
              }
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6 mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm font-semibold text-gray-900">Or continue with</span>
            </div>
          </div>

          {/* Google Button Only */}
          <div className="flex gap-3 mb-2">
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}