import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { X, Loader2, AlertTriangle, Building2, Fingerprint, ChevronRight } from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { initiate2FA, verify2FA, initiateDisable2FA, confirmDisable2FA, getSecurityStatus, updateAutoSave, initiateAccountDeletion, confirmAccountDeletion } from "@/services/securityService";
import CustomOTPInput from "@/components/ui/CustomOTPInput";
import { useRouter } from "next/navigation";
import useUserStore from "./store/userStore";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogHeader,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";

export default function SupportAccessSection({ children, userInfo, setUserInfo }) {
    const { pushNotification } = useNotification();
    const router = useRouter();
    const { setCurrentClinicId } = useUserStore();
    const [open, setOpen] = useState(false);

    // 2FA States
    const [show2FAEnableDialog, setShow2FAEnableDialog] = useState(false);
    const [show2FADisableDialog, setShow2FADisableDialog] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(null); // { secret, qrCode }
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [is2FALoading, setIs2FALoading] = useState(false);
    const [disableStep, setDisableStep] = useState(1); // 1: Password, 2: Code
    const [disablePassword, setDisablePassword] = useState("");
    const [disableCode, setDisableCode] = useState("");

    // Autosave States
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
    const [isAutoSaveLoading, setIsAutoSaveLoading] = useState(false);

    // Account Deletion States
    const [showDeleteAccountView, setShowDeleteAccountView] = useState(false);
    const [deleteStep, setDeleteStep] = useState(1); // 1: Password, 2: OTP
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteOtp, setDeleteOtp] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [deleteOwnedClinics, setDeleteOwnedClinics] = useState([]);

    // Logout All Devices States
    const [showLogoutAllView, setShowLogoutAllView] = useState(false);
    const [logoutAllPassword, setLogoutAllPassword] = useState("");
    const [logoutAllLoading, setLogoutAllLoading] = useState(false);

    // Logout All Handler
    const handleLogoutAll = async () => {
        if (!logoutAllPassword) return;
        setLogoutAllLoading(true);
        try {
            await apiClient("/api/auth/logout-all", {
                method: "POST",
                body: JSON.stringify({ password: logoutAllPassword }),
            });
            pushNotification("success", "Déconnexion de tous les appareils réussie.");
            setShowLogoutAllView(false);
            setLogoutAllPassword("");
        } catch (error) {
            pushNotification("error", error.message || "Erreur lors de la déconnexion.");
        } finally {
            setLogoutAllLoading(false);
        }
    };

    // Fetch Security Status on Open
    useEffect(() => {
        if (open) {
            const fetchStatus = async () => {
                try {
                    const data = await getSecurityStatus();
                    // Update user info store with latest status
                    if (setUserInfo && typeof data.two_factor_enabled !== 'undefined') {
                        setUserInfo({ isTwoFactorEnabled: data.two_factor_enabled });
                    }
                    if (typeof data.autosave !== 'undefined') {
                        setAutoSaveEnabled(data.autosave);
                    }
                } catch (error) {
                    console.error("Failed to fetch security status:", error);
                }
            };
            fetchStatus();
        }
    }, [open, setUserInfo]);

    // 2FA Handlers
    const handleEnable2FJClick = async () => {
        setIs2FALoading(true);
        try {
            const data = await initiate2FA();
            setQrCodeData(data);
            setShow2FAEnableDialog(true);
        } catch (error) {
            pushNotification("error", error.message);
        } finally {
            setIs2FALoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (!twoFactorCode || twoFactorCode.length !== 6) return;
        setIs2FALoading(true);
        try {
            await verify2FA(twoFactorCode, qrCodeData.secret?.base32 || qrCodeData.secret);
            setUserInfo({ isTwoFactorEnabled: true });
            setShow2FAEnableDialog(false);
            setTwoFactorCode("");
            setQrCodeData(null);
            pushNotification("success", "2FA Enabled Successfully!");
        } catch (error) {
            pushNotification("error", error.message);
        } finally {
            setIs2FALoading(false);
        }
    };

    const handleDisable2FA = async () => {
        setIs2FALoading(true);
        try {
            if (disableStep === 1) {
                // Step 1: Initiate with password
                await initiateDisable2FA(disablePassword);
                setDisableStep(2);
                pushNotification("info", "A verification code has been sent to your email.");
            } else {
                // Step 2: Confirm with code
                await confirmDisable2FA(disableCode);
                setUserInfo({ isTwoFactorEnabled: false });
                setShow2FADisableDialog(false);
                // Reset states
                setDisablePassword("");
                setDisableCode("");
                setDisableStep(1);
                pushNotification("success", "2FA Disabled Successfully");
            }
        } catch (error) {
            pushNotification("error", error.message);
        } finally {
            setIs2FALoading(false);
        }
    };

    const handleToggle2FA = (checked) => {
        if (checked) {
            handleEnable2FJClick();
        } else {
            setShow2FADisableDialog(true);
        }
    };

    const handleAutoSaveToggle = async (checked) => {
        setIsAutoSaveLoading(true);
        try {
            await updateAutoSave(checked);
            setAutoSaveEnabled(checked);
            pushNotification("success", `Autosave ${checked ? 'enabled' : 'disabled'} successfully`);
        } catch (error) {
            pushNotification("error", error.message);
        } finally {
            setIsAutoSaveLoading(false);
        }
    };

    // Delete Account Handlers
    const handleDeleteInitiate = async () => {
        if (!deletePassword) return;
        setDeleteLoading(true);
        setDeleteError(null);
        setDeleteOwnedClinics([]);

        try {
            await initiateAccountDeletion(deletePassword);
            setDeleteStep(2);
            pushNotification("info", "Un code de vérification a été envoyé à votre adresse email.");
        } catch (err) {
            console.error(err);
            if (err.data && err.data.ownedClinics) {
                setDeleteOwnedClinics(err.data.ownedClinics);
                console.log(err.data.ownedClinics);
                setDeleteError(err.message || "Impossible de supprimer le compte car vous êtes propriétaire de cliniques.");
            } else {
                setDeleteError(err.message || "Une erreur est survenue.");
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteOtp || deleteOtp.length !== 6) return;
        setDeleteLoading(true);
        setDeleteError(null);

        try {
            await confirmAccountDeletion(deleteOtp);
            pushNotification("success", "Compte supprimé avec succès.");
            // Redirect to login or home after a short delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        } catch (err) {
            setDeleteError(err.message || "Code incorrect.");
        } finally {
            setDeleteLoading(false);
        }
    };

    const resetDeleteState = () => {
        setDeleteStep(1);
        setDeletePassword("");
        setDeleteOtp("");
        setDeleteError(null);
        setDeleteOwnedClinics([]);
        setDeleteLoading(false);
    };

    const renderContent = () => {
        // VIEW: Logout All Devices
        if (showLogoutAllView) {
            return (
                <div className="bg-white rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            Déconnexion de tous les appareils
                        </DialogTitle>
                        <button
                            onClick={() => {
                                setShowLogoutAllView(false);
                                setLogoutAllPassword("");
                            }}
                            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-4 pt-2">
                                <div className="h-20 w-20 bg-[#7564ed] rounded-3xl flex items-center justify-center shadow-md">
                                    <Fingerprint className="text-white h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900">Vérification du mot de passe</h2>
                                    <p className="text-gray-500 text-base">Entrez votre mot de passe pour <span className="font-semibold text-[#7564ed]">confirmer la déconnexion</span></p>
                                </div>
                            </div>

                            <div className="px-4">
                                <Input
                                    type="password"
                                    value={logoutAllPassword}
                                    onChange={(e) => setLogoutAllPassword(e.target.value)}
                                    placeholder="Entrez votre mot de passe"
                                    className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20 transition-all"
                                />
                            </div>

                            <div className="flex gap-4 pt-2 w-full justify-end px-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setShowLogoutAllView(false);
                                        setLogoutAllPassword("");
                                    }}
                                    disabled={logoutAllLoading}
                                    className="text-lg font-semibold border text-gray-600 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleLogoutAll}
                                    disabled={!logoutAllPassword || logoutAllLoading}
                                    className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:bg-[#dcd6fa] transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                                >
                                    {logoutAllLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Se déconnecter
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // VIEW: Delete Account
        if (showDeleteAccountView) {
            return (
                <div className="bg-white rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            Supprimer mon compte
                        </DialogTitle>
                        <button
                            onClick={() => {
                                setShowDeleteAccountView(false);
                                resetDeleteState();
                            }}
                            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        {deleteOwnedClinics.length > 0 ? (
                            <div className="space-y-4">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Action requise</h3>
                                    <p className="text-sm text-gray-600">Vous devez <span className="font-bold text-[#7564ed]">transférer </span> la propriété  ou <span className="font-bold text-[#7564ed]">supprimer </span> ces cliniques avant de pouvoir supprimer votre compte.</p>
                                </div>
                                <div className="space-y-3 max-h-[300px] gap-2 overflow-y-auto pr-2">
                                    {deleteOwnedClinics.map(clinic => (
                                        <div
                                            key={clinic.id}
                                            onClick={() => {
                                                setCurrentClinicId(clinic.id);
                                                router.push('/company');
                                            }}
                                            className="flex items-center gap-2  p-2 bg-gray-50/50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all group cursor-pointer"
                                        >
                                            <Avatar className="h-14 w-14 ">
                                                <AvatarImage src={clinic.logo_url || clinic.logo} className="object-cover" />
                                                <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 text-sm font-bold">
                                                    {clinic.name?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="text-base font-semibold text-[#0d0c22] truncate">{clinic.name}</h4>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE7EB] text-[#f43f5e] uppercase tracking-wide">
                                                        Owner
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 truncate font-medium">{clinic.email || clinic.contactEmail || "email@clinic.com"}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#7564ed] stroke-2 transition-colors mr-2" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowDeleteAccountView(false);
                                            resetDeleteState();
                                        }}
                                    >
                                        Fermer
                                    </Button>
                                </div>
                            </div>
                        ) : deleteStep === 1 ? (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-4 pt-2">
                                    <div className="h-20 w-20 bg-[#7564ed] rounded-3xl flex items-center justify-center shadow-md">
                                        <Fingerprint className="text-white h-10 w-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-gray-900">Vérification du mot de passe</h2>
                                        <p className="text-gray-500 text-base">Entrez votre mot de passe pour <span className="font-semibold text-[#7564ed]">confirmer la suppression</span></p>
                                    </div>
                                </div>

                                <div className="px-4">
                                    <Input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Entrez votre mot de passe"
                                        className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20 transition-all"
                                    />
                                </div>

                                <div className="flex gap-4 pt-2 w-full justify-end px-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setShowDeleteAccountView(false);
                                            resetDeleteState();
                                        }}
                                        disabled={deleteLoading}
                                        className="text-lg font-semibold border text-gray-600 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={handleDeleteInitiate}
                                        disabled={!deletePassword || deleteLoading}
                                        className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:bg-[#dcd6fa] transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                                    >
                                        {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Vérifier
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-gray-600">
                                        Un code de vérification à 6 chiffres a été envoyé à votre email.
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Le code expire dans 10 minutes.
                                    </p>
                                </div>

                                <div className="flex justify-center">
                                    <CustomOTPInput
                                        maxLength={6}
                                        onChange={setDeleteOtp}
                                        value={deleteOtp}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowDeleteAccountView(false);
                                            resetDeleteState();
                                        }}
                                        disabled={deleteLoading}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteConfirm}
                                        disabled={deleteOtp.length !== 6 || deleteLoading}
                                        className="bg-[#FEE7EB] text-[#f43f5e] hover:bg-[#fdd3db] border border-[#f43f5e]/20"
                                    >
                                        {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Supprimer définitivement
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div >
            );
        }

        // VIEW: Enable 2FA Setup
        if (show2FAEnableDialog) {
            return (
                <div className="bg-white rounded-xl overflow-hidden">
                    <div className="p-6 pb-0">
                        <div className="flex items-center justify-between mb-2">
                            <DialogTitle className="text-xl font-bold text-gray-900">Setup Authenticator App</DialogTitle>
                            <button onClick={() => setShow2FAEnableDialog(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            Each time you log in, in addition to your password, you'll use an authenticator app to generate a one-time code.
                        </p>

                        {/* Step 1 */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">Step 1</div>
                                <h3 className="font-semibold text-gray-900 text-sm">Scan QR code</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                Scan the QR code below or manually enter the secret key into your authenticator app.
                            </p>

                            <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                                {qrCodeData?.qrCode && (
                                    <div className="bg-white p-2 rounded-2xl border border-gray-200 shrink-0">
                                        <img src={qrCodeData.qrCode} alt="QR Code" className="w-32 h-32 object-contain" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm">Can't scan QR code?</h4>
                                        <p className="text-sm text-gray-500">Enter this secret instead:</p>
                                    </div>
                                    <div className="bg-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-700 break-all">
                                        {qrCodeData?.secret?.base32 || qrCodeData?.secret || "Generating..."}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-2 bg-white"
                                        onClick={() => {
                                            const secret = qrCodeData?.secret?.base32 || qrCodeData?.secret;
                                            if (secret) {
                                                navigator.clipboard.writeText(secret);
                                                pushNotification("success", "Secret copied to clipboard!");
                                            }
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        Copy code
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">Step 2</div>
                                <h3 className="font-semibold text-gray-900 text-sm">Get verification Code</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                Enter the 6-digit code you see in your authenticator app.
                            </p>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Enter verification code</label>
                                <div className="flex gap-2">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <input
                                            key={index}
                                            id={`setup-otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            className="w-10 h-10 text-center text-lg font-bold border-1 border-gray-300 rounded-2xl focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white text-gray-900"
                                            value={twoFactorCode[index] || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (!/^[0-9]?$/.test(value)) return;

                                                const newCode = twoFactorCode.split("");
                                                while (newCode.length < 6) newCode.push("");

                                                newCode[index] = value;
                                                const nextCode = newCode.join("");
                                                setTwoFactorCode(nextCode);

                                                if (value && index < 5) {
                                                    const nextInput = document.getElementById(`setup-otp-${index + 1}`);
                                                    if (nextInput) nextInput.focus();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace" && !twoFactorCode[index] && index > 0) {
                                                    const prevInput = document.getElementById(`setup-otp-${index - 1}`);
                                                    if (prevInput) prevInput.focus();
                                                }
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault();
                                                const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                                                setTwoFactorCode(pasted);
                                                setTimeout(() => {
                                                    const targetIndex = Math.min(pasted.length, 5);
                                                    const targetInput = document.getElementById(`setup-otp-${targetIndex}`);
                                                    if (targetInput) targetInput.focus();
                                                }, 0);
                                            }}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 p-6 pt-2 bg-white">
                        <Button variant="outline" onClick={() => setShow2FAEnableDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleVerify2FA}
                            disabled={twoFactorCode.length !== 6 || is2FALoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {is2FALoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm
                        </Button>
                    </div>
                </div>
            );
        }

        // VIEW: Disable 2FA
        if (show2FADisableDialog) {
            return (
                <div className="bg-white rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-200">
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            Désactiver l'authentification à deux facteurs
                        </DialogTitle>
                        <button onClick={() => { setShow2FADisableDialog(false); setDisableStep(1); setDisablePassword(""); setDisableCode(""); }} className="rounded-2xl p-2 hover:bg-gray-100 transition">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="px-8 py-6">
                        <DialogDescription className="mb-4">
                            {disableStep === 1
                                ? "Veuillez entrer votre mot de passe pour continuer."
                                : "Veuillez entrer le code de vérification envoyé à votre email."}
                        </DialogDescription>

                        <div className="py-4 space-y-4">
                            {disableStep === 1 ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Mot de passe actuel</label>
                                    <Input
                                        type="password"
                                        value={disablePassword}
                                        onChange={(e) => setDisablePassword(e.target.value)}
                                        placeholder="********"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Code de vérification</label>
                                    <div className="flex justify-center gap-2">
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <input
                                                key={index}
                                                id={`disable-otp-${index}`}
                                                type="text"
                                                maxLength={1}
                                                className="w-10 h-10 text-center text-lg font-bold border-1 border-gray-300 rounded-2xl focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white text-gray-900"
                                                value={disableCode[index] || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (!/^[0-9]?$/.test(value)) return;

                                                    const newCode = disableCode.split("");
                                                    while (newCode.length < 6) newCode.push("");

                                                    newCode[index] = value;
                                                    const nextCode = newCode.join("");
                                                    setDisableCode(nextCode);

                                                    if (value && index < 5) {
                                                        const nextInput = document.getElementById(`disable-otp-${index + 1}`);
                                                        if (nextInput) nextInput.focus();
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && !disableCode[index] && index > 0) {
                                                        const prevInput = document.getElementById(`disable-otp-${index - 1}`);
                                                        if (prevInput) prevInput.focus();
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    e.preventDefault();
                                                    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                                                    setDisableCode(pasted);
                                                    setTimeout(() => {
                                                        const targetIndex = Math.min(pasted.length, 5);
                                                        const targetInput = document.getElementById(`disable-otp-${targetIndex}`);
                                                        if (targetInput) targetInput.focus();
                                                    }, 0);
                                                }}
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" onClick={() => { setShow2FADisableDialog(false); setDisableStep(1); setDisablePassword(""); setDisableCode(""); }}>Annuler</Button>
                            <Button
                                className="text-md font-bold hover:outline-3 hover:outline-[#7564ed]  bg-[#EBE8FC]  border text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-2xl flex items-center justify-center min-w-[6vw]"
                                variant="destructive"
                                onClick={handleDisable2FA}
                                disabled={is2FALoading || (disableStep === 1 ? !disablePassword : disableCode.length !== 6)}
                            >
                                {is2FALoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {disableStep === 1 ? "Continuer" : "Confirmer la désactivation"}
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        // VIEW: Main Support List
        return (
            <>
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-gray-200">
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Accès au support
                    </DialogTitle>
                    <DialogClose asChild>
                        <button className="rounded-2xl p-2 hover:bg-gray-100 transition">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </DialogClose>
                </div>

                {/* Content */}
                <div className="px-8 py-6">
                    {/* Support Access toggle */}
                    <div className="flex items-start justify-between py-4 mb-6 border-b border-gray-100">
                        <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900 mb-1">Autoriser l'accès au support</h4>
                            <p className="text-sm text-gray-600">Permettez à l'équipe technique d'accéder temporairement à votre compte pour vous aider.</p>
                        </div>
                        <Switch
                            checked={false} // Placeholder for now
                            onCheckedChange={() => pushNotification("info", "Fonctionnalité d'accès au support bientôt disponible.")}
                        />
                    </div>

                    {/* 2-Step Verification */}
                    <div className="flex items-start justify-between py-4 mb-6">
                        <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900 mb-1">Vérification en 2 étapes</h4>
                            <p className="text-sm text-gray-600">Ajoutez une couche de sécurité supplémentaire à votre compte lors de la connexion.</p>
                        </div>
                        {userInfo?.isTwoFactorEnabled ? (
                            <button
                                onClick={() => setShow2FADisableDialog(true)}
                                disabled={is2FALoading}
                                className="text-md hover:outline-3 hover:outline-[#f43f5e] font-bold bg-[#FEE7EB] border text-[#f43f5e] transition-all duration-150 px-3 py-2 rounded-2xl flex items-center justify-center min-w-[6vw]"
                            >
                                {is2FALoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Désactiver
                            </button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEnable2FJClick}
                                disabled={is2FALoading}
                            >
                                {is2FALoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Activer
                            </Button>
                        )}
                    </div>



                    {/* Autosave Toggle */}
                    <div className="flex items-start justify-between py-4 mb-6 border-t border-gray-200">
                        <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900 mb-1">Sauvegarde automatique</h4>
                            <p className="text-sm text-gray-600">Activez la sauvegarde automatique pour ne jamais perdre vos données.</p>
                        </div>
                        <Switch
                            checked={autoSaveEnabled}
                            onCheckedChange={handleAutoSaveToggle}
                            disabled={isAutoSaveLoading}
                        />
                    </div>

                    {/* Log out of all devices */}
                    <div className="flex items-start justify-between py-4 border-t border-gray-200 mb-4">
                        <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900 mb-1">Déconnexion de tous les appareils</h4>
                            <p className="text-sm text-gray-600">Déconnectez-vous de toutes les autres sessions actives sur d'autres appareils que celui-ci.</p>
                        </div>
                        <button
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-2xl transition-colors text-sm font-medium whitespace-nowrap"
                            onClick={() => setShowLogoutAllView(true)}
                        >
                            Se déconnecter
                        </button>
                    </div>

                    {/* Delete Account */}
                    <div className="flex items-start justify-between py-4 border-t border-gray-200">
                        <div className="flex-1">
                            <h4 className="text-base font-semibold text-[#f43f5e] mb-1">Supprimer mon compte</h4>
                            <p className="text-sm text-gray-600">Supprimez définitivement le compte et supprimez l'accès à tous les espaces de travail.</p>
                        </div>
                        <button
                            className="text-md font-bold hover:outline-3 hover:outline-[#f43f5e] bg-[#FEE7EB] border text-[#f43f5e] transition-all duration-150 px-3 py-2 rounded-2xl flex items-center justify-center min-w-[6vw]"
                            onClick={() => setShowDeleteAccountView(true)}
                        >
                            Supprimer le compte
                        </button>
                    </div>
                </div>
            </>
        );
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                // Reset views on close
                setShow2FAEnableDialog(false);
                setShow2FADisableDialog(false);
                setDisableStep(1);
                setDisablePassword("");
                setDisableCode("");
                setShowDeleteAccountView(false);
                setShowLogoutAllView(false);
                setLogoutAllPassword("");
                resetDeleteState();
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className=" w-full rounded-2xl bg-white p-0 overflow-hidden border-0 shadow-2xl">
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}
