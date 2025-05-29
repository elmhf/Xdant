"use client";
import styles from "./ToothChar.module.css";
import { 
  useState, 
  useEffect, 
  useMemo, 
  useCallback, 
  useContext 
} from "react";
import { DataContext } from "../../../dashboard";
import { IoMdClose } from "react-icons/io";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDentalStore } from "@/stores/dataStore";
// لوحة ألوان متسقة
const TOOTH_CATEGORIES = {
  Healthy: {
    color: 'rgb(var(--color-Healthy))',
    border: '1px solid rgb(var(--color-Healthy))',
    bg: 'rgba(var(--color-Healthy), 0.2)'
  },
  Treated: {
    color: 'rgb(var(--color-Treated))',
    border: '1px solid rgb(var(--color-Treated),1)',
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
const ToothChar = () => {
  const data = useDentalStore(state => state.data);
  // const { data = { teeth: [] } } = useContext(DataContext);
  console.log(data,'data')
  const [dentalChart, setDentalChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized scroll handler with error boundary
  const scrollToElement = useCallback((event) => {
    try {
      const id = event.currentTarget.getAttribute("name");
      if (!id) return;
      
      const element = document.getElementById(`TooTh-Card-${id}`);
      if (element) {
        element.scrollIntoView({ 
          behavior: "smooth",
          block: "center"
        });
      }
    } catch (err) {
      console.error("Scroll error:", err);
    }
  }, []);

  // Fetch dental chart data with cleanup
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/dentalChart.json", {
          signal: controller.signal
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const chartData = await response.json();
        if (isMounted) {
          setDentalChart(chartData.dental_chart || []);
          setError(null);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error("Fetch error:", error);
          setError("Failed to load dental chart. Please try again later.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Generate tooth JSX with memoization and error boundaries
  const ToothJSX = useMemo(() => {
    if (!Array.isArray(dentalChart)) {
      return <div className={styles.error}>Invalid dental chart format</div>;
    }

    return dentalChart.flatMap((quadrant, quadrantIndex) => {
      if (!quadrant?.teeth || !Array.isArray(quadrant.teeth)) {
        return null;
      }

      return quadrant.teeth.map((tooth) => {
        if (!tooth?.number) return null;
        
        const { number } = tooth;
        const toothData = (data.teeth || []).find(t => t?.toothNumber === number);
        const category = toothData?.category || 'Unknown';
        const categoryStyles = TOOTH_CATEGORIES[category] || TOOTH_CATEGORIES.Unknown;
        
        return (
          <TooltipProvider key={`tooth-${number}-${quadrantIndex}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={scrollToElement}
                  id={`Tooth-${number}`}
                  name={number}
                  style={{
                    display: "flex",
                    flexDirection: number > 30 ? 'column-reverse' : "column",
                    backgroundColor: categoryStyles.bg,
                    border: `1px solid ${categoryStyles.border}`,
                  }}
                  className={styles.toothItem}
                  aria-label={`Tooth ${number} - ${category}`}
                >
                  <div className={styles.toothImageContainer}>
                    {category === 'Missing' ? (
                      <IoMdClose 
                        className={styles.missingToothIcon} 
                        style={{ color: categoryStyles.color }} 
                      />
                    ) : (
                          <img
                          className={styles.toothImage}
                          src={`/${number}.png`}
                          alt={`Tooth ${number}`}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                            e.target.classList.add(styles.placeholderImage);
                          }}
                        />

                    )}
                  </div>
                  <div 
                    className={styles.toothNumber}
                    style={{ color: categoryStyles.color }}
                  >
                    {number}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tooth {number}</p>
                <p>Status: {category}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      });
    });
  }, [dentalChart, data.teeth, scrollToElement]);

  if (loading) {
    return (
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 32 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className={styles.skeletonTooth} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorText}>{error}</div>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      {ToothJSX}
    </div>
  );
};

export default ToothChar;