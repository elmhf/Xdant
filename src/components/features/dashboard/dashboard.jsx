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
  const [selectedTeeth, setSelectedTeeth] = useState(null) // Track selected teeth for filtering (null = no filter active)
  const stageRef = useRef(null)
  const router = useRouter()

  const { layoutKey, setLayout, allLayouts } = useLayout()
  const { settings, SettingChange, updateSettingProblem, setSettings } = useDentalSettings()
  // ØªØ­Ø³ÙŠÙ† Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø´ØªÙ‚Ø©
  const layoutModes = useMemo(() => ({
    detailsMode: layoutKey === 'DETAILS_VIEW',
    comparisonMode: layoutKey === 'COMPARISON',
    fullXrayMode: layoutKey === 'FULL_XRAY',
    newLayoutMode: layoutKey === 'NEW_LAYOUT',
    viewMode: layoutKey === 'VIEW'
  }), [layoutKey])

  // ØªØ®ØµÙŠØµ ØªØ®Ø·ÙŠØ· ØµÙØ­Ø© Pano
  const isPanoType = reportType === 'pano ai' || reportType === 'pano';

  // State for hovering highlights
  const [hoveredProblem, setHoveredProblem] = useState(null);

  // ØªØ­Ø³ÙŠÙ† Context Value
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
    setToothNumberSelect,
    selectedTeeth,
    hoveredProblem,
    setHoveredProblem,
    setSelectedTeeth,
    isPanoType // Add this
  }), [
    data,
    image,
    toothEditData,
    layoutModes,
    selectedTooth,
    toothNumberSelect,
    selectedTeeth,
    isPanoType
  ])

  // Ø§Ø³ØªØ®Ø¯Ø§Ù… useCallback Ù„ØªØ­Ø³ÙŠÙ† Ø§Ù„Ø£Ø¯Ø§Ø¡
  const handleLayoutChange = useCallback(async (layout) => {
    setIsChangingLayout(true)

    if (layout !== 'DETAILS_VIEW' && layoutModes.detailsMode) {
      setSelectedTooth(null)
    }

    await new Promise(resolve => setTimeout(resolve, 200))
    setLayout(layout)
    setIsChangingLayout(false)
  }, [layoutModes.detailsMode, setLayout])


  // ØªØ­Ø³ÙŠÙ† layoutConfig
  const layoutConfig = useMemo(() =>
    allLayouts[layoutKey] || allLayouts['COMPACT'],
    [layoutKey, allLayouts]
  )

  // ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙƒÙˆÙ†Ø§Øª Ø§Ù„Ù…Ø±Ø¦ÙŠØ© Ø­Ø³Ø¨ Ø§Ù„ØªØ®Ø·ÙŠØ·
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

  // ØªØ­Ø³ÙŠÙ† Ø§Ù„Ø£Ù†Ù…Ø§Ø·
  const containerStyle = useMemo(() => ({
    gridTemplateAreas: layoutConfig.template,
    gridTemplateColumns: layoutConfig.columns,
    gridTemplateRows: layoutConfig.rows,
    opacity: isChangingLayout ? 0.5 : 1,
    transition: 'opacity 0.2s ease'
  }), [layoutConfig, isChangingLayout])

  // Ø¯Ø§Ù„Ø© Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ù„ØµÙØ­Ø© ØªÙ‚Ø±ÙŠØ± CBCT
  const handleViewCBCTReport = useCallback((reportId) => {
    if (reportId) {
      router.push(`/patient/${patientId}/cbctReport/${cbctReportid}`);
    }
  }, [router]);

  // ØªØ®ØµÙŠØµ ØªØ®Ø·ÙŠØ· ØµÙØ­Ø© Pano


  useEffect(() => {
    if (reportType) {
      console.log(`Report type set to: ${reportType}`);
      // ØªØ­Ø¯ÙŠØ« Ù†ÙˆØ¹ Ø§Ù„ØªÙ‚Ø±ÙŠØ± ÙÙŠ Ø§Ù„Ø³ØªÙŠØª
      useDentalStore.getState().setReportType(reportType);
    }
  }, [reportType]);

  return (
    <DataContext.Provider value={contextValue}>
      <div className={`${styles.container} ${layoutKey === 'VIEW' ? styles.fullscreen : ''}`}>
        <div className="flex flex-col lg:flex-row gap-2 h-full lg:h-[90vh]  overflow-scroll no-scrollbar lg:overflow-hidden">
          {isPanoType ? (
            <>
              {/* ImageCard Ø¹Ù„Ù‰ Ø§Ù„ÙŠÙ…ÙŠÙ† */}
              <div className="flex-none w-full lg:w-[60%] h-[350px] lg:h-auto flex items-center justify-center">
                <ImageCard settings={settings} SettingChange={SettingChange} setSettings={setSettings} />
              </div>
              {/* Toothlabels ÙÙˆÙ‚ SideCardes */}
              <div className="flex flex-col w-full lg:w-[40%]">
                <div className="flex-none">
                  <Toothlabels NumberOnlyMode={false} />
                </div>
                <div className="flex-1 lg:overflow-scroll no-scrollbar h-auto lg:h-auto">
                  <SideCardes toothNumberSelect={toothNumberSelect} setToothNumberSelect={setToothNumberSelect} layoutKey={layoutKey} />
                </div>
              </div>

            </>
          ) : (
            // Ø§Ù„ØªØ®Ø·ÙŠØ· Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ
            <>
              <div className="flex lg:overflow-scroll gap-5 no-scrollbar flex-col flex-1 w-full h-auto lg:h-auto">
                <div className="flex-1 flex gap-1 min-h-[350px] lg:h-[40%] lg:max-h-[500px]">
                  <ImageCard settings={settings} SettingChange={SettingChange} setSettings={setSettings} />
                </div>
                <div className="flex-none">
                  <Toothlabels onViewCBCTReport={handleViewCBCTReport} NumberOnlyMode={false} />
                </div>
              </div>
              <div className="flex-none w-full lg:w-[50%] h-auto lg:h-auto">
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
