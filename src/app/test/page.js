'use client'
import React, { useState, useRef, useEffect } from 'react';

// محاكاة الـ hook (في الواقع تستورده من ملفك)
const useImageCard = () => {
  const [state, setState] = useState({
    images: [],
    isLoading: false,
    error: null,
    isFullScreen: false,
    showParameters: false,
    imageSettings: {
      brightness: 100,
      contrast: 100,
      zoom: 100
    }
  });

  // محاكاة تحميل صورة من URL
  const handleLoadImageFromUrl = async (imageUrl) => {
    if (!imageUrl) {
      setState(prev => ({ ...prev, error: 'Invalid image URL' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // محاكاة التحميل
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const imageObj = {
        file: null,
        data_url: imageUrl,
        name: 'image-from-url.jpg',
        size: 0,
        type: 'image/jpeg'
      };

      setState(prev => ({ 
        ...prev, 
        images: [imageObj], 
        isLoading: false 
      }));

    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load image',
        isLoading: false
      }));
    }
  };

  const isValidImageUrl = (url) => {
    return url && (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg'));
  };

  return {
    ...state,
    handleLoadImageFromUrl,
    isValidImageUrl
  };
};

// كومبوننت الـ Form
const ImageLoadForm = ({ onImageLoad }) => {
  const [imageUrl, setImageUrl] = useState('');
  const { handleLoadImageFromUrl, isLoading, error, isValidImageUrl } = useImageCard();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageUrl.trim()) {
      alert('يرجى إدخال رابط الصورة');
      return;
    }

    if (!isValidImageUrl(imageUrl)) {
      alert('يرجى إدخال رابط صورة صالح (jpg, png, jpeg)');
      return;
    }

    await handleLoadImageFromUrl(imageUrl);
    
    // إرسال الصورة للكومبوننت الأب
    if (onImageLoad) {
      onImageLoad(imageUrl);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">تحميل صورة من رابط</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
            رابط الصورة
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !imageUrl.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              جاري التحميل...
            </div>
          ) : (
            'تحميل الصورة'
          )}
        </button>
      </form>

      {/* أمثلة سريعة */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">أمثلة سريعة:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'https://picsum.photos/800/600?random=1',
            'https://picsum.photos/800/600?random=2',
            'https://picsum.photos/800/600?random=3'
          ].map((url, index) => (
            <button
              key={index}
              onClick={() => setImageUrl(url)}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700"
              disabled={isLoading}
            >
              مثال {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// كومبوننت Konva (محاكاة - في الواقع تستعمل react-konva)
const KonvaImageDisplay = ({ imageUrl, imageSettings }) => {
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageObj, setImageObj] = useState(null);

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageObj(img);
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error('Failed to load image');
        setImageLoaded(false);
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded && imageObj && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // مسح الـ canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // تطبيق إعدادات الصورة
      const { brightness, contrast, zoom } = imageSettings;
      
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      
      // حساب الأبعاد مع التكبير
      const scale = zoom / 100;
      const width = imageObj.width * scale;
      const height = imageObj.height * scale;
      
      // توسيط الصورة
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;
      
      // رسم الصورة
      ctx.drawImage(imageObj, x, y, width, height);
      
      // إعادة تعيين الفلتر
      ctx.filter = 'none';
    }
  }, [imageLoaded, imageObj, imageSettings]);

  if (!imageUrl) {
    return (
      <div className="bg-gray-100 rounded-lg p-12 text-center">
        <div className="text-gray-400 text-lg mb-2">📷</div>
        <p className="text-gray-600">لا توجد صورة محملة</p>
        <p className="text-sm text-gray-500">استعمل النموذج أعلاه لتحميل صورة</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">معاينة الصورة</h3>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto bg-gray-50"
          style={{ maxHeight: '400px', objectFit: 'contain' }}
        />
      </div>

      {!imageLoaded && (
        <div className="mt-4 text-center">
          <div className="animate-pulse text-gray-500">جاري تحميل الصورة...</div>
        </div>
      )}

      {imageLoaded && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>✅ تم تحميل الصورة بنجاح</p>
          <p>الأبعاد: {imageObj?.width} × {imageObj?.height}</p>
        </div>
      )}
    </div>
  );
};

// كومبوننت التحكم في إعدادات الصورة
const ImageControls = ({ imageSettings, onSettingChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">إعدادات الصورة</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            السطوع: {imageSettings.brightness}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={imageSettings.brightness}
            onChange={(e) => onSettingChange('brightness', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التباين: {imageSettings.contrast}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={imageSettings.contrast}
            onChange={(e) => onSettingChange('contrast', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التكبير: {imageSettings.zoom}%
          </label>
          <input
            type="range"
            min="25"
            max="200"
            value={imageSettings.zoom}
            onChange={(e) => onSettingChange('zoom', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <button
          onClick={() => {
            onSettingChange('brightness', 100);
            onSettingChange('contrast', 100);
            onSettingChange('zoom', 100);
          }}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          إعادة تعيين
        </button>
      </div>
    </div>
  );
};

// الكومبوننت الرئيسي
const ImageFormWithKonva = () => {
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageSettings, setImageSettings] = useState({
    brightness: 100,
    contrast: 100,
    zoom: 100
  });

  const handleImageLoad = (imageUrl) => {
    setCurrentImageUrl(imageUrl);
  };

  const handleSettingChange = (setting, value) => {
    setImageSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تحميل وعرض الصور</h1>
        <p className="text-gray-600">قم بتحميل صورة من رابط وعرضها مع إمكانية التحكم في الإعدادات</p>
      </div>

      {/* نموذج تحميل الصورة */}
      <ImageLoadForm onImageLoad={handleImageLoad} />

      {/* عرض الصورة والتحكم */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <KonvaImageDisplay 
            imageUrl={currentImageUrl} 
            imageSettings={imageSettings}
          />
        </div>
        
        <div>
          <ImageControls 
            imageSettings={imageSettings}
            onSettingChange={handleSettingChange}
          />
        </div>
      </div>

      {/* معلومات إضافية */}
      {currentImageUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">معلومات الصورة:</h4>
          <p className="text-blue-800 text-sm break-all">
            <strong>الرابط:</strong> {currentImageUrl}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageFormWithKonva;