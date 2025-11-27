import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClinicPhoneForm({ value, onSave, onBack }) {
  const [phone, setPhone] = useState(value);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Le numéro de téléphone est obligatoire.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("Téléphone modifié avec succès.");
      setTimeout(() => {
        setSuccess("");
        onSave(phone);
      }, 800);
    }, 600);
  };

  return (
    <form className="p-6 pt-2 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-base font-semibold text-gray-700">
          Numéro de téléphone
        </Label>
        <Input
          id="phone"
          className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
          placeholder="Entrez le nouveau numéro de téléphone"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          disabled={loading}
          required
        />
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
          disabled={!phone || loading}
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