import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  FileText,
  Layout,
  Shield
} from 'lucide-react';
import { useDentalSettings } from '@/hooks/SettingHooks/useDentalSettings ';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

const ReportSettings = ({ settings, updateSetting, resetSettings }) => {
  const { t } = useTranslation();
  
useEffect(() => {console.log("settings",settings)}, [settings]);
  const [expandedSections, setExpandedSections] = useState({
    basic: false,
    page: false,
    quality: false,
    security: false,
    CBCTAnalysis: false,
    Jaw: false,
    report: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatLabel = (key) => {
    const translations = {
      // Basic
      'title': t('report.settings.title'),
      'author': t('report.settings.author'),
      'addPageNumbers': t('report.settings.addPageNumbers'),
      'fontSize': t('report.settings.fontSize'),
      'enableRTL': t('report.settings.enableRTL'),
      
      // Page
      'size': t('report.settings.size'),
      'margins': t('report.settings.margins'),
      'orientation': t('report.settings.orientation'),
      
      // Quality
      'imageQuality': t('report.settings.imageQuality'),
      'compression': t('report.settings.compression'),
      'optimizeSize': t('report.settings.optimizeSize'),
      
      // Security
      'protect': t('report.settings.protect'),
      'password': t('report.settings.password'),
      'allowPrint': t('report.settings.allowPrint'),
      'allowCopy': t('report.settings.allowCopy'),

      // CBCT Analysis
      'showTeeth': t('report.settings.showTeeth'),
      'showJaw': t('report.settings.showJaw'),
      'showRoots': t('report.settings.showRoots'),
      'showEndo': t('report.settings.showEndo'),
      'showCrown': t('report.settings.showCrown'),
      'showNerves': t('report.settings.showNerves'),

      // Jaw
      'showUpperJaw': t('report.settings.showUpperJaw'),
      'showLowerJaw': t('report.settings.showLowerJaw'),

      // Reports
      'showGumHealth': t('report.settings.showGumHealth'),
      'showClinicalNotes': t('report.settings.showClinicalNotes'),
      'showVisualAnalysis': t('report.settings.showVisualAnalysis'),
      'showProblemCounts': t('report.settings.showProblemCounts'),
      'showHealthyStatus': t('report.settings.showHealthyStatus'),
      'showProblemDetails': t('report.settings.showProblemDetails'),
      'showDoctorComments': t('report.settings.showDoctorComments'),

      // Other
      'showDiagnoses': t('report.settings.showDiagnoses'),
      'showToothChart': t('report.settings.showToothChart'),
      'showCBCTAnalysis': t('report.settings.showCBCTAnalysis'),
      'showSignedByDoctor': t('report.settings.showSignedByDoctor'),
      'upper': t('report.settings.upper'),
      'lower': t('report.settings.lower')
    };
    
    return translations[key] || key;
  };

  const getSectionIcon = (key) => {
    const icons = {
      basic: FileText,
      page: Layout,
      quality: Settings,
      security: Shield,
      CBCTAnalysis: FileText,
      Jaw: Layout,
      report: Settings
    };
    return icons[key] || Settings;
  };

  const getSectionTitle = (key) => {
    const titles = {
      basic: t('report.sections.basic'),
      page: t('report.sections.page'),
      quality: t('report.sections.quality'),
      security: t('report.sections.security'),
      CBCTAnalysis: t('report.sections.CBCTAnalysis'),
      Jaw: t('report.sections.jaw'),
      report: t('report.sections.report')
    };
    return titles[key] || key;
  };

  const renderInput = (value, path, key) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card " >
          <Label htmlFor={path} className="text-sm font-medium cursor-pointer text-right">
            {formatLabel(key)}
          </Label>
          <div dir="ltr" className="flex items-center">
          <Switch
            id={path}
            checked={value}
            onCheckedChange={(checked) => updateSetting(path, checked)}
          /></div>
        </div>
      );
    }

    if (typeof value === 'string') {
      return (
        <div className="p-4 rounded-lg border bg-card space-y-2" >
          <Label htmlFor={path} className="text-sm font-medium text-right block">
            {formatLabel(key)}
          </Label>
          <Input
            id={path}
            type={key === 'password' ? 'password' : 'text'}
            value={value}
            onChange={(e) => updateSetting(path, e.target.value)}
            placeholder={key === 'password' ? t('report.settings.passwordPlaceholder') : ''}
            className="text-right"
          />
        </div>
      );
    }

    if (typeof value === 'number') {
      const maxValue = key.includes('Quality') ? 100 : 
                     key.includes('margins') ? 50 : 
                     key.includes('fontSize') ? 24 : 200;
      
      return (
        <div className="p-4 rounded-lg border bg-card space-y-3" >
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-right">
              {formatLabel(key)}
            </Label>
            <span className="text-sm font-medium bg-muted px-2 py-1 rounded text-muted-foreground">
              {value}{key.includes('Quality') ? '%' : ''}
            </span>
          </div>
          <div >
            <Slider
              value={[value]}
              onValueChange={(values) => updateSetting(path, values[0])}
              max={maxValue}
              min={key.includes('fontSize') ? 8 : 1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const renderSettings = (obj, parentPath = '') => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const IconComponent = getSectionIcon(key);
        const isExpanded = expandedSections[key];
        
        return (
          <Collapsible
            key={currentPath}
            open={isExpanded}
            onOpenChange={() => toggleSection(key)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-muted/50"
                
              >
                <div className="flex items-center gap-3 flex-row-reverse">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
                  )}
                  <span className="text-sm font-medium text-right">
                    {getSectionTitle(key)}
                  </span>
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2">
              <Card>
                <CardContent className="p-4 space-y-3">
                  {renderSettings(value, currentPath)}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        );
      }

      return (
        <div key={currentPath}>
          {renderInput(value, currentPath, key)}
        </div>
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 min-h-screen" >
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Settings className="h-5 w-5" />
              {t('report.settings.title')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={resetSettings}
                className="h-8 w-8"
                title={t('report.settings.resetSettings')}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {renderSettings(settings)}
          </div>
          
          <div className="mt-8 pt-6">
            <Separator className="mb-6" />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm">
                {t('common.cancel')}
              </Button>
              <Button size="sm">
                {t('report.settings.save')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSettings;