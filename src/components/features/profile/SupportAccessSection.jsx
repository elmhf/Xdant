"use client"
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";

export default function SupportAccessSection({ children }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[650px] w-full rounded-2xl bg-white p-0 overflow-hidden border-0 shadow-2xl">
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
                        <Switch checked={false} />
                    </div>

                    {/* Support Access Toggle */}
                    <div className="flex items-start justify-between py-4 mb-6 border-t border-gray-200 pt-6">
                        <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900 mb-1">Accès au support</h4>
                            <p className="text-sm text-gray-600">Vous nous avez accordé l'accès à votre compte à des fins d'assistance jusqu'au 31 août 2023, 21:40.</p>
                        </div>
                        <Switch checked={true} />
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
                            <h4 className="text-base font-semibold text-red-600 mb-1">Supprimer mon compte</h4>
                            <p className="text-sm text-gray-600">Supprimez définitivement le compte et supprimez l'accès à tous les espaces de travail.</p>
                        </div>
                        <button className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
                            Supprimer le compte
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
