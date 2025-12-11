import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordForm({ onBack, changePassword }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    const result = await changePassword(oldPassword, newPassword);
    setLoading(false);
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        onBack();
      }, 1200);
    } else {
      setError(result.message);
    }
  };

  // Password requirements: at least 6 chars, 1 letter, 1 number, 1 special (!$@%)
  const passwordMeetsRequirements = (password) => {
    return (
      password.length >= 6 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!$@%]/.test(password)
    );
  };

  const isValid =
    oldPassword &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    passwordMeetsRequirements(newPassword);

  return (
    <form className=" space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
        <span className="font-semibold text-gray-800">Sécurité :</span> Votre mot de passe doit contenir au moins 6 caractères et inclure une combinaison de chiffres, lettres et caractères spéciaux (!$@%).
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="oldPassword" className="text-base font-semibold text-gray-700">
            Mot de passe actuel
          </Label>
          <Input
            id="oldPassword"
            className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7564ed]"
            type="password"
            placeholder="Entrez votre mot de passe actuel"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-base font-semibold text-gray-700">
            Nouveau mot de passe
          </Label>
          <Input
            id="newPassword"
            className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7564ed]"
            type="password"
            placeholder="Entrez votre nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-base font-semibold text-gray-700">
            Confirmer le nouveau mot de passe
          </Label>
          <Input
            id="confirmPassword"
            className="h-12  w-full text-base border-2 border-gray-300 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
            type="password"
            placeholder="Confirmez votre nouveau mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>

      {newPassword && !passwordMeetsRequirements(newPassword) && (
        <div className="p-4 rounded-xl text-base font-medium bg-red-50 text-red-800 border-2 border-red-200">
          Le mot de passe doit contenir au moins 6 caractères et inclure une lettre, un chiffre et un caractère spécial (!$@%).
        </div>
      )}

      {newPassword && confirmPassword && newPassword !== confirmPassword && (
        <div className="p-4 rounded-xl text-base font-medium bg-red-50 text-red-800 border-2 border-red-200">
          Les mots de passe ne correspondent pas
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-base font-medium bg-red-50 text-red-800 border-2 border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl text-base font-medium bg-green-50 text-green-800 border-2 border-green-200">
          {success}
        </div>
      )}

      <div className="flex gap-3 pt-2 mt-auto justify-end">
        <Button
          type="button"
          variant="ghost"
          className="text-gray-600 hover:bg-gray-100 text-lg font-bold transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
          onClick={onBack}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="text-lg font-bold bg-[#EBE8FC] border text-[#7564ed] transition-all duration-150 px-3 py-2 rounded-lg flex items-center min-w-[6vw]"
          disabled={!isValid || loading}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
} 