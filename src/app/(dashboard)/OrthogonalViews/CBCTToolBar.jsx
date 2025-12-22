"use client"
import React, { useState } from "react";
import {
  Search,
  Play,
  Edit3,
  Eraser,
  RotateCw,
  Crop,
  Pen,
  Minus,
  Triangle,
  ZoomIn,
  Eye,
  EyeOff,
  Settings,
  PenTool,
  Move,
  Layers
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Custom Crosshair Icon Component
function CrosshairIcon({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Toolbar Component
function CBCTToolBar({ isCrosshairActive, onToggleCrosshair }) {
  const tools = [
    { icon: Move, name: "Move" },
    { icon: RotateCw, name: "Rotate" },
    { icon: ZoomIn, name: "Zoom" },
    { icon: Minus, name: "Line" },
    { icon: Eraser, name: "Eraser" },
    // Crosshair toggle button
    { icon: CrosshairIcon, name: isCrosshairActive ? "Crosshair On" : "Crosshair Off", isCrosshair: true },
    { icon: PenTool, name: "Linelaser" },
    { icon: Layers, name: "Layers" },
  ];

  return (
    <div className="flex flex-col items-center py-3 gap-1">
      {tools.map((tool, idx) => {
        const IconComponent = tool.icon;
        if (tool.isCrosshair) {
          return (
            <button
              key={idx}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group bg-transparent ${isCrosshairActive ? 'text-blue-500' : 'text-gray-400'}`}
              title={tool.name}
              onClick={onToggleCrosshair}
              type="button"
            >
              <IconComponent size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          );
        }
        return (
          <button
            key={idx}
            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-blue-500 rounded-xl transition-all duration-200 group bg-transparent"
            title={tool.name}
            type="button"
          >
            <IconComponent size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        );
      })}
    </div>
  );
}

// Tree Item Component
function TreeItem({ title, children, defaultExpanded = false, hasCheckbox = false, checked = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-1.5 px-2 text-sm text-gray-300 hover:bg-[#2a2a3e] rounded cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {children && (
          <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
        )}
        {hasCheckbox && (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="w-3 h-3 rounded accent-green-500"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <span className="flex-1">{title}</span>
      </div>

      {children && isExpanded && (
        <div className="ml-4 border-l border-[#3a3a4e] pl-2">
          {children}
        </div>
      )}
    </div>
  );
}

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



const LEGEND_SWITCHES = [
  { label: "Entraînement", key: "entrainement" },
  { label: "Épingles", key: "epingles" },
  { label: "Légendage limité", key: "limite" },
];

const DISPLAY_SWITCHES = [
  { label: "Orientation", key: "orientation" },
  { label: "Afficher/Masquer les références croisées", key: "crossref" },
];

// Main Sidebar Component
export default function MedicalSidebar({ isCrosshairActive, onToggleCrosshair }) {
  const [layerStates, setLayerStates] = React.useState(
    Object.fromEntries(LAYERS.map(l => [l.key, false]))
  );
  const allSelected = Object.values(layerStates).every(Boolean);
  const toggleLayer = (key) => {
    setLayerStates(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleAll = () => {
    const newState = !allSelected;
    setLayerStates(Object.fromEntries(LAYERS.map(l => [l.key, newState])));
  };

  // Legendages
  const [legendStates, setLegendStates] = React.useState({
    entrainement: false,
    epingles: false,
    limite: false,
  });
  const toggleLegend = (key) => {
    setLegendStates(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const [fontSize, setFontSize] = React.useState('auto');

  // Display
  const [displayStates, setDisplayStates] = React.useState({
    orientation: true,
    crossref: true,
  });
  const toggleDisplay = (key) => {
    setDisplayStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-100 max-h-[100%] h-full bg-white border-l  border-gray-200 flex">
      {/* Toolbar */}
      <div className="w-16 p-3 border-r border-gray-200 bg-gray-50">
        <CBCTToolBar isCrosshairActive={isCrosshairActive} onToggleCrosshair={onToggleCrosshair} />
      </div>
      {/* Main Content */}
      <div className="flex-1 p-4 gap-4 flex overflow-y-scroll flex-col">
        {/* Run AI Button */}
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-2xl mb-4 transition-colors">
          Run AI
        </button>
        {/* Warning Notice */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-3 mb-6">
          <div className="flex items-start gap-2">
            <span className="text-yellow-500 text-lg">⚠</span>
            <div className="text-yellow-700 text-xs leading-relaxed">
              <strong>Low resolution decreases accuracy.</strong><br />
              Ensure high resolution for smooth<br />
              3D shapes.
            </div>
          </div>
        </div>


        {/* Liste des couches (layers) avec switch shadcn */}
        <div className=" w-full max-w-md bg-white   flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Tout sélectionner</span>
            <Switch checked={allSelected} onCheckedChange={toggleAll} />
          </div>
          {LAYERS.map(layer => (
            <div key={layer.key} className="flex items-center justify-between gap-2 py-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{layer.emoji}</span>
                <span className="text-sm">{layer.label}</span>
              </div>
              <Switch checked={layerStates[layer.key]} onCheckedChange={() => toggleLayer(layer.key)} />
            </div>
          ))}
        </div>
        {/* Légendages */}
        <div className="">
          <div className="font-semibold text-base mb-2">Légendages</div>
          {LEGEND_SWITCHES.map(s => (
            <div key={s.key} className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">{s.key === 'entrainement' ? '❓' : s.key === 'epingles' ? '📍' : '🔒'}</span>
                <span className="text-sm">{s.label}</span>
              </div>
              <Switch checked={legendStates[s.key]} onCheckedChange={() => toggleLegend(s.key)} />
            </div>
          ))}
        </div>
        {/* Mode d'affichage */}
        <div className="">
          <div className="font-semibold text-base mb-2">Mode d'affichage</div>
          {DISPLAY_SWITCHES.map(s => (
            <div key={s.key} className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">{s.key === 'orientation' ? '↗️' : '🔀'}</span>
                <span className="text-sm">{s.label}</span>
              </div>
              <Switch checked={displayStates[s.key]} onCheckedChange={() => toggleDisplay(s.key)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
