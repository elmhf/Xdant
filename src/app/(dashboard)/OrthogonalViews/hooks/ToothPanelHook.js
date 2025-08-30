import { useState, useCallback, useMemo } from "react";

// Tool panel state object
const initialToolPanelState = {
  objects: {
    label: "Objects",
    id: "objects",
    icon: "FaLayerGroup",
    active: false,
  },
  expand: {
    label: "Expand",
    id: "expand",
    icon: "FaExpand",
    active: false,
  },
  grid: {
    label: "Grid",
    id: "grid",
    icon: "FaTh",
    active: false,
  },
  columns: {
    label: "Columns",
    id: "columns",
    icon: "FaColumns",
    active: false,
  },
  ruler: {
    label: "Ruler",
    id: "ruler",
    icon: "FaRuler",
    active: false,
  },
  brightness: {
    label: "Brightness",
    id: "brightness",
    icon: "FiSun",
    active: false,
  },
  crosshair: {
    label: "Crosshair",
    id: "crosshair",
    icon: "CrosshairIcon",
    active: false,
  },
  info: {
    label: "Info",
    id: "info",
    icon: "FaInfoCircle",
    active: false,
  },
};

// أدوات تعمل بنظام exclusive (واحد فقط نشط)
const exclusiveTools = ["crosshair", "info", "brightness", "ruler"];

// Custom hook to manage the tool panel state
export function useToolPanel(initialActive = null) {
  // تحسين الـ initial state
  const [toolPanel, setToolPanel] = useState(() => {
    if (initialActive && initialToolPanelState[initialActive]) {
      return {
        ...initialToolPanelState,
        [initialActive]: { 
          ...initialToolPanelState[initialActive], 
          active: true 
        },
      };
    }
    return initialToolPanelState;
  });

  // دالة مساعدة للتحقق من كون الأداة exclusive
  const isExclusiveTool = useCallback((toolKey) => {
    return exclusiveTools.includes(toolKey);
  }, []);

  // استخدام useCallback لتحسين الأداء
  const setActiveTool = useCallback((toolKey) => {
    if (!toolKey || !initialToolPanelState[toolKey]) {
      console.warn(`Tool "${toolKey}" does not exist`);
      return;
    }
    
    setToolPanel(prev => {
      const newState = { ...prev };
      
      // إذا كانت الأداة من النوع exclusive، إلغاء تفعيل الأدوات الأخرى من نفس النوع
      if (isExclusiveTool(toolKey)) {
        exclusiveTools.forEach(key => {
          if (key !== toolKey) {
            newState[key] = { ...newState[key], active: false };
          }
        });
      }
      
      newState[toolKey] = { ...newState[toolKey], active: true };
      return newState;
    });
  }, [isExclusiveTool]);

  const setInactiveTool = useCallback((toolKey) => {
    if (!toolKey || !initialToolPanelState[toolKey]) {
      console.warn(`Tool "${toolKey}" does not exist`);
      return;
    }
    
    setToolPanel(prev => ({
      ...prev,
      [toolKey]: { ...prev[toolKey], active: false },
    }));
  }, []);

  const toggleTool = useCallback((toolKey) => {
    if (!toolKey || !initialToolPanelState[toolKey]) {
      console.warn(`Tool "${toolKey}" does not exist`);
      return;
    }
    
    setToolPanel(prev => {
      const newState = { ...prev };
      const currentlyActive = prev[toolKey].active;
      
      if (currentlyActive) {
        // إذا كانت الأداة مفعلة، إلغاء تفعيلها
        newState[toolKey] = { ...newState[toolKey], active: false };
      } else {
        // إذا كانت الأداة غير مفعلة، تفعيلها
        // وإذا كانت من النوع exclusive، إلغاء تفعيل الأدوات الأخرى من نفس النوع
        if (isExclusiveTool(toolKey)) {
          exclusiveTools.forEach(key => {
            if (key !== toolKey) {
              newState[key] = { ...newState[key], active: false };
            }
          });
        }
        newState[toolKey] = { ...newState[toolKey], active: true };
      }
      
      return newState;
    });
  }, [isExclusiveTool]);

  // دالة للتحقق من حالة الأداة
  const isToolActive = useCallback((toolKey) => {
    return !!toolPanel[toolKey]?.active;
  }, [toolPanel]);

  // دالة لإعادة تعيين جميع الأدوات
  const resetAllTools = useCallback(() => {
    setToolPanel(initialToolPanelState);
  }, []);

  // دالة لتفعيل أداة واحدة وإلغاء تفعيل الباقي (exclusive mode)
  const setExclusiveTool = useCallback((toolKey) => {
    if (!toolKey || !initialToolPanelState[toolKey]) {
      console.warn(`Tool "${toolKey}" does not exist`);
      return;
    }
    
    setToolPanel(prev => {
      const newState = { ...prev };
      // إلغاء تفعيل جميع الأدوات
      Object.keys(newState).forEach(key => {
        newState[key] = { ...newState[key], active: false };
      });
      // تفعيل الأداة المحددة
      newState[toolKey] = { ...newState[toolKey], active: true };
      return newState;
    });
  }, []);

  // دالة لتعديل أدوات متعددة في نفس الوقت
  const setMultipleTools = useCallback((toolsConfig) => {
    setToolPanel(prev => {
      const newState = { ...prev };
      
      // التحقق من وجود أدوات exclusive متعددة مفعلة
      const exclusiveToolsToActivate = Object.entries(toolsConfig)
        .filter(([toolKey, active]) => active && exclusiveTools.includes(toolKey))
        .map(([toolKey]) => toolKey);
      
      if (exclusiveToolsToActivate.length > 1) {
        console.warn("Cannot activate multiple exclusive tools simultaneously");
        // تفعيل أول أداة exclusive فقط
        const firstExclusiveTool = exclusiveToolsToActivate[0];
        exclusiveTools.forEach(key => {
          newState[key] = { ...newState[key], active: key === firstExclusiveTool };
        });
        
        // تطبيق باقي التغييرات للأدوات غير الـ exclusive
        Object.entries(toolsConfig).forEach(([toolKey, active]) => {
          if (!exclusiveTools.includes(toolKey) && newState[toolKey]) {
            newState[toolKey] = { ...newState[toolKey], active };
          }
        });
      } else {
        // تطبيق التغييرات عادي
        Object.entries(toolsConfig).forEach(([toolKey, active]) => {
          if (newState[toolKey]) {
            if (active && exclusiveTools.includes(toolKey)) {
              // إلغاء تفعيل الأدوات الأخرى من نفس النوع
              exclusiveTools.forEach(key => {
                if (key !== toolKey) {
                  newState[key] = { ...newState[key], active: false };
                }
              });
            }
            newState[toolKey] = { ...newState[toolKey], active };
          }
        });
      }
      
      return newState;
    });
  }, []);

  // معلومات مفيدة باستخدام useMemo
  const toolInfo = useMemo(() => {
    const activeTools = Object.entries(toolPanel)
      .filter(([_, tool]) => tool.active)
      .map(([key, tool]) => ({ key, ...tool }));
    
    const inactiveTools = Object.entries(toolPanel)
      .filter(([_, tool]) => !tool.active)
      .map(([key, tool]) => ({ key, ...tool }));

    const activeExclusiveTools = activeTools.filter(tool => exclusiveTools.includes(tool.key));

    return {
      activeTools,
      inactiveTools,
      activeCount: activeTools.length,
      totalCount: Object.keys(toolPanel).length,
      activeExclusiveTools,
      activeExclusiveTool: activeExclusiveTools[0] || null,
    };
  }, [toolPanel]);

  // دالة للحصول على أداة محددة
  const getTool = useCallback((toolKey) => {
    return toolPanel[toolKey] || null;
  }, [toolPanel]);

  return {
    toolPanel,
    setActiveTool,
    setInactiveTool,
    isToolActive,
    toggleTool,
    resetAllTools,
    setExclusiveTool,
    setMultipleTools,
    getTool,
    toolInfo,
    // مساعدات إضافية
    hasActiveTool: toolInfo.activeCount > 0,
    toolKeys: Object.keys(toolPanel),
    exclusiveTools,
    isExclusiveTool,
    activeExclusiveTool: toolInfo.activeExclusiveTool,
  };
}

// Hook مخصص لمجموعة أدوات التخطيط (Layout tools)
export function useLayoutTools() {
  const { toolPanel, toggleTool, isToolActive, setExclusiveTool } = useToolPanel();
  
  const layoutKeys = ["expand", "grid", "columns"];
  
  const activeLayoutTool = useMemo(() => {
    return layoutKeys.find(key => toolPanel[key]?.active) || null;
  }, [toolPanel]);

  const toggleLayoutTool = useCallback((toolKey) => {
    if (!layoutKeys.includes(toolKey)) {
      console.warn(`"${toolKey}" is not a layout tool`);
      return;
    }
    
    // إذا كانت الأداة مفعلة، إلغاء تفعيلها
    if (isToolActive(toolKey)) {
      toggleTool(toolKey);
    } else {
      // وإلا تفعيلها وإلغاء تفعيل أدوات التخطيط الأخرى
      setExclusiveTool(toolKey);
    }
  }, [isToolActive, toggleTool, setExclusiveTool]);

  return {
    layoutKeys,
    activeLayoutTool,
    toggleLayoutTool,
    isLayoutToolActive: (toolKey) => layoutKeys.includes(toolKey) && isToolActive(toolKey),
  };
}