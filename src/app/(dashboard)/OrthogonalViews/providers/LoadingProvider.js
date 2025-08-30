// providers/LoadingProvider.js
"use client";
import { useState, useEffect, createContext, useContext } from 'react';

// إنشاء Context للـ Loading Provider
const LoadingContext = createContext();

// Hook لاستخدام Loading Context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

// شاشة التحميل
const LoadingScreen = ({ customLogo, customText, customAnimation }) => (
  <div className="fixed top-0 left-0 w-screen h-screen bg-white flex flex-col items-center justify-center font-Poppins z-[9999]">
    {/* Logo */}
    <div className="flex items-center justify-center">
      <img 
        src={customLogo || "/XDENTAL.png"}
        alt="Logo" 
        className="w-52 h-auto max-h-52 rounded-3xl object-contain"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      {/* Logo نصي بديل */}
      <div className="hidden text-5xl font-bold text-blue-500 text-center">
        XDENTAL
      </div>
    </div>
    
    {/* مؤشر التحميل */}
    <div className="mt-8">
      {customAnimation || (
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      )}
    </div>
    
    <p className="mt-4 text-gray-600 text-lg">
      {customText || "جاري التحميل..."}
    </p>
  </div>
);

// Loading Provider الرئيسي
export const LoadingProvider = ({ 
  children, 
  customChecks = [],
  customDataUrls = [],
  loadingScreenProps = {},
  safetyTimeout = 10000
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
  const defaultChecks = {
    domReady: false,
    fontsReady: false,
    dataReady: false,
    dashboardReady: false
  };

  // دمج الفحوصات المخصصة مع الافتراضية
  const allChecks = { ...defaultChecks };
  customChecks.forEach(check => {
    allChecks[check] = false;
  });

  const [loadingChecks, setLoadingChecks] = useState(allChecks);

  const markCheckComplete = (checkName) => {
    setLoadingChecks(prev => {
      const newChecks = { ...prev, [checkName]: true };
      
      // التحقق من اكتمال جميع الفحوصات
      const allComplete = Object.values(newChecks).every(Boolean);
      if (allComplete) {
        // تأخير بسيط لضمان انتقال سلس
        setTimeout(() => setIsLoading(false), 500);
      }
      
      return newChecks;
    });
  };

  useEffect(() => {
    // 1. فحص DOM
    const checkDOM = () => {
      if (document.readyState === 'complete') {
        markCheckComplete('domReady');
      } else {
        window.addEventListener('load', () => markCheckComplete('domReady'));
      }
    };

    // 2. فحص الخطوط
    const checkFonts = async () => {
      try {
        await document.fonts.ready;
        markCheckComplete('fontsReady');
      } catch {
        // fallback
        setTimeout(() => markCheckComplete('fontsReady'), 2000);
      }
    };

    // 3. فحص البيانات الأساسية
    const checkData = async () => {
      if (typeof window === 'undefined') return;
      try {
        const defaultUrls = [
          '/data/dentalChart.json',
          '/data/tooth_svgs.json'
        ];
        const allUrls = [...defaultUrls, ...customDataUrls];
        const promises = allUrls.map(url => fetch(url).catch(() => null));
        await Promise.allSettled(promises);
        markCheckComplete('dataReady');
      } catch {
        markCheckComplete('dataReady');
      }
    };

    checkDOM();
    checkFonts();
    checkData();

    // timeout أمان
    const safety = setTimeout(() => {
      setIsLoading(false);
    }, safetyTimeout);

    return () => clearTimeout(safety);
  }, [customDataUrls, safetyTimeout]);

  const contextValue = {
    isLoading,
    loadingChecks,
    markCheckComplete
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {/* تحميل الخطوط */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {isLoading && <LoadingScreen {...loadingScreenProps} />}
      
      <div 
        className={`font-Poppins transition-opacity duration-500 ${
          isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;