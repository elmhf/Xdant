/**
 * Converts an image element to base64 data URL
 * @param {HTMLImageElement} img - The image element to convert
 * @returns {Promise<string>} - Promise that resolves with the base64 data URL
 */
export const convertImageToBase64 = (img) => {
  return new Promise((resolve, reject) => {
    // If image is already a data URL, return it directly
    if (img.src.startsWith('data:')) {
      resolve(img.src);
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match image natural size
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    
    // Handle cross-origin images
    img.crossOrigin = 'anonymous';
    
    const handleLoad = () => {
      try {
        ctx.drawImage(img, 0, 0);
        // Convert to PNG for lossless quality
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        console.warn('Failed to convert image:', error);
        // Fallback to original src if conversion fails
        resolve(img.src);
      }
    };
    
    const handleError = () => {
      console.warn('Failed to load image:', img.src);
      // Fallback to original src on error
      resolve(img.src);
    };
    
    // Set up event listeners
    img.onload = handleLoad;
    img.onerror = handleError;
    
    // If image is already loaded, trigger load handler immediately
    if (img.complete) {
      handleLoad();
    }
  });
};

/**
 * Processes all images in an HTML element and converts them to base64
 * @param {HTMLElement} element - The containing element with images
 * @returns {Promise<HTMLElement>} - Promise that resolves with the processed element
 */
export const processImagesInElement = async (element) => {
  if (!element) return element;
  
  const images = element.querySelectorAll('img');
  if (!images.length) return element;
  
  try {
    // Process all images in parallel
    await Promise.all(Array.from(images).map(async (img) => {
      try {
        const base64 = await convertImageToBase64(img);
        img.src = base64;
        
        // Ensure images maintain aspect ratio in PDF
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      } catch (error) {
        console.warn('Error processing image:', error);
      }
    }));
    
    return element;
  } catch (error) {
    console.error('Error processing images:', error);
    return element;
  }
};

/**
 * Optimizes image elements for PDF export
 * @param {HTMLElement} element - The containing element with images
 * @returns {void}
 */
export const optimizeImagesForPDF = (element) => {
  if (!element) return;
  
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    // Ensure images are visible and properly sized
    img.style.display = 'block';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.margin = '0 auto';
    
    // Remove any inline styles that might interfere
    img.style.float = '';
    img.style.position = '';
  });
};

/**
 * Fixes unsupported CSS color formats in an element and its children
 * @param {HTMLElement} element - The element to process
 * @returns {void}
 */
export const fixUnsupportedColors = (element) => {
  if (!element) return;
  
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const computed = getComputedStyle(el);
    
    // Properties that might contain color values
    const colorProperties = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'outlineColor'
    ];
    
    colorProperties.forEach((prop) => {
      const value = computed[prop];
      if (!value) return;
      
      // Check for unsupported color formats
      if (
        value.includes('oklab') ||
        value.includes('lch') ||
        value.includes('color-mix') ||
        value.includes('hwb')
      ) {
        // Fallback colors
        const fallback = prop === 'backgroundColor' ? '#ffffff' : '#000000';
        el.style[prop] = fallback;
      }
    });
  });
};

/**
 * Waits for all images in an element to load
 * @param {HTMLElement} element - The containing element
 * @returns {Promise<void>}
 */
export const waitForImagesToLoad = (element) => {
  if (!element) return Promise.resolve();
  
  const images = element.querySelectorAll('img');
  if (!images.length) return Promise.resolve();
  
  return Promise.all(Array.from(images).map(img => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve;
      }
    });
  }));
};

/**
 * Removes unwanted elements before PDF generation
 * @param {HTMLElement} element - The containing element
 * @param {string[]} selectors - Array of CSS selectors for elements to remove
 * @returns {void}
 */
export const removeUnwantedElements = (element, selectors = [
  'button', 
  '.no-print', 
  '[data-no-print]',
  '.pdf-exclude'
]) => {
  if (!element) return;
  
  selectors.forEach(selector => {
    const elements = element.querySelectorAll(selector);
    elements.forEach(el => {
      el.style.display = 'none';
    });
  });
};