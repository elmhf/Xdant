"use client";
import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback
} from "react";
import { IoMdClose } from "react-icons/io";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDentalStore } from "@/stores/dataStore";

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

function ToothSVG({ toothNumber, className, toothSVGs }) {
  const svgRef = useRef(null);
  const [error, setError] = useState(null);

  const svgContent = useMemo(() => {
    if (!toothSVGs || !toothSVGs[toothNumber]) {
      setError(`SVG for tooth ${toothNumber} not found`);
      return null;
    }
    setError(null);
    return toothSVGs[toothNumber];
  }, [toothSVGs, toothNumber]);

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
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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

const ToothChar = ({ selectedTooth, setSelectedTooth, ref }) => {
  const data = useDentalStore(state => state.data);
  const { dentalChart, loading: chartLoading, error: chartError, retry } = useDentalChart();
  const { toothSVGs, loading: svgLoading, error: svgError } = useToothSVGs();

  const handleToothClick = useCallback((event) => {
    const id = event.currentTarget.getAttribute("name");
    if (setSelectedTooth) setSelectedTooth(id);
    try {
      const element = document.getElementById(`TooTh-Card-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (err) {
      console.error("Scroll error:", err);
    }
  }, [setSelectedTooth]);

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
        const isSelected = selectedTooth == number;

        // Tailwind classes for tooth item
        const baseClasses = `flex  flex-col items-center justify-cente rounded-lg text-center transition-all duration-200 cursor-pointer aspect-[1/2] box-border relative bg-clip-padding border-1 border-transparent shadow-sm`;
        const hoverClasses = `hover:scale-105 hover:shadow-lg hover:border-indigo-200 z-10`;
        const selectedClasses = isSelected ? `border-2.5 border-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.13)] z-20 bg-gradient-to-br from-indigo-50 to-indigo-100` : '';

        return (
          <TooltipProvider key={`tooth-${number}-${quadrantIndex}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={handleToothClick}
                  id={`Tooth-${number}`}
                  name={number}
                  style={{
                    display: "flex",
                    flexDirection: number > 30 ? 'column-reverse' : "column",
                    backgroundColor: categoryStyles.bg,
                    borderColor: isSelected ? '#6366f1' : categoryStyles.color,
                    stroke: categoryStyles.color
                  }}
                  className={[
                    baseClasses,
                    hoverClasses,
                    selectedClasses
                  ].join(' ')}
                  aria-label={`Tooth ${number} - ${category}`}
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
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                        toothSVGs={toothSVGs}
                      />
                    )}
                  </div>
                  <div
                    className="text-base font-bold mt-1 tracking-wide text-shadow"
                    style={{ color: categoryStyles.color }}
                  >
                    {number}
                  </div>
                </div>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        );
      }).filter(Boolean);
    });
  }, [dentalChart, data.teeth, handleToothClick, toothSVGs, selectedTooth]);

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
        <div className="text-2xl">📋</div>
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
      className="p-5  w-[80%]  grid grid-cols-16 gap-1 md:gap-1 overflow-x-auto"
      ref={ref}
      style={{ minWidth: 0 }}
    >
      {ToothJSX}
    </div>
  );
};

export default ToothChar;