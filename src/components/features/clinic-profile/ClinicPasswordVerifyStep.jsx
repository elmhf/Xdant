import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";

import { Fingerprint } from "lucide-react";

export default function ClinicPasswordVerifyStep({
  userEmail,
  onSuccess,
  onBack,
  title = "Vérification du mot de passe",
  description = "Entrez votre mot de passe pour continuer"
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { pushNotification } = useNotification();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      pushNotification('error', "Le mot de passe est obligatoire.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-password", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password }),
      });
      const data = await res.json();
      if (res.ok && data.valid === true) {
        onSuccess();
      } else {
        pushNotification('error', "Mot de passe incorrect.");
      }
    } catch (e) {
      pushNotification('error', "Erreur réseau");
    }
    setLoading(false);
  };

  return (
    <form className="p-6 pt-2 space-y-6" onSubmit={handleVerify}>
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8 pt-4">
        <div className="h-20 w-20 bg-[#7564ed] rounded-3xl flex items-center justify-center">
          <Fingerprint className="text-white h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 text-lg">{description}</p>
        </div>
      </div>

      <div className="space-y-3 px-4">

        <Input
          id="password"
          className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
          placeholder="Entrez votre mot de passe"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </div>



      <div className="flex gap-4 pt-4 w-full justify-end">
        <Button
          type="button"
          variant="ghost"
          className="text-lg font-semibold border text-gray-600 transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
          onClick={onBack}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4 transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
          disabled={!password || loading}
        >
          {loading ? "Vérification..." : "Vérifier"}
        </Button>
      </div>
    </form>
  );
} 