'use client';
export const dynamic = "force-dynamic";
import { apiClient } from '@/utils/apiClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SignupCompletionForm from './SignupCompletionForm';

export default function AuthCallback() {
    const router = useRouter();
    const [status, setStatus] = useState('Traitement en cours...');
    const [signupData, setSignupData] = useState(null); // Pour stocker les données du nouveau user

    useEffect(() => {
        const processLogin = async () => {
            // 1. Lire les tokens dans l'URL (Hash)
            const hash = window.location.hash;
            const params = new URLSearchParams(hash.substring(1)); // Retire le '#'

            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (!accessToken) {
                setStatus("Erreur: Pas de token reçu.");
                return;
            }

            try {
                // 2. Envoyer au Backend
                // Use apiClient since we are in the project ecosystem
                const data = await apiClient('/api/auth/google-callback', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ refreshToken })
                });

                if (data) {
                    // CAS A: C'est un nouveau user -> Il faut compléter l'inscription
                    if (data.requireSignup) {
                        // Robust extraction: Check signupData first, then top-level fields
                        const baseData = data.signupData || {};

                        // Fallback logic for names
                        let finalFirstName = baseData.firstName || data.firstName || data.given_name || '';
                        let finalLastName = baseData.lastName || data.lastName || data.family_name || '';

                        // If specific names are missing, try splitting Full Name
                        if ((!finalFirstName || !finalLastName) && (data.name || baseData.name)) {
                            const fullName = (baseData.name || data.name || '').trim();
                            const parts = fullName.split(' ');
                            if (parts.length > 0) {
                                if (!finalFirstName) finalFirstName = parts[0];
                                if (!finalLastName) finalLastName = parts.slice(1).join(' ');
                            }
                        }

                        const formData = {
                            registrationToken: baseData.registrationToken || data.signupToken,
                            firstName: finalFirstName,
                            lastName: finalLastName,
                            email: baseData.email || data.email || ''
                        };

                        setSignupData(formData);
                        setStatus("Veuillez compléter votre inscription.");
                    }
                    // CAS B: C'est un ancien user -> Connecté direct
                    else {
                        setStatus("Succès ! Redirection...");
                        window.location.href = '/';
                    }
                }
            } catch (err) {
                console.error(err);
                setStatus("Erreur lors de la création de session: " + (err.message || "Erreur inconnue"));
            }
        };

        if (!signupData) {
            processLogin();
        }
    }, [router, signupData]);

    // Si on a des données d'inscription, on affiche le formulaire
    if (signupData) {
        return <SignupCompletionForm initialData={signupData} />;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', flexDirection: 'column', alignItems: 'center' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h2 className="text-lg font-semibold">{status}</h2>
        </div>
    );
}
