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


const TOOTH_CATEGORIES = {
  Healthy: {
    color: 'rgb(var(--color-Healthy))',
    border: '1px solid rgb(var(--color-Healthy))',
    bg: 'rgba(var(--color-Healthy), 0.2)'
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
    color: 'rgb(var(--color-Missing))',
    border: '1px solid rgb(var(--color-Missing))',
    bg: 'rgba(var(--color-Missing), 0.1)'
  },
  Unknown: {
    color: 'rgb(var(--color-UNKNOWN-Tooth))',
    border: '1px solid rgba(var(--color-UNKNOWN-Tooth), 0.5)',
    bg: 'rgba(var(--color-UNKNOWN-Tooth), 0)'
  }
};

// Global state for tooth SVGs
let globalToothSVGs = null;
let globalToothSVGsPromise = null;

// Function to fetch tooth SVGs once
const fetchToothSVGs = async () => {
  if (globalToothSVGs) {
    return globalToothSVGs;
  }
  
  if (globalToothSVGsPromise) {
    return globalToothSVGsPromise;
  }
  
  globalToothSVGsPromise = fetch("/data/tooth_svgs.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to load SVG data");
      }
      return response.json();
    })
    .then(data => {
      globalToothSVGs = data;
      globalToothSVGsPromise = null;
      return data;
    })
    .catch(error => {
      globalToothSVGsPromise = null;
      throw error;
    });
    
  return globalToothSVGsPromise;
};

// Hook to manage tooth SVGs globally
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

    return () => {
      isMounted = false;
    };
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
    // Replace fill with currentColor, and stroke with strokeColor
    return toothSVGs[toothNumber]
      .replace(/fill="(currentFill|currentStroke|strokeColor|currentColor)"/g, 'fill="currentColor"')
      .replace(/stroke="(currentFill|currentStroke|strokeColor|currentColor)"/g, `stroke="${strokeColor}"`);
  }, [toothSVGs, toothNumber, strokeColor]);

  // تطبيق stroke-width بعد render
  useEffect(() => {
    if (svgRef.current && svgContent) {
      const elementsWithStroke = svgRef.current.querySelectorAll(
        'path[stroke], line[stroke], circle[stroke], rect[stroke], ellipse[stroke], polyline[stroke], polygon[stroke]'
      );
      
      elementsWithStroke.forEach(element => {
        if (!element.hasAttribute('stroke-width')) {
          element.setAttribute('stroke-width', '3');
        }
      });
    }
  }, [svgContent]);

  if (error) {
    return (
      <div className={className} style={{ color: "red", fontSize: "12px" }}>
        {error}
      </div>
    );
  }

  if (!svgContent) {
    return <Skeleton className={className} />;
  }

  return (
    <svg
      ref={svgRef}
      height={100}
      viewBox="0 0 1000 1300"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

// إنشاء safe cache system للـ dental chart
const createSafeCache = () => {
  if (typeof window === 'undefined') {
    return {
      get: () => null,
      set: () => {},
      clear: () => {}
    };
  }
  
  let cache = null;
  
  return {
    get: () => cache,
    set: (data) => { cache = data; },
    clear: () => { cache = null; }
  };
};

const dentalChartCache = createSafeCache();

// Custom hook لإدارة بيانات الـ dental chart
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

      // التحقق من الـ cache أولاً
      const cachedData = dentalChartCache.get();
      if (cachedData && Array.isArray(cachedData)) {
        setDentalChart(cachedData);
        setLoading(false);
        return;
      }

      // إنشاء AbortController جديد
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await fetch("/data/dentalChart.json", {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const chartData = await response.json();
      const dentalChartData = chartData.dental_chart || [];

      if (!Array.isArray(dentalChartData)) {
        throw new Error("Invalid dental chart format");
      }

      // حفظ البيانات في الـ cache
      dentalChartCache.set(dentalChartData);
      setDentalChart(dentalChartData);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Fetch error:", error);
        setError("Failed to load dental chart. Please try again later.");
        dentalChartCache.clear();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDentalChart();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDentalChart]);

  const retry = useCallback(() => {
    dentalChartCache.clear();
    // Reset global SVG cache
    globalToothSVGs = null;
    globalToothSVGsPromise = null;
    fetchDentalChart();
  }, [fetchDentalChart]);

  return {
    dentalChart,
    loading,
    error,
    retry
  };
};

const ToothChar = ({ ref }) => {
  const data = useDentalStore(state => state.data);
  console.log(data.teeth,"data.teeth")

  const { toothNumberSelect, setToothNumberSelect } = useContext(DataContext);
  const { dentalChart, loading: chartLoading, error: chartError, retry } = useDentalChart();
  const { toothSVGs, loading: svgLoading, error: svgError } = useToothSVGs();

  const handleToothClick = useCallback((event) => {
    const id = event.currentTarget.getAttribute("name");
    if (setToothNumberSelect) setToothNumberSelect(id);
    try {
      const element = document.getElementById(`TooTh-Card-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (err) {
      console.error("Scroll error:", err);
    }
  }, [setToothNumberSelect]);

  const ToothJSX = useMemo(() => {
    if (!Array.isArray(dentalChart)) {
      return <div className="text-red-500 text-center">Invalid dental chart format</div>;
    }

    return dentalChart.flatMap((quadrant, quadrantIndex) => {
      if (!quadrant?.teeth || !Array.isArray(quadrant.teeth)) return [];

      return quadrant.teeth.map((tooth) => {
        if (!tooth?.number) return null;

        const { number } = tooth;
        const toothData = (data.teeth || []).find(t => t?.toothNumber === number);
        const category = toothData?.category || 'Unknown';
        const categoryStyles = TOOTH_CATEGORIES[category] || TOOTH_CATEGORIES.Unknown;
        const isSelected = toothNumberSelect == number;

        let toothColor = categoryStyles.color;
        let strokeColor = '#cbd5e1'; // default gray

        // Unknown teeth always get white fill and black stroke
        if (category === 'Unknown') {
          toothColor = '#fff';
          strokeColor = '#000';
        } else if (category === 'Healthy') {
          toothColor = '#fff';
          strokeColor = '#000';
        } else {
          // For other categories, determine stroke color based on selection and background
          const isBgWhite = (
            (isSelected && (
              categoryStyles.bg === 'white' ||
              categoryStyles.bg === '#fff' ||
              categoryStyles.bg === 'rgba(255,255,255,1)' ||
              categoryStyles.bg.includes('to-indigo-100') ||
              categoryStyles.bg.includes('from-indigo-50')
            ))
          );
          if (isSelected && isBgWhite) {
            strokeColor = '#000';
          } else if (isSelected) {
            strokeColor = '#fff';
          }
        }

        const isUnknown =
          !toothData ||
          !toothData.category ||
          toothData.category === 'Unknown' ||
          toothData.category === null ||
          toothData.category === '';

        // Tailwind classes for tooth item
        const baseClasses = `flex flex-col items-center justify-cente rounded-[0.5vw] text-center transition-all duration-200 cursor-pointer aspect-[1/2.5] box-border relative bg-clip-padding border`;
        // Remove hoverClasses and selectedClasses for border, handle with framer-motion
        return (
          <TooltipProvider key={`tooth-${number}-${quadrantIndex}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  onClick={handleToothClick}
                  id={`Tooth-${number}`}
                  name={number}
                  style={{
                    display: "flex",
                    flexDirection: number > 30 ? 'column-reverse' : "column",
                    backgroundColor: categoryStyles.bg,
                    stroke: categoryStyles.color
                  }}
                  className={[
                    baseClasses,
                  ].join(' ')}
                  aria-label={`Tooth ${number} - ${category}`}
                  animate={{
                    borderColor: isSelected ? "#6366f1" : categoryStyles.bg,
                    borderWidth: "0.2vw"
                  }}
                  whileHover={{
                    borderColor: "#6366f1",
                    borderWidth: "0.2vw"
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 5
                  }}
                >
                  <div className="w-full h-[60%] flex items-center justify-center">
                    {category === 'Missing' ? (
                      <IoMdClose
                        className="text-5xl text-center"
                        style={{ color: categoryStyles.color }}
                      />
                    ) : (
                      <ToothSVG 
                        toothNumber={number} 
                        className="max-w-full max-h-full h-full object-contain transition-transform duration-200"
                        toothSVGs={toothSVGs}
                        color={isUnknown ? '#fff' : toothColor}
                        strokeColor={isUnknown ? '#000' : strokeColor}
                      />
                    )}
                  </div>
                  <div
                    className="text-[1vw] font-medium  tracking-wide text-shadow"
                    style={{ color: categoryStyles.color }}
                  >
                    {number}
                  </div>
                </motion.div>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        );
      }).filter(Boolean);
    });
  }, [dentalChart, data.teeth, handleToothClick, toothSVGs, toothNumberSelect]);

  const loading = chartLoading || svgLoading;
  const error = chartError || svgError;

  if (loading) {
    return (
      <div className="grid grid-cols-16 gap-2 p-3 w-full">
        {Array.from({ length: 32 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="w-full  " />
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
      className="  w-[80%] gap-[0.1vw]  grid grid-cols-16 "
      ref={ref}
      style={{ minWidth: 0 }}
    >
      {ToothJSX}
    </div>
  );
};

export default ToothChar;