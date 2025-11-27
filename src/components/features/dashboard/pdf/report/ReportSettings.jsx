'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDentalSettings } from '@/hooks/SettingHooks/useDentalSettings '; // ← استورد الhook

export default function ReportSettings({ downloadPDF,updateSetting,settings }) {
  // نجيبو الإعدادات و الدوال من الhook


  // باش نسهلو الaccess
  const opts = settings.CBCTAnalysis;

  return (
    <div className="w-[280px] bg-white rounded-2xl shadow-md p-5 flex flex-col space-y-4 text-sm font-medium">
      <h2 className="text-lg font-bold text-gray-800">Paramètres</h2>

      <div>
        <p className="text-gray-600 mb-2 font-semibold">Genre d'impression</p>
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
            B&amp;W
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
            Color
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        {[["showPatientInfo","Patient Info"],
          ['showCBCTImage', 'Image CBCT'],
          ['showToothChart', 'Graphique dentaire'],
          ['showUpperJaw', 'Mâchoire supérieure'],
          ['showLowerJaw', 'Mâchoire inférieure'],
          ['ShowSlices', 'Coupes'],
          ['ShowMasks', 'Afficher les masques'],
          ['showDiagnoses', 'Diagnostic'],
          
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
        Imprimer
      </Button>

      <button onClick={downloadPDF} className="text-[#7564ed] text-sm font-medium hover:underline cursor-pointer">
        Télécharger le PDF
      </button>
    </div>
  );
}
