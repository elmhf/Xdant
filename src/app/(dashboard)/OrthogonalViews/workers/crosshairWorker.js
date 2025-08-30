// correctedCrosshairWorker.js
"use clienr"
self.onmessage = function (e) {
    try {
      const { voxelCoords, volumeSize, spacing, canvasSize, zoom, panOffset = { x: 0, y: 0 } } = e.data;
      
      // Input validation
      if (!voxelCoords || !volumeSize || !spacing || !canvasSize) {
        throw new Error('Missing required parameters');
      }
      
      // Convert voxel to world coordinates
      const worldX = voxelCoords.x * spacing.x;
      const worldY = voxelCoords.y * spacing.y;
      const worldZ = voxelCoords.z * spacing.z;
      
      // Calculate screen coordinates for each view with proper aspect ratio
      const screenCoords = {
        axial: calculateScreenCoords(
          worldX, worldY, 
          volumeSize.width * spacing.x, volumeSize.height * spacing.y,
          canvasSize, zoom, panOffset, voxelCoords.z
        ),
        coronal: calculateScreenCoords(
          worldX, worldZ,
          volumeSize.width * spacing.x, volumeSize.depth * spacing.z,
          canvasSize, zoom, panOffset, voxelCoords.y
        ),
        sagittal: calculateScreenCoords(
          worldY, worldZ,
          volumeSize.height * spacing.y, volumeSize.depth * spacing.z,
          canvasSize, zoom, panOffset, voxelCoords.x
        )
      };
      
      self.postMessage({ success: true, data: screenCoords });
    } catch (error) {
      self.postMessage({ success: false, error: error.message });
    }
  };
  
  // Function to calculate screen coordinates with proper aspect ratio and centering
  function calculateScreenCoords(worldX, worldY, imageWidth, imageHeight, canvasSize, zoom, panOffset, slice) {
    const { width: canvasWidth, height: canvasHeight } = canvasSize;
    
    // Calculate aspect ratios
    const imageAspectRatio = imageWidth / imageHeight;
    const canvasAspectRatio = canvasWidth / canvasHeight;
    
    // Calculate display dimensions (fit image in canvas)
    let displayWidth, displayHeight, offsetX, offsetY;
    
    if (imageAspectRatio > canvasAspectRatio) {
      // Image is wider than canvas
      displayWidth = canvasWidth;
      displayHeight = canvasWidth / imageAspectRatio;
      offsetX = 0;
      offsetY = (canvasHeight - displayHeight) / 2;
    } else {
      // Image is taller than canvas
      displayWidth = canvasHeight * imageAspectRatio;
      displayHeight = canvasHeight;
      offsetX = (canvasWidth - displayWidth) / 2;
      offsetY = 0;
    }
    
    // Convert world coordinates to normalized coordinates (0-1)
    const normalizedX = worldX / imageWidth;
    const normalizedY = worldY / imageHeight;
    
    // Convert to display coordinates
    const displayX = normalizedX * displayWidth;
    const displayY = normalizedY * displayHeight;
    
    // Apply zoom around center
    const centerX = displayWidth / 2;
    const centerY = displayHeight / 2;
    
    const zoomedX = (displayX - centerX) * zoom + centerX;
    const zoomedY = (displayY - centerY) * zoom + centerY;
    
    // Apply canvas offset and pan
    const screenX = zoomedX + offsetX + panOffset.x;
    const screenY = zoomedY + offsetY + panOffset.y;
    
    return {
      screenX,
      screenY,
      slice,
      displayBounds: {
        left: offsetX + panOffset.x,
        top: offsetY + panOffset.y,
        width: displayWidth * zoom,
        height: displayHeight * zoom
      }
    };
  }
  