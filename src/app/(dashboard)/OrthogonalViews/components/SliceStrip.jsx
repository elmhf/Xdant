import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { throttle } from "lodash";

const SliceStrip = React.memo(function SliceStrip({
  setShowGrid,
  images,
  selectedIndex,
  onSelect,
  minThumbnailWidth = 50,
  thumbnailHeight =50,
  mainView,
  onViewChange
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState(null);

  // 🎯 تحديث عرض الحاوية - تحسين الأداء
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        if (newWidth !== containerWidth) {
          setContainerWidth(newWidth);
        }
      }
    };

    updateWidth();
    const handleResize = () => {
      requestAnimationFrame(updateWidth);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [containerWidth]);

  // 🧠 حساب الصور المعروضة والمواضع الدقيقة - تحسين الأداء
  const thumbnailData = useMemo(() => {
    if (!images || images.length === 0 || containerWidth === 0) return [];

    const getSrc = (img) => (typeof img === "string" ? img : img?.src);
    const padding = 8;
    const gap = 2;
    const availableWidth = containerWidth - (padding * 2);
    
    const maxThumbnails = Math.floor(availableWidth / (minThumbnailWidth + gap));
    const displayCount = Math.min(maxThumbnails, images.length);
    
    if (displayCount <= 0) return [];

    const selectedIndices = [];
    
    if (images.length <= displayCount) {
      for (let i = 0; i < images.length; i++) {
        selectedIndices.push(i);
      }
    } else {
      for (let i = 0; i < displayCount; i++) {
        const ratio = i / (displayCount - 1);
        const index = Math.round(ratio * (images.length - 1));
        selectedIndices.push(index);
      }
    }

    const uniqueIndices = [...new Set(selectedIndices)].sort((a, b) => a - b);
    const thumbnailWidth = (availableWidth - (gap * (uniqueIndices.length - 1))) / uniqueIndices.length;
    
    return uniqueIndices.map((originalIndex, displayIndex) => {
      const leftPosition = (thumbnailWidth + gap) * displayIndex;
      const centerPosition = leftPosition + (thumbnailWidth / 2);
      const timelinePosition = (originalIndex / (images.length - 1)) * 100;
      
      return {
        src: getSrc(images[originalIndex]),
        originalIndex,
        displayIndex,
        leftPosition,
        centerPosition,
        width: thumbnailWidth,
        timelinePosition,
      };
    });
  }, [images, containerWidth, minThumbnailWidth]);

  // 🎯 حساب موضع المؤشر الدقيق - تحسين الأداء
  const indicatorPosition = useMemo(() => {
    if (images.length === 0) return 0;
    return (selectedIndex / (images.length - 1)) * 100;
  }, [selectedIndex, images.length]);

  // 🚀 معالجة الحركة - تحسين الأداء
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current || images.length === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));

    const newIndex = Math.round(percent * (images.length - 1));
    const clampedIndex = Math.max(0, Math.min(images.length - 1, newIndex));

    if (clampedIndex !== selectedIndex) {
      onSelect(clampedIndex);
    }
  }, [isDragging, images.length, selectedIndex, onSelect]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStartIndex(selectedIndex);
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newIndex = Math.round(percent * (images.length - 1));
    const clampedIndex = Math.max(0, Math.min(images.length - 1, newIndex));
    
    if (clampedIndex !== selectedIndex) {
      onSelect(clampedIndex);
    }
  }, [selectedIndex, onSelect, images.length]);

  const handleMouseUp = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(false);
    setDragStartIndex(null);
  }, []);

  // تحسين الأداء - استخدام throttle للـ mouse events
  const throttledMouseMove = useMemo(
    () => throttle(handleMouseMove, 16), // 60fps
    [handleMouseMove]
  );

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        throttledMouseMove(e);
      }
    };

    const handleGlobalMouseUp = (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        handleMouseUp(e);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { capture: true });
      document.addEventListener('mouseup', handleGlobalMouseUp, { capture: true });
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleGlobalMouseUp, { capture: true });
    };
  }, [isDragging, throttledMouseMove, handleMouseUp]);

  // 🎮 تحسين التحكم بالكيبورد
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (selectedIndex > 0) {
          onSelect(selectedIndex - 1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (selectedIndex < images.length - 1) {
          onSelect(selectedIndex + 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        onSelect(0);
        break;
      case 'End':
        e.preventDefault();
        onSelect(images.length - 1);
        break;
      case 'PageUp':
        e.preventDefault();
        onSelect(Math.max(0, selectedIndex - 10));
        break;
      case 'PageDown':
        e.preventDefault();
        onSelect(Math.min(images.length - 1, selectedIndex + 10));
        break;
    }
  }, [selectedIndex, images.length, onSelect]);

  const handleThumbnailClick = useCallback((originalIndex, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (originalIndex !== selectedIndex) {
      onSelect(originalIndex);
    }
  }, [selectedIndex, onSelect]);

  // 🔄 تحسين أزرار التنقل
  const handlePrevious = useCallback(() => {
    if (selectedIndex > 0) {
      onSelect(selectedIndex - 1);
    }
  }, [selectedIndex, onSelect]);

  const handleNext = useCallback(() => {
    if (selectedIndex < images.length - 1) {
      onSelect(selectedIndex + 1);
    }
  }, [selectedIndex, images.length, onSelect]);

  const handleViewChange = useCallback((e) => {
    if (onViewChange) {
      onViewChange(e.target.value);
    }
  }, [onViewChange]);

  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(16,30,54,0.06)',
        padding: 10,
        userSelect: "none",
        fontFamily: 'Poppins, Inter, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display:'flex',
        flexDirection:"row",
        border: '1px solid #e5e7eb',
        alignItems: 'center',
        gap: 16,
        position: 'relative',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >

      {/* Second Row - Timeline - تحسين الأداء */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 ,width:"70%"}}>
        {/* Timeline Container - تحسين الأداء */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            e.stopPropagation();
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(1, x / rect.width));
            const newIndex = Math.round(percent * (images.length - 1));
            const clampedIndex = Math.max(0, Math.min(images.length - 1, newIndex));
            if (clampedIndex !== selectedIndex) {
              onSelect(clampedIndex);
            }
          }}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          style={{
            height: thumbnailHeight,
            background: "#fff",
            borderRadius: 10,
            position: "relative",
            cursor: isDragging ? "grabbing" : "grab",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            padding: 6,
            gap: 4,
            transition: isDragging ? "none" : "all 0.2s ease",
            border: "1.5px solid #e5e7eb",
            flex: 1,
            boxShadow: '0 1px 4px rgba(16,30,54,0.04)',
            zIndex: 11,
            pointerEvents: 'auto',
          }}
        >
          {/* Thumbnail Images - تحسين الأداء */}
          {thumbnailData.map(({ src, originalIndex, width }) => (
            <img
              key={`${originalIndex}-${selectedIndex}`}
              src={src}
              alt={`Slice ${originalIndex + 1}`}
              onClick={(e) => handleThumbnailClick(originalIndex, e)}
              style={{
                height: "100%",
                width: `${width}px`,
                minWidth: `${width}px`,
                maxWidth: `${width}px`,
                objectFit: "cover",
                borderRadius: 8,
                border: originalIndex === selectedIndex
                  ? "2.5px solid #6366f1"
                  : "1.5px solid #d1d5db",
                cursor: "pointer",
                flexShrink: 0,
                transition: isDragging ? "none" : "all 0.18s cubic-bezier(.4,0,.2,1)",
                transform: originalIndex === selectedIndex ? "scale(1.08)" : "scale(1)",
                boxShadow: originalIndex === selectedIndex 
                  ? "0 0 10px 0 rgba(99,102,241,0.10)"
                  : "0 1px 4px rgba(16,30,54,0.04)",
                background: '#f3f4f6',
              }}
            />
          ))}

          {/* Progress Indicator - تحسين الأداء */}
          <div
            style={{
              position: "absolute",
              left: `${indicatorPosition}%`,
              top: 0,
              width: 3,
              height: "100%",
              background: "#6366f1",
              transform: "translateX(-50%)",
              zIndex: 10,
              borderRadius: 2,
              transition: isDragging ? "none" : "left 0.18s cubic-bezier(.4,0,.2,1)",
            }}
          />

          {/* Indicator Dot - تحسين الأداء */}
          <div
            style={{
              position: "absolute",
              left: `${indicatorPosition}%`,
              top: "50%",
              width: 12,
              height: 12,
              background: "#6366f1",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 11,
              border: "2.5px solid #fff",
              boxShadow: "0 0 8px 0 rgba(99,102,241,0.18)",
            }}
          />
        </div>

      </div>
      {/* First Row - View Controls & Counter - تحسين الأداء */}
      <div style={{
        width:"30%",
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
      }}>    {/* Right side - Navigation & Counter - تحسين الأداء */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handlePrevious}
            disabled={selectedIndex === 0}
            style={{
              background: selectedIndex === 0 ? '#f3f4f6' : '#fff',
              color: selectedIndex === 0 ? '#a1a1aa' : '#6366f1',
              border: '1.5px solid #e5e7eb',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: selectedIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: 16,
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              boxShadow: selectedIndex === 0 ? 'none' : '0 1px 4px rgba(16,30,54,0.04)',
              transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
            }}
          >
            <span>←</span>
          </button>

          <span style={{ 
            color: '#64748b', 
            fontSize: 15,
            fontWeight: '600',
            minWidth: '48px',
            textAlign: 'center',
            letterSpacing: 0.2,
          }}>
            {selectedIndex + 1} / {images.length}
          </span>

          <button
            onClick={handleNext}
            disabled={selectedIndex === images.length - 1}
            style={{
              background: selectedIndex === images.length - 1 ? '#f3f4f6' : '#fff',
              color: selectedIndex === images.length - 1 ? '#a1a1aa' : '#6366f1',
              border: '1.5px solid #e5e7eb',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: selectedIndex === images.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: 16,
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              boxShadow: selectedIndex === images.length - 1 ? 'none' : '0 1px 4px rgba(16,30,54,0.04)',
              transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
            }}
          >
            <span>→</span>
          </button>
        </div>

        <button
          onClick={() => setShowGrid(true)}
          style={{
            background: '#fff',
            color: '#6366f1',
            border: '1.5px solid #e5e7eb',
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 4px rgba(16,30,54,0.04)',
          }}
        >
          <span>Grid</span>
        </button>

        <select
          value={mainView}
          onChange={handleViewChange}
          style={{
            background: '#f3f4f6',
            color: '#374151',
            border: '1.5px solid #e5e7eb',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 14,
            fontWeight: '600',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 1px 4px rgba(16,30,54,0.04)',
            marginLeft: 4,
          }}
        >
          <option value="axial">Axial</option>
          <option value="coronal">Coronal</option>
          <option value="sagittal">Sagittal</option>
        </select>
      </div>
    </div>
  );
});

export default SliceStrip;