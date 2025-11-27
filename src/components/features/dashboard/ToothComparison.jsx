'use client'
import React, { useContext } from "react";
import { DataContext } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CompareIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const ToothComparison = () => {
  const { ToothEditData } = useContext(DataContext);
  const [selectedTeeth, setSelectedTeeth] = React.useState({
    tooth1: null,
    tooth2: null
  });
  const [isLoading, setIsLoading] = React.useState(true);

  // Merge data from ToothEditData and ObjecthestoriqData
  const toothOptions = React.useMemo(() => {
    try {
      const teethData = ToothEditData?.hestoriqData?.[0]?.teeth || [];
      const editData = ToothEditData?.toothEditData || [];
      
      const options = teethData.map(tooth => {
        const editInfo = editData.find(edit => edit.tooth === tooth.toothNumber) || {};
        return {
          label: `Tooth ${tooth.toothNumber}`,
          value: tooth.toothNumber,
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
  }, [ToothEditData]);

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
    { id: 'status', label: 'Status', key: 'category', icon: '🦷' },
    { id: 'problems', label: 'Problems', key: 'problems', icon: '⚠️' },
    { id: 'treatment', label: 'Treatment', key: 'type', icon: '🏥' },
    { id: 'gumHealth', label: 'Gum Health', key: 'gumHealth', icon: '🩺' },
    { id: 'approval', label: 'Approval', key: 'Approve', icon: '✅' },
    { id: 'lastCheckup', label: 'Last Checkup', key: 'lastCheckup', icon: '📅' }
  ];

  const formatValue = (value, key) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Approved' : 'Not Approved';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      if (key === 'problems') return value.map(p => p.type || p).join(', ');
      if (key === 'lastCheckup') return new Date(value).toLocaleDateString();
      return value.join(', ');
    }
    if (key === 'lastCheckup' && value) return new Date(value).toLocaleDateString();
    return value;
  };

  const getBadgeVariant = (value, key) => {
    if (key === 'category') {
      return value === 'Healthy' ? 'default' : 
             value === 'Treated' ? 'secondary' : 'destructive';
    }
    if (key === 'gumHealth') {
      return value === 'Healthy' ? 'default' : 'destructive';
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
        <div className="col-span-3 font-medium flex items-center gap-2">
          <span className="text-lg">{attribute.icon}</span>
          <span>{attribute.label}</span>
        </div>
        <div className="col-span-4 flex items-center">
          <Badge 
            variant={getBadgeVariant(tooth1Value, attribute.key)}
            className="w-full justify-center py-1"
          >
            {formatValue(tooth1Value, attribute.key)}
          </Badge>
        </div>
        <div className="col-span-1 flex justify-center items-center">
          {/* <CompareIcon className="h-4 w-4 text-muted-foreground" /> */}
        </div>
        <div className="col-span-4 flex items-center">
          <Badge 
            variant={getBadgeVariant(tooth2Value, attribute.key)}
            className="w-full justify-center py-1"
          >
            {formatValue(tooth2Value, attribute.key)}
          </Badge>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            {/* <CompareIcon className="h-5 w-5 text-primary" /> */}
            Tooth Comparison
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearSelection}
            disabled={!selectedTeeth.tooth1 && !selectedTeeth.tooth2}
            className="hover:bg-red-50 hover:text-red-600"
          >
            <XIcon className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Select 
              onValueChange={(v) => handleToothSelect('tooth1', v)} 
              value={selectedTeeth.tooth1?.toothNumber || ''}
            >
              <SelectTrigger className="hover:border-primary">
                <SelectValue placeholder="Select first tooth" />
              </SelectTrigger>
              <SelectContent>
                {toothOptions.map((tooth) => (
                  <SelectItem 
                    key={`tooth1-${tooth.value}`} 
                    value={tooth.value}
                    className="flex justify-between"
                  >
                    <span>{tooth.label}</span>
                    <Badge 
                      variant={tooth.data.category === 'Healthy' ? 'default' : 
                              tooth.data.category === 'Treated' ? 'secondary' : 'destructive'}
                      className="ml-2"
                    >
                      {tooth.data.category}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select 
              onValueChange={(v) => handleToothSelect('tooth2', v)} 
              value={selectedTeeth.tooth2?.toothNumber || ''}
            >
              <SelectTrigger className="hover:border-primary">
                <SelectValue placeholder="Select second tooth" />
              </SelectTrigger>
              <SelectContent>
                {toothOptions.map((tooth) => (
                  <SelectItem 
                    key={`tooth2-${tooth.value}`} 
                    value={tooth.value}
                    className="flex justify-between"
                  >
                    <span>{tooth.label}</span>
                    <Badge 
                      variant={tooth.data.category === 'Healthy' ? 'default' : 
                              tooth.data.category === 'Treated' ? 'secondary' : 'destructive'}
                      className="ml-2"
                    >
                      {tooth.data.category}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedTeeth.tooth1 || selectedTeeth.tooth2 ? (
          <Tabs defaultValue="status">
            <TabsList className="grid w-full grid-cols-6 bg-muted/50">
              {compareAttributes.map(attr => (
                <TabsTrigger 
                  key={attr.id} 
                  value={attr.id}
                  className="flex items-center gap-1 text-xs"
                >
                  <span className="text-sm">{attr.icon}</span>
                  <span className="truncate">{attr.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <ScrollArea className="h-[400px] mt-4">
              <div className="space-y-2">
                {compareAttributes.map(attr => (
                  <TabsContent key={attr.id} value={attr.id}>
                    <Card className="border-0 shadow-none">
                      <CardContent className="p-4">
                        {renderComparisonRow(attr)}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </div>
            </ScrollArea>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            {/* <CompareIcon className="h-12 w-12 mb-4 opacity-30" /> */}
            <p className="text-center max-w-xs">
              Select two teeth to compare their attributes and treatment history
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ToothComparison;