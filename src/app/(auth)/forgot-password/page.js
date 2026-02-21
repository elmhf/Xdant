"use client";
export const dynamic = "force-dynamic";
import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/shared/navbar/LanguageSwitcher";

export default function ForgotPasswordPage() {
    const { t } = useTranslation("auth");
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const inputRefs = useRef([]);
    const router = useRouter();

    // Timer effect
    useEffect(() => {
        if (step === 2 && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [step, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.every(char => !isNaN(Number(char)))) {
            const newOtp = [...otp];
            pastedData.forEach((char, index) => {
                if (index < 6) newOtp[index] = char;
            });
            setOtp(newOtp);
            const nextIndex = Math.min(pastedData.length, 5);
            inputRefs.current[nextIndex]?.focus();
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await apiClient('/api/auth/reset/sendPasswordReset', {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            setStep(2);
            setTimeLeft(300);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError(t("forgotPassword.errors.otpRequired"));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await apiClient('/api/auth/reset/verifyResetOtp', {
                method: 'POST',
                body: JSON.stringify({ email, code: otpString })
            });

            if (data.resetToken) {
                setResetToken(data.resetToken);
                setStep(3); // Move to password creation step
            } else {
                throw new Error("System error: No reset token received.");
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError(t("forgotPassword.newPassword.confirmHint"));
            return;
        }
        if (newPassword.length < 12) {
            setError(t("forgotPassword.newPassword.passwordHint"));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await apiClient('/api/auth/reset/updatePassword', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    resetToken: resetToken,
                    newPassword
                })
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        if (timeLeft > 0) return;
        setLoading(true);
        setError(null);
        try {
            await apiClient('/api/auth/reset/sendPasswordReset', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            setTimeLeft(300);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 relative">
            <div className="absolute top-8 right-8 z-50">
                <LanguageSwitcher />
            </div>
            <AnimatePresence mode='wait'>
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-[20px] p-10 w-full max-w-[500px] "
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t("forgotPassword.title")}</h2>
                            <p className="text-gray-500 text-[15px]">
                                {t("forgotPassword.subtitle")}
                            </p>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-[15px] font-medium text-gray-700 block">
                                    {t("forgotPassword.email")}
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-[50px] rounded-xl border-2 border-gray-200 bg-white focus:ring-[#5c4ce3] focus:border-[#5c4ce3]"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-2xl border border-red-100">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[50px] bg-[#5c4ce3] hover:bg-[#4b3ccb] text-white rounded-xl text-[16px] font-medium transition-colors"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("forgotPassword.resetButton")}
                            </Button>

                        </form>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="bg-white rounded-[20px] p-10 w-full max-w-[500px]  text-center"
                    >
                        <div className="w-12 h-12 bg-[#EBE9FE] rounded-xl flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-6 h-6 text-[#5c4ce3]" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("forgotPassword.checkEmail.title")}</h2>
                        <p className="text-gray-500 mb-8">
                            {t("forgotPassword.checkEmail.desc")}<br />
                            <span className="font-semibold text-gray-900">{email}</span>
                        </p>

                        <form onSubmit={handleOtpSubmit} className="space-y-8">
                            <div className="flex justify-center gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => inputRefs.current[index] = el}
                                        type="text"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="w-full h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#5c4ce3] focus:ring-2 focus:ring-[#5c4ce3]/20 focus:outline-none bg-white transition-all text-gray-800"
                                        maxLength={1}
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-2xl border border-red-100">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading || otp.join('').length !== 6}
                                className="w-full h-[50px] bg-[#5c4ce3] hover:bg-[#4b3ccb] text-white rounded-xl text-[16px] font-medium transition-colors"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("forgotPassword.checkEmail.verifyButton")}
                            </Button>
                        </form>

                        <div className="mt-8 text-sm text-gray-500">
                            {t("forgotPassword.checkEmail.noEmail")}{' '}
                            <button
                                onClick={resendOtp}
                                disabled={timeLeft > 0}
                                className={`font-semibold ${timeLeft > 0 ? 'text-gray-400' : 'text-[#5c4ce3] hover:underline'}`}
                            >
                                {timeLeft > 0 ? t("forgotPassword.checkEmail.resendIn", { time: formatTime(timeLeft) }) : t("forgotPassword.checkEmail.tryAgain")}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[20px] p-10 w-full max-w-[500px] "
                    >
                        <div className="text-center mb-8">
                            <p className="text-6xl font-bold text-gray-900 mb-2">{t("forgotPassword.newPassword.title")}</p>
                            <p className="text-gray-500 text-[15px]">
                                {t("forgotPassword.newPassword.subtitle")}
                            </p>
                        </div>

                        {success ? (
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="font-semibold text-lg">{t("forgotPassword.newPassword.successTitle")}</p>
                                <p className="text-sm mt-1">{t("forgotPassword.newPassword.successDesc")}</p>
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="newPassword" className="text-[15px] font-medium text-gray-700 block">
                                        {t("forgotPassword.newPassword.passwordLabel")}
                                    </label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full h-[50px] rounded-xl border-gray-200 bg-white focus:ring-[#5c4ce3] focus:border-[#5c4ce3]"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">{t("forgotPassword.newPassword.passwordHint")}</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="text-[15px] font-medium text-gray-700 block">
                                        {t("forgotPassword.newPassword.confirmLabel")}
                                    </label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-[50px] rounded-xl border-gray-200 bg-white focus:ring-[#5c4ce3] focus:border-[#5c4ce3]"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">{t("forgotPassword.newPassword.confirmHint")}</p>
                                </div>

                                {error && (
                                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-2xl border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[50px] bg-[#5c4ce3] hover:bg-[#4b3ccb] text-white rounded-xl text-[16px] font-medium transition-colors"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("forgotPassword.newPassword.resetting")}
                                </Button>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
