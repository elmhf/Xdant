import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function ErrorState({ error, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center gap-3">
      <div className="text-red-500 font-medium">{error}</div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          {t('common.clear')}
        </Button>
        <Button size="sm" onClick={onRetry}>
          {t('common.tryAgain')}
        </Button>
      </div>
    </div>
  );
}