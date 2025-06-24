"use client";
import { useState, useEffect, useRef } from 'react';
import Dashboard from './component/dashboard/dashboard';

const SimpleLoadingScreen = () => (
  <div className="fixed top-0 left-0 w-screen h-screen bg-white flex flex-col items-center justify-center font-Poppins z-[9999]">
    {/* Logo */}
    <div className="flex items-center justify-center ">
      <img 
        src="/XDENTAL.png" 
        alt="Logo" 
        className="w-52 h-auto max-h-52 rounded-3xl object-contain"
        onError={(e) => {
          // في حالة عدم وجود الصورة، عرض نص بديل
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      {/* Logo نصي بديل */}
      <div className="hidden text-5xl font-bold text-blue-500 text-center">
        LOGO
      </div>
    </div>
  </div>
);

// Hook بسيط للتحقق من اكتمال التحميل
const useRealLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingChecks, setLoadingChecks] = useState({
    domReady: false,
    fontsReady: false,
    dataReady: false,
    dashboardReady: false
  });

  const markCheckComplete = (checkName) => {
    setLoadingChecks(prev => {
      const newChecks = { ...prev, [checkName]: true };
      
      // التحقق من اكتمال جميع الفحوصات
      const allComplete = Object.values(newChecks).every(Boolean);
      if (allComplete) {
        setIsLoading(false);
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
      try {
        // محاولة تحميل البيانات المطلوبة
        const promises = [
          fetch('/data/dentalChart.json').catch(() => null),
          fetch('/data/tooth_svgs.json').catch(() => null)
        ];
        
        await Promise.allSettled(promises);
        markCheckComplete('dataReady');
      } catch {
        // في حالة الفشل، متابعة العمل
        markCheckComplete('dataReady');
      }
    };

    checkDOM();
    checkFonts();
    checkData();

    // timeout أمان - إجبار التحميل بعد 10 ثوانٍ
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    return () => clearTimeout(safetyTimeout);
  }, []);

  return {
    isLoading,
    markDashboardReady: () => markCheckComplete('dashboardReady')
  };
};

// Dashboard مع إشعار الجاهزية
const DashboardWithReadyCheck = ({ onReady }) => {
  const hasNotified = useRef(false);

  useEffect(() => {
    if (!hasNotified.current) {
      // انتظار دورة render واحدة للتأكد من اكتمال التحميل
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          onReady();
          hasNotified.current = true;
        });
      });

      return () => cancelAnimationFrame(timer);
    }
  }, [onReady]);

  return <Dashboard />;
};

const Home = () => {
  const { isLoading, markDashboardReady } = useRealLoading();

  if (typeof window === "undefined") {
    // Skip client-only loading logic during SSR/build
    return null;
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {isLoading && <SimpleLoadingScreen />}

      <div 
        className="font-Poppins h-full w-[95%]"
        style={{
          display: isLoading ? 'none' : 'block'
        }}
      >
        <div className="flex items-center justify-center h-full">
          <DashboardWithReadyCheck onReady={markDashboardReady} />
        </div>
      </div>
    </>
  );
};

export default Home;