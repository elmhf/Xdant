"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { apiClient } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/shared/navbar/LanguageSwitcher";

export default function LoginPage() {
  const { t } = useTranslation("auth");
  const { pushNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const WEBSITE_NAME = process.env.NEXT_PUBLIC_WEBSITE_NAME || "Xdental";

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
          router.push('/');
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      await apiClient("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const redirectPath = searchParams.get("redirect") || "/";
      router.push(redirectPath);
    } catch (err) {
      console.error("Login error:", err);
      if (err.data?.state === 'pending_verification') {
        pushNotification('error', "auth:login.errors.pendingVerification||");
        router.push(`/signeup?step=1&email=${encodeURIComponent(email)}`);
        return;
      }
      const errorMessage = err.message === "Invalid email or password"
        ? t("login.errors.invalidCredentials")
        : (err.message || t("login.errors.network"));

      setError(errorMessage);
      pushNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://serverrouter.onrender.com';
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">{t("common:loading")}</p>
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
                alt={t("navbar:logoAlt")}
                width={120}
                height={40}
                className="h-10 w-auto rounded-full overflow-hidden object-contain"
              />
            </div>

            {/* Language Switcher in side panel */}
            <div className="absolute top-8 right-8 z-20">
              <LanguageSwitcher />
            </div>

            {/* Image with Border Radius */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden">
              <Image
                src="/loginside.png"
                alt={t("login.title")}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-2/3 p-6 md:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto relative">
            {/* Mobile Language Switcher */}
            <div className="absolute top-6 left-6 md:hidden z-50">
              <LanguageSwitcher />
            </div>
            {/* Top Right Signup Link */}
            <div className="absolute top-6 right-6 md:top-10 md:right-10">
              <p className="text-sm text-gray-600">
                {t("login.noAccount")}{' '}
                <Link href="/signeup" className="font-bold text-black  transition-colors">
                  {t("login.signUp")}
                </Link>
              </p>
            </div>

            {/* Mobile Logo */}
            <div className="md:hidden mb-8 text-center pt-10">
              <Image
                src="/XDENTAL.png"
                alt={t("navbar:logoAlt")}
                width={120}
                height={40}
                className="h-12 w-auto mx-auto object-contain"
              />
            </div>

            {/* Form Container with Max Width */}
            <div className="w-full max-w-md mx-auto">
              {/* Header */}
              <div className="mb-8">
                <p className="text-6xl font-semibold text-gray-900 mb-4">{t("login.title")}</p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-4">{t("login.subtitle")}</p>
              </div>

              {/* Social Login Buttons */}
              <div className="flex gap-4 mb-8">
                {/* Google Button */}
                <Button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-gray-300 bg-white border-1 rounded-xl hover:bg-gray-50 transition-all hover:border-gray-300 font-medium text-gray-700 "
                >
                  <FcGoogle className="w-5 h-5" />
                  <span className="text-sm">{t("login.continueWithGoogle")}</span>
                </Button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="relative flex text-sm">
                  <span className=" bg-white text-gray-900 font-semibold">{t("login.orContinueWithEmail")}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("login.email")}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      placeholder={t("login.emailPlaceholder")}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-100 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-gray-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">{t("login.password")}</label>
                    <Link href="/forgot-password" className="text-sm font-medium text-black font-bold transition-colors">
                      {t("login.forgotPassword")}
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      placeholder={t("login.passwordPlaceholder")}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-100 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-gray-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-3xl font-semibold transition-all  mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      {t("login.signingIn")}
                    </span>
                  ) : (
                    t("login.signIn")
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
