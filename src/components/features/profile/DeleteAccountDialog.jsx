import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Loader2, X, Building2 } from "lucide-react";
import { initiateAccountDeletion, confirmAccountDeletion } from "@/services/securityService";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";
import CustomOTPInput from "@/components/ui/CustomOTPInput";

export default function DeleteAccountDialog({ open, onOpenChange }) {
    const { pushNotification } = useNotification();
    const [step, setStep] = useState(1); // 1: Password, 2: OTP
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ownedClinics, setOwnedClinics] = useState([]);

    const handleInitiate = async () => {
        if (!password) return;
        setLoading(true);
        setError(null);
        setOwnedClinics([]);

        try {
            await initiateAccountDeletion(password);
            setStep(2);
            pushNotification("info", "Un code de vérification a été envoyé à votre adresse email.");
        } catch (err) {
            console.error(err);
            if (err.data && err.data.ownedClinics) {
                setOwnedClinics(err.data.ownedClinics);
                setError(err.message || "Impossible de supprimer le compte car vous êtes propriétaire de cliniques.");
            } else {
                setError(err.message || "Une erreur est survenue.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!otp || otp.length !== 6) return;
        setLoading(true);
        setError(null);

        try {
            await confirmAccountDeletion(otp);
            pushNotification("success", "Compte supprimé avec succès.");
            // Redirect to login or home after a short delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        } catch (err) {
            setError(err.message || "Code incorrect.");
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setStep(1);
        setPassword("");
        setOtp("");
        setError(null);
        setOwnedClinics([]);
        setLoading(false);
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset state after transition
        setTimeout(resetState, 300);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
            <DialogContent className="max-w-[500px] w-full p-0 gap-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Supprimer mon compte
                    </DialogTitle>
                    <DialogClose asChild>
                        <button className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </DialogClose>
                </div>

                <div className="p-6">
                    {/* Error Display (e.g., Owned Clinics) */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-red-900">{error}</p>
                                    {ownedClinics.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-red-700 mb-2 font-medium">Cliniques dont vous êtes propriétaire :</p>
                                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                                {ownedClinics.map(clinic => (
                                                    <div key={clinic.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-100 shadow-sm">
                                                        <Building2 className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-700 font-medium">{clinic.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-red-600 mt-3">
                                                Vous devez transférer la propriété ou supprimer ces cliniques avant de pouvoir supprimer votre compte.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-4">
                            {!ownedClinics.length && (
                                <p className="text-sm text-gray-600">
                                    Cette action est <strong>irréversible</strong>. Toutes vos données personnelles, accès et informations seront définitivement effacés.
                                    Veuillez saisir votre mot de passe pour confirmer.
                                </p>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-900">Mot de passe actuel</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Entrez votre mot de passe"
                                    className="h-11 border-gray-200 focus:ring-red-500/20"
                                />
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
                                    onChange={setOtp}
                                    value={otp}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
                    <Button variant="outline" onClick={handleClose} disabled={loading} className="h-10 px-4">
                        Annuler
                    </Button>

                    {step === 1 ? (
                        <Button
                            variant="destructive"
                            onClick={handleInitiate}
                            disabled={!password || loading || ownedClinics.length > 0}
                            className="text-md hover:outline-3 hover:outline-[#f43f5e] font-bold bg-[#FEE7EB] border text-[#f43f5e] transition-all duration-150 px-3 py-2 rounded-lg flex items-center justify-center min-w-[6vw]"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Continuer
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={otp.length !== 6 || loading}
                            className="text-md hover:outline-3 hover:outline-[#f43f5e] font-bold bg-[#FEE7EB] border text-[#f43f5e] transition-all duration-150 px-3 py-2 rounded-lg flex items-center justify-center min-w-[6vw]"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Supprimer définitivement
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
