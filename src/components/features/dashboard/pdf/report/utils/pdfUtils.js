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
  return new Promise((resolve) => {
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
    document.body.appendChild(elementClone);

    // تحويل كل canvas إلى صورة
    const canvases = elementClone.querySelectorAll('canvas');
    canvases.forEach((canvas) => {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const img = document.createElement('img');
        img.src = dataUrl;
        img.width = canvas.width;
        img.height = canvas.height;
        img.style.display = 'block';
        img.style.maxWidth = '100%';
        canvas.parentNode.replaceChild(img, canvas);
      } catch (e) {}
    });

    await processImagesInElement(elementClone);
    fixUnsupportedColors(elementClone);

    // إخفاء العناصر الغير لازمة
    elementClone.querySelectorAll('button, .no-print, [data-no-print]').forEach(el => {
      el.style.display = 'none';
    });

    elementClone.querySelectorAll('*').forEach(el => {
      el.style.boxShadow = 'none';
      el.style.textShadow = 'none';
      el.style.WebkitPrintColorAdjust = 'exact';
      el.style.printColorAdjust = 'exact';
    });

    // استنى تحميل كل الصور
    const imgs = elementClone.querySelectorAll('img');
    await Promise.all(Array.from(imgs).map(img => {
      return new Promise((resolve) => {
        if (img.complete) resolve();
        else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      });
    }));

    // تصوير المحتوى
    const canvas = await html2canvas(elementClone, {
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
      imageTimeout: 15000
    });

    document.body.removeChild(elementClone);

    // إعداد الـ PDF
    const imgData = canvas.toDataURL('image/jpeg', settings.imageQuality);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.width / imgProps.height;
    const pageHeightPx = (contentHeight * imgProps.height) / (contentWidth / imgRatio);

    let y = 0;
    let page = 0;
    while (y < imgProps.height) {
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgProps.width;
      pageCanvas.height = pageHeightPx;
      const ctx = pageCanvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, -y);

      const pageImgData = pageCanvas.toDataURL('image/jpeg', settings.imageQuality);
      if (page > 0) pdf.addPage();
      pdf.addImage(pageImgData, 'JPEG', margin, margin, contentWidth, contentHeight, undefined, 'FAST');

      y += pageHeightPx - 10; // نقص بسيط باش ما يقطعش الصور
      page++;
    }

    const fileName = `dental-report-${patientId || 'unknown'}-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);

    const fileSize = (pdf.output('blob').size / 1024).toFixed(2);
    onSuccess(fileSize, page);

  } catch (error) {
    console.error(error);
    onError(error);
  }
};
