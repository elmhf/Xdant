"use client";
import { fetchWithToast } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import Link from "next/link";

// Mock function for demonstration
const signUp = async (email, password, firstName, lastName, phone) => {
    return fetchWithToast("http://localhost:5000/api/auth/send-verification-code", {
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


  return (
    <div className="flex w-full max-h-[100%] items-center justify-center relative">

      <div
        className="w-full max-w-xl overflow-scroll max-h-[100%] no-scrollbar bg-white rounded-lg px-2 space-y-6"
      >
        {/* Heading */}
        <div
          className="text-center"
        >
          <h2 className="text-5xl font-bold text-gray-900">Create a secure account</h2>
          <p className="text-sm text-gray-600 mt-2">
            Your security is our priority. Please fill all fields carefully.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* First and Last Name */}
          <div
            className="flex space-x-4"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="firstName" className="font-semibold text-gray-700">
                First name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter first name"
                maxLength={50}
                className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.firstName ? 'border-red-500' : 'border-gray-200'
                  }`}
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
                className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.lastName ? 'border-red-500' : 'border-gray-200'
                  }`}
                value={lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
              />
            </div>
          </div>

          {/* Email and Phone number on the same line */}
          <div
            className="flex space-x-4"
          >
            {/* Email */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="email" className="font-semibold text-gray-700">
                Email address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                maxLength={254}
                className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); handleChange('email', e.target.value); }}
                onBlur={() => handleBlur('email')}
              />
            </div>
            {/* Phone number */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="phone" className="font-semibold text-gray-700">
                Phone
              </Label>
              <div className="flex">
                <select
                  className="border border-gray-300 rounded-l-lg px-3 py-2 bg-white text-gray-700 border-r-0"
                  defaultValue="TN"
                >
                  <option value="US">🇺🇸 +1</option>
                  <option value="FR">🇫🇷 +33</option>
                  <option value="TN">🇹🇳 +216</option>
                </select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone"
                  maxLength={15}
                  className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 text-gray-900 placeholder-gray-400 rounded-l-none focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                  value={phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div
            className="space-y-2"
          >
            <Label htmlFor="password" className="font-semibold text-gray-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                maxLength={128}
                className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.password ? 'border-red-500' : 'border-gray-200'
                  }`}
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
          <div
            className="space-y-2"
          >
            <Label htmlFor="confirmPassword" className="font-semibold text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                maxLength={128}
                className={`w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                  }`}
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
          {/* Navigation Button */}
          <div
            className="flex w-full mt-8"
          >
            <button
              type="button"
              onClick={canContinue ? handleNext : undefined}
              className={`px-8 py-3 w-full rounded-lg font-semibold transition-all duration-200 ${canContinue && !loading
                ? 'bg-[#5c4ce3] text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              ) : canContinue ? 'Continue' : 'Continue'}
            </button>
          </div>
          <div
            className="text-center mt-6"
          >
            <p className="text-sm text-gray-600">
              Already have an account? ?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                Log in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}