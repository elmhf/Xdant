'use client';
import React, { useEffect, useRef,useState } from 'react';
import { Stage, Layer, Image, Group } from 'react-konva';

const ImageViewer = ({
  image,
  stageRef,
  viewState,
  updateViewState,
  useFilter,
  children
}) => {
  const containerRef = useRef(null);
  const [imgState, setImgState] = useState({
    obj: null,
    size: { width: 0, height: 0 }
  });
  const imageNodeRef = useRef(null);

  // تحميل الصورة
  useEffect(() => {
    if (!image) return;

    const img = new window.Image();
    img.onload = () => {
      setImgState({
        obj: img,
        size: { width: img.naturalWidth, height: img.naturalHeight }
      });
    };
    img.src = image;
  }, [image]);

  // حساب حجم الحاوية
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        updateViewState({ containerSize: { width, height } });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [updateViewState]);

  // تطبيق الفلاتر
  useEffect(() => {
    if (!imageNodeRef.current || !useFilter) return;

    const [brightness, contrast, saturation] = useFilter;
    imageNodeRef.current.cache();
    imageNodeRef.current.filters([
      function (imageData) {
        // تطبيق السطوع
        const brightnessFactor = brightness / 100;
        for (let i = 0; i < imageData.data.length; i += 4) {
          imageData.data[i] = Math.min(255, imageData.data[i] * brightnessFactor);
          imageData.data[i + 1] = Math.min(255, imageData.data[i + 1] * brightnessFactor);
          imageData.data[i + 2] = Math.min(255, imageData.data[i + 2] * brightnessFactor);
        }

        // تطبيق التباين
        const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < imageData.data.length; i += 4) {
          imageData.data[i] = contrastFactor * (imageData.data[i] - 128) + 128;
          imageData.data[i + 1] = contrastFactor * (imageData.data[i + 1] - 128) + 128;
          imageData.data[i + 2] = contrastFactor * (imageData.data[i + 2] - 128) + 128;
        }

        // تطبيق التشبع
        for (let i = 0; i < imageData.data.length; i += 4) {
          const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          imageData.data[i] = avg + (imageData.data[i] - avg) * (saturation / 100);
          imageData.data[i + 1] = avg + (imageData.data[i + 1] - avg) * (saturation / 100);
          imageData.data[i + 2] = avg + (imageData.data[i + 2] - avg) * (saturation / 100);
        }
      }
    ]);
    imageNodeRef.current.getLayer().batchDraw();
  }, [useFilter]);

  // معالجة التكبير/التصغير
  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / viewState.scale,
      y: (pointer.y - stage.y()) / viewState.scale
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(ZOOM_RANGE.min, 
      Math.min(ZOOM_RANGE.max, viewState.scale * (1 + direction * ZOOM_RANGE.step)));

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    };

    updateViewState({
      scale: newScale,
      position: newPos
    });
  };

  // معالجة السحب
  const handleDragMove = (e) => {
    if (viewState.isDragging) {
      const newPos = { x: e.target.x(), y: e.target.y() };
      updateViewState({ position: newPos });
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ cursor: viewState.isDragging ? 'grabbing' : 'grab' }}
    >
      <Stage
        ref={stageRef}
        width={viewState.containerSize.width}
        height={viewState.containerSize.height}
        scaleX={viewState.scale}
        scaleY={viewState.scale}
        x={viewState.position.x}
        y={viewState.position.y}
        onWheel={handleWheel}
        draggable
        onDragStart={() => updateViewState({ isDragging: true })}
        onDragEnd={() => updateViewState({ isDragging: false })}
        onDragMove={handleDragMove}
      >
        <Layer>
          {imgState.obj && (
            <Group>
              <Image
                ref={imageNodeRef}
                image={imgState.obj}
                width={imgState.size.width}
                height={imgState.size.height}
                x={(viewState.containerSize.width - imgState.size.width) / 2}
                y={(viewState.containerSize.height - imgState.size.height) / 2}
              />
              {children}
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageViewer;