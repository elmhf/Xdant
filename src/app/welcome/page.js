"use client";
import { apiClient } from "@/utils/apiClient";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ChevronRight, Edit2, Loader2, MapPin, Minus, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

const MapPicker = dynamic(() => import("../(auth)/signeup/SingUpSteps/MapPicker"), { ssr: false });

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
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [clinicId, setClinicId] = useState(null);
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
            setError(err.message || "Failed to send code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit code.");
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
            setError(err.message || "Failed to create clinic. Invalid code or data.");
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
    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            return data.address;
        } catch (error) {
            console.error("Error reverse geocoding:", error);
            return null;
        }
    };

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
            setInviteMessage("Please enter both email and role.");
            return;
        }

        if (invitedEmails.length >= 5) {
            setInviteMessage("You have reached the maximum limit of 5 invitations.");
            return;
        }

        if (!clinicId) {
            setInviteMessage("Error: Clinic ID missing. Please refresh and try again.");
            return;
        }

        setInviteLoading(true);
        setInviteMessage("");

        try {
            await inviteMember(clinicId, inviteEmail, inviteRole);

            // Add to invited list
            setInvitedEmails(prev => [...prev, inviteEmail]);

            // Show success message and clear fields for next invite
            setInviteMessage(`Invitation sent to ${inviteEmail}!`);
            setInviteEmail("");
            setInviteRole("");
            setInviteLoading(false);

            // Clear message after a few seconds
            setTimeout(() => setInviteMessage(""), 4000);
        } catch (e) {
            console.error(e);
            setInviteMessage(e.message || "Failed to send invitation.");
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
                <h2 className="text-3xl font-bold text-gray-900">Setup your clinic</h2>
                <p className="text-gray-500 mt-2">Enter your clinic details to get started.</p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="clinic_name" className="font-semibold text-gray-700">Company name <span className="text-red-500">*</span></Label>
                        <Input id="clinic_name" required value={formData.clinic_name} onChange={handleChange} placeholder="Dental Clinic Name" className="mt-1 h-[50px] border-2 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                    </div>

                    <div>
                        <Label htmlFor="website" className="font-semibold text-gray-700">Website</Label>
                        <Input id="website" value={formData.website} onChange={handleChange} placeholder="https://www.example.com" className="mt-1 h-[50px] border-2 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="country" className="font-semibold text-gray-700">Country</Label>
                            <Input id="country" value={formData.country} onChange={handleChange} placeholder="Country" className="mt-1 h-[50px] border-2 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label htmlFor="street_address" className="font-semibold text-gray-700">Street Address</Label>
                                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs flex items-center gap-1 text-[#5c4ce3] border-[#5c4ce3] hover:bg-[#5c4ce3]/10">
                                            <MapPin className="w-3 h-3" /> Pick on Map
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-3xl h-[80vh] p-0 overflow-hidden rounded-2xl">
                                        <div className="w-full h-full">
                                            <MapPicker onLocationSelect={handleLocationSelect} />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <Input id="street_address" value={formData.street_address} onChange={handleChange} placeholder="123 Main St" className="h-[50px] border-2 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="city" className="font-semibold text-gray-700">City</Label>
                            <Input id="city" value={formData.city} onChange={handleChange} placeholder="City" className="mt-1 h-[50px] border-2 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                        </div>
                        <div>
                            <Label htmlFor="postal_code" className="font-semibold text-gray-700">Zip code</Label>
                            <Input id="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="Zip Code" className="mt-1 h-[50px] border-2 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="neighbourhood" className="font-semibold text-gray-700">neighbourhood</Label>
                        <Input id="neighbourhood" value={formData.neighbourhood} onChange={handleChange} placeholder="Full neighbourhood" className="mt-1 h-[50px] border-2 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Clinic Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="contactEmail" className="font-semibold text-gray-700">Email</Label>
                                <Input id="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} placeholder="contact@clinic.com" className="mt-1 h-[50px] border-2 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                            </div>
                            <div>
                                <Label htmlFor="contactPhone" className="font-semibold text-gray-700">Phone</Label>
                                <Input id="contactPhone" type="tel" value={formData.contactPhone} onChange={handleChange} placeholder="+1234567890" className="mt-1 h-[50px] border-2 rounded-xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3]" />
                            </div>
                        </div>
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-[#5c4ce3] hover:bg-[#4b3ccb] text-white h-[50px] rounded-xl font-semibold text-lg">
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Next Step"}
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
                <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
                <p className="text-gray-500 mt-2">We sent a verification code to <span className="font-medium text-gray-900">{formData.contactEmail}</span></p>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-6">
                <div>
                    <div className="flex justify-center items-center gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <>
                                <Input
                                    key={index}
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
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-2xl focus:ring-[#5c4ce3] focus:border-[#5c4ce3] bg-gray-50 text-gray-900"
                                    maxLength={1}
                                />
                                {index === 2 && <span className="text-gray-400 font-bold text-xl "><Minus className="h-7 w-7" /></span>}
                            </>
                        ))}
                        {error && <p className="text-red-500 text-sm mt-2 absolute -bottom-6 w-full">{error}</p>}
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-[#5c4ce3] hover:bg-[#4b3ccb] text-white h-[50px] rounded-xl font-semibold">
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify & Create Clinic"}
                </Button>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-[#5c4ce3]">
                    Back to Edit Info
                </button>
            </form>
        </div>
    );


    // Step 3: Invite Members
    const renderStep3 = () => (
        <div className="w-full max-w-xl mx-auto p-8 overflow-scroll max-h-[80vh] bg-white flex flex-col items-center">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Invite Team Member</h2>
                <p className="text-gray-500 mt-2">Add a member to your clinic team.</p>
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-sm">
                    {invitedEmails.length} / 5 Invitations sent
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
                        Email <span className="text-red-500">*</span>
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
                        Access level <span className="text-red-500">*</span>
                    </Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger className="h-12 text-base rounded-xl w-full border border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="full_access">Full access</SelectItem>
                            <SelectItem value="clinic_access">Clinic access</SelectItem>
                            <SelectItem value="limited_access">Limited access</SelectItem>
                            <SelectItem value="assistant_access">Assistant</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Feedback Message */}
                {inviteMessage && (
                    <div className={`p-4 rounded-xl text-base font-medium border-2 ${inviteMessage.includes("Failed") ? "bg-red-50 border-red-100 text-red-600" : "bg-blue-50 border-blue-100 text-blue-600"}`}>
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
                        {inviteLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send Invitation"}
                    </Button>

                    <button type="button" onClick={handleSkip} className="text-gray-500 font-medium hover:text-[#5c4ce3] hover:underline transition-colors">
                        Skip
                    </button>
                </div>
            </div>
        </div>
    );
    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

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
                            STEP {step}/3
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
