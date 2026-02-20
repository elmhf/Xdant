"use client";
import React, { useCallback, useMemo } from 'react';
import {
  Hand, RotateCcw, Grid3X3, Download, Eye, EyeOff, Ruler, ZoomIn, ZoomOut, Maximize, Square, Undo, MapPin, Trash, Pencil, X
} from 'lucide-react';
import { useLayout } from '@/contexts/LayoutContext';

const COLORS = [
  { id: 'red', value: '#FF5050', label: 'Red' },
  { id: 'green', value: '#4ADE80', label: 'Green' },
  { id: 'blue', value: '#60A5FA', label: 'Blue' }
];

const ToolButton = React.memo(({ tool, isSelected, onClick, variant = 'default', disabled = false, isCircular = false, className = "" }) => {
  const getButtonStyles = () => {
    const baseStyles = isCircular ? `w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 group relative mb-1 ${className}` : `w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group relative mb-1 ${className}`;

    const inactiveStyle = 'bg-[#1e1e2e] text-gray-400 hover:text-white border border-white/5 shadow-inner';
    const activeStyle = 'bg-[#6366f1] text-white border border-white/10 scale-105 shadow-xl';

    if (disabled) {
      return `${baseStyles} bg-gray-800/50 text-gray-600 cursor-not-allowed opacity-50`;
    }

    return `${baseStyles} ${isSelected ? activeStyle : inactiveStyle}`;
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
      <tool.icon size={20} />

    </button>
  );
});
ToolButton.displayName = 'ToolButton';

export default function QuickToolsVertical({
  onToolSelect, selectedTool: activeTool, onZoom, onReset, onToggleFullScreen, onUndo, canUndo = false, onHelperToolToggle, showGrid, showLayers, isLocked, onDownload, onReanalyze, zoomValue = 100,
  selectedColor, onColorChange
}) {
  const { setLayout } = useLayout();
  const isDrawMode = activeTool === 'draw';

  const tools = useMemo(() => {
    if (isDrawMode) {
      return [
        { icon: Pencil, label: 'Draw Mode', id: 'draw', type: 'tool', variant: 'orange' },
        { type: 'color-picker' },
        { icon: Undo, label: 'Undo', id: 'undo', type: 'action', variant: 'blue', disabled: !canUndo },
        { icon: Trash, label: 'Clear All', id: 'clear', type: 'action', variant: 'red' },
        { type: 'separator' },
        { icon: X, label: 'Exit Draw', id: 'exit', type: 'action', variant: 'default' }
      ];
    }

    return [
      { icon: Hand, label: 'Pan Tool', id: 'pan', type: 'tool', variant: 'blue' },
      { icon: Pencil, label: 'Draw Tool', id: 'draw', type: 'tool', variant: 'orange' },
      { type: 'separator' },
      { icon: Grid3X3, label: 'Toggle Grid', id: 'grid', type: 'helper', variant: 'purple', isSelected: showGrid },
      { icon: showLayers ? Eye : EyeOff, label: 'Toggle Layers', id: 'layers', type: 'helper', variant: 'indigo', isSelected: !showLayers },
      { type: 'separator' },
      { icon: Maximize, label: 'Full Screen', id: 'fullscreen', type: 'action', variant: 'default' },
      { icon: RotateCcw, label: 'Reset Zoom', id: 'reset', type: 'action', variant: 'default' },
      ...(onDownload ? [{ icon: Download, label: 'Download', id: 'download', type: 'action', variant: 'default' }] : []),
    ];
  }, [isDrawMode, canUndo, showGrid, showLayers, onDownload]);

  const handleToolClick = (tool) => {
    if (tool.disabled) return;
    switch (tool.id) {
      case 'exit':
        if (onToolSelect) onToolSelect(null);
        break;
      case 'undo':
        if (onUndo) onUndo();
        break;
      case 'clear':
        if (onReset) onReset();
        break;
      case 'fullscreen':
        if (onToggleFullScreen) onToggleFullScreen();
        break;
      case 'reset':
        if (onReset) onReset();
        break;
      case 'download':
        if (onDownload) onDownload();
        break;
      case 'grid':
      case 'layers':
        if (onHelperToolToggle) onHelperToolToggle(tool.id);
        break;
      default:
        if (tool.type === 'tool') {
          if (onToolSelect) onToolSelect(tool.id === activeTool ? null : tool.id);
        }
        break;
    }
  };

  // Selection logic for highlighting
  const isButtonSelected = (tool) => {
    if (tool.id === 'draw' || tool.id === 'pan') return activeTool === tool.id;
    if (tool.id === 'grid') return !!showGrid;
    if (tool.id === 'layers') return !showLayers;
    return false;
  };

  return (
    <div className="flex flex-col items-center py-3 px-2 w-14 min-h-[100px] gap-0.5 select-none animate-in fade-in zoom-in-95">
      {tools.map((tool, idx) => {
        if (tool.type === 'separator') {
          return null;
        }
        if (tool.id === 'draw') {
          return (
            <React.Fragment key={tool.id}>
              <ToolButton
                tool={tool}
                isSelected={isButtonSelected(tool)}
                onClick={() => handleToolClick(tool)}
                variant={tool.variant}
                disabled={tool.disabled}
              />
            </React.Fragment>
          )
        }
        if (tool.type === 'color-picker') {
          return (
            <div key="colors" className="flex flex-col items-center gap-2 py-1 mb-2 animate-in slide-in-from-top-2 duration-300">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onColorChange?.(color.value)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group relative border border-white/5 ${selectedColor === color.value ? 'bg-[#6366f1] border-white/20 scale-105 shadow-xl' : 'bg-[#1e1e2e] hover:bg-[#252545]'}`}
                  title={color.label}
                >
                  <div
                    className={`w-4 h-4 rounded-full shadow-lg transition-transform duration-300 ${selectedColor === color.value ? 'scale-125' : 'group-hover:scale-110'}`}
                    style={{ backgroundColor: color.value }}
                  />
                  {selectedColor === color.value && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          );
        }
        return (
          <ToolButton
            key={tool.id}
            tool={tool}
            isSelected={isButtonSelected(tool)}
            onClick={() => handleToolClick(tool)}
            variant={tool.variant}
            disabled={tool.disabled}
          />
        );
      })}
    </div>
  );
}