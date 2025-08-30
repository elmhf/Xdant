import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUserStore from "../profile/store/userStore";

export default function ClinicInfoForm({ values, onSave, onBack }) {
  const currentClinicId = useUserStore(state => state.currentClinicId);
  const [form, setForm] = useState({
    clinic_name: values.clinic_name || "",
    country: values.country || "",
    neighbourhood: values.neighbourhood || "",
    city: values.city || "",
    street_address: values.street_address || "",
    postal_code: values.postal_code || "",
    website: values.website || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Validation helper for alphabetic only
  const isAlphabetic = (str) => /^[A-Za-zÀ-ÿ\s'-]+$/.test(str);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === 'clinic_name') {
      setError(""); // Clear error when user starts typing
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clinic_name || form.clinic_name.trim().length < 3) {
      setError("Le nom de la clinique est obligatoire et doit contenir au moins 3 caractères.");
      return;
    }
    if (!isAlphabetic(form.clinic_name)) {
      setError("Le nom de la clinique ne doit contenir que des lettres alphabétiques (pas de chiffres ni de symboles).");
      return;
    }
    // Check if any data has changed
    const hasChanges = 
      form.clinic_name !== values.clinic_name ||
      form.country !== values.country ||
      form.neighbourhood !== values.neighbourhood ||
      form.city !== values.city ||
      form.street_address !== values.street_address ||
      form.postal_code !== values.postal_code ||
      form.website !== values.website;

    if (!hasChanges) {
      setError("Aucune modification n'a été apportée.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/clinics/update-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          clinicId: currentClinicId,
          clinic_name: form.clinic_name,
          street_address: form.street_address,
          neighbourhood: form.neighbourhood,
          city: form.city,
          postal_code: form.postal_code,
          country: form.country,
          website: form.website
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Informations modifiées avec succès.");
        setTimeout(() => {
          setSuccess("");
          onSave(form);
        }, 800);
      } else {
        setError(data.message || "Erreur lors de la modification des informations.");
      }
    } catch (e) {
      setError("Erreur réseau");
    }
    setLoading(false);
  };

  return (
    <form className="p-6 pt-2 space-y-6" onSubmit={handleSubmit}>
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
        <span className="font-semibold text-gray-800">Info :</span> Le nom de la clinique est obligatoire et doit contenir au moins <span className="font-semibold">3 lettres</span>, uniquement des caractères alphabétiques (pas de chiffres ni de symboles). Évitez d'utiliser un nom aléatoire ou des caractères spéciaux.
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clinic_name" className="text-base font-semibold text-gray-700">
            Nom de la clinique
          </Label>
          <Input 
            id="clinic_name"
            className={`h-12 w-full   text-base border-2 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20'}`}
            name="clinic_name" 
            value={form.clinic_name} 
            onChange={handleChange} 
            required 
          />
          {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-base font-semibold text-gray-700">
            Pays
          </Label>
          <Input 
            id="country"
            className="h-12 w-full  text-base border-2 border-gray-300 focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
            name="country" 
            value={form.country} 
            onChange={handleChange} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighbourhood" className="text-base font-semibold text-gray-700">
            Région
          </Label>
          <Input 
            id="neighbourhood"
            className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
            name="neighbourhood" 
            value={form.neighbourhood} 
            onChange={handleChange} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-base font-semibold text-gray-700">
            Ville
          </Label>
          <Input 
            id="city"
            className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
            name="city" 
            value={form.city} 
            onChange={handleChange} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="street_address" className="text-base font-semibold text-gray-700">
            Adresse
          </Label>
          <Input 
            id="street_address"
            className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
            name="street_address" 
            value={form.street_address} 
            onChange={handleChange} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code" className="text-base font-semibold text-gray-700">
            Code postal
          </Label>
          <Input 
            id="postal_code"
            className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
            name="postal_code" 
            value={form.postal_code} 
            onChange={handleChange} 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="website" className="text-base font-semibold text-gray-700">
            Site web
          </Label>
          <Input 
            id="website"
            className="h-12 w-full text-base border-2 border-gray-300 focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
            name="website" 
            value={form.website} 
            onChange={handleChange} 
          />
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl text-base font-medium bg-green-50 text-green-800 border-2 border-green-200">
          {success}
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button 
          type="submit" 
          className="flex-1 h-12 text-base font-semibold bg-[#7c5cff] hover:bg-[#6a4fd8] text-white border-2 border-[#7c5cff]" 
          disabled={loading}
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