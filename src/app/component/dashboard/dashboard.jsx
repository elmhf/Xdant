'use client'
import styles from './dachbord.module.css'
import Toothlabels from './main/ToothLabels/Toothlabels'
import ImageCard from './main/ImageXRay/ImageXRay'
import SideCardes from './side/sideToothCard'
import ToothComparison from './ToothComparison'
import ToothDetailsPage from './ToothDetailsPage'
import { createContext, useState, useMemo, useRef, useCallback } from 'react'
import DentalXRaySettingsPanel from './imageSetting/imageSetting'
import { useLayout } from '@/stores/setting'
import { motion, AnimatePresence } from 'framer-motion'
import DentalComponent from './DentalComponent'
import { useDentalSettings } from './main/ImageXRay/component/CustomHook/useDentalSettings'

export const DataContext = createContext()

const LAYOUTS = {
  COMPACT: {
    name: 'Compact View',
    template: `
      "xray labels ."
      "xray side . "
      "xray side . "
    `,
    columns: '1fr 1fr 0.5fr',
    rows: '1fr 1fr 1fr',
    description: 'عرض مضغوط مع التركيز على صورة الأشعة'
  },
  DEFAULT: {
    name: 'Default View',
    template: `
      "xray  side"
      "labels  side"
    `,
    columns: '1fr  1fr',
    rows: '1.5fr 1fr',
    description: 'العرض الافتراضي مع توازن بين جميع المكونات'
  },
  VIEW: {
    name: 'VIEW',
    template: `
      "settings xray side"
      "settings xray side"
      "settings xray side"
    `,
    columns: '.5fr 1.75fr 1fr',
    rows: '1fr 1fr 1fr',
    description: 'العرض الافتراضي مع توازن بين جميع المكونات'
  },
  DETAILS_VIEW: {
    name: 'Details View',
    template: `
      "details details details"
    `,
    columns: '1fr',
    rows: '1fr',
    description: 'عرض مفصل لبيانات السن المحدد'
  },
  COMPARISON: {
    name: 'Comparison View',
    template: `
      "compare xray"
      "compare labels"
      "side side"
    `,
    columns: '1fr 2fr',
    rows: '1fr 1fr auto',
    description: 'عرض المقارنة مع التركيز على تحليل الأسنان'
  },
  FULL_XRAY: {
    name: 'Full X-Ray View',
    template: `
      "xray xray xray"
      "xray xray xray"
    `,
    columns: '1fr',
    rows: '1fr',
    description: 'عرض كامل لصورة الأشعة مع إخفاء العناصر الأخرى'
  },
  NEW_LAYOUT: {
    name: 'Dental Details View',
    template: `
      "labels newcomponent"
      "side newcomponent"
      "side newcomponent"
    `,
    columns: '1fr 1fr',
    rows: '1fr 1fr 1fr',
    description: 'عرض تفاصيل الأسنان بدون صورة الأشعة'
  }
}

// Animation variants للتحسين
const animationVariants = {
  fadeIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: 0.1 }
  },
  slideInRight: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: 0.3 }
  },
  slideInUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  }
}

const Dashboard = () => {
  const [data, setData] = useState({})
  const [image, setImg] = useState({})
  const [toothNumberSelect, setToothNumberSelect] = useState(null) // تصحيح الاسم
  const [toothEditData, setToothEditData] = useState([])
  const [selectedTooth, setSelectedTooth] = useState(null)
  const [isChangingLayout, setIsChangingLayout] = useState(false)
  const stageRef = useRef(null)
  
  const { currentLayout, applyLayout, toggleFullscreen, isFullscreen } = useLayout()
  const { settings, SettingChange, updateSettingProblem, setSettings } = useDentalSettings()

  // تحسين الحالات المشتقة
  const layoutModes = useMemo(() => ({
    detailsMode: currentLayout === 'DETAILS_VIEW',
    comparisonMode: currentLayout === 'COMPARISON',
    fullXrayMode: currentLayout === 'FULL_XRAY',
    newLayoutMode: currentLayout === 'NEW_LAYOUT',
    viewMode: currentLayout === 'VIEW'
  }), [currentLayout])

  const { detailsMode, comparisonMode, fullXrayMode, newLayoutMode, viewMode } = layoutModes

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
    
    if (layout !== 'DETAILS_VIEW' && detailsMode) {
      setSelectedTooth(null)
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
    applyLayout(layout)
    setIsChangingLayout(false)
  }, [detailsMode, applyLayout])

  const closeDetailsView = useCallback(() => {
    setSelectedTooth(null)
    handleLayoutChange('COMPACT')
  }, [handleLayoutChange])

  // تحسين layoutConfig
  const layoutConfig = useMemo(() => 
    LAYOUTS[currentLayout] || LAYOUTS['COMPACT'], 
    [currentLayout]
  )

  // تحديد المكونات المرئية حسب التخطيط
  const getVisibleComponents = useCallback(() => {
    const layout = LAYOUTS[currentLayout]
    if (!layout) return {}
    
    const areas = layout.template.match(/"([^"]+)"/g)
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
  }, [currentLayout])

  const visibleComponents = useMemo(() => getVisibleComponents(), [getVisibleComponents])

  // تحسين الأنماط
  const containerStyle = useMemo(() => ({
    gridTemplateAreas: layoutConfig.template,
    gridTemplateColumns: layoutConfig.columns,
    gridTemplateRows: layoutConfig.rows,
    opacity: isChangingLayout ? 0.5 : 1,
    transition: 'opacity 0.2s ease'
  }), [layoutConfig, isChangingLayout])

  return (
    <DataContext.Provider value={contextValue}>
      <div className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}>
        <div
          className={styles.wrapper}
          style={containerStyle}
        >
          <AnimatePresence mode="wait">
            {detailsMode ? (
              <motion.div
                key="details"
                className={styles.compare} 
                style={{ gridArea: 'details' }}
                {...animationVariants.fadeIn}
              >
                <ToothDetailsPage onClose={closeDetailsView} />
              </motion.div>
            ) : (
              <>
                {visibleComponents.showSettings && (
                  <motion.div
                    key="settings"
                    className={`${styles.compare} max-h-[100%] max-w-full scrollbar-hide`}
                    style={{ gridArea: 'settings' }}
                    {...animationVariants.slideInLeft}
                  >
                    <DentalXRaySettingsPanel />
                  </motion.div>
                )}

                {visibleComponents.showXray && (
                  <motion.div
                    key="xray"
                    className={styles.XRayI}
                    style={{ gridArea: 'xray' }}
                    {...animationVariants.fadeIn}
                  >
                    <ImageCard 
                      settings={settings} 
                      SettingChange={SettingChange} 
                      setSettings={setSettings} 
                    />
                  </motion.div>
                )}

                {visibleComponents.showCompare && (
                  <motion.div
                    key="compare"
                    className={styles.compare}
                    style={{ gridArea: 'compare' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <ToothComparison />
                  </motion.div>
                )}

                {visibleComponents.showLabels && (
                  <motion.div
                    key="labels"
                    className={styles.ToothLabels}
                    style={{ gridArea: 'labels' }}
                    {...animationVariants.slideInUp}
                    transition={{ delay: 0.1 }}
                  >
                    <Toothlabels />
                  </motion.div>
                )}

                {visibleComponents.showSide && (
                  <motion.div
                    key="side"
                    className={styles.side}
                    style={{ gridArea: 'side' }}
                    {...animationVariants.slideInUp}
                    transition={{ delay: 0.2 }}
                  >
                    <SideCardes />
                  </motion.div>
                )}

                {visibleComponents.showNewComponent && (
                  <motion.div
                    key="newcomponent"
                    className={styles.compare}
                    style={{ gridArea: 'newcomponent' }}
                    {...animationVariants.slideInRight}
                  >
                    <DentalComponent />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DataContext.Provider>
  )
}

export default Dashboard