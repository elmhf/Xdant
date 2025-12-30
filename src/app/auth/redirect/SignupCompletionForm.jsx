'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/utils/apiClient';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SignupCompletionForm({ initialData }) {
    const router = useRouter();
    const [firstName, setFirstName] = useState(initialData?.firstName || '');
    const [lastName, setLastName] = useState(initialData?.lastName || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // 1. Required Fields Check
        if (!firstName.trim()) newErrors.firstName = true;
        if (!lastName.trim()) newErrors.lastName = true;
        if (!password) newErrors.password = true;
        if (!confirmPassword) newErrors.confirmPassword = true;

        // 2. Password Confirmation
        if (password !== confirmPassword) {
            newErrors.confirmPassword = true;
        }

        // 3. Phone Validation (Optional but must be numeric if provided)
        if (phone && phone.trim()) {
            const phoneRegex = /^\d+$/;
            if (!phoneRegex.test(phone.trim())) {
                newErrors.phone = true;
            }
        }

        // 4. Update Errors State
        setErrors(newErrors);

        // 5. Block Submission if errors exist
        if (Object.keys(newErrors).length > 0) {
            if (newErrors.phone) {
                alert("Le numéro de téléphone doit contenir uniquement des chiffres.");
            } else if (password !== confirmPassword) {
                alert("Les mots de passe ne correspondent pas");
            }
            return;
        }

        setLoading(true);
        try {
            await apiClient('/api/auth/google-complete-signup', {
                method: 'POST',
                body: JSON.stringify({
                    registrationToken: initialData.registrationToken,
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone,
                    email: email
                })
            });

            window.location.href = '/';

        } catch (err) {
            console.error(err);
            alert("Erreur: " + (err.message || "Erreur serveur."));
        } finally {
            setLoading(false);
        }
    };

    const inputBaseClass = "w-full h-[50px] border-2 rounded-xl bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3]";

    return (
        <div className="flex flex-col items-center justify-center min-w-screen min-h-screen bg-white p-4">
            <div className="w-full max-w-2xl rounded-3xl  p-8 md:p-12">

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Row 1: Names */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900">
                                First name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter first name"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                className={`${inputBaseClass} ${errors.firstName ? 'border-red-500' : 'border-gray-200'}`}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900">
                                Last name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter last name"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                className={`${inputBaseClass} ${errors.lastName ? 'border-red-500' : 'border-gray-200'}`}
                                required
                            />
                        </div>
                    </div>

                    {/* Row 2: Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900">
                                Email address <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="email"
                                value={email}
                                readOnly // Usually email from Google is fixed
                                className="w-full h-[50px] border-2 rounded-xl bg-gray-50 px-4 py-2 text-gray-500 border-gray-200 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900">
                                Phone
                            </label>
                            <div className="flex">
                                <div className="flex items-center justify-center px-3 border-2 border-r-0 border-gray-200 rounded-l-xl bg-white text-gray-700 font-medium min-w-[100px] h-[50px]">
                                    TN +216
                                </div>
                                <Input
                                    type="tel"
                                    placeholder="Phone"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className={`w-full h-[50px] border-2 rounded-r-xl rounded-l-none bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-[#5c4ce3] focus:border-[#5c4ce3] ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className={`${inputBaseClass} ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[25px] -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className={`${inputBaseClass} ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-[25px] -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? 'Creating Account...' : 'Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
