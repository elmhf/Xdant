"use client";
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Download, Ruler, ZoomIn, ZoomOut, Maximize, Eye, EyeOff, Grid3X3, MousePointer, Hand, Lock, Unlock, MoreHorizontal, RotateCcw, RotateCw, Square, Circle, Undo, MapPin,
  Trash
} from 'lucide-react';

const ToolButton = React.memo(({ tool, isSelected, onClick, variant = 'default', disabled = false, isCircular = false }) => {
  const getButtonStyles = () => {
    const baseStyles = isCircular ? "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 group relative shadow-sm" : "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group relative shadow-sm";
    const variants = {
      blue: 'bg-blue-100 border-2 border-blue-300 text-blue-700 hover:bg-blue-200 hover:border-blue-400',
      green: 'bg-green-100 border-2 border-green-300 text-green-700 hover:bg-green-200 hover:border-green-400',
      purple: 'bg-purple-100 border-2 border-purple-300 text-purple-700 hover:bg-purple-200 hover:border-purple-400',
      indigo: 'bg-indigo-100 border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-200 hover:border-indigo-400',
      red: 'bg-red-100 border-2 border-red-300 text-red-700 hover:bg-red-200 hover:border-red-400',
      orange: 'bg-orange-100 border-2 border-orange-300 text-orange-700 hover:bg-orange-200 hover:border-orange-400',
      default: 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 border-2 border-transparent hover:border-gray-200'
    };
    
    if (disabled) {
      return `${baseStyles} bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed`;
    }
    
    return `${baseStyles} ${isSelected ? variants[variant] + ' font-bold ring-2 ring-offset-2 ring-' + (variant === 'default' ? 'gray-300' : variant + '-300') : variants.default}`;
  };

  const getIconStyles = () => {
    if (disabled) return 'text-gray-400';
    if (tool.id === 'reset-drawing' && !disabled) return 'text-red-600';
    const variants = {
      blue: 'text-blue-700', 
      green: 'text-green-700', 
      purple: 'text-purple-700',
      indigo: 'text-indigo-700', 
      red: 'text-red-700', 
      orange: 'text-orange-700',
      default: 'group-hover:text-gray-800'
    };
    return isSelected ? variants[variant] + ' font-bold' : variants.default;
  };

  return (
    <button
      onClick={disabled ? undefined : onClick} 
      className={getButtonStyles()}
      title={tool.label}
      aria-label={tool.label}
      disabled={disabled}
      style={{ fontWeight: isSelected ? 700 : 500 }}
    >
      <tool.icon size={16} className={getIconStyles()} />
      {isSelected && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full opacity-70"></div>
      )}
    </button>
  );
});
ToolButton.displayName = 'ToolButton';

const DropdownMenu = React.memo(({ items, isOpen, onClose, onItemClick }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px] z-50 animate-in slide-in-from-top-2 duration-200 flex flex-col gap-0.5">
        {items.map((item) => (
          <button key={item.id} onClick={() => onItemClick(item)} className="w-full px-2 py-1 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-left transition-colors duration-150 rounded-lg">
            {item.icon && <item.icon size={14} className="text-gray-600" />}
            <span className="text-xs text-gray-700 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
});
DropdownMenu.displayName = 'DropdownMenu';

export default function Toolbar({
  onDownload, onReanalyze, onZoom, onToolSelect, selectedTool: activeTool,
  onHelperToolToggle, showGrid, showLayers, isLocked, zoomValue = 100, onReset, onUndo, canUndo = false
}) {
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
  const [visibleTools, setVisibleTools] = useState([]);
  const [hiddenTools, setHiddenTools] = useState([]);
  const toolbarRef = useRef(null);
  
  const handleToolClick = useCallback((toolId) => {
    if (onToolSelect) {
      onToolSelect(toolId === activeTool ? null : toolId);
    }
  }, [activeTool, onToolSelect]);
  
  const handleViewToolClick = useCallback((toolId) => {
    switch (toolId) {
      case 'zoom-in':
        if (onZoom) onZoom(Math.min(zoomValue + 25, 400));
        break;
      case 'zoom-out':
        if (onZoom) onZoom(Math.max(zoomValue - 25, 25));
        break;
      case 'fit-screen':
        if (onZoom) onZoom(100);
        break;
      case 'reset-size':
        if (onReset) onReset();
        break;
      case 'reset-drawing':
        if (onReset) onReset();
        break;
      case 'undo':
        if (onUndo) onUndo();
        break;
      default:
        break;
    }
  }, [onZoom, zoomValue, onReset, onUndo]);

  const handleHelperToolClick = useCallback((toolId) => {
    if (onHelperToolToggle) {
      onHelperToolToggle(toolId);
    }
  }, [onHelperToolToggle]);

  const toolDefinitions = useMemo(() => ({
    selection: [
      { icon: MousePointer, label: 'Select Tool', id: 'pointer', type: 'tool', priority: 1 },
      { icon: Hand, label: 'Pan Tool', id: 'pan', type: 'tool', priority: 2 },
    ],
    measurement: [
      { icon: Ruler, label: 'Linear Measurement', id: 'linear', type: 'measurement', priority: 3 },
    ],
    drawing: [
      { icon: Square, label: 'Rectangle Tool', id: 'rectangle', type: 'drawing', priority: 4 },
      { icon: MapPin, label: 'Point Tool', id: 'point', type: 'drawing', priority: 5 },
    ],
    view: [
      { icon: Trash, label: 'Reset (Delete)', id: 'reset-drawing', type: 'view', 
        priority: 10, 
        variant: canUndo ? 'red' : 'default',
        disabled: !canUndo
      },
      { icon: RotateCcw, label: 'Reset Size', id: 'reset-size', type: 'view', priority: 9 },
      { icon: Undo, label: 'Undo', id: 'undo', type: 'view', disabled: !canUndo, priority: 11 }
    ],
    helper: [
      { icon: Grid3X3, label: 'Toggle Grid', id: 'grid', type: 'helper', priority: 12 },
      { icon: showLayers ? Eye : EyeOff, label: 'Toggle Layers', id: 'layers', type: 'helper', priority: 13 },
      { icon: isLocked ? Lock : Unlock, label: isLocked ? 'Unlock' : 'Lock', id: 'lock', type: 'helper', priority: 14 }
    ]
  }), [showLayers, isLocked, canUndo]);

  const allTools = useMemo(() => {
    const tools = [
      ...toolDefinitions.selection,
      ...toolDefinitions.measurement,
      ...toolDefinitions.drawing,
      ...toolDefinitions.view,
      ...toolDefinitions.helper,
      ...(onDownload ? [{ icon: Download, label: 'Download', id: 'download', type: 'action', priority: 15 }] : []),
      ...(onReanalyze ? [{ icon: RotateCcw, label: 'Reanalyze', id: 'reanalyze', type: 'action', priority: 16 }] : []),
    ];
    return tools.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }, [toolDefinitions, onDownload, onReanalyze]);

  // حساب المساحة المطلوبة وتحديد الأدوات المرئية والمخفية
  const calculateVisibleTools = useCallback(() => {
    if (!toolbarRef.current) return;
    
    const containerWidth = toolbarRef.current.offsetWidth;
    const baseWidth = 38; // كان 48
    const toolWidth = 26; // كان 32
    const separatorWidth = 13; // كان 16
    const dropdownWidth = 64; // كان 80
    
    // حساب عدد الفواصل (عدد المجموعات - 1)
    const separatorCount = Object.keys(toolDefinitions).length - 1;
    const separatorsWidth = separatorCount * separatorWidth;
    
    // المساحة الكلية المتاحة للأدوات
    const availableWidth = containerWidth - baseWidth - separatorsWidth - dropdownWidth;
    
    // عدد الأدوات التي يمكن عرضها
    const maxVisibleTools = Math.floor(availableWidth / toolWidth);
    
    if (maxVisibleTools >= allTools.length) {
      setVisibleTools(allTools);
      setHiddenTools([]);
    } else {
      setVisibleTools(allTools.slice(0, Math.max(0, maxVisibleTools)));
      setHiddenTools(allTools.slice(Math.max(0, maxVisibleTools)));
    }
  }, [allTools, toolDefinitions]);

  // استخدام ResizeObserver لمراقبة تغييرات حجم الحاوية
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      calculateVisibleTools();
    });

    if (toolbarRef.current) {
      observer.observe(toolbarRef.current);
    }

    calculateVisibleTools(); // حساب أولي

    return () => observer.disconnect();
  }, [calculateVisibleTools]);

  const handleDropdownItemClick = useCallback((item) => {
    setMoreMenuOpen(false);
    switch (item.type) {
      case 'tool':
      case 'measurement':
      case 'drawing':
        handleToolClick(item.id);
        break;
      case 'view':
        handleViewToolClick(item.id);
        break;
      case 'helper':
        handleHelperToolClick(item.id);
        break;
      case 'action':
        if (item.id === 'download' && onDownload) onDownload();
        if (item.id === 'reanalyze' && onReanalyze) onReanalyze();
        break;
    }
  }, [handleToolClick, handleViewToolClick, handleHelperToolClick, onDownload, onReanalyze]);

  const renderToolButton = useCallback((tool) => {
    const getVariantAndSelection = () => {
      switch (tool.type) {
        case 'tool': return { variant: 'blue', isSelected: activeTool === tool.id };
        case 'measurement': return { variant: 'green', isSelected: activeTool === tool.id };
        case 'drawing': 
          if (tool.id === 'point') return { variant: 'orange', isSelected: activeTool === tool.id, isCircular: true };
          return { variant: 'purple', isSelected: activeTool === tool.id };
        case 'helper':
          if (tool.id === 'grid') return { variant: 'purple', isSelected: showGrid };
          if (tool.id === 'layers') return { variant: 'indigo', isSelected: !showLayers };
          if (tool.id === 'lock') return { variant: 'red', isSelected: isLocked };
          return { variant: 'default', isSelected: false };
        default: return { variant: 'default', isSelected: false };
      }
    };

    const getClickHandler = () => {
      if (tool.disabled) return () => {};
      
      switch (tool.type) {
        case 'tool':
        case 'measurement':
        case 'drawing': return () => handleToolClick(tool.id);
        case 'view': return () => handleViewToolClick(tool.id);
        case 'helper':
          if (tool.id === 'lock') return () => handleHelperToolClick('lock');
          return () => handleHelperToolClick(tool.id);
        case 'action':
          if (tool.id === 'download') return onDownload;
          if (tool.id === 'reanalyze') return onReanalyze;
          return () => {};
        default: return () => {};
      }
    };

    const { variant, isSelected, isCircular } = getVariantAndSelection();
    return <ToolButton key={tool.id} tool={tool} isSelected={isSelected} onClick={getClickHandler()} variant={variant} disabled={tool.disabled} isCircular={isCircular} />;
  }, [activeTool, showGrid, showLayers, isLocked, handleToolClick, handleViewToolClick, handleHelperToolClick, onDownload, onReanalyze]);

  // تجميع الأدوات المرئية حسب النوع لإضافة الفواصل
  const groupVisibleTools = useMemo(() => {
    const groups = {};
    visibleTools.forEach(tool => {
      if (!groups[tool.type]) {
        groups[tool.type] = [];
      }
      groups[tool.type].push(tool);
    });
    return groups;
  }, [visibleTools]);

  return (
    <div className="flex items-center justify-center p-3">
      <div
        ref={toolbarRef}
        className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg border border-gray-200/50 hover:shadow-xl transition-shadow duration-300 w-full max-w-2xl mx-auto"
        style={{ minHeight: 45 }}
      >
        {/* الأدوات مع فاصل بين المجموعات */}
        {Object.entries(groupVisibleTools).map(([type, tools], groupIndex) => (
          <React.Fragment key={type}>
            {groupIndex > 0 && <div className="w-px h-6 bg-gray-200/80 mx-1.5 rounded-full" />}
            {tools.map(renderToolButton)}
          </React.Fragment>
        ))}
        {/* زر المزيد إذا كان هناك أدوات مخفية */}
        {hiddenTools.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-200/80 mx-1.5 rounded-full" />
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!isMoreMenuOpen)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 border-2 border-transparent hover:border-gray-200 shadow-sm"
                title="المزيد من الأدوات"
              >
                <MoreHorizontal size={16} />
              </button>
              <DropdownMenu
                items={hiddenTools}
                isOpen={isMoreMenuOpen}
                onClose={() => setMoreMenuOpen(false)}
                onItemClick={handleDropdownItemClick}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}