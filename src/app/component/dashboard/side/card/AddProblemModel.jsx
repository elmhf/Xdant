"use client"
import * as React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next";
import RanderImagwithDrw from "./problrms/RanderImagwithDrw"
import {
  RefreshCw,
  Settings,
  Trash2,
  Save,
  Copy,
  Download,
  Printer,
  Share2,
  Plus,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const ArrayProblems = [
  'Tooth Decay', 'Gingivitis', 'Bad Breath or Halitosis', 'Sensitive Teeth',
  'Dry Mouth', 'Teeth Grinding', 'Enamel Erosion', 'Cracked or Broken Teeth',
  'Receding Gums', 'Root Infection'
].map(item => ({ label: item, value: item }));

const severityLevels = [
  { value: "Very Mild", color: "bg-green-500" },
  { value: "Mild", color: "bg-teal-500" },
  { value: "Moderate", color: "bg-yellow-500" },
  { value: "Severe", color: "bg-orange-500" },
  { value: "Critical/Urgent", color: "bg-red-500" }
];

const progressionStages = [
  { value: "Initial", color: "bg-blue-100 text-blue-800" },
  { value: "Developing", color: "bg-purple-100 text-purple-800" },
  { value: "Moderate", color: "bg-amber-100 text-amber-800" },
  { value: "Advanced", color: "bg-orange-100 text-orange-800" },
  { value: "Critical", color: "bg-red-100 text-red-800" }
];

export default function DentalProblemForm({
  teeth,
  ProblemVlaueState,
  descriptionState,
  maskProblemState,
  SeverityState,
  ProgressionState
}) {
  const { t } = useTranslation();
  const {ProblemVlaue, setProblemVlaue} = ProblemVlaueState;
  const {Severity, setSeverity} = SeverityState;
  const {Progression, setProgression} = ProgressionState;
  const {description, setdescription} = descriptionState;
  const {maskProblem, setmaskProblem} = maskProblemState;
  
  const [activeTab, setActiveTab] = useState("form");
  const [showProblemList, setShowProblemList] = useState(false);

  const onSelectProblem = (problem) => {
    setProblemVlaue(problem);
    setShowProblemList(false);
  };

  const handleResetMask = () => {
    setmaskProblem([]);
    toast.success(t("dentalForm.resetDrawingSuccess"));
  };

  const handleClearAll = () => {
    if (confirm(t("dentalForm.confirmClearAll"))) {
      setProblemVlaue('');
      setdescription('');
      setmaskProblem([]);
      setSeverity('');
      setProgression('');
      toast.info(t("dentalForm.allFieldsCleared"));
    }
  };

  const handleSaveDraft = () => {
    // Validate before saving
    if (!ProblemVlaue) {
      toast.error(t("dentalForm.errorProblemRequired"));
      return;
    }
    
    toast.success(t("dentalForm.draftSaved"));
    // Add actual save logic here
  };

  const handleDuplicate = () => {
    toast(t("dentalForm.problemDuplicated"), {
      action: {
        label: t("dentalForm.view"),
        onClick: () => console.log("View duplicated"),
      },
    });
  };

  const handleExportImage = () => {
    toast.message(t("dentalForm.exportingImage"));
    // Add export logic
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    toast.info(t("dentalForm.shareFeatureComingSoon"));
  };

  return (
    <div className="flex w-full h-full">
      {/* Left side - Image with Drawing */}
      <div className="w-1/2 h-full border-r p-4 flex flex-col relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {t("dentalForm.dentalVisualization")}
            {maskProblem.length > 0 && (
              <Badge variant="secondary">
                {maskProblem.length} {t("dentalForm.areasMarked")}
              </Badge>
            )}
          </h2>
          
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleResetMask}
                  disabled={maskProblem.length === 0}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t("dentalForm.resetDrawing")}
              </TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("dentalForm.actions")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleSaveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("dentalForm.saveDraft")}
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  {t("dentalForm.duplicate")}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>{t("dentalForm.export")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleExportImage}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("dentalForm.exportImage")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  {t("dentalForm.print")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  {t("dentalForm.share")}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleClearAll}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("dentalForm.clearAll")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex-1 border rounded-lg overflow-hidden bg-gray-50 relative">
          <RanderImagwithDrw
            size={500}
            maskPoints={teeth['boundingBox']}
            setMask={{ maskProblem, setmaskProblem }}
            imageUrl={teeth.xrayImage || teeth.image} // استخدام الصورة من بيانات السن
            aspectRatio={4/3} // نسبة العرض إلى الارتفاع المناسبة لصور الأسنان
          />
        </div>
        
      </div>

      {/* Right side - Form */}
      <div className="w-1/2 h-full overflow-y-auto p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("dentalForm.dentalProblemReport")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Problem Selection */}
                <div className="space-y-2">
                  <Label htmlFor="problem">
                    {t("dentalForm.problem")} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      value={ProblemVlaue || ''}
                      onChange={(e) => setProblemVlaue(e.target.value)}
                      type="text"
                      placeholder={t("dentalForm.problemPlaceholder")}
                      id="problem"
                      className="pr-10"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowProblemList(!showProblemList)}
                    >
                      {showProblemList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {showProblemList && (
                    <div className="border rounded-lg p-2 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-1">
                        {ArrayProblems.map((problem) => (
                          <Button
                            key={problem.value}
                            variant="ghost"
                            className="justify-start text-left h-auto py-2"
                            onClick={() => onSelectProblem(problem.value)}
                          >
                            {problem.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Severity Level Select */}
                <div className="space-y-2">
                  <Label htmlFor="severity">
                    {t("dentalForm.severity")}
                  </Label>
                  <Select value={Severity} onValueChange={setSeverity}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("dentalForm.selectSeverity")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t("dentalForm.severityLevels")}</SelectLabel>
                        {severityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value} className="flex items-center">
                            <span className={`w-3 h-3 rounded-full ${level.color} mr-2`}></span>
                            {level.value}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Progression Stage Select */}
                <div className="space-y-2">
                  <Label htmlFor="progression">
                    {t("dentalForm.stage")}
                  </Label>
                  <Select value={Progression} onValueChange={setProgression}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("dentalForm.selectStage")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t("dentalForm.progressionStages")}</SelectLabel>
                        {progressionStages.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            <Badge className={`${stage.color} mr-2`}>{stage.value}</Badge>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* description Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="description">{t("dentalForm.description")}</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setdescription(e.target.value)}
                    placeholder={t("dentalForm.descriptionPlaceholder")}
                    className="min-h-[120px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>
            
          </div>
      </div>
    </div>
  )
}