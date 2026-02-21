import { Button } from "@material-tailwind/react";
import { useTranslation } from "react-i18next";

export default function SettingButton() {
  const { t } = useTranslation();
  return (
    <div className="flex w-max gap-4" style={{
      backgroundColor: `rgba(var( --color-Healthy), 0.2)`,
      border: `solid 1px rgba(var( --color-Healthy), 0.5)`,
      borderRadius: 'var(  --Border-Radios)'
    }}>
      <Button style={{ padding: "10px 30px", textDecorationColor: 'rgba(var( --color-Healthy), 0.5)' }} variant="gradient">{t('common.setting')}</Button>
    </div>
  );
}