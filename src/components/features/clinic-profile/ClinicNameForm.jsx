import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ClinicNameForm({ value, onSave, onBack }) {
  const [name, setName] = useState(value);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("Nom modifié avec succès.");
      setTimeout(() => {
        setSuccess("");
        onSave(name);
      }, 800);
    }, 600);
  };

  return (
    <form className="p-6 pt-0" onSubmit={handleSubmit}>
      <label className="block text-gray-700 text-sm mb-1">Nom de la clinique</label>
      <input
        className="border  w-full rounded px-3 py-2 w mb-4 focus:outline-none focus:ring-2 focus:ring-[#625a97]"
        placeholder="Entrez le nouveau nom de la clinique"
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        disabled={loading}
        required
      />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      <div className="flex gap-2 mt-4">
        <Button type="submit" className="flex-1 bg-[#6a5acd] hover:bg-[#625a97] text-white rounded-lg" disabled={!name || loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onBack} disabled={loading}>
          Annuler
        </Button>
      </div>
    </form>
  );
} 