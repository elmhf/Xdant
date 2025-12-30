"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, User } from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [banData, setBanData] = useState(null);
  const router = useRouter();

  const WEBSITE_NAME = process.env.NEXT_PUBLIC_WEBSITE_NAME || "Xdental";

  // Report Dialog State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");
    setBanData(null);

    try {
      await apiClient("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Login successful
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);

      // Handle Ban Case
      if (err.status === 403 && err.data?.code === 'USER_BANNED') {
        setBanData(err.data);
      } else {
        setError(err.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportSubject || !reportMessage) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmittingReport(true);
    try {
      // TODO: Connect to actual support/appeal endpoint
      // await apiClient("/api/support/appeal", { ... })
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

      toast.success("Report submitted successfully. We will review your appeal.");
      setIsReportOpen(false);
      setReportSubject("");
      setReportMessage("");
    } catch (err) {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // If user is banned, show the Facebook-style ban screen
  if (banData) {
    // Extract user name from email if available for the greeting
    const userName = email ? email.split('@')[0] : 'User';
    // Capitalize first letter
    const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

    const isPermanent = banData.details?.type === 'PERMANENT';
    const formattedEndDate = banData.details?.end_date
      ? new Date(banData.details.end_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      : null;

    // Dynamic text based on ban type
    const headerTitle = isPermanent
      ? `${displayName}, your account has been disabled`
      : `${displayName}, your account has been locked`;

    const headerDescription = isPermanent
      ? "Your account has been permanently disabled because it violated our Community Standards and Terms of Service."
      : "We noticed some activity on your account that violates our Community Standards, so we have temporarily locked it.";

    const infoBoxTitle = isPermanent
      ? "Account Disabled"
      : (formattedEndDate ? `Locked until ${formattedEndDate}` : "Account Locked");

    const infoBoxDescription = isPermanent
      ? `This decision is final. You can no longer use ${WEBSITE_NAME}.`
      : (formattedEndDate
        ? "Your account will be automatically unlocked after this time. Until then, your profile is not visible and you cannot access your account."
        : `To protect our community, your profile is not visible to people on ${WEBSITE_NAME} and you can't use your account.`);

    return (
      <div className="min-h-screen w-full flex flex-col items-center pt-20 p-4 bg-white">
        <div className="w-full max-w-[500px] animate-in fade-in zoom-in duration-300">

          {/* Header Image (Purple Lock) */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Simple illustration representation */}
              <div className="w-48 h-24 bg-[#edecfa] rounded-t-lg relative overflow-visible flex items-center justify-center">
                <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-[#edecfa] to-[#edecfa]/50"></div>
                {/* Lock Icon */}
                <div className="relative z-10 -mb-6">
                  <div className="w-24 h-24 bg-[#584be3] rounded-2xl flex items-center justify-center shadow-lg transform rotate-[-5deg]">
                    <Lock className="w-12 h-12 text-white/90" strokeWidth={2.5} />
                    {/* Chain decoration */}
                    <div className="absolute -right-4 top-1/2 w-8 h-2 bg-gray-300 rounded-full"></div>
                    <div className="absolute -left-4 top-1/2 w-8 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center px-4 mb-4 mt-8">
            <p className="text-2xl font-bold text-gray-900 leading-tight mb-4">
              {headerTitle}
            </p>
            <p className="text-[15px] text-gray-600 leading-relaxed text-left">
              {headerDescription}
            </p>
          </div>

          {/* Info Box */}
          <div className="mx-4 bg-[#f0f2f5] rounded-lg p-4 flex items-start gap-4 mb-8 border border-gray-100">
            <div className="bg-[#1877f2] rounded-full p-2 shrink-0 mt-0.5">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">
                {infoBoxTitle}
              </p>
              <p className="text-[13px] text-gray-600 leading-snug">
                {infoBoxDescription}
              </p>
            </div>
          </div>

          {/* Action Section */}
          {/* Only show appeal options if it's not a permanent ban, or if we want to allow appeals for perma-bans too. 
                        Usually perma-bans might have a different flow, but keeping it simple for now. */}
          <div className="mx-4 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              What can I do?
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              If you think we made a mistake, you can submit an appeal to our review team.
            </p>

            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold h-10 rounded-md text-sm">
                  Appeal Decision
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Submit an Appeal</DialogTitle>
                  <DialogDescription>
                    If you believe your account was locked in error, please provide details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input
                      id="subject"
                      value={reportSubject}
                      onChange={(e) => setReportSubject(e.target.value)}
                      placeholder="Brief summary of the issue"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea
                      id="message"
                      value={reportMessage}
                      onChange={(e) => setReportMessage(e.target.value)}
                      placeholder="Explain why your account should be unlocked..."
                      className="min-h-[150px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReportOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmitReport} disabled={isSubmittingReport}>
                    {isSubmittingReport ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              className="w-full mt-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => {
                setBanData(null);
                setEmail("");
                setPassword("");
              }}
            >
              Back to Login
            </Button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-[480px] p-6 sm:p-8">

        {/* Header Image (Purple User) - Matching Ban Style */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-48 h-24 bg-[#edecfa] rounded-t-lg relative overflow-visible flex items-center justify-center">
              <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-[#edecfa] to-[#edecfa]/50"></div>
              {/* User Icon */}
              <div className="relative z-10 -mb-6">
                <div className="w-24 h-24 bg-[#584be3] rounded-2xl flex items-center justify-center shadow-lg transform rotate-[-5deg]">
                  <User className="w-12 h-12 text-white/90" strokeWidth={2.5} />
                  {/* Decorative elements */}
                  <div className="absolute -right-4 top-1/2 w-8 h-2 bg-gray-300 rounded-full"></div>
                  <div className="absolute -left-4 top-1/2 w-8 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center px-4 mb-8 mt-8">
          <p className="text-2xl font-bold text-gray-900 leading-tight mb-2">
            Welcome Back
          </p>
          <p className="text-[15px] text-gray-600 leading-relaxed">
            Sign in to access your account
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="w-full bg-red-50 border border-red-100 text-red-600 rounded-lg px-4 py-3 text-sm font-medium mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="email"
                placeholder="Email address"
                className="w-full h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full h-12 pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-all text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-600/20 text-base"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/signeup" className="font-semibold text-blue-600 hover:text-blue-500">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
