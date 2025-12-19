"use client";
import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext
} from "react";
import { IoMdClose } from "react-icons/io";
import { FaRegThumbsUp } from "react-icons/fa";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDentalStore } from "@/stores/dataStore";
import { DataContext } from "../../../dashboard";
import { useRouter, useParams } from "next/navigation";

const TOOTH_CATEGORIES = {
  Healthy: {
    color: 'white',
    border: '1px solid black ',
    bg: 'white'
  },
  Treated: {
    color: 'rgb(var(--color-Treated))',
    border: '1px solid rgb(var(--color-Treated))',
    bg: 'rgba(var(--color-Treated), 0.2)'
  },
  Unhealthy: {
    color: 'rgb(var(--color-Unhealthy))',
    border: '1px solid rgb(var(--color-Unhealthy))',
    bg: 'rgba(var(--color-Unhealthy), 0.2)'
  },
  Missing: {
    color: 'rgb(var(--color-Unhealthy))',
    border: '1px solid rgb(var(--color-Unhealthy))',
    bg: 'rgba(var(--color-Unhealthy), 0.2)'
  },
  Unknown: {
    color: '#e5e7eb',
    border: '1px solid #4b5563',
    bg: 'rgba(var(--color-UNKNOWN-Tooth), 0)'
  }
};

let globalToothSVGs = null;
let globalToothSVGsPromise = null;

const fetchToothSVGs = async () => {
  if (globalToothSVGs) return globalToothSVGs;
  if (globalToothSVGsPromise) return globalToothSVGsPromise;

  globalToothSVGsPromise = fetch("/data/tooth_svgs.json")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load SVG data");
      return res.json();
    })
    .then(data => {
      globalToothSVGs = data;
      globalToothSVGsPromise = null;
      return data;
    })
    .catch(err => {
      globalToothSVGsPromise = null;
      throw err;
    });

  return globalToothSVGsPromise;
};

const useToothSVGs = () => {
  const [toothSVGs, setToothSVGs] = useState(globalToothSVGs);
  const [loading, setLoading] = useState(!globalToothSVGs);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (globalToothSVGs) {
      setToothSVGs(globalToothSVGs);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const loadSVGs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchToothSVGs();
        if (isMounted) {
          setToothSVGs(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    loadSVGs();
    return () => { isMounted = false; };
  }, []);

  return { toothSVGs, loading, error };
};

function ToothSVG({ toothNumber, className, toothSVGs, color, strokeColor }) {
  const svgRef = useRef(null);
  const [error, setError] = useState(null);

  const svgContent = useMemo(() => {
    if (!toothSVGs || !toothSVGs[toothNumber]) {
      setError(`SVG for tooth ${toothNumber} not found`);
      return null;
    }
    setError(null);
    return toothSVGs[toothNumber]
      .replace(/fill="(currentFill|currentStroke|strokeColor|currentColor)"/g, 'fill="currentColor"')
      .replace(/stroke="(currentFill|currentStroke|strokeColor|currentColor)"/g, `stroke="${strokeColor}"`);
  }, [toothSVGs, toothNumber, strokeColor]);

  useEffect(() => {
    if (svgRef.current && svgContent) {
      const elementsWithStroke = svgRef.current.querySelectorAll(
        'path[stroke], line[stroke], circle[stroke], rect[stroke], ellipse[stroke], polyline[stroke], polygon[stroke]'
      );
      elementsWithStroke.forEach(el => {
        if (!el.hasAttribute('stroke-width')) {
          el.setAttribute('stroke-width', '3');
        }
      });
    }
  }, [svgContent]);

  if (error) {
    return <div className={className} style={{ color: "red", fontSize: "12px" }}>{error}</div>;
  }

  if (!svgContent) {
    return <Skeleton className={className} />;
  }

  return (
    <svg
      ref={svgRef}
      height={200}

      viewBox="0 0 500 800"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
      stroke="white"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

const createSafeCache = () => {
  if (typeof window === 'undefined') {
    return { get: () => null, set: () => { }, clear: () => { } };
  }
  let cache = null;
  return {
    get: () => cache,
    set: (data) => { cache = data; },
    clear: () => { cache = null; }
  };
};

const dentalChartCache = createSafeCache();

const useDentalChart = () => {
  const [dentalChart, setDentalChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchDentalChart = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      setLoading(true);
      setError(null);
      const cachedData = dentalChartCache.get();
      if (cachedData && Array.isArray(cachedData)) {
        setDentalChart(cachedData);
        setLoading(false);
        return;
      }

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      const res = await fetch("/data/dentalChart.json", { signal: abortControllerRef.current.signal });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const chartData = await res.json();
      const dentalChartData = chartData.dental_chart || [];
      if (!Array.isArray(dentalChartData)) throw new Error("Invalid dental chart format");

      dentalChartCache.set(dentalChartData);
      setDentalChart(dentalChartData);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Fetch error:", err);
        setError("Failed to load dental chart. Please try again later.");
        dentalChartCache.clear();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDentalChart();
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
  }, [fetchDentalChart]);

  const retry = useCallback(() => {
    dentalChartCache.clear();
    globalToothSVGs = null;
    globalToothSVGsPromise = null;
    fetchDentalChart();
  }, [fetchDentalChart]);

  return { dentalChart, loading, error, retry };
};

// ⬇️ الكومبوننت الرئيسي مع فلترة الأسنان حسب الفك ⬇️
// ⬇️ الكومبوننت الرئيسي مع فلترة الأسنان حسب الفك ⬇️
const ToothChar = ({
  NumberOnlyMode = false,
  settings = {},
  isSelectionMode = false,
  selectedTeeth = [],
  toggleTooth = () => { }
}) => {
  const data = useDentalStore(state => state.data);
  const { toothNumberSelect, setToothNumberSelect } = useContext(DataContext) || useState(0);
  const { dentalChart, loading: chartLoading, error: chartError, retry } = useDentalChart();
  const { toothSVGs, loading: svgLoading, error: svgError } = useToothSVGs();
  const router = useRouter();
  const params = useParams();

  // 🔹 دوال الفلترة حسب الفك
  const isUpperTooth = (num) =>
    (num >= 11 && num <= 18) || (num >= 21 && num <= 28);
  const isLowerTooth = (num) =>
    (num >= 31 && num <= 38) || (num >= 41 && num <= 48);

  // 🔹 فلترة الأسنان حسب showUpperJaw / showLowerJaw
  const shouldShowTooth = (num) => {
    if (!settings?.CBCTAnalysis) return true;
    if (!settings?.CBCTAnalysis?.showUpperJaw && isUpperTooth(num)) return false;
    if (!settings?.CBCTAnalysis?.showLowerJaw && isLowerTooth(num)) return false;
    return true;
  };

  const handleToothClick = useCallback((event) => {
    const id = event.currentTarget.getAttribute("name");

    // If in selection mode, toggle individual tooth selection
    if (isSelectionMode) {
      // Only allow selecting teeth that exist in the data
      const toothExists = (data.teeth || []).some(t => t?.toothNumber === Number(id));
      if (toothExists) {
        toggleTooth(Number(id));
      }
      return;
    }

    // Normal mode behavior
    if (setToothNumberSelect) setToothNumberSelect(id);

    if (NumberOnlyMode) {
      if (params?.patientId && params?.report_id) {
        const newPath = `/patient/${params.patientId}/${params.report_id}/ToothSlice/${id}`;
        router.push(newPath);
      } else {
        console.warn("⚠️ Params missing:", params);
      }
    } else {
      try {
        const el = document.getElementById(`TooTh-Card-${id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (err) { console.error("Scroll error:", err); }
    }
  }, [setToothNumberSelect, NumberOnlyMode, router, isSelectionMode, toggleTooth, data.teeth, params]);

  const renderNumberOnlyMode = useCallback(() => {
    const numbers = [...Array(8).keys()].map(i => 11 + i)
      .concat([...Array(8).keys()].map(i => 21 + i))
      .concat([...Array(8).keys()].map(i => 31 + i))
      .concat([...Array(8).keys()].map(i => 41 + i));

    return numbers.filter(shouldShowTooth).map(number => {
      const toothData = (data.teeth || []).find(t => t?.toothNumber === number);
      const category = toothData?.category || 'Unknown';
      const toothExists = !!toothData;

      // 🔹 في وضع NumberOnlyMode: نتجاهل فلتر الاختيار و نطبق opacity فقط على الأسنان غير الموجودة
      // Only apply reduced opacity to non-existent teeth, ignore selection filter
      const isNonExistent = !toothExists;

      const styles = TOOTH_CATEGORIES[category] || TOOTH_CATEGORIES.Unknown;
      const selected = toothNumberSelect == number;

      return (
        <TooltipProvider key={`tooth-${number}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                onClick={isNonExistent ? undefined : handleToothClick}
                id={`Tooth-${number}`}
                name={number}
                className="flex items-center justify-center rounded-md text-center aspect-square relative bg-clip-padding"
                style={{
                  backgroundColor: styles.bg,
                  borderColor: selected ? "#6366f1" : styles.border,
                  opacity: isNonExistent ? 0.3 : 1,
                  cursor: isNonExistent ? 'not-allowed' : 'pointer',
                  pointerEvents: isNonExistent ? 'none' : 'auto',
                  transition: 'all 0.3s ease'
                }}
                animate={{
                  borderColor: selected ? "#6366f1" : styles.border,
                  borderWidth: "2px",
                  scale: 1
                }}
                whileHover={isNonExistent ? {} : {
                  borderColor: "#6366f1",
                  borderWidth: "2px",
                  scale: 1.1,
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                }}
                whileTap={isNonExistent ? {} : { scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="text-sm font-medium tracking-wide" style={{ color: ['Unknown', 'Healthy'].includes(category) ? '#000' : styles.color }}>{number}</div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tooth {number} - {category}</p>
              {toothExists ? (
                <p>Click to view slices</p>
              ) : (
                <p className="text-red-500">Tooth does not exist</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    });
  }, [data.teeth, toothNumberSelect, handleToothClick, settings, isSelectionMode, selectedTeeth]);

  const renderNormalMode = useCallback(() => {
    if (!Array.isArray(dentalChart)) return <div className="text-red-500 text-center">Invalid dental chart format</div>;

    return dentalChart.flatMap((quad, i) => {
      if (!quad?.teeth || !Array.isArray(quad.teeth)) return [];
      return quad.teeth.map((tooth) => {
        const number = tooth?.number;
        if (!number || !shouldShowTooth(number)) return null;

        const toothData = (data.teeth || []).find(t => t?.toothNumber === number);
        const category = toothData?.category || 'Unknown';
        const toothExists = !!toothData;

        // 🔹 تحديد ما إذا كان السن مخفيًا في وضع الاختيار
        // Show tooth with reduced opacity if filter is active (selectedTeeth !== null) and tooth is not selected
        const isFiltered = selectedTeeth !== null && !selectedTeeth.includes(number);
        const isNonSelectable = isSelectionMode && !toothExists;

        const styles = TOOTH_CATEGORIES[category] || TOOTH_CATEGORIES.Unknown;
        const selected = toothNumberSelect == number;

        return (
          <TooltipProvider key={`tooth-${number}-${i}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  onClick={handleToothClick}
                  id={`Tooth-${number}`}
                  name={number}
                  style={{
                    display: "flex",
                    justifyContent: number < 30 ? 'end' : 'start',
                    flexDirection: number > 30 ? 'column-reverse' : "column",
                    backgroundColor: styles.bg,
                    stroke: styles.color,
                    opacity: isFiltered ? 0.5 : 1,
                    cursor: 'pointer'
                  }}
                  className="flex flex-col items-center justify-center rounded-md text-center transition-all duration-200 aspect-[1/2.4] box-border  relative bg-clip-padding"
                  animate={{ borderColor: selected ? "#6366f1" : styles.bg, borderWidth: "2px" }}
                  whileHover={isFiltered ? {} : { borderColor: "#6366f1", borderWidth: "2px" }}
                  transition={{ type: "spring", stiffness: 100, damping: 5 }}
                >
                  <div className="w-full h-[70%] flex items-center justify-center">
                    {category === 'Missing' ? (
                      <IoMdClose className="text-xl md:text-2xl text-center" style={{ color: styles.color }} />
                    ) : (
                      <ToothSVG
                        toothNumber={number}
                        className="max-w-full max-h-full h-full  object-contain transition-transform duration-200"

                        toothSVGs={toothSVGs}
                        color={styles.color}
                        strokeColor={
                          ["Missing", "Unhealthy", "Treated"].includes(category)
                            ? "#ffff"
                            : ["Unknown", "Healthy"].includes(category) ? "#000" : "#0000"
                        }
                      />
                    )}
                  </div>
                  <div
                    className="font-[400] p-1 tracking-wide text-shadow text-xs md:text-sm"
                    style={{ color: ['Unknown', 'Healthy'].includes(category) ? '#000' : styles.color }}
                  >
                    {number}
                  </div>
                </motion.div>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        );
      });
    });
  }, [dentalChart, data.teeth, handleToothClick, toothSVGs, toothNumberSelect, settings, isSelectionMode, selectedTeeth]);

  const loading = chartLoading || svgLoading;
  const error = chartError || svgError;

  if (loading) {
    return (
      <div className="grid grid-cols-16 gap-2  p-3 w-full">
        {Array.from({ length: 32 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="text-2xl">⚠️</div>
        <div className="text-red-500 font-semibold">{error}</div>
        <button
          className="px-4 py-2 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition"
          onClick={retry}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!Array.isArray(dentalChart) || dentalChart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="text-[1vw]">📋</div>
        <div className="text-gray-500 font-semibold">No dental chart data available</div>
        <button
          className="px-4 py-2 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition"
          onClick={retry}
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div
      className={`gap-0.5 grid grid-cols-16 gap-y-2 ${!NumberOnlyMode ? "w-[80%]" : "w-[100%]"}`}
      style={{ minWidth: NumberOnlyMode ? "max-content" : 0 }}
    >
      {NumberOnlyMode ? renderNumberOnlyMode() : renderNormalMode()}
    </div>
  );
};

export default ToothChar;
