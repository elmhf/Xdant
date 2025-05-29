export const fixUnsupportedColors = (element) => {
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const computed = getComputedStyle(el);
    ['color', 'backgroundColor', 'borderColor'].forEach((prop) => {
      const value = computed[prop];
      if (
        value?.includes('oklab') ||
        value?.includes('lch') ||
        value?.includes('color-mix')
      ) {
        const fallback = prop === 'backgroundColor' ? '#ffffff' : '#000000';
        el.style[prop] = fallback;
      }
    });
  });
};

const convertImageToBase64 = (img) => {
  return new Promise((resolve, reject) => {
    if (img.src.startsWith('data:')) {
      resolve(img.src);
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        console.warn('فشل في تحويل الصورة:', error);
        resolve(img.src);
      }
    };
    
    img.onerror = () => {
      console.warn('فشل في تحميل الصورة:', img.src);
      resolve(img.src);
    };
    
    if (img.complete) {
      img.onload();
    }
  });
};

export const processImagesInElement = async (element) => {
  const images = element.querySelectorAll('img');
  const imagePromises = Array.from(images).map(async (img) => {
    try {
      const base64 = await convertImageToBase64(img);
      img.src = base64;
      return img;
    } catch (error) {
      console.warn('خطأ في معالجة الصورة:', error);
      return img;
    }
  });
  
  await Promise.all(imagePromises);
  return element;
};

export const generatePDF = async ({ 
  element, 
  settings, 
  patientId,
  onSuccess,
  onError
}) => {
  try {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    if (!element) throw new Error('PDF content element not found');

    const elementClone = element.cloneNode(true);
    elementClone.style.position = 'absolute';
    elementClone.style.left = '-9999px';
    elementClone.style.top = '0';
    elementClone.style.width = element.offsetWidth + 'px';
    elementClone.style.height = 'auto';
    document.body.appendChild(elementClone);

    await processImagesInElement(elementClone);
    fixUnsupportedColors(elementClone);

    const unwantedElements = elementClone.querySelectorAll('button, .no-print, [data-no-print]');
    unwantedElements.forEach(el => {
      el.style.display = 'none';
    });

    elementClone.querySelectorAll('*').forEach(el => {
      el.style.boxShadow = 'none';
      el.style.textShadow = 'none';
      el.style.WebkitPrintColorAdjust = 'exact';
      el.style.printColorAdjust = 'exact';
    });

    const images = elementClone.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      });
    }));

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);

    const canvas = await html2canvas(elementClone, {
      scale: settings.resolutionScale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      width: elementClone.scrollWidth,
      height: elementClone.scrollHeight,
      windowWidth: elementClone.scrollWidth,
      windowHeight: elementClone.scrollHeight,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedImages = clonedDoc.querySelectorAll('img');
        clonedImages.forEach(img => {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.display = 'block';
        });
      }
    });

    document.body.removeChild(elementClone);

    const imgData = canvas.toDataURL('image/jpeg', settings.imageQuality);
    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.width / imgProps.height;
    
    let imgWidth = contentWidth;
    let imgHeight = contentWidth / imgRatio;
    let totalPages = Math.ceil(imgHeight / (pageHeight - margin * 2));

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      const yOffset = -(i * (pageHeight - margin * 2));
      
      pdf.addImage(
        imgData,
        'JPEG',
        margin,
        margin + yOffset,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
    }

    const fileName = `dental-report-${patientId || 'unknown'}-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);

    const fileSize = (pdf.output('blob').size / 1024).toFixed(2);
    onSuccess(fileSize, totalPages);

  } catch (error) {
    onError(error);
    throw error;
  }
};