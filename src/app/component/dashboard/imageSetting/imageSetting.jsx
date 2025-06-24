"use client";
import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip } from "@/components/ui/tooltip";
import {
  SlidersHorizontal,
  Sparkles,
  Ruler,
  Layers,
  RotateCcw,
  Save,
  Download,
  Share2,
  AlertTriangle,
  Target,
  Triangle,
  Square,
  Circle,
  Sun,
  Moon,
  Globe2,
  Volume2,
  Text
} from 'lucide-react';

const ControlSection = ({ icon, title, children }) => (
  <AccordionItem value={title} className="border-b-0 mb-2 bg-white rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
    <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 rounded-xl text-slate-800 hover:no-underline">
      <div className="flex items-center gap-3">
        {React.cloneElement(icon, { className: "w-4 h-4 text-blue-500" })}
        <span className="font-semibold text-sm">{title}</span>
      </div>
    </AccordionTrigger>
    <AccordionContent className="pt-1.5 pb-3 px-4 space-y-4 border-t border-slate-100">
      {children}
    </AccordionContent>
  </AccordionItem>
);

const SliderControl = ({ label, value, onValueChange, min, max, step, unit }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
        {value}{unit}
      </span>
    </div>
    <Slider
      value={[value]}
      onValueChange={(val) => onValueChange(val[0])}
      min={min}
      max={max}
      step={step}
    />
  </div>
);

const SwitchControl = ({ label, description, checked, onCheckedChange }) => (
    <div className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
        <div className="flex-1 pr-4">
            <Label className="text-sm font-medium text-slate-800">{label}</Label>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
);

export default function CleanImagePanel() {
  // User Experience Settings
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState('en');
  const [fontSize, setFontSize] = useState(16);
  const [sound, setSound] = useState(false);

  const [adjustments, setAdjustments] = useState({
    contrast: 42,
    brightness: 18,
    gamma: 1.4,
    clarity: 65,
    sharpness: 35,
    windowing: 50,
  });

  const [aiFilters, setAiFilters] = useState({
    dentalEnhancement: true,
    noiseReduction: true,
    edgeEnhancement: true,
    adaptiveContrast: true,
  });

  const [tools, setTools] = useState({
      zoom: 125,
      measurementTool: 'linear',
  });

  const [visibility, setVisibility] = useState({
    showTeeth: true,
    showCrown: true,
    showRoots: true,
    showJaw: true,
    showNerve: false,
    showImplants: true,
    showProblems: true,
  });

  const [diagnosticFindings, setDiagnosticFindings] = useState([
    { 
      id: 'dx_001', 
      type: 'Caries', 
      location: 'Tooth #16 (Mesial)', 
      severity: 'Moderate', 
      confidence: 94,
      enabled: true,
    },
    { 
      id: 'dx_002', 
      type: 'Bone Loss', 
      location: 'Mandibular Anterior', 
      severity: 'Mild', 
      confidence: 88,
      enabled: true,
    },
    { 
      id: 'dx_003', 
      type: 'Impacted Tooth', 
      location: 'Tooth #38', 
      severity: 'Severe', 
      confidence: 96,
      enabled: false,
    }
  ]);

  const handleAdjustmentChange = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterChange = (key, value) => {
    setAiFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleToolChange = (key, value) => {
    setTools(prev => ({ ...prev, [key]: value }));
  };
  
  const handleVisibilityChange = (key, value) => {
    setVisibility(prev => ({...prev, [key]: value}));
  }

  const handleFindingToggle = (id) => {
    setDiagnosticFindings(prev => 
        prev.map(finding => 
            finding.id === id ? { ...finding, enabled: !finding.enabled } : finding
        )
    );
  };

  const resetAll = () => {
      setAdjustments({ contrast: 50, brightness: 50, gamma: 1.0, clarity: 50, sharpness: 50, windowing: 50 });
      setAiFilters({ dentalEnhancement: true, noiseReduction: true, edgeEnhancement: true, adaptiveContrast: true });
      setTools({ zoom: 100, measurementTool: 'linear' });
      setVisibility({ showTeeth: true, showCrown: true, showRoots: true, showJaw: true, showNerve: false, showImplants: true, showProblems: true });
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
        case 'Severe': return 'bg-red-100 text-red-800';
        case 'Moderate': return 'bg-orange-100 text-orange-800';
        case 'Mild': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-slate-100 text-slate-800';
    }
  }

  const analysisTools = [
      { id: 'linear', label: 'Linear', icon: <Ruler size={20}/> },
      { id: 'angular', label: 'Angular', icon: <Triangle size={20} /> },
      { id: 'area', label: 'Area', icon: <Square size={20} /> },
      { id: 'circular', label: 'Circular', icon: <Circle size={20} /> },
  ];

  return (
    <div className={`bg-[#F8F9FA] scrollbar-hide no-scrollbar rounded-xl text-[#333] w-full max-w-[100%] max-h-[100%] border-r border-[#E0E0E0] flex flex-col font-sans transition-all`} style={{ fontSize: fontSize }}>



      <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-hide p-2.5">
        <Accordion type="multiple" defaultValue={['Image Adjustments', 'AI Filters', 'Measurement & Analysis Tools', 'Diagnostic Findings']} className="w-full space-y-2">
          
          <ControlSection icon={<SlidersHorizontal />} title="Image Adjustments">
            <SliderControl label="Contrast" value={adjustments.contrast} onValueChange={(v) => handleAdjustmentChange('contrast', v)} min={0} max={100} step={1} unit="%" />
            <SliderControl label="Brightness" value={adjustments.brightness} onValueChange={(v) => handleAdjustmentChange('brightness', v)} min={0} max={100} step={1} unit="%" />
            <SliderControl label="Gamma" value={adjustments.gamma} onValueChange={(v) => handleAdjustmentChange('gamma', v)} min={0.1} max={2.5} step={0.1} unit="" />
            <SliderControl label="Clarity" value={adjustments.clarity} onValueChange={(v) => handleAdjustmentChange('clarity', v)} min={0} max={100} step={1} unit="%" />
            <SliderControl label="Sharpness" value={adjustments.sharpness} onValueChange={(v) => handleAdjustmentChange('sharpness', v)} min={0} max={100} step={1} unit="%" />
            <SliderControl label="Window/Level" value={adjustments.windowing} onValueChange={(v) => handleAdjustmentChange('windowing', v)} min={0} max={100} step={1} unit="%" />
          </ControlSection>

          <ControlSection icon={<Sparkles />} title="AI Filters">
            <SwitchControl label="Dental Enhancement" description="Specialized filters for dental anatomy" checked={aiFilters.dentalEnhancement} onCheckedChange={(c) => handleFilterChange('dentalEnhancement', c)} />
            <SwitchControl label="Advanced Denoising" description="AI-powered noise removal" checked={aiFilters.noiseReduction} onCheckedChange={(c) => handleFilterChange('noiseReduction', c)} />
            <SwitchControl label="Edge Enhancement" description="Sharpen anatomical boundaries" checked={aiFilters.edgeEnhancement} onCheckedChange={(c) => handleFilterChange('edgeEnhancement', c)} />
            <SwitchControl label="Adaptive Contrast" description="Context-aware contrast adjustment" checked={aiFilters.adaptiveContrast} onCheckedChange={(c) => handleFilterChange('adaptiveContrast', c)} />
          </ControlSection>
          
          <ControlSection icon={<Ruler />} title="Measurement & Analysis Tools">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'linear', label: 'Linear', icon: <Ruler size={16} /> },
                  { id: 'angular', label: 'Angular', icon: <Triangle size={16} /> },
                  { id: 'area', label: 'Area', icon: <Square size={16} /> },
                  { id: 'circular', label: 'Circular', icon: <Circle size={16} /> },
                ].map(tool => (
                  <Button
                    key={tool.id}
                    variant={tools.measurementTool === tool.id ? "secondary" : "outline"}
                    className={`flex items-center justify-center gap-1.5 h-8 rounded-lg border ${tools.measurementTool === tool.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-[#E0E0E0] bg-white text-[#333]'}`}
                    onClick={() => handleToolChange('measurementTool', tool.id)}
                  >
                    {tool.icon}
                    <span className="text-xs font-semibold">{tool.label}</span>
                  </Button>
                ))}
              </div>

              <Button className="w-full bg-[#2196F3] hover:bg-blue-700 text-white font-semibold rounded-lg shadow text-sm" style={{border: 'none'}}>
                Start Measurement
              </Button>

              <div className="flex items-center justify-between bg-[#F2F4F7] border border-[#E0E0E0] rounded-lg px-3 py-2 mt-2">
                <div>
                  <span className="text-xs text-[#6C757D]">Last Value:</span>
                  <span className="ml-2 text-sm font-bold text-[#333]">
                    {tools.measurementTool === 'linear' && '23.5 mm'}
                    {tools.measurementTool === 'angular' && '45.2°'}
                    {tools.measurementTool === 'area' && '12.8 mm²'}
                    {tools.measurementTool === 'circular' && '7.1 mm'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" className="border-[#E0E0E0]" title="Copy">
                    <svg width="16" height="16" fill="none" stroke="#2196F3" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="3" y="3" width="13" height="13" rx="2"/></svg>
                  </Button>
                  <Button size="icon" variant="outline" className="border-[#E0E0E0]" title="Reset">
                    <RotateCcw className="w-4 h-4 text-slate-500" />
                  </Button>
                </div>
              </div>
            </div>
          </ControlSection>

          <ControlSection icon={<AlertTriangle />} title="Diagnostic Findings">
            <SwitchControl 
                label="Show All Detections"
                description="Toggle visibility of all findings"
                checked={visibility.showProblems}
                onCheckedChange={(c) => handleVisibilityChange('showProblems', c)}
            />
            <div className="space-y-2 pt-2">
                {diagnosticFindings.map(finding => (
                    <div key={finding.id} className="p-3 bg-[#F2F4F7] rounded-lg border border-[#E0E0E0]">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 pr-2">
                                <p className="text-sm font-semibold text-[#333]">{finding.type}</p>
                                <p className="text-xs text-[#6C757D]">{finding.location}</p>
                            </div>
                            <Switch 
                                checked={finding.enabled}
                                onCheckedChange={() => handleFindingToggle(finding.id)}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E0E0E0]">
                             <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSeverityBadge(finding.severity)}`}>
                                {finding.severity}
                            </span>
                             <div className="flex items-center gap-1.5">
                                <Target className="w-3 h-3 text-slate-500" />
                                <span className="text-xs font-mono text-[#6C757D]">{finding.confidence}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ControlSection>

          <ControlSection icon={<Layers />} title="Layer Visibility">
            <SwitchControl label="Teeth" checked={visibility.showTeeth} onCheckedChange={(c) => handleVisibilityChange('showTeeth', c)} />
            <SwitchControl label="Crowns & Fillings" checked={visibility.showCrown} onCheckedChange={(c) => handleVisibilityChange('showCrown', c)} />
            <SwitchControl label="Root Structure" checked={visibility.showRoots} onCheckedChange={(c) => handleVisibilityChange('showRoots', c)} />
            <SwitchControl label="Jaw & Bone" checked={visibility.showJaw} onCheckedChange={(c) => handleVisibilityChange('showJaw', c)} />
            <SwitchControl label="Nerve Canals" checked={visibility.showNerve} onCheckedChange={(c) => handleVisibilityChange('showNerve', c)} />
            <SwitchControl label="Implants" checked={visibility.showImplants} onCheckedChange={(c) => handleVisibilityChange('showImplants', c)} />
            <SwitchControl label="AI Detections" checked={visibility.showProblems} onCheckedChange={(c) => handleVisibilityChange('showProblems', c)} />
          </ControlSection>

        </Accordion>
      </div>

      
    </div>
  );
}