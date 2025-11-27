"use client";
import React, { useCallback } from 'react';
import {
  MousePointer, Hand, RotateCcw, Grid3X3, Download, Eye, EyeOff, Ruler, ZoomIn, ZoomOut, Maximize, Lock, Unlock, Square, Undo, MapPin, Trash
} from 'lucide-react';
import { useLayout } from '@/contexts/LayoutContext';

const ToolButton = React.memo(({ tool, isSelected, onClick, variant = 'default', disabled = false, isCircular = false }) => {
  const getButtonStyles = () => {
    const baseStyles = isCircular ? "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 group relative shadow-sm mb-2" : "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group relative shadow-sm mb-2";
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
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={getButtonStyles()}
      title={tool.label}
      aria-label={tool.label}
      disabled={disabled}
      style={{ fontWeight: isSelected ? 700 : 500 }}
    >
      <tool.icon size={16} />
      {isSelected && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full opacity-70"></div>
      )}
    </button>
  );
});
ToolButton.displayName = 'ToolButton';

export default function QuickToolsVertical({
  onToolSelect, selectedTool: activeTool, onZoom, onReset, onUndo, canUndo = false, onHelperToolToggle, showGrid, showLayers, isLocked, onDownload, onReanalyze, zoomValue = 100
}) {
  const { setLayout } = useLayout();
  // Tool definitions (vertical order, with separators)
  const tools = [
    // Selection
    { icon: MousePointer, label: 'Select Tool', id: 'pointer', type: 'tool', variant: 'blue' },
    { icon: Hand, label: 'Pan Tool', id: 'pan', type: 'tool', variant: 'blue' },
    { icon: Maximize, label: 'Full', id: 'full', type: 'action', variant: 'default' },
    { type: 'separator' },
    // Helper
    { icon: Grid3X3, label: 'Toggle Grid', id: 'grid', type: 'helper', variant: 'purple', isSelected: showGrid },
    { icon: showLayers ? Eye : EyeOff, label: 'Toggle Layers', id: 'layers', type: 'helper', variant: 'indigo', isSelected: !showLayers },
    { icon: isLocked ? Lock : Unlock, label: isLocked ? 'Unlock' : 'Lock', id: 'lock', type: 'helper', variant: 'red', isSelected: isLocked },
    { type: 'separator' },
    // Actions
    ...(onDownload ? [{ icon: Download, label: 'Download', id: 'download', type: 'action', variant: 'default' }] : []),
    ...(onReanalyze ? [{ icon: RotateCcw, label: 'Reanalyze', id: 'reanalyze', type: 'action', variant: 'default' }] : []),
  ];

  const handleToolClick = (tool) => {
    if (tool.disabled) return;
    switch (tool.type) {
      case 'tool':
        if (onToolSelect) onToolSelect(tool.id === activeTool ? null : tool.id);
        break;
      case 'action':
        if (tool.id === 'full') setLayout('XRAY_SIDE');
        if (tool.id === 'download' && onDownload) onDownload();
        if (tool.id === 'reanalyze' && onReanalyze) onReanalyze();
        break;
      case 'helper':
        if (onHelperToolToggle) onHelperToolToggle(tool.id);
        break;
      default:
        break;
    }
  };

  // Selection logic for highlighting
  const isButtonSelected = (tool) => {
    if (tool.type === 'tool' || tool.type === 'measurement' || tool.type === 'drawing') {
      return activeTool === tool.id;
    }
    if (tool.id === 'grid') return !!showGrid;
    if (tool.id === 'layers') return !showLayers;
    if (tool.id === 'lock') return !!isLocked;
    return false;
  };

  return (
    <div className="flex flex-col items-center rounded-2xl py-4 px-2 shadow-lg border border-gray-200/50 hover:shadow-xl transition-shadow duration-300 w-14 min-h-[340px] gap-0 select-none">
      {tools.map((tool, idx) => {
        if (tool.type === 'separator') {
          return <div key={idx} className="w-8 h-px bg-gray-200/80 my-2 rounded-full" />;
        }
        return (
          <ToolButton
            key={tool.id}
            tool={tool}
            isSelected={isButtonSelected(tool)}
            onClick={() => handleToolClick(tool)}
            variant={tool.variant}
            disabled={tool.disabled}
            isCircular={tool.isCircular}
          />
        );
      })}
    </div>
  );
} 