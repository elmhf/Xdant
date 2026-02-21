"use client";
export const dynamic = "force-dynamic";
import nextDynamic from "next/dynamic";
import { apiClient } from "@/utils/apiClient";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ChevronRight, Edit2, Loader2, MapPin, Minus, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation, Trans } from 'react-i18next';
import React from "react";

const MapPicker = nextDynamic(() => import("../(auth)/signeup/SingUpSteps/MapPicker"), { ssr: false });
import { reverseGeocode } from "@/utils/geocoding";

// API Helpers
const sendOtp = async (email) => {
    return apiClient("/api/auth/send-email-otp-code", {
        method: "POST",
        body: JSON.stringify({
            otpKey: "create_clinic",
            email: email
        }),
    });
};

const createClinic = async (code, clinicData) => {
    return apiClient("/api/clinics/create", {
        method: "POST",
        body: JSON.stringify({
            code: code,
            otpKey: "create_clinic",
            clinicData: {
                email: clinicData.contactEmail,
                clinic_name: clinicData.clinic_name,
                phone: clinicData.contactPhone,
                neighbourhood: clinicData.neighbourhood,
                website: clinicData.website,
                country: clinicData.country,
                street_address: clinicData.street_address,
                city: clinicData.city,
                postal_code: clinicData.postal_code
            }
        }),
    });
};

const inviteMember = async (clinicId, email, role) => {
    return apiClient("/api/clinics/invite-member", {
        method: "POST",
        body: JSON.stringify({
            clinicId: clinicId,
            email: email,
            role: role || 'assistant_access',
        }),
    });
};

export default function WelcomePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingRoles, setCheckingRoles] = useState(true); // New state for initial role check
    const [clinicId, setClinicId] = useState(null);

    // Check user roles on mount
    useEffect(() => {
        const checkUserRoles = async () => {
            try {
                // Use the dedicated API to check ownership
                const response = await apiClient("/api/clinics/is-owner");

                if (response.isOwnerOrAdmin) {
                    router.push("/"); // Redirect to home/dashboard
                } else {
                    setCheckingRoles(false); // Allow access
                }
            } catch (error) {
                console.error("Failed to check user ownership:", error);
                // On error, we might want to allow access or retry. 
                // For now, allowing access to not block valid users if api fails temporarily
                setCheckingRoles(false);
            }
        };

        checkUserRoles();
    }, [router]);

    const [formData, setFormData] = useState({
        clinic_name: "",
        website: "",
        country: "",
        street_address: "",
        city: "",
        postal_code: "",
        neighbourhood: "",
        contactEmail: "",
        contactPhone: "",
    });
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleStep1Submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await sendOtp(formData.contactEmail);
            setStep(2);
        } catch (err) {
            console.error(err);
            setError(err.message || t('createClinic.step2.errors.failedOtp'));
        } finally {
            setLoading(false);
        }
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError(t('createClinic.step2.errors.invalidCode'));
            return;
        }

        setLoading(true);
        setError("");
        try {
            // Create clinic
            const response = await createClinic(otp, formData);

            // Store clinic Id
            if (response?.id) {
                setClinicId(response.id);
            } else if (response?.data?.id) {
                setClinicId(response.data.id);
            } else if (response?.clinic?.id) {
                setClinicId(response.clinic.id);
            }

            setStep(3); // Move to Invite step
        } catch (err) {
            console.error(err);
            setError(err.message || t('createClinic.step2.errors.failedCreate'));
        } finally {
            setLoading(false);
        }
    };

    // State for AddTeamMemberDialog
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteMessage, setInviteMessage] = useState("");

    const [invitedEmails, setInvitedEmails] = useState([]);

    // Map & Address Logic
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Simple reverse geocoding using OSM (Nominatim)


    const handleLocationSelect = async (pos) => {
        const addressData = await reverseGeocode(pos.lat, pos.lng);
        if (addressData) {
            setFormData(prev => ({
                ...prev,
                country: addressData.country || prev.country,
                city: addressData.city || addressData.town || addressData.village || prev.city,
                street_address: addressData.road ? `${addressData.house_number ? addressData.house_number + ' ' : ''}${addressData.road}` : prev.street_address,
                postal_code: addressData.postcode || prev.postal_code,
                neighbourhood: addressData.suburb || addressData.neighbourhood || prev.neighbourhood,
            }));
        }
        setIsMapOpen(false);
    };

    const handleInviteJob = async () => {
        if (!inviteEmail || !inviteRole) {
            setInviteMessage(t('createClinic.step3.errors.fieldsRequired'));
            return;
        }

        if (invitedEmails.length >= 5) {
            setInviteMessage(t('createClinic.step3.errors.limitReached'));
            return;
        }

        if (!clinicId) {
            setInviteMessage(t('createClinic.step3.errors.missingClinicId'));
            return;
        }

        setInviteLoading(true);
        setInviteMessage("");

        try {
            await inviteMember(clinicId, inviteEmail, inviteRole);

            // Add to invited list
            setInvitedEmails(prev => [...prev, inviteEmail]);

            // Show success message and clear fields for next invite
            setInviteMessage(t('createClinic.step3.success', { email: inviteEmail }));
            setInviteEmail("");
            setInviteRole("");
            setInviteLoading(false);

            // Clear message after a few seconds
            setTimeout(() => setInviteMessage(""), 4000);
        } catch (e) {
            console.error(e);
            setInviteMessage(e.message || t('common.error'));
            setInviteLoading(false);
        }
    };

    const handleSkip = () => {
        router.push("/");
    };

    // Step 1: Clinic Information
    const renderStep1 = () => (
        <div className="w-full max-w-2xl mx-auto p-6 overflow-scroll no-scrollbar bg-white ">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{t('createClinic.step1.title')}</h2>
                <p className="text-gray-500 mt-2">{t('createClinic.step1.desc')}</p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="clinic_name" className="font-semibold text-gray-700">{t('createClinic.step1.companyName')} <span className="text-red-500">*</span></Label>
                        <Input id="clinic_name" required value={formData.clinic_name} onChange={handleChange} placeholder={t('createClinic.step1.placeholders.companyName')} className="mt-1 h-[50px] border-1 border-gray-400 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                    </div>

                    <div>
                        <Label htmlFor="website" className="font-semibold text-gray-700">{t('createClinic.step1.website')}</Label>
                        <Input id="website" value={formData.website} onChange={handleChange} placeholder={t('createClinic.step1.placeholders.website')} className="mt-1 h-[50px] border-1 border-gray-400 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="country" className="font-semibold text-gray-700">{t('createClinic.step1.country')}</Label>
                            <Input id="country" value={formData.country} onChange={handleChange} placeholder={t('createClinic.step1.placeholders.country')} className="mt-1 h-[50px] border-1 border-gray-400 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label htmlFor="street_address" className="font-semibold text-gray-700">{t('createClinic.step1.streetAddress')}</Label>
                                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs flex items-center gap-1 text-[#5c4ce3] border-[#5c4ce3] hover:bg-[#5c4ce3]/10">
                                            <MapPin className="w-3 h-3" /> {t('createClinic.step1.pickOnMap')}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-3xl h-[80vh] p-0 overflow-hidden rounded-2xl">
                                        <div className="w-full h-full">
                                            <MapPicker onLocationSelect={handleLocationSelect} />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <Input id="street_address" value={formData.street_address} onChange={handleChange} placeholder={t('createClinic.step1.placeholders.streetAddress')} className="h-[50px] border-1 border-gray-400 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="city" className="font-semibold text-gray-700">{t('createClinic.step1.city')}</Label>
                            <Input id="city" value={formData.city} onChange={handleChange} placeholder={t('createClinic.step1.placeholders.city')} className="mt-1 h-[50px] border-1 border-gray-400 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                        </div>
                        <div>
                            <Label htmlFor="postal_code" className="font-semibold text-gray-700">{t('createClinic.step1.zipCode')}</Label>
                            <Input id="postal_code" value={formData.postal_code} onChange={handleChange} placeholder={t('createClinic.step1.placeholders.zipCode')} className="mt-1 h-[50px] border-1 border-gray-400 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="neighbourhood" className="font-semibold text-gray-700">{t('createClinic.step1.neighbourhood')}</Label>
                        <Input id="neighbourhood" value={formData.neighbourhood} onChange={handleChange} placeholder={t('createClinic.step1.placeholders.neighbourhood')} className="mt-1 h-[50px] border-1 border-gray-400 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('createClinic.step1.clinicContact')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="contactEmail" className="font-semibold text-gray-700">{t('createClinic.step1.email')}</Label>
                                <Input id="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} placeholder={t('createClinic.step1.placeholders.email')} className="mt-1 h-[50px] border-1 border-gray-400 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                            </div>
                            <div>
                                <Label htmlFor="contactPhone" className="font-semibold text-gray-700">{t('createClinic.step1.phone')}</Label>
                                <Input id="contactPhone" type="tel" value={formData.contactPhone} onChange={handleChange} placeholder={t('createClinic.step1.placeholders.phone')} className="mt-1 h-[50px] border-1 border-gray-400 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                            </div>
                        </div>
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-[#5c4ce3] hover:bg-[#4b3ccb] text-white h-[50px] rounded-xl font-semibold text-lg">
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t('createClinic.step1.nextStep')}
                </Button>
            </form>
        </div>
    );

    // Step 2: Email Verification
    const renderStep2 = () => (
        <div className="w-full max-w-md mx-auto p-6 bg-white  text-center">
            <div className="mb-6">
                <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-12 w-12 text-[#5c4ce3]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t('createClinic.step2.title')}</h2>
                <div className="text-gray-500 mt-2">
                    <Trans
                        i18nKey="createClinic.step2.desc"
                        t={t}
                        values={{ email: formData.contactEmail }}
                    >
                        We sent a verification code to <span className="font-medium text-gray-900">{{ email: formData.contactEmail }}</span>
                    </Trans>
                </div>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-6">
                <div>
                    <div className="flex justify-center items-center gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <React.Fragment key={index}>
                                <Input
                                    id={`otp-${index}`}
                                    value={otp[index] || ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (!/^\d*$/.test(val)) return;

                                        const newOtp = otp.split('');
                                        // Handle overwrite or insert
                                        newOtp[index] = val.slice(-1);
                                        const finalOtp = newOtp.join('').substring(0, 6);
                                        setOtp(finalOtp);

                                        if (val && index < 5) {
                                            document.getElementById(`otp-${index + 1}`)?.focus();
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                                            document.getElementById(`otp-${index - 1}`)?.focus();
                                        }
                                    }}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
                                        setOtp(pastedData);
                                        if (pastedData.length > 0) {
                                            document.getElementById(`otp-${Math.min(pastedData.length - 1, 5)}`)?.focus();
                                        }
                                    }}
                                    className="w-12 h-14 text-center text-2xl font-bold border-1 border-gray-400 rounded-2xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3] bg-gray-50 text-gray-900"
                                    maxLength={1}
                                />
                                {index === 2 && <span className="text-gray-400 font-bold text-xl "><Minus className="h-7 w-7" /></span>}
                            </React.Fragment>
                        ))}
                        {error && <p className="text-red-500 text-sm mt-2 absolute -bottom-6 w-full">{error}</p>}
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-[#5c4ce3] hover:bg-[#4b3ccb] text-white h-[50px] rounded-xl font-semibold">
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t('createClinic.step2.verifyAndCreate')}
                </Button>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-[#5c4ce3]">
                    {t('createClinic.step2.back')}
                </button>
            </form>
        </div>
    );


    // Step 3: Invite Members
    const renderStep3 = () => (
        <div className="w-full max-w-xl mx-auto p-8 overflow-y-scroll no-scrollbar max-h-[80vh] bg-white flex flex-col items-center">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{t('createClinic.step3.title')}</h2>
                <p className="text-gray-500 mt-2">{t('createClinic.step3.desc')}</p>
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-sm">
                    {t('createClinic.step3.invitationsSent', { count: invitedEmails.length })}
                </div>
            </div>

            {/* Invited Emails List */}
            {invitedEmails.length > 0 && (
                <div className="w-full mb-6 flex flex-wrap gap-2 justify-center">
                    {invitedEmails.map((email, idx) => (
                        <div key={idx} className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-2xl text-sm font-medium border border-green-100">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            {email}
                        </div>
                    ))}
                </div>
            )}

            <div className="w-full space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                    <Label htmlFor="inviteEmail" className="block text-base font-medium text-gray-500">
                        {t('createClinic.step3.email')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="inviteEmail"
                        type="email"
                        placeholder="dr.colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full h-12 text-base rounded-xl focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
                    />
                </div>

                {/* Role Select */}
                <div className="space-y-2">
                    <Label htmlFor="role" className="block text-base font-medium text-gray-500">
                        {t('createClinic.step3.accessLevel')} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger className="h-12 text-base rounded-xl w-full border border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20">
                            <SelectValue placeholder={t('createClinic.step3.selectRole')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="full_access">{t('createClinic.step3.roles.full_access')}</SelectItem>
                            <SelectItem value="clinic_access">{t('createClinic.step3.roles.clinic_access')}</SelectItem>
                            <SelectItem value="limited_access">{t('createClinic.step3.roles.limited_access')}</SelectItem>
                            <SelectItem value="assistant_access">{t('createClinic.step3.roles.assistant_access')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Feedback Message */}
                {inviteMessage && (
                    <div className={`p-4 rounded-xl text-base font-medium border-1 border-gray-400 ${inviteMessage.includes("Failed") || inviteMessage.includes("Error") || inviteMessage.includes("maximum") ? "bg-red-50 border-red-100 text-red-600" : "bg-blue-50 border-blue-100 text-blue-600"}`}>
                        {inviteMessage}
                    </div>
                )}

                {/* Actions */}
                <div className="pt-4 flex flex-col gap-4">
                    <Button
                        onClick={handleInviteJob}
                        disabled={inviteLoading}
                        className="w-full h-12 text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:bg-[#dcd6fa] hover:outline-[#7564ed] hover:outline-2 transition-all duration-150 rounded-xl"
                    >
                        {inviteLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t('createClinic.step3.sendInvitation')}
                    </Button>

                    <Button
                        onClick={handleSkip}
                        variant="outline"
                        className="w-full h-12 text-lg font-bold border-2 border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50 rounded-xl"
                    >
                        {invitedEmails.length > 0 ? t('createClinic.step3.finish') : t('createClinic.step3.skip')}
                    </Button>
                </div>
            </div>
        </div>
    );
    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    if (checkingRoles) {
        return (
            <div className="min-h-screen w-full bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#5c4ce3]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-white flex flex-col">
            {/* Top Navigation Bar */}
            <div className="w-full max-w-4xl mx-auto px-6 py-6">
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-blue-50 rounded-full mb-6 overflow-hidden">
                    <div
                        className="h-full bg-[#2563EB] transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="flex justify-between items-center relative">
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className={`p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors ${step === 1 ? 'invisible' : ''}`}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5" />
                            <path d="M12 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Step Indicator (Centered Absolute) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="text-[#2563EB] font-bold text-sm tracking-wide">
                            {t('common.step', { current: step, total: 3 }).toUpperCase()}
                        </span>
                    </div>

                    {/* Skip Button - Removed */}
                    <div className="w-8" /> {/* Placeholder to balance the flex layout if needed, or just nothing */}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-scroll no-scrollbar flex flex-col items-center justify-center p-4">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
}
