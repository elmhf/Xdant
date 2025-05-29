'use client';
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Download, Settings, Info, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

export default function ReportSettings({ 
  settings, 
  toggleSetting, 
  updateSetting,
  downloadPDF, 
  isGenerating,
  lang 
}) {
  const { t } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDownload = async () => {
    try {
      await downloadPDF();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const options = useMemo(() => [
    { 
      key: "colorPrint", 
      label: t("reportSettings.colorPrint"), 
      description: t("reportSettings.colorPrintDesc"), 
      type: "boolean",
    },
    { 
      key: "signedByDoctor", 
      label: t("reportSettings.signedByDoctor"), 
      description: t("reportSettings.signedByDoctorDesc"), 
      type: "boolean",
    },
    { 
      key: "includeXrayImages", 
      label: t("reportSettings.includeXrayImages"), 
      description: t("reportSettings.includeXrayImagesDesc"), 
      type: "boolean",
    },
    { 
      key: "includeDoctorNotes", 
      label: t("reportSettings.includeDoctorNotes"), 
      description: t("reportSettings.includeDoctorNotesDesc"), 
      type: "boolean",
    },
    { 
      key: "showToothNumbers", 
      label: t("reportSettings.showToothNumbers"), 
      description: t("reportSettings.showToothNumbersDesc"), 
      type: "boolean",
    },
    { 
      key: "includeTreatmentPlan", 
      label: t("reportSettings.includeTreatmentPlan"), 
      description: t("reportSettings.includeTreatmentPlanDesc"), 
      type: "boolean",
    },
    { 
      key: "onlyAffectedTeeth", 
      label: t("reportSettings.onlyAffectedTeeth"), 
      description: t("reportSettings.onlyAffectedTeethDesc"), 
      type: "boolean",
    },
    { 
      key: "clinicStamp", 
      label: t("reportSettings.clinicStamp"), 
      description: t("reportSettings.clinicStampDesc"), 
      type: "boolean",
    },
    { 
      key: "showDateTime", 
      label: t("reportSettings.showDateTime"), 
      description: t("reportSettings.showDateTimeDesc"), 
      type: "boolean",
    },
    { 
      key: "includeCoverPage", 
      label: t("reportSettings.includeCoverPage"), 
      description: t("reportSettings.includeCoverPageDesc"), 
      type: "boolean",
    },
    { 
      key: "reportLanguage", 
      label: t("reportSettings.reportLanguage"), 
      type: "select", 
      options: [
        t("languages.arabic"), 
        t("languages.english"), 
        t("languages.french")
      ],
      icon: "🌐"
    },
    { 
      key: "detailLevel", 
      label: t("reportSettings.detailLevel"), 
      type: "select", 
      options: [
        t("detailLevels.brief"), 
        t("detailLevels.detailed")
      ],
      icon: "🔍"
    },
  ], [t]);

  return (
    <Card className="relative">
      {/* Success notification */}
      {showSuccess && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-lg z-10 animate-fade-in-out">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">{t("reportSettings.downloadSuccess")}</span>
        </div>
      )}
      
      <CardContent className="space-y-4  pr-2 py-4">
        {options.map((option) => (
          <div key={option.key} className="space-y-2 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  {option.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>

              { option.type === "select" ? (
                <Select
                  value={settings[option.key]}
                  onValueChange={(value) => updateSetting(option.key, value)}
                >
                  <SelectTrigger className="w-[160px] text-sm">
                    <SelectValue placeholder={t("common.select")} />
                  </SelectTrigger>
                  <SelectContent className="min-w-[160px]">
                    {option.options.map((opt) => (
                      <SelectItem 
                        key={opt} 
                        value={opt}
                        className="text-sm"
                      >
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ): option.type === "boolean" ? (
                <div className="flex items-center gap-2">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Switch
                            id={option.key}
                            checked={!!settings[option.key]}
                            onCheckedChange={() => toggleSetting(option.key)}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="bg-gray-800 text-white">
                        <p>{settings[option.key] ? t("common.enabled") : t("common.disabled")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="border-t pt-4">
        <Button 
          onClick={handleDownload} 
          disabled={isGenerating} 
          className="w-full gap-2 h-11 text-base font-medium"
          variant={isGenerating ? "secondary" : "default"}
        >
          {isGenerating ? (
            <LoadingSpinner t={t} />
          ) : (
            <>
              <Download className="h-5 w-5" />
              {t("reportSettings.downloadPDF")}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function LoadingSpinner({ t }) {
  return (
    <div className="flex items-center gap-2">
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
      <span className="font-medium">{t("reportSettings.generating")}</span>
    </div>
  );
}