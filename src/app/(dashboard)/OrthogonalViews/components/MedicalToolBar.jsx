"use client";
import React, { useState } from "react";
import CBCTToolBar from "./CBCTToolBar";
import LayerSettings from "./LayerSettings";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useSettingsStore } from "../stores/useSettingsStore";
import SideCardes from "@/components/features/dashboard/side/sideToothCard";

// Custom Tooth SVG Component


const SWITCH_CONFIG = {
  legend: [
    { label: "Entraînement", key: "entrainement", icon: "❓" },
    { label: "Épingles", key: "epingles", icon: "📍" },
    { label: "Légendage limité", key: "limite", icon: "🔒" }
  ],
  display: [
    { label: "Orientation", key: "orientation", icon: "↗️" },
    { label: "Afficher/Masquer les références croisées", key: "crossref", icon: "🔀" }
  ]
};

const SwitchGroup = ({ title, items, states, onToggle }) => (
  <div className="mb-4">
    <div className="font-semibold text-base mb-2">{title}</div>
    {items.map(item => (
      <div key={item.key} className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-blue-500">{item.icon}</span>
          <span className="text-sm">{item.label}</span>
        </div>
        <Switch checked={states[item.key]} onCheckedChange={() => onToggle(item.key)} />
      </div>
    ))}
  </div>
);

export default function MedicalToolBar() {
  const [toothNumberSelect, setToothNumberSelect] = useState(null);
  const { legendStates, toggleLegend, displayStates, toggleDisplay } = useSettingsStore();
  const [selectedView, setSelectedView] = useState("main");

  return (
    <div className="flex flex-row " style={{ fontFamily: 'poppins' }} >
      <div className="flex flex-col border-r p-2 border-gray-200 bg-gray-50">
        <CBCTToolBar />
        <div className="flex flex-col items-center mt-4 gap-2">
          <Button
            onClick={() => setSelectedView("main")}
            variant={selectedView === "main" ? "default" : "outline"}
            size="icon"
            className="w-10 h-10"
            title="Settings"
          >
            <Settings size={16} />
          </Button>
          <Button
            onClick={() => setSelectedView("second")}
            variant={selectedView === "second" ? "default" : "outline"}
            size="icon"
            className="w-10 h-10"
            title="Tooth View"
          >

          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 gap-4 flex flex-col">
        {selectedView === "main" ? (
          <>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-2xl mb-4 transition-colors">
              Run AI
            </button>

            <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-yellow-500 text-lg">⚠</span>
                <div className="text-yellow-700 text-xs leading-relaxed">
                  <strong>Low resolution decreases accuracy.</strong><br />
                  Ensure high resolution for smooth 3D shapes.
                </div>
              </div>
            </div>

            <div className="p-4 overflow-scroll no-scrollbar">
              <LayerSettings />
              <SwitchGroup title="Légendages" items={SWITCH_CONFIG.legend} states={legendStates} onToggle={toggleLegend} />
              <SwitchGroup title="Mode d'affichage" items={SWITCH_CONFIG.display} states={displayStates} onToggle={toggleDisplay} />
            </div>
          </>
        ) : (
          <div style={{ height: '100%', width: '100%' }}>
            <SideCardes layoutKey={"XRAY_SIDE"} toothNumberSelect={toothNumberSelect} setToothNumberSelect={setToothNumberSelect} />
          </div>
        )}
      </div>
    </div>
  );
}

