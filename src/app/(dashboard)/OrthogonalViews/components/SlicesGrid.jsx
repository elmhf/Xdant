import React, { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, RotateCw } from "lucide-react";

export default function SlicesGrid({ 
  images = [], 
  selectedIndex = -1, 
  onSelect,
  maxHeight = "70vh",
  gridColumns = "repeat(auto-fit, minmax(80px, 1fr))",
  showPreview = true,
  allowMultiSelect = false,
  enableKeyboardNav = true,
  loadingPlaceholder = "Loading...",
  errorPlaceholder = "Error loading image"
}) {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());
  const [previewIndex, setPreviewIndex] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());

  // Handle image loading states
  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => new Set([...prev, index]));
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const handleImageError = useCallback((index) => {
    setFailedImages(prev => new Set([...prev, index]));
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  // Enhanced selection handling
  const handleSelect = useCallback((index, event) => {
    if (allowMultiSelect && event?.ctrlKey) {
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    } else {
      onSelect?.(index);
      if (allowMultiSelect) {
        setSelectedImages(new Set([index]));
      }
    }
  }, [allowMultiSelect, onSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (!enableKeyboardNav || images.length === 0) return;

    const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowRight':
        newIndex = Math.min(images.length - 1, currentIndex + 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(0, currentIndex - 4); // Assuming 4 columns
        break;
      case 'ArrowDown':
        newIndex = Math.min(images.length - 1, currentIndex + 4);
        break;
      case 'Enter':
      case ' ':
        if (showPreview) {
          setPreviewIndex(currentIndex);
        }
        event.preventDefault();
        break;
      case 'Escape':
        setPreviewIndex(null);
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      handleSelect(newIndex);
      event.preventDefault();
    }
  }, [enableKeyboardNav, images.length, selectedIndex, handleSelect, showPreview]);

  // Memoized image source getter
  const getImageSrc = useMemo(() => {
    return images.map(img => {
      if (typeof img === 'string') return img;
      if (img?.src) return img.src;
      if (img?.url) return img.url;
      return '';
    });
  }, [images]);

  // Preview navigation
  const navigatePreview = useCallback((direction) => {
    if (previewIndex === null) return;
    
    const newIndex = direction === 'next' 
      ? Math.min(images.length - 1, previewIndex + 1)
      : Math.max(0, previewIndex - 1);
    
    setPreviewIndex(newIndex);
  }, [previewIndex, images.length]);

  // Check if image is selected
  const isSelected = useCallback((index) => {
    if (allowMultiSelect) {
      return selectedImages.has(index);
    }
    return index === selectedIndex;
  }, [allowMultiSelect, selectedImages, selectedIndex]);

  React.useEffect(() => {
    if (enableKeyboardNav) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enableKeyboardNav]);

  if (!images || images.length === 0) {
    return (
      <div style={{
        padding: 48,
        textAlign: 'center',
        background: '#23272e',
        borderRadius: 12,
        color: '#9ca3af'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
        <p>لا توجد صور متاحة</p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridColumns,
          gap: 12,
          padding: 24,
          background: "#23272e",
          borderRadius: 12,
          maxHeight: maxHeight,
          overflowY: "auto",
          position: "relative"
        }}
        role="grid"
        aria-label="معرض الصور"
      >
        {images.map((img, idx) => {
          const src = getImageSrc[idx];
          const isLoaded = loadedImages.has(idx);
          const hasFailed = failedImages.has(idx);
          const selected = isSelected(idx);

          return (
            <div
              key={idx}
              onClick={(e) => handleSelect(idx, e)}
              onDoubleClick={() => showPreview && setPreviewIndex(idx)}
              style={{
                border: selected ? "3px solid #3b82f6" : "2px solid #374151",
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                background: "#111827",
                boxShadow: selected ? "0 0 0 2px #60a5fa" : "0 1px 3px rgba(0,0,0,0.3)",
                transition: "all 0.2s ease",
                position: "relative",
                transform: selected ? "scale(1.05)" : "scale(1)",
                opacity: hasFailed ? 0.5 : 1
              }}
              role="gridcell"
              aria-selected={selected}
              aria-label={`صورة ${idx + 1}`}
              tabIndex={0}
            >
              {!isLoaded && !hasFailed && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#1f2937",
                  color: "#9ca3af",
                  fontSize: 12,
                  zIndex: 1
                }}>
                  {loadingPlaceholder}
                </div>
              )}
              
              {hasFailed ? (
                <div style={{
                  width: "100%",
                  height: 70,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#1f2937",
                  color: "#ef4444",
                  fontSize: 12,
                  textAlign: "center"
                }}>
                  {errorPlaceholder}
                </div>
              ) : (
                <img
                  src={src}
                  alt={`شريحة ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: 70,
                    objectFit: "cover",
                    display: "block",
                    opacity: isLoaded ? 1 : 0,
                    transition: "opacity 0.3s ease"
                  }}
                  onLoad={() => handleImageLoad(idx)}
                  onError={() => handleImageError(idx)}
                  loading="lazy"
                />
              )}
              
              {showPreview && (
                <div style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "rgba(0,0,0,0.7)",
                  borderRadius: 4,
                  padding: 4,
                  opacity: 0,
                  transition: "opacity 0.2s ease"
                }}>
                  <ZoomIn size={12} color="white" />
                </div>
              )}
              
              {selected && allowMultiSelect && (
                <div style={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  background: "#3b82f6",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 12,
                  fontWeight: "bold"
                }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {showPreview && previewIndex !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setPreviewIndex(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              background: "#1f2937",
              borderRadius: 12,
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageSrc[previewIndex]}
              alt={`معاينة الصورة ${previewIndex + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block"
              }}
            />
            
            {/* Navigation Controls */}
            <button
              onClick={() => navigatePreview('prev')}
              disabled={previewIndex === 0}
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0, 0, 0, 0.7)",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: previewIndex === 0 ? "not-allowed" : "pointer",
                opacity: previewIndex === 0 ? 0.5 : 1
              }}
            >
              <ChevronLeft color="white" size={20} />
            </button>
            
            <button
              onClick={() => navigatePreview('next')}
              disabled={previewIndex === images.length - 1}
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0, 0, 0, 0.7)",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: previewIndex === images.length - 1 ? "not-allowed" : "pointer",
                opacity: previewIndex === images.length - 1 ? 0.5 : 1
              }}
            >
              <ChevronRight color="white" size={20} />
            </button>
            
            <button
              onClick={() => setPreviewIndex(null)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "rgba(0, 0, 0, 0.7)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <X color="white" size={16} />
            </button>
            
            {/* Image Info */}
            <div style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              right: 16,
              background: "rgba(0, 0, 0, 0.7)",
              padding: 12,
              borderRadius: 8,
              color: "white",
              textAlign: "center"
            }}>
              صورة {previewIndex + 1} من {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}