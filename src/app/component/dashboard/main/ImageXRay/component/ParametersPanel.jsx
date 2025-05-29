"use client";
import { useMemo, useCallback } from 'react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Sun, Contrast, ZoomIn, PanelLeftClose, Bone, GitFork, AlertCircle } from "lucide-react";

const COLOR_PALETTE = {
  primary: 'hsl(210, 80%, 42%)',
  secondary: 'hsl(220, 14%, 96%)',
  accent: 'hsl(350, 89%, 60%)',
  success: 'hsl(142, 71%, 45%)',
  warning: 'hsl(38, 92%, 50%)',
  info: 'hsl(199, 89%, 48%)'
};

const FILTER_PRESETS = {
  none: { brightness: 100, contrast: 0, saturation: 0 },
  grayscale: { brightness: 100, contrast: 100, saturation: 0 },
  sepia: { brightness: 100, contrast: 90, saturation: 50 },
  dental: { brightness: 110, contrast: 120, saturation: 120 },
  xray: { brightness: 120, contrast: 110, saturation: 80 }
};

export default function ParametersPanel({ settings, onSettingChange, onClose, useFilter }) {
  // Destructure filter states from useFilter prop
  const [
    { brightness, setBrightness },
    { contrast, setContrast },
    { saturation, setSaturation }
  ] = useFilter;

  const filterControls = useMemo(() => [
    {
      icon: <Sun className="h-4 w-4" style={{ color: COLOR_PALETTE.warning }} />,
      label: "Brightness",
      key: "brightness",
      min: 0,
      max: 200,
      step: 5,
      filter: (value) => `brightness(${value}%)`
    },
    {
      icon: <Contrast className="h-4 w-4" style={{ color: COLOR_PALETTE.info }} />,
      label: "Contrast",
      key: "contrast",
      min: 0,
      max: 200,
      step: 5,
      filter: (value) => `contrast(${value}%)`
    },
    {
      icon: <GitFork className="h-4 w-4" style={{ color: COLOR_PALETTE.primary }} />,
      label: "Saturation",
      key: "saturation",
      min: 0,
      max: 200,
      step: 5,
      filter: (value) => `saturate(${value}%)`
    }
  ], []);

  // Apply filters using useFilter values
  const applyFilters = useCallback(() => {
    return [
      brightness !== 100 && `brightness(${brightness}%)`,
      contrast !== 100 && `contrast(${contrast}%)`,
      saturation !== 100 && `saturate(${saturation}%)`
    ].filter(Boolean).join(' ');
  }, [brightness, contrast, saturation]);

  // Handle preset changes
  const handlePreset = useCallback((preset) => {
    const presetValues = FILTER_PRESETS[preset];
    Object.entries(presetValues).forEach(([key, value]) => {
      switch (key) {
        case "brightness":
          setBrightness(value);
          break;
        case "contrast":
          setContrast(value);
          break;
        case "saturation":
          setSaturation(value);
          break;
      }
      onSettingChange(key, value);
    });
  }, [onSettingChange, setBrightness, setContrast, setSaturation]);

  // Problem controls renderer
  const renderProblemControls = useCallback(() => {
    const problemConfigs = {
      cavity: {
        icon: <AlertCircle className="h-4 w-4" style={{ color: COLOR_PALETTE.accent }} />,
        label: "Cavities",
        description: "Show dental cavities",
        color: COLOR_PALETTE.accent
      },
      gingivitis: {
        icon: <AlertCircle className="h-4 w-4" style={{ color: COLOR_PALETTE.success }} />,
        label: "Gingivitis",
        description: "Show gum inflammation",
        color: COLOR_PALETTE.success
      },
      fracture: {
        icon: <AlertCircle className="h-4 w-4" style={{ color: COLOR_PALETTE.warning }} />,
        label: "Fractures",
        description: "Show tooth fractures",
        color: COLOR_PALETTE.warning
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium">Show All Problems</p>
              <p className="text-xs text-gray-500">Toggle all dental problems visibility</p>
            </div>
          </div>
          <Switch
            checked={settings.showProblems}
            onCheckedChange={(checked) => {
              onSettingChange('showProblems', checked);
              Object.keys(settings.problems).forEach(key => {
                onSettingChange(key, checked, 'problems');
              });
            }}
          />
        </div>

        <div className="space-y-2 pl-2 border-l-2 border-gray-100 ml-3">
          {Object.entries(settings.problems).map(([key, value]) => {
            const config = problemConfigs[key] || {
              icon: <GitFork className="h-4 w-4 text-gray-500" />,
              label: key.charAt(0).toUpperCase() + key.slice(1),
              description: `Show ${key} markers`,
              color: COLOR_PALETTE.info
            };

            return (
              <div 
                key={key} 
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                style={{ opacity: settings.showProblems ? 1 : 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <div style={{ color: config.color }}>
                    {config.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{config.label}</p>
                    <p className="text-xs text-gray-500">{config.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.showProblems && value}
                  onCheckedChange={(checked) => onSettingChange(key, checked, 'problems')}
                  disabled={!settings.showProblems}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [settings, onSettingChange]);

  // Toggle controls configuration
  const toggleControls = useMemo(() => [
    {
      label: "Show Teeth",
      key: "showTeeth",
      description: "Display tooth structures"
    },
    {
      icon: <Bone className="h-4 w-4" style={{ color: '#8B4513' }} />,
      label: "Show Jaw",
      key: "showJaw",
      description: "Display jaw bone structure"
    },
    {
      icon: <GitFork className="h-4 w-4" style={{ color: '#5D4037' }} />,
      label: "Show Roots",
      key: "showRoots",
      description: "Display tooth roots",
      disabled: !settings.showTeeth
    },
    {
      icon: <GitFork className="h-4 w-4" style={{ color: '#7B1FA2' }} />,
      label: "Show Nerves",
      key: "showNerves",
      description: "Display dental nerves",
      disabled: !settings.showTeeth
    }
  ], [settings.showTeeth]);

  // Advanced controls configuration
  const advancedControls = useMemo(() => [
    {
      icon: <GitFork className="h-4 w-4" style={{ color: COLOR_PALETTE.primary }} />,
      label: "Tooth Numbering",
      key: "showNumbering",
      description: "Show FDI numbering system"
    },
    {
      icon: <GitFork className="h-4 w-4" style={{ color: COLOR_PALETTE.accent }} />,
      label: "Cavities Highlight",
      key: "showCavities",
      description: "Mark detected cavities"
    }
  ], []);

  return (
    <div 
      className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl z-20 p-5 overflow-y-auto border-r"
      style={{ borderColor: COLOR_PALETTE.secondary }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg" style={{ color: COLOR_PALETTE.primary }}>
          Dental View Settings
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="hover:bg-gray-100 rounded-full"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-8">
        {/* Image Filters Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">IMAGE FILTERS</h4>
          
          {/* Filter Presets */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {Object.keys(FILTER_PRESETS).map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => handlePreset(preset)}
                className="text-xs"
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </Button>
            ))}
          </div>

          {/* Filter Sliders */}
          {filterControls.map((control) => {
            let value, setValue;
            switch (control.key) {
              case "brightness":
                value = brightness;
                setValue = setBrightness;
                break;
              case "contrast":
                value = contrast;
                setValue = setContrast;
                break;
              case "saturation":
                value = saturation;
                setValue = setSaturation;
                break;
              default:
                value = 100;
            }

            return (
              <div key={control.key} className="space-y-2">
                <div className="flex items-center gap-3">
                  {control.icon}
                  <span className="text-sm font-medium">{control.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[value]}
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    onValueChange={(val) => {
                      setValue(val[0]);
                      onSettingChange(control.key, val[0]);
                    }}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-10 text-right">
                    {value}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Zoom Control */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <ZoomIn className="h-4 w-4" style={{ color: COLOR_PALETTE.success }} />
            <span className="text-sm font-medium">Zoom</span>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              value={[settings.zoom ?? 100]}
              min={50}
              max={200}
              step={5}
              onValueChange={(val) => onSettingChange('zoom', val[0])}
              className="flex-1"
            />
            <span className="text-xs font-mono w-10 text-right">
              {settings.zoom ?? 100}%
            </span>
          </div>
        </div>

        {/* Dental Structures Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">DENTAL STRUCTURES</h4>
          <div className="space-y-2">
            {toggleControls.map((control) => (
              <div 
                key={control.key} 
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  control.disabled ? 'opacity-60' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {control.icon}
                  <div>
                    <p className={`text-sm font-medium ${control.disabled ? 'opacity-75' : ''}`}>
                      {control.label}
                    </p>
                    <p className="text-xs text-gray-500">{control.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[control.key]}
                  onCheckedChange={(checked) => onSettingChange(control.key, checked)}
                  disabled={control.disabled}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Options Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">ADVANCED OPTIONS</h4>
          <div className="space-y-2">
            {advancedControls.map((control) => (
              <div 
                key={control.key} 
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {control.icon}
                  <div>
                    <p className="text-sm font-medium">{control.label}</p>
                    <p className="text-xs text-gray-500">{control.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[control.key]}
                  onCheckedChange={(checked) => onSettingChange(control.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dental Problems Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">DENTAL PROBLEMS</h4>
          {renderProblemControls()}
        </div>
      </div>
    </div>
  );
}