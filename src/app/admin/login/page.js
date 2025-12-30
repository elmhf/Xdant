"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { useRouter } from 'next/navigation';
import { loginAdmin } from "@/utils/adminUtils";
import Image from "next/image";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setError("");

        try {
            await loginAdmin(email, password);
            router.push("/admin/dashboard");
        } catch (err) {
            setError(err.message || "Invalid admin credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white overflow-hidden">
            {/* Left Side - Visual Hero */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 justify-center items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/dent.jpg"
                        alt="Dental Office"
                        fill
                        className="object-cover opacity-60 mix-blend-overlay"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-black/80 z-10" />
                </div>

                <div className="relative z-20 text-white p-12 max-w-xl">
                    <div className="mb-6 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                        <ShieldCheck className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
                        Administration <br />
                        <span className="text-blue-400">Control Panel</span>
                    </h1>
                    <p className="text-lg text-gray-300 leading-relaxed opacity-90">
                        Secure access to clinic management, user administration, and system settings.
                        Please ensure you have authorized access before proceeding.
                    </p>

                    <div className="mt-12 flex gap-4 text-sm font-medium text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            System Online
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Secure Connection
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 xl:p-24 bg-white relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
                        <p className="mt-2 text-gray-500">
                            Please sign in to access your dashboard.
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    <ShieldCheck className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="text-sm text-red-700">
                                    <p className="font-medium">Authentication Failed</p>
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 block">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="admin@xdental.com"
                                        className="h-12 pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all rounded-xl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Password
                                    </label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-12 pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all rounded-xl"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform active:scale-[0.99]"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In to Dashboard
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="pt-6 mt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">
                            By signing in, you agree to our Terms of Service and Privacy Policy.
                            <br />
                            © {new Date().getFullYear()} XDental Admin Portal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

