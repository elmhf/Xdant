import { useState, useEffect } from "react";
import LAYOUTS from "@/constants/layouts";

export default function useLayout(defaultLayout = "DEFAULT") {
  const [layoutKey, setLayoutKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("xdental-layout") || defaultLayout;
    }
    return defaultLayout;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("xdental-layout", layoutKey);
    }
  }, [layoutKey]);

  const setLayout = (key) => {
    if (LAYOUTS[key]) setLayoutKey(key);
  };

  return {
    layoutKey,
    layout: LAYOUTS[layoutKey],
    setLayout,
    allLayouts: LAYOUTS
  };
} 