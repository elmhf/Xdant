'use client'
import React, { useContext, useState, useMemo } from "react";
import { DataContext } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X as XIcon, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

const ToothComparison = () => {
  const { t } = useTranslation();
  const { ToothEditData } = useContext(DataContext);
  const [selectedTeeth, setSelectedTeeth] = useState({
    tooth1: null,
    tooth2: null
  });
  const [isLoading, setIsLoading] = useState(true);

  const toothOptions = useMemo(() => {
    try {
      const currentTeethData = ToothEditData?.hestoriqData?.[0]?.teeth || [];
      const editData = ToothEditData?.toothEditData || [];

      const options = currentTeethData.map(tooth => {
        const editInfo = editData.find(edit => edit.tooth === tooth.toothNumber) || {};
        return {
          label: `${t('dashboard.comparison.tooth')} ${tooth.toothNumber}`,
          value: tooth.toothNumber.toString(),
          data: {
            ...tooth,
            ...editInfo
          }
        };
      });

      setIsLoading(false);
      return options;
    } catch (error) {
      console.error("Error processing tooth data:", error);
      setIsLoading(false);
      return [];
    }
  }, [ToothEditData, t]);

  const handleToothSelect = (key, value) => {
    setSelectedTeeth(prev => ({
      ...prev,
      [key]: toothOptions.find(opt => opt.value === value)?.data || null
    }));
  };

  const clearSelection = () => {
    setSelectedTeeth({ tooth1: null, tooth2: null });
  };

  const compareAttributes = [
    { id: 'status', label: t('dashboard.healthy'), key: 'category', icon: '🦷' },
    { id: 'problems', label: t('dashboard.unhealthy'), key: 'problems', icon: '⚠️' },
    { id: 'treatment', label: t('dashboard.treated'), key: 'type', icon: '🏥' },
    { id: 'approval', label: t('common.report'), key: 'Approve', icon: '✅' }
  ];

  const formatValue = (value, key) => {
    if (value === undefined || value === null) return '-';
    if (typeof value === 'boolean') return value ? t('common.enabled') : t('common.disabled');
    if (Array.isArray(value)) {
      if (value.length === 0) return '-';
      return value.map(p => p.type || p).join(', ');
    }
    return value;
  };

  const getBadgeVariant = (value, key) => {
    if (key === 'category') {
      return value === 'Healthy' ? 'default' :
        value === 'Treated' ? 'secondary' : 'destructive';
    }
    if (typeof value === 'boolean') {
      return value ? 'default' : 'destructive';
    }
    return 'outline';
  };

  const renderComparisonRow = (attribute) => {
    const tooth1Value = selectedTeeth.tooth1?.[attribute.key];
    const tooth2Value = selectedTeeth.tooth2?.[attribute.key];

    return (
      <div key={attribute.id} className="grid grid-cols-12 gap-2 py-3 border-b last:border-b-0">
        <div className="col-span-4 font-medium flex items-center gap-2">
          <span className="text-lg">{attribute.icon}</span>
          <span className="text-sm">{attribute.label}</span>
        </div>
        <div className="col-span-4 flex items-center px-2">
          <Badge
            variant={getBadgeVariant(tooth1Value, attribute.key)}
            className="w-full justify-center py-1 text-[10px]"
          >
            {formatValue(tooth1Value, attribute.key)}
          </Badge>
        </div>
        <div className="col-span-4 flex items-center px-2">
          <Badge
            variant={getBadgeVariant(tooth2Value, attribute.key)}
            className="w-full justify-center py-1 text-[10px]"
          >
            {formatValue(tooth2Value, attribute.key)}
          </Badge>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-none bg-white">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-normal">{t('dashboard.comparison.title')}</CardTitle>
        <Button
          variant="ghost"
          onClick={clearSelection}
          className="text-red-500 hover:text-red-700 h-8 px-2"
          disabled={!selectedTeeth.tooth1 && !selectedTeeth.tooth2}
        >
          <XIcon className="h-4 w-4 mr-1" /> {t('common.clearAll')}
        </Button>
      </CardHeader>
      <CardContent className="px-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Select
            onValueChange={(v) => handleToothSelect('tooth1', v)}
            value={selectedTeeth.tooth1?.toothNumber?.toString() || ""}
          >
            <SelectTrigger className="h-9 rounded-xl border-gray-100 bg-gray-50/50">
              <SelectValue placeholder={t('dashboard.comparison.tooth')} />
            </SelectTrigger>
            <SelectContent>
              {toothOptions.map((tooth) => (
                <SelectItem key={`t1-${tooth.value}`} value={tooth.value}>
                  {tooth.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(v) => handleToothSelect('tooth2', v)}
            value={selectedTeeth.tooth2?.toothNumber?.toString() || ""}
          >
            <SelectTrigger className="h-9 rounded-xl border-gray-100 bg-gray-50/50">
              <SelectValue placeholder={t('dashboard.comparison.tooth')} />
            </SelectTrigger>
            <SelectContent>
              {toothOptions.map((tooth) => (
                <SelectItem key={`t2-${tooth.value}`} value={tooth.value}>
                  {tooth.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTeeth.tooth1 || selectedTeeth.tooth2 ? (
          <div className="bg-gray-50/30 rounded-2xl p-3 border border-gray-50">
            <div className="grid grid-cols-12 gap-2 mb-2 px-2">
              <div className="col-span-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('dashboard.comparison.attribute')}</div>
              <div className="col-span-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">T-{selectedTeeth.tooth1?.toothNumber || '1'}</div>
              <div className="col-span-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">T-{selectedTeeth.tooth2?.toothNumber || '2'}</div>
            </div>
            <div className="divide-y divide-gray-100/50">
              {compareAttributes.map(attr => renderComparisonRow(attr))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-indigo-50 p-4 rounded-full mb-4">
              <LayoutGrid className="h-8 w-8 text-[#7564ed]" />
            </div>
            <p className="text-gray-400 text-sm max-w-[200px] leading-relaxed">
              {t('dashboard.comparison.compare')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ToothComparison;