import React from "react";
import { FaLayerGroup, FaThLarge, FaRuler, FaRegSun, FaTh, FaColumns, FaExpand, FaInfoCircle } from "react-icons/fa";
import { FiSun } from "react-icons/fi";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useSettingsStore } from "../stores/useSettingsStore";

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

const iconMap = {
  FaLayerGroup,
  FaExpand,
  FaTh,
  FaColumns,
  FaRuler,
  FaRegSun,
  FiSun,
  CrosshairIcon,
  FaInfoCircle,
};

export default function ToolPanel(props) {
  // استعمال useSettingsStore
  const activeActivities = useSettingsStore((s) => s.activeActivities);
  const toggleActivity = useSettingsStore((s) => s.toggleActivity);

  // Animation state: track which tool is animating
  const [animatingTool, setAnimatingTool] = React.useState(null);

  // Définir les outils exclusifs (un seul actif à la fois)
  const exclusiveTools = ["ruler", "brightness", "crosshair", "info"];

  // Helper to trigger animation when a tool becomes active
  const handleAnimatedToggle = (toolKey) => {
    const wasActive = activeActivities.includes(toolKey);
    
    // Si le tool est dans le groupe exclusif
    if (exclusiveTools.includes(toolKey)) {
      if (wasActive) {
        // Si déjà actif, le désactiver
        toggleActivity(toolKey);
        setAnimatingTool(toolKey);
        setTimeout(() => {
          setAnimatingTool(null);
        }, 200);
      } else {
        // Désactiver tous les autres de ce groupe, activer seulement celui cliqué
        exclusiveTools.forEach((key) => {
          if (key !== toolKey && activeActivities.includes(key)) {
            toggleActivity(key); // désactive les autres
          }
        });
        toggleActivity(toolKey); // active celui cliqué
        setAnimatingTool(toolKey);
        setTimeout(() => {
          setAnimatingTool(null);
        }, 200);
      }
    } else {
      // Comportement normal pour les autres outils - toggle simple
      toggleActivity(toolKey);
      setAnimatingTool(toolKey);
      setTimeout(() => {
        setAnimatingTool(null);
      }, 200);
    }
  };

  // دالة لرسم الأيقونة
  const renderIcon = (iconName, props = {}) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent {...props} /> : null;
  };

  // دالة لرسم الأزرار العامة
  const renderToolButton = (toolKey, extraProps = {}) => {
    // تعريف tool info محلي (لأننا لم نعد نستعمل toolPanel prop)
    const toolInfoMap = {
      objects: { label: "Objects", icon: "FaLayerGroup" },
      expand: { label: "Expand", icon: "FaExpand" },
      grid: { label: "Grid", icon: "FaTh" },
      columns: { label: "Columns", icon: "FaColumns" },
      ruler: { label: "Ruler", icon: "FaRuler" },
      brightness: { label: "Brightness", icon: "FiSun" },
      crosshair: { label: "Crosshair", icon: "CrosshairIcon" },
      info: { label: "Info", icon: "FaInfoCircle" },
    };
    const tool = toolInfoMap[toolKey];
    if (!tool) return null;

    const isActive = activeActivities.includes(toolKey);
    const baseClasses = "w-12 h-12 flex items-center justify-center rounded-xl text-2xl shadow-sm transition-transform duration-200";
    const activeClasses = extraProps.activeClasses || "bg-black text-white border border-black";
    const inactiveClasses = extraProps.inactiveClasses || "bg-white text-black border border-gray-300";
    const popClass = animatingTool === toolKey ? "scale-110" : "";

    return (
      <button
        key={toolKey}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${popClass}`}
        title={extraProps.title || tool.label}
        onClick={() => handleAnimatedToggle(toolKey)}
        {...extraProps.buttonProps}
      >
        {renderIcon(tool.icon, { size: extraProps.iconSize || 24 })}
      </button>
    );
  };

  React.useEffect(() => {
    const activeTools = activeActivities;
    console.log("Active tools:", activeTools);
  }, [activeActivities]);

  return (
    <div className="flex gap-2 items-center w-fit px-4 py-2 rounded-2xl bg-white shadow-lg border border-gray-200" style={{ minHeight: 56 }}>
      {/* Objects button */}
      <button
        className={`flex items-center gap-2 px-4 h-12 rounded-xl font-medium shadow-sm transition-transform duration-200 ${activeActivities.includes("objects") 
          ? `bg-black text-white border border-black ${animatingTool === "objects" ? "scale-110" : ""}`
          : "bg-white text-black border border-gray-300"}`}
        onClick={() => handleAnimatedToggle("objects")}
      >
        {renderIcon("FaLayerGroup", { className: "text-xl" })}
        <span>Objects</span>
      </button>

      {/* Layout Dropdown */}
      {/* Layout Dropdown (اختياري: يمكن ربطه بنفس المنطق إذا تحب) */}

      {/* Ruler button */}
      {renderToolButton("ruler")}

      {/* Brightness button */}
      {renderToolButton("brightness")}

      {/* Crosshair button */}
      {renderToolButton("crosshair")}

      {/* Info button */}
      {renderToolButton("info")}

    </div>
  );
}