"use client";
import React from "react";
import { 
  RotateCw, 
  ZoomIn, 
  Minus, 
  Eraser, 
  PenTool,
  Move,
  Layers
} from "lucide-react";
import { useSettingsStore } from "../stores/useSettingsStore";

// Custom Crosshair Icon
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

export default function CBCTToolBar() {
  const { activeActivities, toggleActivity } = useSettingsStore();
  const isDrawActive = useSettingsStore(s => s.activeActivities.includes('draw'));

  const tools = [
    { icon: Move, id: "move" },
    { icon: RotateCw, id: "rotate" },
    { icon: ZoomIn, id: "zoom" },
    { icon: Minus, id: "line" },
    { icon: Eraser, id: "erase" },
    { icon: CrosshairIcon, id: "crosshair" },
    { icon: PenTool, id: "draw" },
    { icon: Layers, id: "slice-scroll" },
  ];

  return (
    <div className="flex flex-col items-center py-3 gap-1">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeActivities.includes(tool.id);

        return (
          <button
            key={tool.id}
            title={tool.id}
            onClick={() =>{ toggleActivity(tool.id)}}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 group bg-transparent ${
              isActive ? "text-blue-500" : "text-gray-400"
            }`}
            type="button"
          >
            <Icon size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        );
      })}
    </div>
  );
}
