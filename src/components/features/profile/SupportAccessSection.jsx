import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { initiate2FA, verify2FA, initiateDisable2FA, confirmDisable2FA, getSecurityStatus, updateAutoSave } from "@/services/securityService";
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
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";

import DeleteAccountDialog from "./DeleteAccountDialog";

export default function SupportAccessSection({ children, userInfo, setUserInfo }) {
    const { pushNotification } = useNotification();
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

    // Account Deletion State
    const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);

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


    const renderContent = () => {
        // VIEW: Enable 2FA Setup
        if (show2FAEnableDialog) {
            return (
                <div className="bg-white rounded-xl overflow-hidden">
                    <div className="p-6 pb-0">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-gray-900">Setup Authenticator App</h2>
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
                                    <div className="bg-white p-2 rounded-lg border border-gray-200 shrink-0">
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
                                            className="w-10 h-10 text-center text-lg font-bold border-1 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white text-gray-900"
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
                        <button onClick={() => { setShow2FADisableDialog(false); setDisableStep(1); setDisablePassword(""); setDisableCode(""); }} className="rounded-lg p-2 hover:bg-gray-100 transition">
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
                                                className="w-10 h-10 text-center text-lg font-bold border-1 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white text-gray-900"
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
                                className="text-md font-bold hover:outline-3 hover:outline-[#7564ed]  bg-[#EBE8FC]  border text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-lg flex items-center justify-center min-w-[6vw]"
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
                        <button className="rounded-lg p-2 hover:bg-gray-100 transition">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </DialogClose>
                </div>

                {/* Content */}
                <div className="px-8 py-6">
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
                                className="text-md hover:outline-3 hover:outline-[#f43f5e] font-bold bg-[#FEE7EB] border text-[#f43f5e] transition-all duration-150 px-3 py-2 rounded-lg flex items-center justify-center min-w-[6vw]"
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
                        <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
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
                            className="text-md font-bold hover:outline-3 hover:outline-[#f43f5e] bg-[#FEE7EB] border text-[#f43f5e] transition-all duration-150 px-3 py-2 rounded-lg flex items-center justify-center min-w-[6vw]"
                            onClick={() => setShowDeleteAccountDialog(true)}
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
                setShowDeleteAccountDialog(false);
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className=" w-full rounded-2xl bg-white p-0 overflow-hidden border-0 shadow-2xl">
                {renderContent()}
            </DialogContent>

            <DeleteAccountDialog
                open={showDeleteAccountDialog}
                onOpenChange={setShowDeleteAccountDialog}
            />
        </Dialog>
    );
}
