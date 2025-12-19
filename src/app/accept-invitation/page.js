"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Mail, Building, User, Clock, AlertTriangle } from "lucide-react";
import useUserStore from "@/components/features/profile/store/userStore";
import { apiClient } from "@/utils/apiClient";

export default function AcceptInvitation() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "success", "error", "expired"

  useEffect(() => {
    if (token) {
      validateInvitation();
    } else {
      setStatus("error");
      setMessage("Token d'invitation manquant");
      setLoading(false);
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      const data = await apiClient("/api/clinics/validate-invitation", {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      setInvitation(data.invitation);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Token d'invitation invalide");

      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setProcessing(true);
    try {
      await apiClient("/api/clinics/accept-invitation", {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      setStatus("success");
      setMessage("Invitation acceptée avec succès! Vous êtes maintenant membre de la clinique.");
      // Redirect to dashboard after a delay
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Erreur lors de l'acceptation de l'invitation");
    } finally {
      setStatus("error");
      setMessage("Erreur de connexion");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await apiClient("/api/clinics/reject-invitation", {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      setStatus("success");
      setMessage("Invitation rejetée. Vous serez redirigé vers la page d'accueil.");
      // Redirect to home after a delay
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Erreur lors du rejet de l'invitation");
    } finally {
      setStatus("error");
      setMessage("Erreur de connexion");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base">Validation de l'invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[500px]">
        <Card className="shadow-2xl border-2 border-gray-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-900 text-xl font-bold">
              <Mail className="h-6 w-6 text-gray-600" />
              {status === "success" && invitation
                ? "Invitation à rejoindre la clinique"
                : "Invitation invalide"}
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-2">
              {status === "success" && invitation
                ? "Vous avez été invité à rejoindre une clinique"
                : "Cette invitation n'est plus valide ou a expiré"}
            </CardDescription>
          </CardHeader>

          {status === "success" && invitation && (
            <CardContent className="space-y-6 px-6 pb-6">
              {/* Invitation Information Card */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Building className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {invitation.clinicName}
                    </p>
                    <p className="text-gray-600 text-base mt-1">
                      {invitation.email}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Rôle: {invitation.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="text-base text-gray-700">
                    <p className="font-bold mb-2">Informations importantes :</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-600 font-bold">•</span>
                        <span>Vous aurez accès à tous les patients de cette clinique</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-600 font-bold">•</span>
                        <span>Vous pourrez voir les rendez-vous et les dossiers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-600 font-bold">•</span>
                        <span>Vous devrez accepter pour rejoindre la clinique</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={handleReject}
                  disabled={processing}
                  variant="outline"
                  className="flex-1 h-12 text-base font-semibold border-2"
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                  ) : (
                    <XCircle className="mr-2 h-5 w-5" />
                  )}
                  Rejeter
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={processing}
                  className="flex-1 h-12 text-base font-semibold bg-[#ff254e] hover:bg-[#e01e3e] text-white border-2 border-[#ff254e]"
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircle className="mr-2 h-5 w-5" />
                  )}
                  Accepter l'invitation
                </Button>
              </div>
            </CardContent>
          )}

          {status === "error" && (
            <CardContent className="text-center px-6 pb-6">
              <p className="text-gray-600 mb-6 text-lg font-medium">{message}</p>
              <Button
                onClick={() => window.location.href = "/"}
                className="h-12 text-base font-semibold bg-[#ff254e] hover:bg-[#e01e3e] text-white border-2 border-[#ff254e]"
              >
                Retour à l'accueil
              </Button>
            </CardContent>
          )}

          {message && (
            <div className={`p-4 mx-6 mb-6 rounded-xl text-base font-medium border-2 ${message.includes('succès') || message.includes('acceptée')
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
              }`}>
              {message}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 