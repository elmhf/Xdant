import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUserStore from "@/components/features/profile/store/userStore";
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";

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
  const [error, setError] = useState("");
  const { pushNotification } = useNotification();

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
        pushNotification('success', "Informations modifiées avec succès.");
        setTimeout(() => {
          onSave(form);
        }, 800);
      } else {
        pushNotification('error', data.message || "Erreur lors de la modification des informations.");
      }
    } catch (e) {
      pushNotification('error', "Erreur réseau");
    }
    setLoading(false);
  };

  return (
    <form className="p-6 pt-2 space-y-6" onSubmit={handleSubmit}>
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-gray-700 mb-4">
        <span className="font-semibold text-gray-800">Info :</span> Le nom de la clinique est obligatoire et doit contenir au moins <span className="font-semibold">3 lettres</span>, uniquement des caractères alphabétiques (pas de chiffres ni de symboles).
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clinic_name" className="text-base font-medium text-gray-700">
            Nom de la clinique <span className="text-red-500">*</span>
          </Label>
          <Input
            id="clinic_name"
            className={`h-12 w-full text-base rounded-xl ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20'}`}
            name="clinic_name"
            value={form.clinic_name}
            onChange={handleChange}
            required
            placeholder="Ex: Ma Clinique Dentaire"
          />
          {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-base font-medium text-gray-700">
            Site web
          </Label>
          <Input
            id="website"
            className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-base font-medium text-gray-700">
              Pays
            </Label>
            <Input
              id="country"
              className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Tunisie"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighbourhood" className="text-base font-medium text-gray-700">
              Région
            </Label>
            <Input
              id="neighbourhood"
              className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
              name="neighbourhood"
              value={form.neighbourhood}
              onChange={handleChange}
              placeholder="Tunis"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-base font-medium text-gray-700">
              Ville
            </Label>
            <Input
              id="city"
              className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Ariana"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code" className="text-base font-medium text-gray-700">
              Code postal
            </Label>
            <Input
              id="postal_code"
              className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
              name="postal_code"
              value={form.postal_code}
              onChange={handleChange}
              placeholder="2080"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="street_address" className="text-base font-medium text-gray-700">
            Adresse
          </Label>
          <Input
            id="street_address"
            className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
            name="street_address"
            value={form.street_address}
            onChange={handleChange}
            placeholder="Rue 14 Janvier..."
          />
        </div>
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
          disabled={loading}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
} 