import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function LoadingState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <Skeleton className="w-full h-full rounded-2xl" />
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500">{t('dashboard.analyzingScan')}</p>
        <p className="text-xs text-gray-400">{t('dashboard.takeMoments')}</p>
      </div>
    </div>
  );
}