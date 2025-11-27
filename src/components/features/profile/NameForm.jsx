import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NameForm({ onBack, userInfo, setUserInfo, changeName }) {
  const [firstName, setFirstName] = useState(userInfo.firstName || '');
  const [lastName, setLastName] = useState(userInfo.lastName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validation helpers
  const isAlpha = (str) => /^[A-Za-zÀ-ÿ 0-9\s'-]+$/.test(str);
  const isValidName = (name) => name.length >= 3 && isAlpha(name);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    // Validation
    if (!isValidName(firstName) || !isValidName(lastName)) {
      setError("Le prénom et le nom doivent contenir au moins 3 lettres, uniquement des caractères alphabétiques (pas de chiffres ni de symboles)");
      setLoading(false);
      return;
    }
    const result = await changeName(firstName.trim(), lastName.trim());
    setLoading(false);
    if (result.success) {
      setUserInfo({ firstName: firstName.trim(), lastName: lastName.trim() });
      setSuccess("Nom modifié avec succès.");
      setTimeout(() => {
        onBack();
      }, 1200);
    } else {
      setError(result.message || "Erreur lors de la modification du nom.");
    }
  };

  return (
    <form className="p-6 pt-2 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
        <span className="font-semibold text-gray-800">Info :</span> Le prénom et le nom doivent contenir au moins <span className="font-semibold">3 lettres</span>, uniquement des caractères alphabétiques (pas de chiffres ni de symboles). Évitez d'utiliser un nom aléatoire ou des caractères spéciaux.
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-base font-semibold text-gray-700">
            Prénom
          </Label>
          <Input
            id="firstName"
            className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
            placeholder="Entrez votre prénom"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-base font-semibold text-gray-700">
            Nom
          </Label>
          <Input
            id="lastName"
            className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
            placeholder="Entrez votre nom"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />
        </div>
      </div>
      
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
      
      <div className="flex gap-4 pt-4">
        <Button 
          type="submit" 
          className="flex-1 h-12 text-base font-semibold bg-[#7564ed] hover:bg-[#6a4fd8] text-white border-2 border-[#7564ed]" 
          disabled={!firstName.trim() || !lastName.trim() || loading}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
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