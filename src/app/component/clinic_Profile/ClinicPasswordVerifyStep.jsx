import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClinicPasswordVerifyStep({ userEmail, onSuccess, onBack }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Le mot de passe est obligatoire.");
      return;
    }
    setLoading(true);
    setError("");
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
        setError("Mot de passe incorrect.");
      }
    } catch (e) {
      setError("Erreur réseau");
    }
    setLoading(false);
  };

  return (
    <form className="p-6 pt-2 space-y-6" onSubmit={handleVerify}>
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
        <span className="font-semibold text-gray-800">Sécurité :</span> Pour modifier les informations de la clinique, nous devons vérifier votre identité en saisissant votre mot de passe actuel.
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-base font-semibold text-gray-700">
          Mot de passe
        </Label>
        <Input
          id="password"
          className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
          placeholder="Entrez votre mot de passe"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </div>
      
      {error && (
        <div className="p-4 rounded-xl text-base font-medium bg-red-50 text-red-800 border-2 border-red-200">
          {error}
        </div>
      )}
      
      <div className="flex gap-4 pt-4">
        <Button 
          type="submit" 
          className="flex-1 h-12 text-base font-semibold bg-[#7c5cff] hover:bg-[#6a4fd8] text-white border-2 border-[#7c5cff]" 
          disabled={!password || loading}
        >
          {loading ? "Vérification..." : "Vérifier"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50" 
          onClick={onBack} 
          disabled={loading}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
} 