"use client"
import { createContext, useContext, useState } from "react";
import LAYOUTS from "@/constants/layouts";

const LayoutContext = createContext();

export function LayoutProvider({ children }) {
  // يبدأ دائماً بـ DEFAULT
  const [layoutKey, setLayoutKey] = useState("DEFAULT");

  const setLayout = (key) => {
    console.log('set layout ',key)
    if (LAYOUTS[key]) setLayoutKey(key);
  };

  return (
    <LayoutContext.Provider value={{
      layoutKey,
      layout: LAYOUTS[layoutKey],
      setLayout,
      allLayouts: LAYOUTS
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
} 