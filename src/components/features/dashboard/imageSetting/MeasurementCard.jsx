'use client';
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Ruler,
  Move,
  Circle,
  Square,
  Hexagon,
  PenTool,
  ArrowUpRight,
  Grid,
  MousePointer,
  Cross,
  CornerRightDown,
  CornerUpRight,
  Dot,
  ArrowRight,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  Layers,
  Palette,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  Minimize,
  Save,
  FolderOpen,
  FileText,
  Camera,
  Lock,
  Unlock,
  Minus
} from 'lucide-react';

const measurementTools = [
  { id: 'select', icon: MousePointer, label: 'Select' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'angle', icon: CornerRightDown, label: 'Angle' },
  { id: 'vertical', icon: Move, label: 'Vertical' },
  { id: 'horizontal', icon: Move, label: 'Horizontal' },
  { id: 'curve', icon: CornerUpRight, label: 'Curve' },
  { id: 'parallel', icon: Minus, label: 'Parallel' },
  { id: 'perpendicular', icon: Cross, label: 'Perpendicular' },
  { id: 'dot', icon: Dot, label: 'Point' },
  { id: 'cross', icon: Cross, label: 'Cross' },
  { id: 'grid', icon: Grid, label: 'Grid' },
  { id: 'ruler', icon: Ruler, label: 'Ruler' },
];

const drawingTools = [
  { id: 'pen', icon: PenTool, label: 'Pen' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Arrow' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'square', icon: Square, label: 'Square' },
  { id: 'hexagon', icon: Hexagon, label: 'Polygon' },
  { id: 'dot', icon: Dot, label: 'Dot' },
];

const panelTools = [
  { id: 'layers', icon: Layers, label: 'Layers', category: 'view' },
  { id: 'visibility', icon: Eye, label: 'Show/Hide', category: 'view' },
  { id: 'lock', icon: Lock, label: 'Lock/Unlock', category: 'edit' },
  { id: 'copy', icon: Copy, label: 'Copy', category: 'edit' },
  { id: 'delete', icon: Trash2, label: 'Delete', category: 'edit' },
  { id: 'undo', icon: Undo2, label: 'Undo', category: 'history' },
  { id: 'redo', icon: Redo2, label: 'Redo', category: 'history' },
  { id: 'zoom-in', icon: ZoomIn, label: 'Zoom In', category: 'view' },
  { id: 'zoom-out', icon: ZoomOut, label: 'Zoom Out', category: 'view' },
  { id: 'rotate', icon: RotateCcw, label: 'Rotate', category: 'transform' },
  { id: 'flip-h', icon: FlipHorizontal, label: 'Flip H', category: 'transform' },
  { id: 'flip-v', icon: FlipVertical, label: 'Flip V', category: 'transform' },
];

const fileTools = [
  { id: 'save', icon: Save, label: 'Save' },
  { id: 'open', icon: FolderOpen, label: 'Open' },
  { id: 'export', icon: Download, label: 'Export' },
  { id: 'import', icon: Upload, label: 'Import' },
  { id: 'capture', icon: Camera, label: 'Capture' },
  { id: 'report', icon: FileText, label: 'Report' },
];

const colors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#000000', '#6b7280', '#ffffff'
];

export default function EnhancedMeasurementPanel() {
  const [activeTool, setActiveTool] = useState('select');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [showLayers, setShowLayers] = useState(true);
  const [lockedItems, setLockedItems] = useState([]);

  const handleToolChange = (toolId) => {
    setActiveTool(toolId);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const toggleLayers = () => {
    setShowLayers(!showLayers);
  };

  return (
    <div className="w-80 space-y-4">
      {/* File Operations */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">File Operations</h3>
          <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
            Tools
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {fileTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant="outline"
                size="sm"
                className="h-9 flex flex-col items-center justify-center gap-1 text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
                onClick={() => console.log(`${tool.label} clicked`)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{tool.label}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Main Tools */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-0">
        {/* Investigation Type */}
        <div className="p-4 pb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Investigation Type</label>
          <Select defaultValue="select">
            <SelectTrigger className="w-full h-9 rounded-2xl bg-gray-50 border-gray-200 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              <SelectValue placeholder="Select Investigation" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="select">Select Investigation</SelectItem>
              <SelectItem value="digital">Digital X-Ray</SelectItem>
              <SelectItem value="panoramic">Panoramic X-Ray</SelectItem>
              <SelectItem value="ceph">Cephalometric</SelectItem>
              <SelectItem value="cbct">CBCT Scan</SelectItem>
              <SelectItem value="intraoral">Intraoral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-gray-200" />

        {/* Measurement Tools */}
        <div className="p-4 pb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Measurement Tools</label>
          <div className="grid grid-cols-4 gap-2 bg-gray-50 rounded-2xl p-3 border border-gray-200">
            {measurementTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? "default" : "ghost"}
                  size="icon"
                  className={`h-9 w-9 rounded-2xl transition-all ${activeTool === tool.id
                      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                      : 'text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm'
                    }`}
                  onClick={() => handleToolChange(tool.id)}
                  title={tool.label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Drawing Tools */}
        <div className="p-4 pb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Drawing Tools</label>
          <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-2xl p-3 border border-gray-200">
            {drawingTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? "default" : "ghost"}
                  size="icon"
                  className={`h-9 w-9 rounded-2xl transition-all ${activeTool === tool.id
                      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                      : 'text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm'
                    }`}
                  onClick={() => handleToolChange(tool.id)}
                  title={tool.label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Color Palette */}
        <div className="p-4 pb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
          <div className="flex flex-wrap gap-2 bg-gray-50 rounded-2xl p-3 border border-gray-200">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === color
                    ? 'border-gray-400 shadow-md'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
                title={`Select ${color}`}
              />
            ))}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Panel Tools */}
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Panel Tools</label>
          <div className="grid grid-cols-4 gap-2 bg-gray-50 rounded-2xl p-3 border border-gray-200">
            {panelTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-2xl text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm transition-all"
                  onClick={() => {
                    if (tool.id === 'visibility') toggleLayers();
                    console.log(`${tool.label} clicked`);
                  }}
                  title={tool.label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Layers Panel */}
      {showLayers && (
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Layers</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLayers}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <Minimize className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {['Measurements', 'Drawings', 'Annotations', 'Grid'].map((layer, index) => (
              <div key={layer} className="flex items-center justify-between p-2 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <span className="text-sm text-gray-700">{layer}</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  {Math.floor(Math.random() * 10) + 1}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

      )}

      {/* Status Bar */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Ready</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Tool: {measurementTools.find(t => t.id === activeTool)?.label || drawingTools.find(t => t.id === activeTool)?.label}</span>
            <span>Color: {selectedColor}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}