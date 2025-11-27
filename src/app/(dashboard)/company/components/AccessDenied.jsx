import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, UserCheck } from "lucide-react";

export const AccessDenied = ({ userRole, requiredRole = "Administrateur", message = "Vous n'avez pas les permissions nécessaires pour accéder à cette page." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-6">
          <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Accès restreint
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            {message}
            {userRole && (
              <span className="block mt-2 text-sm text-gray-500">
                Votre rôle actuel : <span className="font-semibold">{userRole}</span>
              </span>
            )}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-3">
              <Shield className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Permissions requises</span>
            </div>
            <div className="flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">{requiredRole}</span>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm mb-6">
            Contactez votre administrateur pour obtenir les permissions nécessaires.
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = "/"}
          className="bg-[#7564ed] hover:bg-[#6a4fd8] text-white border-2 border-[#7564ed] h-12 text-base font-semibold px-8"
        >
          Retour au Dashboard
        </Button>
      </div>
    </div>
  );
}; 