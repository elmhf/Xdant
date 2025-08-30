"use client";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "../stores/useSettingsStore";

const LAYERS = [
  { label: "Anatomie générale", emoji: "🧍", key: "anatomie" },
  { label: "Os", emoji: "🦴", key: "os" },
  { label: "Nomenclature des dents", emoji: "🌈", key: "nomenclature" },
  { label: "Structure des dents", emoji: "🦷", key: "structure" },
  { label: "Face et orientation des dents", emoji: "🦷", key: "face" },
  { label: "Cuspides des dents", emoji: "🦷", key: "cuspides" },
  { label: "Racines des dents", emoji: "🦷", key: "racines" },
  { label: "Numérotation dentaire (FDI)", emoji: "🦷", key: "fdi" },
  { label: "Numérotation universelle", emoji: "🦷", key: "universal" },
  { label: "Cavité orale", emoji: "🫦", key: "orale" },
  { label: "Cavité nasale", emoji: "👃", key: "nasale" },
  { label: "Sinus maxillaire", emoji: "🦴", key: "sinus" },
  { label: "Artères", emoji: "🩸", key: "arteres" },
  { label: "Nerfs", emoji: "🧠", key: "nerfs" },
];

export default function LayerSettings() {
  const { layerStates, setLayerStates, toggleLayer } = useSettingsStore();

  React.useEffect(() => {
    if (Object.keys(layerStates).length === 0) {
      const initial = Object.fromEntries(LAYERS.map((l) => [l.key, false]));
      setLayerStates(initial);
    }
  }, []);

  const allSelected = Object.values(layerStates).length > 0 && Object.values(layerStates).every(Boolean);

  const toggleAll = () => {
    const newState = !allSelected;
    const updatedStates = {};
    for (const layer of LAYERS) {
      updatedStates[layer.key] = newState;
    }
    setLayerStates(updatedStates);
  };

  return (
    <div className="w-full max-w-md bg-white flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">Tout sélectionner</span>
        <Switch checked={allSelected} onCheckedChange={toggleAll} />
      </div>
      {LAYERS.map((layer) => (
        <div key={layer.key} className="flex items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{layer.emoji}</span>
            <span className="text-sm">{layer.label}</span>
          </div>
          <Switch checked={layerStates[layer.key]} onCheckedChange={() => toggleLayer(layer.key)} />
        </div>
      ))}
    </div>
  );
}
