"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Home, Repeat, Square, Plus } from "lucide-react";
import { FaLayerGroup } from "react-icons/fa";
import ShowelemntPanel from "./ShowelemntPanel";
import SideCardes from "@/app/component/dashboard/side/sideToothCard";


const ToothSVG = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="currentColor" style={{ transform: 'rotate(180deg)' }}>
    <path d="M157 486.6c-19.2-2.8-33.7-8-47.8-17.4-33.6-22-51.5-65-51.6-123.2-0.1-32.5 3.7-47.7 21.9-89 12.3-28 13.1-30.8 20.5-74 14.5-83.7 39.6-140.9 68.2-154.9 11.6-5.7 26.1-5.2 37.2 1.3 9.4 5.5 16.1 17.4 19.7 34.6 1.8 8.8 2.3 16 3 43.5 0.5 21.5 1.3 35.4 2.3 40 4.1 20.1 11.7 33.5 21 37 4.2 1.6 4.6 1.6 8.7-0.2 12.2-5.4 20.7-24.3 22.9-50.3 0.5-6.3 1-20.3 1-31 0-36.2 4.2-55 15.1-67.3 8.9-10.2 24.5-14.1 38.7-9.8 32.8 9.9 59.4 69.1 76.2 169.5 4.6 27.5 7.1 35.8 19 62.9 14.4 33.1 18.7 47.4 21.1 70.7 3.2 32.1-3.9 74.8-16.9 100.5-7.4 14.9-19.5 29.3-31.8 38.1-19.7 14.1-49.1 21.6-78.8 20.1-20.8-1.1-36.5-5.8-58.2-17.2l-12.4-6.5-12.4 6.5c-14.1 7.4-25.3 11.8-37.6 14.6-11.2 2.6-35.9 3.3-49 1.5z"/>
  </svg>
);

const icons = [
  { id: "c", icon: <FaLayerGroup size={20} />, label: "Home" },
  { id: "s", icon: <ToothSVG size={20} />, label: "Teeth" },
  { id: "o", icon: <Square size={20} />, label: "Square" },
  { id: "+", icon: <Plus size={20} />, label: "Add" },
];

export default function SidePanel() {
  const [toothNumberSelect, setToothNumberSelect] = React.useState();
  const [active, setActive] = React.useState("c");

  const buttonHeight = 40;
  const buttonGap = 8;
  const index = icons.findIndex((item) => item.id === active);
  const indicatorY = index * (buttonHeight + buttonGap);

  return (
    <div className="relative flex flex-row rounded-[0.5vw] overflow-hidden items-start h-full">
      {/* Sidebar buttons */}
      <div className="max-h-[100%] h-full bg-white px-2 py-4 flex flex-col gap-2 items-center relative  z-10">
        <motion.div
          layout
          layoutId="verticalBar"
          className="absolute left-0 w-1 bg-black rounded-r-md"
          style={{ height: buttonHeight }}
          animate={{ y: indicatorY }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />

        {icons.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`relative flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-300 ${
              active === item.id ? "bg-black text-white" : "bg-gray-100 text-black"
            }`}
            title={item.label}
          >
            {item.icon}
            {active === item.id && (
              <motion.span
                layoutId="activeIndicator"
                className="absolute inset-0 rounded-md bg-black z-[-1]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Panel container: always shown, content based on active icon */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 300, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{  duration:1}}
        className="h-full bg-white  border-l border-gray-200 flex flex-col overflow-hidden"
        style={{ minWidth: 300 }}
      >
        {/* Content dynamic based on active icon */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "tween", stiffness: 200, duration:0.5 ,ease:"easeInOut" }}
          className="w-full h-full"
        >
          {active === "c" ? (
            <ShowelemntPanel />
          ) : active === "s" ? (
            <SideCardes layoutKey="XRAY_SIDE" toothNumberSelect={toothNumberSelect} setToothNumberSelect={setToothNumberSelect}  />
          ) : (
            <>
              <div className="font-bold text-lg mb-4">{icons.find(i => i.id === active)?.label} Panel</div>
              <div className="text-gray-700">محتوى {icons.find(i => i.id === active)?.label} هنا...</div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
