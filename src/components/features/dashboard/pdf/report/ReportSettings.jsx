'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDentalSettings } from '@/hooks/SettingHooks/useDentalSettings '; // ← استورد الhook
import { useTranslation } from 'react-i18next';

export default function ReportSettings({ downloadPDF, updateSetting, settings }) {
  const { t } = useTranslation('patient');
  // نجيبو الإعدادات و الدوال من الhook


  // باش نسهلو الaccess
  const opts = settings.CBCTAnalysis;

  return (
    <div className="w-[280px] bg-white rounded-2xl shadow-md p-5 flex flex-col space-y-4 text-sm font-medium">
      <h2 className="text-lg font-bold text-gray-800">{t('pdfReport.settings.title')}</h2>

      <div>
        <p className="text-gray-600 mb-2 font-semibold">{t('pdfReport.settings.printType')}</p>
        <div className="flex gap-2">
          <button
            onClick={() => updateSetting('CBCTAnalysis.colorMode', 'bw')}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer',
              opts.colorMode === 'bw'
                ? 'bg-[#0d0c22] text-white shadow'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {t('pdfReport.settings.bw')}
          </button>

          <button
            onClick={() => updateSetting('CBCTAnalysis.colorMode', 'color')}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer',
              opts.colorMode === 'color'
                ? 'bg-gradient-to-r from-[#7564ed] to-[#7564ed] text-white shadow'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {t('pdfReport.settings.color')}
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        {[["showPatientInfo", t('pdfReport.items.patientInfo')],
        ['showCBCTImage', t('pdfReport.items.cbctImage')],
        ['showToothChart', t('pdfReport.items.toothChart')],
        ['showUpperJaw', t('pdfReport.items.upperJaw')],
        ['showLowerJaw', t('pdfReport.items.lowerJaw')],
        ['ShowSlices', t('pdfReport.items.slices')],
        ['ShowMasks', t('pdfReport.items.masks')],
        ['showDiagnoses', t('pdfReport.items.diagnoses')],

        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-gray-800 cursor-pointer">
            <input
              type="checkbox"
              checked={opts[key]}
              onChange={() => updateSetting(`CBCTAnalysis.${key}`, !opts[key])}
              className="accent-[#7564ed] w-4 h-4 rounded cursor-pointer"
            />
            {label}
          </label>
        ))}
      </div>

      <Button
        className="bg-gradient-to-r from-[#7564ed] to-[#7564ed] text-white py-2 rounded-xl font-bold text-base hover:opacity-90 cursor-pointer"
      >
        {t('pdfReport.settings.print')}
      </Button>

      <button onClick={downloadPDF} className="text-[#7564ed] text-sm font-medium hover:underline cursor-pointer">
        {t('pdfReport.settings.download')}
      </button>
    </div>
  );
}
