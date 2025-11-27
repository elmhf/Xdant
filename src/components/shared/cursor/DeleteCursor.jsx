// DeleteCursor.jsx
"use client";
import React from "react";
import { motion } from "framer-motion";

const DeleteCursor = ({ x, y }) => {
  return (
    <motion.div
      style={{
        position: "fixed",
        top: y - 15,
        left: x - 15,
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "rgba(255,0,0,0.2)",
        border: "2px solid red",
        pointerEvents: "none",
        zIndex: 9999,
      }}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    />
  );
};

export default DeleteCursor;
