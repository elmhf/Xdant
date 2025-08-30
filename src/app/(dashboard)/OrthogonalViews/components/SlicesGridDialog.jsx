import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

// Virtual Grid لتحسين الأداء مع الصور الكثيرة
const VirtualGrid = ({ 
  images, 
  selectedIndex, 
  onSelect, 
  onPreview, 
  containerWidth = 800,
  containerHeight = 600,
  getImageLabel
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [imageStates, setImageStates] = useState({});
  const scrollRef = useRef(null);
  
  // حساب المتغيرات
  const ITEM_WIDTH = 160;
  const ITEM_HEIGHT = 132;
  const GAP = 12;
  const ITEMS_PER_ROW = Math.floor((containerWidth - 24) / (ITEM_WIDTH + GAP));
  const TOTAL_ROWS = Math.ceil(images.length / ITEMS_PER_ROW);
  const VISIBLE_ROWS = Math.ceil(containerHeight / ITEM_HEIGHT) + 2; // buffer
  
  // حساب المدى المرئي
  const startRow = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 1);
  const endRow = Math.min(TOTAL_ROWS, startRow + VISIBLE_ROWS);
  
  // الصور المرئية فقط
  const visibleItems = useMemo(() => {
    const items = [];
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < ITEMS_PER_ROW; col++) {
        const index = row * ITEMS_PER_ROW + col;
        if (index < images.length) {
          items.push({
            index,
            row,
            col,
            top: row * ITEM_HEIGHT,
            left: col * (ITEM_WIDTH + GAP)
          });
        }
      }
    }
    return items;
  }, [startRow, endRow, ITEMS_PER_ROW, images.length, ITEM_HEIGHT, ITEM_WIDTH, GAP]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const updateImageState = useCallback((index, state) => {
    setImageStates(prev => ({
      ...prev,
      [index]: { ...prev[index], ...state }
    }));
  }, []);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      style={{
        width: '100%',
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        scrollbarWidth: 'thin'
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: TOTAL_ROWS * ITEM_HEIGHT,
        padding: 12
      }}>
        {visibleItems.map(item => (
          <VirtualImageItem
            key={item.index}
            {...item}
            image={images[item.index]}
            selected={item.index === selectedIndex}
            onSelect={onSelect}
            onPreview={onPreview}
            imageState={imageStates[item.index]}
            onImageStateChange={updateImageState}
            imageLabel={getImageLabel ? getImageLabel(item.index).label : `${item.index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// عنصر الصورة الافتراضي المحسن
const VirtualImageItem = React.memo(({ 
  index, 
  top, 
  left, 
  image, 
  selected, 
  onSelect, 
  onPreview,
  imageState,
  onImageStateChange,
  imageLabel
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const imgRef = useRef(null);

  const src = useMemo(() => {
    if (typeof image === 'string') return image;
    return image?.src || image?.url || '';
  }, [image]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasFailed(false);
    onImageStateChange?.(index, { loaded: true, failed: false });
  }, [index, onImageStateChange]);

  const handleError = useCallback(() => {
    setIsLoaded(false);
    setHasFailed(true);
    onImageStateChange?.(index, { loaded: false, failed: true });
  }, [index, onImageStateChange]);

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width: 160,
        height: 120,
        border: "1px solid #374151",
        borderRadius: 6,
        overflow: "hidden",
        cursor: "pointer",
        background: "#111827",
        transform:  "scale(1)",
        transition: "transform 0.15s ease",
        willChange: 'transform'
      }}
      onClick={() => onSelect(index)}
      onDoubleClick={() => onPreview(index)}
    >
      {hasFailed ? (
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f2937",
          color: "#ef4444",
          fontSize: 10
        }}>
          Error
        </div>
      ) : (
        <>
          {!isLoaded && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "#1f2937",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: 10
            }}>
              ...
            </div>
          )}
          <img
            ref={imgRef}
            src={src}
            alt={imageLabel}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isLoaded ? 1 : 0
            }}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        </>
      )}
      
      <div style={{
        position: "absolute",
        bottom: 2,
        right: 2,
        background: "rgba(0,0,0,0.7)",
        color: "white",
        fontSize: 8,
        padding: 2,
        borderRadius: 2
      }}>
        {imageLabel}
      </div>
    </div>
  );
});

// معاينة مبسطة
const SimplePreview = ({ previewIndex, images, onClose, onNavigate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (previewIndex !== null) {
      setImageLoaded(false);
    }
  }, [previewIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate('prev');
      if (e.key === 'ArrowRight') onNavigate('next');
    };

    if (previewIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [previewIndex, onClose, onNavigate]);

  if (previewIndex === null) return null;

  const currentImage = images[previewIndex];
  const src = typeof currentImage === 'string' ? currentImage : 
             currentImage?.src || currentImage?.url || '';

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          background: "#000",
          borderRadius: 8
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!imageLoaded && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666"
          }}>
            Loading...
          </div>
        )}

        <img
          src={src}
          alt={`Preview ${previewIndex + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: imageLoaded ? 1 : 0
          }}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Navigation */}
        {previewIndex > 0 && (
          <button
            onClick={() => onNavigate('prev')}
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <ChevronLeft color="white" size={16} />
          </button>
        )}
        
        {previewIndex < images.length - 1 && (
          <button
            onClick={() => onNavigate('next')}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <ChevronRight color="white" size={16} />
          </button>
        )}
        
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.5)",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <X color="white" size={14} />
        </button>
      </div>
    </div>
  );
};

// شريط جانبي مبسط
const SimpleSidebar = ({ seriesList, selectedSeries, onSeriesChange }) => {
  return (
    <div style={{
      width: 220,
      background: "#181b20",
      padding: 16,
      height: "100%",
      overflowY: "auto",
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      boxShadow: "2px 0 8px #0002"
    }}>
      <div style={{
        color: "#fff",
        marginBottom: 18,
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: 1
      }}>
        Séries
      </div>
      {seriesList.map(serie => {
        const selected = selectedSeries === serie.key;
        const iconSrc = typeof serie.getIcon?.() === 'string'
          ? serie.getIcon()
          : serie.getIcon?.()?.src;
        return (
          <div
            key={serie.key}
            onClick={() => onSeriesChange(serie.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 8px',
              background: selected ? '#3b82f6' : 'transparent',
              color: selected ? '#fff' : '#bbb',
              borderRadius: 8,
              cursor: 'pointer',
              marginBottom: 6,
              fontWeight: selected ? 600 : 400,
              boxShadow: selected ? "0 2px 8px #3b82f633" : undefined,
              transition: "background 0.15s, color 0.15s",
              border: selected ? "2px solid #2563eb" : "2px solid transparent"
            }}
            onMouseOver={e => {
              if (!selected) e.currentTarget.style.background = "#23272e";
            }}
            onMouseOut={e => {
              if (!selected) e.currentTarget.style.background = "transparent";
            }}
          >
            <img
              src={iconSrc}
              alt=""
              style={{
                width: 38,
                height: 38,
                borderRadius: 6,
                background: '#111',
                objectFit: "cover",
                border: selected ? "2px solid #fff" : "2px solid #222"
              }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{serie.label}</div>
              <div style={{
                fontSize: 12,
                color: selected ? "#e0e7ef" : "#aaa",
                marginTop: 2
              }}>
                {serie.getImages?.()?.length || 0} Images
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// المكون الرئيسي المحسن للأجهزة الضعيفة
export default function SlicesGridDialog({ 
  numSlicesAxial,
  numSlicesCoronal,
  numSlicesSagittal,
  open,
  onOpenChange,
  seriesList = [],
  selectedSeries = 'axial',
  onSeriesChange,
  onSelect,
  selectedIndex = -1,
  mainView,
  numSlices,
  setCrosshair,
  onViewChange
}) {

  
  const [previewIndex, setPreviewIndex] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef(null);

  // Function to get the correct label for each image
  const getImageLabel = useCallback((index) => {
    if (selectedSeries === "axial") {
      return { label: `Axial #${index + 1}`, view: "axial", slice: index + 1 };
    }
    if (selectedSeries === "coronal") {
      return { label: `Coronal #${index + 1}`, view: "coronal", slice: index + 1 };
    }
    if (selectedSeries === "sagittal") {
      return { label: `Sagittal #${index + 1}`, view: "sagittal", slice: index + 1 };
    }
    if (selectedSeries === "all") {
      const axialCount = numSlicesAxial;
      const coronalCount = numSlicesCoronal;
      const sagittalCount = numSlicesSagittal;
      if (index < axialCount) {
        return { label: `Axial #${index + 1}`, view: "axial", slice: index + 1 };
      } else if (index < axialCount + coronalCount) {
        const coronalIndex = index - axialCount;
        return { label: `Coronal #${coronalIndex + 1}`, view: "coronal", slice: coronalIndex + 1 };
      } else {
        const sagittalIndex = index - axialCount - coronalCount;
        return { label: `Sagittal #${sagittalIndex + 1}`, view: "sagittal", slice: sagittalIndex + 1 };
      }
    }
    return { label: `#${index + 1}`, view: "", slice: index + 1 };
  }, [selectedSeries, numSlicesAxial, numSlicesCoronal, numSlicesSagittal]);

  // تحسين الحصول على الصور
  const images = useMemo(() => {
    const currentSeries = seriesList.find(s => s.key === selectedSeries);
    return currentSeries?.getImages?.() || [];
  }, [seriesList, selectedSeries]);

  // تحديث حجم الحاوية
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({
        width: rect.width - 200, // minus sidebar
        height: rect.height
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [open]);

  // تحسين اختيار الصور
  const handleSelect = useCallback((index) => {
    let view = mainView;
    let sliceIndex = index;

    // If in "all" mode, determine which view and index
    if (selectedSeries === "all") {
      const axialCount = numSlicesAxial;
      const coronalCount = numSlicesCoronal;
      const sagittalCount = numSlicesSagittal;
      if (index < axialCount) {
        console.log("axial") ;
        view = "axial";
        onViewChange("axial");
        sliceIndex = index;
      } else if (index < axialCount + coronalCount) {
        console.log("coronal") ;
        view = "coronal";
        onViewChange("coronal");
        sliceIndex = index - axialCount;
      } else {
        view = "sagittal";
        onViewChange("sagittal");
        sliceIndex = index - axialCount - coronalCount;
      }
    }else{
      console.log(index,'index slice')
      // Get correct numSlices for the selected view
      console.log(selectedSeries,"mainview")
      onViewChange(selectedSeries);
    }


    let slicesForView = numSlices;
    if (view === "axial") slicesForView = numSlicesAxial;
    else if (view === "coronal") slicesForView = numSlicesCoronal;
    else if (view === "sagittal") slicesForView = numSlicesSagittal;

    const normalizedIndex = slicesForView > 1 ? sliceIndex / (slicesForView - 1) : 0;

    if (view === "axial") {
      setCrosshair(prev => ({ ...prev, z: normalizedIndex }));
    } else if (view === "coronal") {
      setCrosshair(prev => ({ ...prev, y: 1 - normalizedIndex }));
    } else if (view === "sagittal") {
      setCrosshair(prev => ({ ...prev, x: normalizedIndex }));
    }

    onSelect?.(sliceIndex);
    onOpenChange(false);
  }, [mainView, numSlices, setCrosshair, onSelect, onOpenChange, selectedSeries, numSlicesAxial, numSlicesCoronal, numSlicesSagittal, onViewChange]);

  // تنقل المعاينة
  const handlePreviewNavigate = useCallback((direction) => {
    if (previewIndex === null) return;
    
    const newIndex = direction === 'next' 
      ? Math.min(images.length - 1, previewIndex + 1)
      : Math.max(0, previewIndex - 1);
    
    setPreviewIndex(newIndex);
  }, [previewIndex, images.length]);

  // تنظيف عند الإغلاق
  useEffect(() => {
    if (!open) {
      setPreviewIndex(null);
    }
  }, [open]);

  if (!open) return null;

  if (!images.length) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          width: 400,
          background: '#1a1a1a',
          borderRadius: 8,
          padding: 32,
          textAlign: 'center',
          color: '#ccc'
        }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>📷</div>
          <div>No images available</div>
          <button
            onClick={() => onOpenChange(false)}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              background: '#333',
              border: 'none',
              borderRadius: 4,
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div
        ref={containerRef}
        style={{
          width: '90vw',
          height: '90vh',
          background: '#1a1a1a',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          position: 'relative'
        }}
      >
        {/* زر الإغلاق */}
        <button
          onClick={() => onOpenChange(false)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '50%',
            width: 28,
            height: 28,
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X color="white" size={14} />
        </button>

        {/* الشريط الجانبي */}
        <SimpleSidebar
          seriesList={seriesList}
          selectedSeries={selectedSeries}
          onSeriesChange={onSeriesChange}
        />

        {/* الشبكة الافتراضية */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <VirtualGrid
            images={images}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
            onPreview={setPreviewIndex}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
            getImageLabel={getImageLabel}
          />
        </div>

        {/* المعاينة */}
        <SimplePreview
          previewIndex={previewIndex}
          images={images}
          onClose={() => setPreviewIndex(null)}
          onNavigate={handlePreviewNavigate}
        />
      </div>
    </div>
  );
}