import { useState } from 'react';

export default function useZoom({ initial = 1, min = 1, max = 3, step = 0.1 } = {}) {
  const [zoom, setZoom] = useState(initial);
  const [zoomCenter, setZoomCenter] = useState({ x: 0, y: 0 });

  const setZoomSafe = (value, center) => {
    let newZoom = value;
    if (typeof value === 'function') {
      newZoom = value(zoom);
    }
    newZoom = Math.max(min, Math.min(max, newZoom));
    setZoom(newZoom);
    if (center) setZoomCenter(center);
  };

  const zoomIn = (center) => setZoomSafe(z => z + step, center);
  const zoomOut = (center) => setZoomSafe(z => z - step, center);
  const resetZoom = () => setZoomSafe(initial);

  return [zoom, setZoomSafe, { zoomIn, zoomOut, resetZoom, min, max, step, zoomCenter, setZoomCenter }];
} 