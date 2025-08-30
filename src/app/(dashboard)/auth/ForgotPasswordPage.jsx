import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, Loader2, Shield, Check } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds
  
  const inputRefs = useRef([]);

  // Countdown timer effect
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  // Format time left
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Send email request
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
  const response = await fetch('http://localhost:5000/api/auth/reset/sendPasswordReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      // Move to step 2 (OTP verification)
      setStep(2);
      setSuccess(true);
      setTimeLeft(300); // Reset timer to 5 minutes
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
  const response = await fetch('http://localhost:5000/api/auth/reset/verifyResetOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpString })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid OTP');
      }
      
      const data = await response.json();
      setResetToken(data.resetToken);
      setStep(3); // Move to password reset step
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Update Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
  const response = await fetch('http://localhost:5000/api/auth/reset/updatePassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          resetToken, 
          newPassword 
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update password');
      }
      
      setSuccess(true);
      // You can redirect to login page here
      setTimeout(() => {
        console.log('Redirect to login page');
        // window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBackToEmail = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setResetToken('');
    setError(null);
    setSuccess(false);
  };

  const resendOtp = async () => {
    if (timeLeft > 0) return; // Don't allow resend if timer is still running
    
    setLoading(true);
    setError(null);
    
    try {
  const response = await fetch('http://localhost:5000/api/auth/reset/sendPasswordReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend OTP');
      }
      
      setSuccess(true);
      setTimeLeft(300); // Reset timer to 5 minutes
      setOtp(['', '', '', '', '', '']); // Clear previous OTP
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-full flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl  p-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify your email' : 'Reset Password'}
          </h2>
        </div>

        {/* Progress indicator - only show on step 1 */}
        {step === 1 && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#7c5cff] text-white">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">Email</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-500">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">OTP</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-500">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">Reset</span>
            </div>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-lg font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 pr-4 h-12 w-full border-2 border-[#7c5cff] rounded-lg focus:border-[#6a4fd8]"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleEmailSubmit}
              className="w-full h-12 bg-[#7c5cff] hover:bg-[#6a4fd8] text-white font-bold text-lg rounded-lg shadow-md"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending OTP...
                </span>
              ) : (
                'Send OTP Code'
              )}
            </Button>
          </div>
        )}

        {/* Step 2: OTP Form */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2">
                We sent a code to <span className="font-semibold text-blue-600">{email}</span>
              </p>
              <p className="text-gray-500 text-sm">
                Time left to verify: <span className="font-mono font-semibold">{formatTime(timeLeft)} seconds</span>
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-400 focus:outline-none bg-gray-50"
                  maxLength={1}
                />
              ))}
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleOtpSubmit}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold text-lg rounded-lg"
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Continue'
              )}
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-gray-600 mb-2">Didn't get a code?</p>
              <Button
                variant="ghost"
                onClick={resendOtp}
                disabled={loading || timeLeft > 0}
                className={`font-semibold ${timeLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
              >
                {timeLeft > 0 ? `Resend in ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Resend'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Reset Password Form */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 text-lg">
                Email verified! Now set your new password.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-lg font-bold text-gray-700 mb-2">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-12 w-full border-2 border-[#7c5cff] rounded-lg focus:border-[#6a4fd8]"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-lg font-bold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 w-full border-2 border-[#7c5cff] rounded-lg focus:border-[#6a4fd8]"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  Password updated successfully! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handlePasswordSubmit}
              className="w-full h-12 bg-[#7c5cff] hover:bg-[#6a4fd8] text-white font-bold text-lg rounded-lg shadow-md"
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Password...
                </span>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;