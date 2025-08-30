"use client";
import { useReducer, useCallback, useMemo } from "react";

// Generate teeth using FDI notation
function generateTeethFDI(start, end) {
  const teeth = {};
  for (let i = start; i <= end; i++) {
    teeth[`tooth${i}`] = { 
      label: `Tooth ${i}`, 
      value: false,
      id: `tooth-${i}` // Add unique ID for better tracking
    };
  }
  return teeth;
}

// Initial state with improved structure
const initialState = {
  jaws: {
    label: "Jaws",
    id: "jaws",
    value: {
      upperJaw: { 
        label: "Upper Jaw", 
        value: false,
        id: "upper-jaw" 
      },
      lowerJaw: { 
        label: "Lower Jaw", 
        value: false,
        id: "lower-jaw" 
      },
    },
  },
  teeth: {
    label: "Teeth",
    id: "teeth",
    value: {
      upperRight: {
        label: "Upper Right Teeth",
        id: "upper-right-teeth",
        value: generateTeethFDI(11, 18),
      },
      upperLeft: {
        label: "Upper Left Teeth",
        id: "upper-left-teeth",
        value: generateTeethFDI(21, 28),
      },
      lowerLeft: {
        label: "Lower Left Teeth",
        id: "lower-left-teeth",
        value: generateTeethFDI(31, 38),
      },
      lowerRight: {
        label: "Lower Right Teeth",
        id: "lower-right-teeth",
        value: generateTeethFDI(41, 48),
      },
    },
  },
  anatomy: {
    label: "Anatomy",
    id: "anatomy",
    value: {
      softTissue: { 
        label: "Soft Tissue", 
        value: false,
        id: "soft-tissue" 
      },
      cranial: { 
        label: "Cranial", 
        value: false,
        id: "cranial" 
      },
      sinus: { 
        label: "Sinus", 
        value: false,
        id: "sinus" 
      },
      incisiveCanal: { 
        label: "Incisive Canal", 
        value: false,
        id: "incisive-canal" 
      },
      maxilla: { 
        label: "Maxilla", 
        value: false,
        id: "maxilla" 
      },
      mandible: { 
        label: "Mandible", 
        value: false,
        id: "mandible" 
      },
      mandibularCanal: { 
        label: "Mandibular Canal", 
        value: false,
        id: "mandibular-canal" 
      },
      gingivaUpper: { 
        label: "Gingiva Upper", 
        value: false,
        id: "gingiva-upper" 
      },
      gingivaLower: { 
        label: "Gingiva Lower", 
        value: false,
        id: "gingiva-lower" 
      },
      airways: { 
        label: "Airways", 
        value: false,
        id: "airways" 
      },
    },
  },
};

// Immutable deep clone helper
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(deepClone);
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

// Enhanced toggle function with better error handling
function toggleDeep(obj, path) {
  if (!path || path.length === 0) return obj;
  
  const [key, ...rest] = path;
  
  if (!(key in obj)) {
    console.warn(`Key "${key}" not found in object`);
    return obj;
  }
  
  if (rest.length === 0) {
    // Toggle the value
    return {
      ...obj,
      [key]: {
        ...obj[key],
        value: !obj[key].value,
      },
    };
  }
  
  // Recursively toggle nested value
  return {
    ...obj,
    [key]: {
      ...obj[key],
      value: toggleDeep(obj[key].value, rest),
    },
  };
}

// Enhanced setAll function with better performance
function setAllDeep(obj, path, newValue) {
  if (!path || path.length === 0) {
    if (typeof obj.value === "boolean") {
      return { ...obj, value: newValue };
    } else if (obj.value && typeof obj.value === "object") {
      const newNested = {};
      for (const key in obj.value) {
        newNested[key] = setAllDeep(obj.value[key], [], newValue);
      }
      return { ...obj, value: newNested };
    }
    return obj;
  }
  
  const [key, ...rest] = path;
  
  if (!(key in obj)) {
    console.warn(`Key "${key}" not found in object`);
    return obj;
  }
  
  return {
    ...obj,
    [key]: setAllDeep(obj[key], rest, newValue),
  };
}

// Enhanced reducer with action validation
function reducer(state, action) {
  if (!action || !action.type) {
    console.warn("Invalid action provided to reducer");
    return state;
  }
  
  switch (action.type) {
    case "TOGGLE_ITEM":
      if (!action.payload || !action.payload.path) {
        console.warn("Invalid payload for TOGGLE_ITEM action");
        return state;
      }
      return toggleDeep(state, action.payload.path);
      
    case "SET_ALL":
      if (!action.payload || !action.payload.path || action.payload.value === undefined) {
        console.warn("Invalid payload for SET_ALL action");
        return state;
      }
      return setAllDeep(state, action.payload.path, action.payload.value);
      
    case "RESET":
      return deepClone(initialState);
      
    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
}

// Enhanced hook with additional utilities
export function useVisibilityTree() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Toggle individual item
  const toggleItem = useCallback((path) => {
    if (!path || !Array.isArray(path)) {
      console.warn("Invalid path provided to toggleItem");
      return;
    }
    dispatch({ type: "TOGGLE_ITEM", payload: { path } });
  }, []);
  
  // Set all items in a path to a specific value
  const setAll = useCallback((path, value) => {
    if (!path || !Array.isArray(path) || typeof value !== "boolean") {
      console.warn("Invalid parameters provided to setAll");
      return;
    }
    dispatch({ type: "SET_ALL", payload: { path, value } });
  }, []);
  
  // Reset to initial state
  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);
  
  // Get value at specific path
  const getValue = useCallback((path) => {
    if (!path || !Array.isArray(path)) return undefined;
    
    let current = state;
    for (const key of path) {
      if (!current || !current[key]) return undefined;
      current = current[key];
    }
    return current?.value;
  }, [state]);
  
  // Check if all items in a path are true/false
  const areAllTrue = useCallback((path) => {
    const checkAll = (obj) => {
      if (typeof obj.value === "boolean") {
        return obj.value;
      } else if (obj.value && typeof obj.value === "object") {
        return Object.values(obj.value).every(checkAll);
      }
      return false;
    };
    
    if (!path || path.length === 0) return checkAll({ value: state });
    
    let current = state;
    for (const key of path) {
      if (!current || !current[key]) return false;
      current = current[key];
    }
    return checkAll(current);
  }, [state]);
  
  const areAllFalse = useCallback((path) => {
    const checkAll = (obj) => {
      if (typeof obj.value === "boolean") {
        return !obj.value;
      } else if (obj.value && typeof obj.value === "object") {
        return Object.values(obj.value).every(checkAll);
      }
      return false;
    };
    
    if (!path || path.length === 0) return checkAll({ value: state });
    
    let current = state;
    for (const key of path) {
      if (!current || !current[key]) return false;
      current = current[key];
    }
    return checkAll(current);
  }, [state]);
  
  // Get statistics about the current state
  const stats = useMemo(() => {
    const countItems = (obj) => {
      if (typeof obj.value === "boolean") {
        return { total: 1, enabled: obj.value ? 1 : 0 };
      } else if (obj.value && typeof obj.value === "object") {
        return Object.values(obj.value).reduce(
          (acc, child) => {
            const childStats = countItems(child);
            return {
              total: acc.total + childStats.total,
              enabled: acc.enabled + childStats.enabled,
            };
          },
          { total: 0, enabled: 0 }
        );
      }
      return { total: 0, enabled: 0 };
    };
    
    return countItems({ value: state });
  }, [state]);
  
  return {
    state,
    toggleItem,
    setAll,
    reset,
    getValue,
    areAllTrue,
    areAllFalse,
    stats,
  };
}