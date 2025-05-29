'use client'
import styles from './dachbord.module.css'
import Toothlabels from './main/ToothLabels/Toothlabels'
import ImageCard from './main/ImageXRay/ImageXRay'
import SideCardes from './side/sideToothCard'
import ToothComparison from './ToothComparison'
import ToothDetailsPage from './ToothDetailsPage'
import { createContext, useState, useMemo, useRef, useEffect } from 'react'
import { LayoutGrid, Maximize, Minimize, Loader, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useLayout } from '@/stores/setting'
import { motion, AnimatePresence } from 'framer-motion'
import DentalComponent from './DentalComponent'

export const DataContext = createContext()

const LAYOUTS = {
  COMPACT: {
    name: 'Compact View',
    template: `
      "xray xray"
      "xray xray"
      "labels side"
      "compare compare"
    `,
    columns: '1fr 1fr',
    rows: '1fr 1fr 1fr 1fr',
    description: 'عرض مضغوط مع التركيز على صورة الأشعة'
  },
  DEFAULT: {
    name: 'Default View',
    template: `
      "xray  side"
      "xray  side"
      "labels  side"
    `,
    columns: '1.2fr  1fr',
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

const Dashboard = () => {
  const [data, setData] = useState({})
  const [image, setImg] = useState({})
  const [ToothNumberSelect,seToothNumberSelect]=useState(null)
  const [ToothEditData, setToothEditData] = useState([])
  const [selectedTooth, setSelectedTooth] = useState(null)
  const [isChangingLayout, setIsChangingLayout] = useState(false)
  const stageRef = useRef(null)
  
  const { currentLayout, applyLayout, toggleFullscreen, isFullscreen } = useLayout()

  // تحديد الوضع الحالي بناءً على الـ layout
  const detailsMode = currentLayout === 'DETAILS_VIEW'
  const comparisonMode = currentLayout === 'COMPARISON'
  const fullXrayMode = currentLayout === 'FULL_XRAY'
  const newLayoutMode = currentLayout === 'NEW_LAYOUT'

  const contextValue = useMemo(() => ({
    data,
    setData,
    image,
    setImg,
    ToothEditData,
    setToothEditData,
    stageRef,
    comparisonMode,
    detailsMode,
    newLayoutMode,
    selectedTooth,
    setSelectedTooth,
    ToothNumberSelect,
    seToothNumberSelect
  }), [data, image, ToothEditData, comparisonMode, detailsMode, newLayoutMode, selectedTooth,ToothNumberSelect])

  const handleLayoutChange = async (layout) => {
    setIsChangingLayout(true)
    
    // إغلاق عرض التفاصيل إذا كان المستخدم يختار layout آخر
    if (layout !== 'DETAILS_VIEW' && detailsMode) {
      setSelectedTooth(null)
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
    applyLayout(layout)
    setIsChangingLayout(false)
  }

  const closeDetailsView = () => {
    setSelectedTooth(null)
    handleLayoutChange('COMPACT')
  }

  const layoutConfig = LAYOUTS[currentLayout] || LAYOUTS['COMPACT']

  return (
    <DataContext.Provider value={contextValue}>
      <div className={`  ${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}>

        <div
          className={styles.wrapper}
          style={{
            gridTemplateAreas: layoutConfig.template,
            gridTemplateColumns: layoutConfig.columns,
            gridTemplateRows: layoutConfig.rows,
            opacity: isChangingLayout ? 0.5 : 1,
            transition: 'opacity 0.2s ease'
          }}
        >
          <AnimatePresence mode="wait">
            {detailsMode ? (
              <motion.div
                key="details"
                className={styles.details}
                style={{ gridArea: 'details' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ToothDetailsPage onClose={closeDetailsView} />
              </motion.div>
            ) : (
              <>
                {!fullXrayMode && !newLayoutMode && (
                  <motion.div
                    key="xray"
                    className={styles.XRayI}
                    style={{ gridArea: 'xray' }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ImageCard />
                  </motion.div>
                )}

                {!newLayoutMode && comparisonMode && (
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

                <motion.div
                  key="labels"
                  className={styles.ToothLabels}
                  style={{ gridArea: 'labels' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Toothlabels />
                </motion.div>

                <motion.div
                  key="side"
                  className={styles.side}
                  style={{ gridArea: 'side' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <SideCardes />
                </motion.div>

                {newLayoutMode && (
                  <motion.div
                    key="newcomponent"
                    className={styles.newcomponent}
                    style={{ gridArea: 'newcomponent' }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <DentalComponent />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
          {isChangingLayout && (
            <motion.div
              className={styles.loadingOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Loader className={styles.loadingSpinner} />
              <span className="mt-2">جاري تغيير التخطيط...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DataContext.Provider>
  )
}

export default Dashboard