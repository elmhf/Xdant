"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Eye, EyeOff, Check, X, AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";

// Mock function for demonstration
const signUp = async (email, password, firstName, lastName, phone) => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/send-verification-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, firstName, lastName, phone }),
    });
    const data = await res.json();
    
    // Handle 409 status (email already exists)
    if (res.status === 409) {
      return { error: "This email is already registered. Please use another email." };
    }
    
    // Handle other error statuses
    if (!res.ok) {
      return { error: data.error || "Unknown error occurred. Please try again." };
    }
    
    return { data };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Network error. Please check your connection and try again." };
  }
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
  const [apiError, setApiError] = useState("");
  const [showAlert, setShowAlert] = useState(false);

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

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: "", color: "" };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommon: !["password", "123456", "qwerty", "admin"].includes(password.toLowerCase())
    };
    
    Object.values(checks).forEach(check => check && score++);
    
    if (score < 3) return { level: 0, text: "Weak", color: "text-red-500", bgColor: "bg-red-400" };
    if (score < 5) return { level: 1, text: "Medium", color: "text-yellow-500", bgColor: "bg-yellow-400" };
    return { level: 2, text: "Strong", color: "text-green-500", bgColor: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const getPasswordRequirements = () => {
    return [
      { text: "At least 8 characters", met: password.length >= 8 },
      { text: "One lowercase letter", met: /[a-z]/.test(password) },
      { text: "One uppercase letter", met: /[A-Z]/.test(password) },
      { text: "One number", met: /\d/.test(password) },
      { text: "One special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];
  };

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
        } else if (passwordStrength.level < 2) {
          newErrors.password = "Password must be strong";
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
  const canContinue = allFieldsValid && allFieldsFilled && passwordStrength.level >= 2;

  const handleNext = async () => {
    if (!canContinue) return;
    
    setLoading(true);
    setApiError("");
    setShowAlert(false);
    
    try {
      const { error, data } = await signUp(email, password, firstName, lastName, phone);
      
      if (error) {
        setApiError(error);
        setShowAlert(true);
        setLoading(false);
        return; // Don't proceed to next page if there's an error
      }
      
      // Success - proceed to next page
      setLoading(false);
      onNext();
      
    } catch (error) {
      console.error("Unexpected error:", error);
      setApiError("An unexpected error occurred. Please try again.");
      setShowAlert(true);
      setLoading(false);
    }
  };

  const dismissAlert = () => {
    setShowAlert(false);
    setApiError("");
  };

  return (
    <div className="flex w-full max-h-[100%] items-center justify-center relative">
      {/* Alert Overlay */}
      <AnimatePresence>
        {showAlert && apiError && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={dismissAlert}
            />
            
            {/* Alert Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl border border-red-200 max-w-sm w-full mx-4"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Registration Failed
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  {apiError}
                </p>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={dismissAlert}
                    variant="outline"
                    className="px-4 py-2"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Error Banner (Alternative to modal) */}
      <AnimatePresence>
        {apiError && !showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-30 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Registration Error</p>
                <p className="text-red-700 text-sm mt-1">{apiError}</p>
              </div>
              <button
                onClick={() => setApiError("")}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md overflow-scroll max-h-[100%] no-scrollbar bg-white rounded-lg px-2 space-y-6"
      >
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-5xl font-bold text-gray-900">Create a secure account</h2>
          <p className="text-sm text-gray-600 mt-2">
            Your security is our priority. Please fill all fields carefully.
          </p>
        </motion.div>

        {/* Form */}
        <div className="space-y-4">
          {/* First and Last Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
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
                className={`w-full border rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400 ${
                  errors.firstName ? 'border-red-500' : touched.firstName ? 'border-green-500' : 'border-gray-300'
                }`}
                value={firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
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
                className={`w-full border rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400 ${
                  errors.lastName ? 'border-red-500' : touched.lastName ? 'border-green-500' : 'border-gray-300'
                }`}
                value={lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </motion.div>

          {/* Email and Phone number on the same line */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
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
                className={`w-full border rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400 ${
                  errors.email ? 'border-red-500' : touched.email ? 'border-green-500' : 'border-gray-300'
                }`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); handleChange('email', e.target.value); }}
                onBlur={() => handleBlur('email')}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                  className={`w-full border rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400 rounded-l-none ${
                    errors.phone ? 'border-red-500' : touched.phone ? 'border-green-500' : 'border-gray-300'
                  }`}
                  value={phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
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
                className={`w-full border rounded-lg bg-white px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 ${
                  errors.password ? 'border-red-500' : touched.password ? 'border-green-500' : 'border-gray-300'
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
            
            {/* Password strength indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        passwordStrength.level > level ? passwordStrength.bgColor : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.text}
                </p>
              </div>
            )}
            
            {/* Password requirements */}
            {password && (
              <div className="space-y-1">
                {getPasswordRequirements().map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    {req.met ? (
                      <Check size={12} className="text-green-500" />
                    ) : (
                      <X size={12} className="text-red-500" />
                    )}
                    <span className={req.met ? 'text-green-600' : 'text-red-600'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
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
                className={`w-full border rounded-lg bg-white px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 ${
                  errors.confirmPassword ? 'border-red-500' : touched.confirmPassword && confirmPassword === password ? 'border-green-500' : 'border-gray-300'
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
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </motion.div>
          {/* Navigation Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex w-full mt-8"
          >
            <motion.button
              whileHover={{ scale: canContinue ? 1.02 : 1 }}
              whileTap={{ scale: canContinue ? 0.98 : 1 }}
              type="button"
              onClick={canContinue ? handleNext : undefined}
              className={`px-8 py-3 w-full rounded-lg font-semibold transition-all duration-200 ${
                canContinue && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
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
            </motion.button>
          </motion.div>
        <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center mt-6"
            >
              <p className="text-sm text-gray-600">
                Already have an account? ?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                  Log in
                </Link>
              </p>
            </motion.div>
          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center my-6"
          >
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300" />
          </motion.div>

          {/* Social Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="space-y-3"
          >
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 border-gray-300 hover:bg-gray-50"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5"
              />
              <span>Continue with Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 border-gray-300 hover:bg-gray-50"
            >
              <img
                src="https://www.svgrepo.com/show/448234/linkedin.svg"
                alt="LinkedIn"
                className="h-5 w-5"
              />
              <span>Continue with LinkedIn</span>
            </Button>
          </motion.div>


        </div>
      </motion.div>
    </div>
  );
}