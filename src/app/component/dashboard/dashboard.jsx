'use client'
import styles from './dachbord.module.css'
import Toothlabels from './main/ToothLabels/Toothlabels'
import ImageCard from './main/ImageXRay/ImageXRay'
import SideCardes from './side/sideToothCard'
import ToothComparison from './ToothComparison'

import { createContext, useState, useMemo, useRef, useCallback, useEffect } from 'react'
import DentalXRaySettingsPanel from './imageSetting/imageSetting'
import { useLayout } from '@/contexts/LayoutContext'
import { motion, AnimatePresence } from 'framer-motion'
import DentalComponent from './DentalComponent'
import { useDentalSettings } from './main/ImageXRay/component/CustomHook/useDentalSettings'
import { useRouter } from 'next/navigation'
import { useDentalStore } from '@/stores/dataStore'

export const DataContext = createContext()



const Dashboard = ({ reportType }) => {
  const [data, setData] = useState({})
  const [image, setImg] = useState({})
  const [toothNumberSelect, setToothNumberSelect] = useState(null)
  const [toothEditData, setToothEditData] = useState([])
  const [selectedTooth, setSelectedTooth] = useState(null)
  const [isChangingLayout, setIsChangingLayout] = useState(false)
  const stageRef = useRef(null)
  const router = useRouter()

  const { layoutKey, setLayout, allLayouts } = useLayout()
  const { settings, SettingChange, updateSettingProblem, setSettings } = useDentalSettings()
  // تحسين الحالات المشتقة
  const layoutModes = useMemo(() => ({
    detailsMode: layoutKey === 'DETAILS_VIEW',
    comparisonMode: layoutKey === 'COMPARISON',
    fullXrayMode: layoutKey === 'FULL_XRAY',
    newLayoutMode: layoutKey === 'NEW_LAYOUT',
    viewMode: layoutKey === 'VIEW'
  }), [layoutKey])

  // تحسين Context Value
  const contextValue = useMemo(() => ({
    data,
    setData,
    image,
    setImg,
    toothEditData,
    setToothEditData,
    stageRef,
    ...layoutModes,
    selectedTooth,
    setSelectedTooth,
    toothNumberSelect,
    setToothNumberSelect
  }), [
    data, 
    image, 
    toothEditData, 
    layoutModes, 
    selectedTooth, 
    toothNumberSelect
  ])

  // استخدام useCallback لتحسين الأداء
  const handleLayoutChange = useCallback(async (layout) => {
    setIsChangingLayout(true)
    
    if (layout !== 'DETAILS_VIEW' && layoutModes.detailsMode) {
      setSelectedTooth(null)
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
    setLayout(layout)
    setIsChangingLayout(false)
  }, [layoutModes.detailsMode, setLayout])


  // تحسين layoutConfig
  const layoutConfig = useMemo(() => 
    allLayouts[layoutKey] || allLayouts['COMPACT'], 
    [layoutKey, allLayouts]
  )

  // تحديد المكونات المرئية حسب التخطيط
  const getVisibleComponents = useCallback(() => {
    const currentLayoutObj = allLayouts[layoutKey] || allLayouts['DEFAULT']
    if (!currentLayoutObj) return {}
    
    const areas = currentLayoutObj.template.match(/"([^"]+)"/g)
      ?.join(' ')
      .replace(/"/g, '')
      .split(/\s+/)
      .filter(area => area !== '.')
    
    return {
      showSettings: areas?.includes('settings'),
      showXray: areas?.includes('xray'),
      showLabels: areas?.includes('labels'),
      showSide: areas?.includes('side'),
      showCompare: areas?.includes('compare'),
      showNewComponent: areas?.includes('newcomponent')
    }
  }, [layoutKey, allLayouts])

  const visibleComponents = useMemo(() => getVisibleComponents(), [getVisibleComponents])

  // تحسين الأنماط
  const containerStyle = useMemo(() => ({
    gridTemplateAreas: layoutConfig.template,
    gridTemplateColumns: layoutConfig.columns,
    gridTemplateRows: layoutConfig.rows,
    opacity: isChangingLayout ? 0.5 : 1,
    transition: 'opacity 0.2s ease'
  }), [layoutConfig, isChangingLayout])

  // دالة التوجيه لصفحة تقرير CBCT
  const handleViewCBCTReport = useCallback((reportId) => {
    if (reportId) {
      router.push(`/patient/${patientId}/cbctReport/${cbctReportid}`);
    }
  }, [router]);

  // تخصيص تخطيط صفحة Pano
  const isPanoType = reportType === 'pano ai' || reportType === 'pano';

  useEffect(() => {
    if (reportType) {
      console.log(`Report type set to: ${reportType}`);
      // تحديث نوع التقرير في الستيت
      useDentalStore.getState().setReportType(reportType);
    }
  }, [reportType]);

  return (
    <DataContext.Provider value={contextValue}>
      <div className={`${styles.container} ${layoutKey === 'VIEW' ? styles.fullscreen : ''}`}>
        <div className="flex flex-row gap-2 h-[90vh]">
          {isPanoType ? (
            <>
               {/* ImageCard على اليمين */}
              <div className="flex-none w-[60%] flex items-center justify-center">
                <ImageCard settings={settings} SettingChange={SettingChange} setSettings={setSettings} />
              </div>
              {/* Toothlabels فوق SideCardes */}
              <div className="flex flex-col w-[40%]">
                <div className="flex-none">
                  <Toothlabels />
                </div>
                <div className="flex-1 overflow-scroll no-scrollbar ">
                  <SideCardes toothNumberSelect={toothNumberSelect} setToothNumberSelect={setToothNumberSelect} layoutKey={layoutKey} />
                </div>
              </div>
           
            </>
          ) : (
            // التخطيط الافتراضي
            <>
              <div className="flex overflow-scroll gap-5 no-scrollbar flex-col flex-1 w-fitt">
                <div className="flex-1 flex gap-1 h-[40%] max-h-[500px]">
                  <ImageCard settings={settings} SettingChange={SettingChange} setSettings={setSettings} />
                </div>
                <div className="flex-none">
                  <Toothlabels onViewCBCTReport={handleViewCBCTReport} />
                </div>
              </div>
              <div className="flex-none w-[50%] ">
                <SideCardes toothNumberSelect={toothNumberSelect} setToothNumberSelect={setToothNumberSelect} layoutKey={layoutKey} />
              </div>
            </>
          )}
        </div>
      </div>
    </DataContext.Provider>
  );
}

export default Dashboard