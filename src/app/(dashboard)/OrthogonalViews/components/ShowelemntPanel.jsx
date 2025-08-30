"use client";
import React, { useState, useMemo } from "react";
import { useVisibilityTree } from "../hooks/VisibilitySettingHook";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";

const CheckboxItem = React.memo(({ obj, path, onToggle }) => {
  if (!obj || typeof obj.value !== "boolean") return null;

  return (
    <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-zinc-100 transition-colors">
      <span className="text-sm text-zinc-800">{obj.label}</span>
      <Switch checked={obj.value} onCheckedChange={() => onToggle(path)} />
    </div>
  );
});
CheckboxItem.displayName = "CheckboxItem";

const GroupHeader = React.memo(
  ({ obj, path, onSetAll, areAllTrue, onToggleCollapse, isCollapsed }) => {
    if (!obj || typeof obj.value === "boolean") return null;

    const allTrue = areAllTrue(path);

    return (
      <div className="flex items-center justify-between mb-3 p-2 bg-zinc-100 rounded-lg border border-zinc-300">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleCollapse(path.join("-"))}
            className="p-1 hover:bg-zinc-200 rounded cursor-pointer"
            type="button"
          >
            <svg
              className={`w-4 h-4 transition-transform text-zinc-600 ${isCollapsed ? "rotate-0" : "rotate-90"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h3 className="font-semibold text-zinc-800">{obj.label}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Toggle All</span>
          <Switch checked={allTrue} onCheckedChange={(val) => onSetAll(path, val)} />
        </div>
      </div>
    );
  }
);
GroupHeader.displayName = "GroupHeader";

export default function VisibilityPanel() {
  const { state, toggleItem, setAll, reset, areAllTrue, areAllFalse, stats } = useVisibilityTree();
  // Utility to get all group IDs recursively
  const getAllGroupIds = (obj, path = []) => {
    let ids = [];
    if (obj && typeof obj.value === "object" && !Array.isArray(obj.value)) {
      const groupId = path.join("-");
      ids.push(groupId);
      for (const [key, child] of Object.entries(obj.value)) {
        ids = ids.concat(getAllGroupIds(child, [...path, key]));
      }
    }
    return ids;
  };
  // Memoize all group IDs from state
  const allGroupIds = useMemo(() => {
    let ids = [];
    for (const [key, value] of Object.entries(state)) {
      ids = ids.concat(getAllGroupIds(value, [key]));
    }
    return ids;
  }, [state]);
  // Initialize collapsedGroups with all group IDs (all collapsed by default)
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set(allGroupIds));
  // Keep collapsedGroups in sync if state changes (e.g. after reset)
  React.useEffect(() => {
    setCollapsedGroups(new Set(allGroupIds));
  }, [allGroupIds.length]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleCollapse = (groupId) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      newSet.has(groupId) ? newSet.delete(groupId) : newSet.add(groupId);
      return newSet;
    });
  };

  const filteredState = useMemo(() => {
    if (!searchTerm) return state;
    const filterObject = (obj, path = []) => {
      if (typeof obj.value === "boolean") {
        return obj.label.toLowerCase().includes(searchTerm.toLowerCase()) ? obj : null;
      } else if (obj.value && typeof obj.value === "object") {
        const filteredChildren = {};
        let hasVisibleChildren = false;
        for (const [key, child] of Object.entries(obj.value)) {
          const filtered = filterObject(child, [...path, key]);
          if (filtered) {
            filteredChildren[key] = filtered;
            hasVisibleChildren = true;
          }
        }
        if (hasVisibleChildren || obj.label.toLowerCase().includes(searchTerm.toLowerCase())) {
          return { ...obj, value: hasVisibleChildren ? filteredChildren : obj.value };
        }
      }
      return null;
    };

    const filtered = {};
    for (const [key, value] of Object.entries(state)) {
      const filteredValue = filterObject(value, [key]);
      if (filteredValue) {
        filtered[key] = filteredValue;
      }
    }
    return filtered;
  }, [state, searchTerm]);

  const renderItem = (obj, path = [], level = 0) => {
    if (!obj) return null;
    const groupId = path.join("-");
    const isCollapsed = collapsedGroups.has(groupId);
    if (typeof obj.value === "boolean") {
      return (
        <div key={groupId} style={{ marginLeft: level * 16 }}>
          <CheckboxItem obj={obj} path={path} onToggle={toggleItem} />
        </div>
      );
    } else if (obj.value && typeof obj.value === "object") {
      return (
        <div key={groupId} style={{ marginLeft: level * 16 }} className="mb-4">
          <GroupHeader
            obj={obj}
            path={path}
            onSetAll={setAll}
            areAllTrue={areAllTrue}
            areAllFalse={areAllFalse}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapse}
          />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                className="ml-4 space-y-1"
                key="content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                {Object.entries(obj.value).map(([key, child]) =>
                  renderItem(child, [...path, key], level + 1)
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-2 overflow-scroll no-scrollbar bg-gradient-to-br from-white via-zinc-50 to-white h-[100%] max-h-[100%">

      <div className="mb-6">
        <div className="relative">
          <motion.input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-white border border-zinc-300 text-zinc-800 placeholder-zinc-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            whileFocus={{ scale: 1.04, boxShadow: "0 0 0 4px #a78bfa44" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {Object.entries(filteredState).length > 0 ? (
            Object.entries(filteredState).map(([key, value]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
              >
                {renderItem(value, [key])}
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center py-8 text-zinc-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No items found matching "{searchTerm}"
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
