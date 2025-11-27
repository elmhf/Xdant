/**
 * Optimized Image Utilities for Better Performance
 * إصدار محسّن لمعالجة الصور وتوليد PDF
 */

// Global cache for processed images
const imageCache = new Map();
const canvasPool = [];
const MAX_CANVAS_POOL_SIZE = 5;

/**
 * Pool management for canvas elements to reduce memory allocation
 */
const getCanvasFromPool = () => {
  if (canvasPool.length > 0) {
    const canvas = canvasPool.pop();
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }
  return document.createElement('canvas');
};

const returnCanvasToPool = (canvas) => {
  if (canvasPool.length < MAX_CANVAS_POOL_SIZE) {
    canvasPool.push(canvas);
  }
};

/**
 * Optimized image to base64 conversion with caching and quality control
 * @param {HTMLImageElement} img - The image element to convert
 * @param {Object} options - Conversion options
 * @returns {Promise<string>} - Promise that resolves with the base64 data URL
 */
export const convertImageToBase64 = (img, options = {}) => {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'image/jpeg',
    useCache = true
  } = options;

  return new Promise((resolve, reject) => {
    // Check cache first
    const cacheKey = `${img.src}_${quality}_${maxWidth}_${maxHeight}_${format}`;
    if (useCache && imageCache.has(cacheKey)) {
      resolve(imageCache.get(cacheKey));
      return;
    }

    // If image is already a data URL and no processing needed, return it
    if (img.src.startsWith('data:') && !options.resize) {
      resolve(img.src);
      return;
    }

    const canvas = getCanvasFromPool();
    const ctx = canvas.getContext('2d');

    // Calculate optimal dimensions
    let { width, height } = calculateOptimalDimensions(
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      maxWidth,
      maxHeight
    );

    canvas.width = width;
    canvas.height = height;

    const handleLoad = () => {
      try {
        // Use better image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataURL = canvas.toDataURL(format, quality);
        
        // Cache the result
        if (useCache) {
          // Limit cache size to prevent memory leaks
          if (imageCache.size > 50) {
            const firstKey = imageCache.keys().next().value;
            imageCache.delete(firstKey);
          }
          imageCache.set(cacheKey, dataURL);
        }
        
        returnCanvasToPool(canvas);
        resolve(dataURL);
      } catch (error) {
        console.warn('Failed to convert image:', error);
        returnCanvasToPool(canvas);
        resolve(img.src);
      }
    };

    const handleError = () => {
      console.warn('Failed to load image:', img.src);
      returnCanvasToPool(canvas);
      resolve(img.src);
    };

    img.onload = handleLoad;
    img.onerror = handleError;

    if (img.complete) {
      handleLoad();
    }
  });
};

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
const calculateOptimalDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;
  let width = maxWidth;
  let height = width / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
};

/**
 * Batch process images with throttling to prevent browser freeze
 * @param {HTMLElement} element - The containing element with images
 * @param {Object} options - Processing options
 * @returns {Promise<HTMLElement>} - Promise that resolves with the processed element
 */
export const processImagesInElement = async (element, options = {}) => {
  if (!element) return element;

  const images = element.querySelectorAll('img');
  if (!images.length) return element;

  const {
    batchSize = 3, // Process 3 images at a time
    delay = 100,   // 100ms delay between batches
    ...conversionOptions
  } = options;

  try {
    const imageArray = Array.from(images);
    
    // Process images in batches to prevent UI freezing
    for (let i = 0; i < imageArray.length; i += batchSize) {
      const batch = imageArray.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (img, index) => {
        try {
          // Add small delay for each image in batch
          await new Promise(resolve => setTimeout(resolve, index * 10));
          
          const base64 = await convertImageToBase64(img, conversionOptions);
          img.src = base64;
          
          // Optimize for PDF display
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.display = 'block';
        } catch (error) {
          console.warn('Error processing image:', error);
        }
      }));

      // Delay between batches to prevent blocking
      if (i + batchSize < imageArray.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return element;
  } catch (error) {
    console.error('Error processing images:', error);
    return element;
  }
};

/**
 * Optimized PDF preparation with progressive loading
 * @param {HTMLElement} element - The containing element
 * @param {Object} options - Optimization options
 * @returns {Promise<HTMLElement>} - Processed element ready for PDF
 */
export const optimizeForPDFExport = async (element, options = {}) => {
  if (!element) return element;

  const {
    imageQuality = 0.7,
    maxImageWidth = 1200,
    maxImageHeight = 800,
    removeElements = true,
    fixColors = true
  } = options;

  try {
    // Show loading indicator
    const loadingIndicator = showLoadingIndicator(element);

    // Step 1: Remove unwanted elements
    if (removeElements) {
      removeUnwantedElements(element);
    }

    // Step 2: Fix color issues
    if (fixColors) {
      fixUnsupportedColors(element);
    }

    // Step 3: Process images with optimized settings
    await processImagesInElement(element, {
      quality: imageQuality,
      maxWidth: maxImageWidth,
      maxHeight: maxImageHeight,
      format: 'image/jpeg', // JPEG for smaller file size
      batchSize: 2 // Smaller batches for PDF processing
    });

    // Step 4: Wait for all images to load
    await waitForImagesToLoad(element);

    // Step 5: Apply final PDF optimizations
    optimizeImagesForPDF(element);

    // Hide loading indicator
    hideLoadingIndicator(loadingIndicator);

    return element;
  } catch (error) {
    console.error('Error optimizing for PDF:', error);
    return element;
  }
};

/**
 * Enhanced image optimization for PDF with better compression
 */
export const optimizeImagesForPDF = (element) => {
  if (!element) return;

  const images = element.querySelectorAll('img');
  images.forEach(img => {
    // Ensure proper display and sizing
    img.style.display = 'block';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.margin = '10px auto';
    img.style.pageBreakInside = 'avoid';
    
    // Remove problematic styles
    img.style.float = '';
    img.style.position = '';
    img.style.transform = '';
    
    // Add PDF-friendly attributes
    img.setAttribute('data-pdf-optimized', 'true');
  });
};

/**
 * Progressive color fixing with better fallbacks
 */
export const fixUnsupportedColors = (element) => {
  if (!element) return;

  const allElements = element.querySelectorAll('*');
  const colorMap = new Map(); // Cache computed colors

  allElements.forEach((el) => {
    const elementKey = el.tagName + el.className;
    let computed;

    if (colorMap.has(elementKey)) {
      computed = colorMap.get(elementKey);
    } else {
      computed = getComputedStyle(el);
      colorMap.set(elementKey, computed);
    }

    const colorProperties = [
      'color', 'backgroundColor', 'borderColor',
      'borderTopColor', 'borderRightColor', 
      'borderBottomColor', 'borderLeftColor', 'outlineColor'
    ];

    colorProperties.forEach((prop) => {
      const value = computed[prop];
      if (!value || value === 'transparent') return;

      // Check for unsupported color formats
      if (isUnsupportedColor(value)) {
        const fallback = getFallbackColor(prop, value);
        el.style[prop] = fallback;
      }
    });
  });
};

/**
 * Check if color format is unsupported
 */
const isUnsupportedColor = (value) => {
  return value.includes('oklab') ||
         value.includes('lch') ||
         value.includes('color-mix') ||
         value.includes('hwb') ||
         value.includes('color(');
};

/**
 * Get appropriate fallback color
 */
const getFallbackColor = (property, originalValue) => {
  // Try to extract RGB values if possible
  const rgbMatch = originalValue.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
  }

  // Default fallbacks
  const fallbacks = {
    'backgroundColor': '#ffffff',
    'color': '#000000',
    'borderColor': '#cccccc',
    'borderTopColor': '#cccccc',
    'borderRightColor': '#cccccc',
    'borderBottomColor': '#cccccc',
    'borderLeftColor': '#cccccc',
    'outlineColor': '#000000'
  };

  return fallbacks[property] || '#000000';
};

/**
 * Optimized image loading with timeout
 */
export const waitForImagesToLoad = (element, timeout = 30000) => {
  if (!element) return Promise.resolve();

  const images = element.querySelectorAll('img');
  if (!images.length) return Promise.resolve();

  return Promise.race([
    Promise.all(Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete && img.naturalHeight !== 0) {
          resolve();
        } else {
          const onLoad = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onLoad);
            resolve();
          };
          img.addEventListener('load', onLoad);
          img.addEventListener('error', onLoad);
        }
      });
    })),
    new Promise((resolve) => setTimeout(resolve, timeout))
  ]);
};

/**
 * Enhanced element removal with performance optimization
 */
export const removeUnwantedElements = (element, selectors = [
  'button:not(.pdf-keep)',
  '.no-print',
  '[data-no-print]',
  '.pdf-exclude',
  'script',
  'noscript',
  '.tooltip',
  '.dropdown-menu'
]) => {
  if (!element) return;

  // Use DocumentFragment for better performance
  const fragment = document.createDocumentFragment();
  
  selectors.forEach(selector => {
    try {
      const elements = element.querySelectorAll(selector);
      elements.forEach(el => {
        // Instead of display:none, remove completely for better PDF performance
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
    }
  });
};

/**
 * Loading indicator utilities
 */
const showLoadingIndicator = (element) => {
  const indicator = document.createElement('div');
  indicator.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 9999;
      font-family: Arial, sans-serif;
    ">
      <div style="text-align: center;">
        <div style="
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        "></div>
        Processing images for PDF...
      </div>
    </div>
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(indicator);
  return indicator;
};

const hideLoadingIndicator = (indicator) => {
  if (indicator && indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }
};

/**
 * Clean up resources and cache
 */
export const cleanupImageUtils = () => {
  imageCache.clear();
  canvasPool.length = 0;
};