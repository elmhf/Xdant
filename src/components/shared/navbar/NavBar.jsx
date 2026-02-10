"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Globe, Moon, ChevronRight, Printer, Building, ChevronDown, Bell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileDropdown from "./UserDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import useNotificationStore from '@/stores/notificationStore';
import NotificationDropdown from './NotificationDropdown';
import { useRouter, usePathname } from 'next/navigation';
import Link from "next/link";
import { LayoutControls } from "./controlLayout";
import { useTranslation } from 'react-i18next';
import { logout } from '@/utils/jwtUtils';
import useUserStore from '@/components/features/profile/store/userStore';
import Image from 'next/image';
import Lottie from 'lottie-react';
import circleLoaderAnimation from '@/components/shared/lottie/circle-loader.json';
import { useNotificationWebSocket } from '@/hooks/useNotificationWebSocket';
import { useUpdateReportData } from '@/app/(dashboard)/patient/hooks';
import { useDentalStore } from '@/stores/dataStore';
import Breadcrumb from '@/components/ui/breadcrumb';

const userData = {
  name: "Paul Fisher",
  fallback: "PF"
};

export default function Navbar() {
  const { notifications, loadingNotification, fetchNotifications } = useNotificationStore();
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();

  // State to manage client-side rendering
  const [isMounted, setIsMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  // const [loading, setLoading] = useState(true); // Handled in parent layout
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [lastSaveTime, setLastSaveTime] = useState(null);

  // Get store data with memoization
  const userInfo = useUserStore(state => state.userInfo);
  const getUserInfo = useUserStore(state => state.getUserInfo);
  const clinicsInfo = useUserStore(state => state.clinicsInfo);
  const currentClinicId = useUserStore(state => state.currentClinicId);
  const setCurrentClinicId = useUserStore(state => state.setCurrentClinicId);
  const fetchMyClinics = useUserStore(state => state.fetchMyClinics);
  const getCurrentClinic = useUserStore(state => state.getCurrentClinic);

  useEffect(() => {
    setIsMounted(true);
    // Retrieve saved language
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';

    // Data loading is now handled in dashboard layout
    // loadData(); 

  }, [i18n]);

  const reportData = useMemo(() => ({
    patientName: t('navbar.patientName') || "Felicia Hall",
    title: t('navbar.reportTitle') || "CBCT AI Report",
    date: "Jan 27, 2025"
  }), [t]);

  const breadcrumbItems = useMemo(() => [
    { label: t('navbar.home'), href: "/" },
    { label: t('navbar.patients'), href: "/patients" },
    { label: reportData.patientName, href: `/patients/${reportData.patientName.toLowerCase().replace(' ', '-')}` },
    { label: reportData.title, href: "#", isCurrent: true },
  ], [t, reportData]);

  const goToAnotherPage = useCallback(() => {
    router.push('/Report');
  }, [router]);

  const handlePrintAnalyses = useCallback(() => {
    window.print();
  }, []);

  const changeLanguage = useCallback((lng) => {
    setCurrentLanguage(lng);
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('preferredLanguage', lng);
  }, [i18n]);

  useEffect(() => {
    if (!userInfo?.user_id) return;
    fetchNotifications(userInfo.id);
    console.log(userInfo, 'userInfo');
  }, [userInfo?.user_id, fetchNotifications]);

  // تفعيل WebSocket للإشعارات
  const { isConnected: wsConnected, connectionStatus: wsStatus } = useNotificationWebSocket(userInfo?.user_id);

  // Log WebSocket status for debugging
  useEffect(() => {
    if (userInfo?.user_id) {
      console.log('🔌 Notification WebSocket Status:', { wsConnected, wsStatus });
    }
  }, [wsConnected, wsStatus, userInfo?.user_id]);

  // Auto-save functionality
  const { updateReportData } = useUpdateReportData();
  const patientData = useDentalStore(state => state.data);
  const hasData = useDentalStore(state => state.hasData);

  const performAutoSave = useCallback(async () => {
    // Get current report data from the page
    const pathname = window.location.pathname;
    const reportIdMatch = pathname.match(/\/patient\/[^\/]+\/([^\/]+)/);

    if (!reportIdMatch) {
      console.log('Not on a report page, skipping auto-save');
      return;
    }

    const reportId = reportIdMatch[1];

    // Check if we have valid patient data to save
    if (!patientData || Object.keys(patientData).length === 0) {
      console.log('No patient data available, skipping auto-save');
      return;
    }

    // Verify data is valid using the store's hasData function
    if (!hasData || !hasData()) {
      console.log('hasData', hasData());
      console.log('⚠️ Data validation failed - data is initial/empty, skipping auto-save');
      return 0;
    }

    setAutoSaveStatus('saving');
    console.log('🔄 Auto-saving report data...', { reportId, dataSize: JSON.stringify(patientData).length });

    try {
      const result = await updateReportData(reportId, patientData);

      if (result.success) {
        setAutoSaveStatus('saved');
        setLastSaveTime(new Date());
        console.log('✅ Auto-save successful');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } else {
        setAutoSaveStatus('error');
        console.error('❌ Auto-save failed:', result.error);
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, [updateReportData, patientData, hasData]);

  // Auto-save every 50 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     performAutoSave();
  //   }, 5000); // 50 seconds

  //   return () => clearInterval(interval);
  // }, [performAutoSave]);

  if (!isMounted) {
    return (
      <div className="w-full flex items-center justify-center py-6">
        <div className="h-10 w-10 animate-pulse bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="flex items-center justify-between py-3 ">
        <div className="flex items-center gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => router.push("/")} tabIndex={0} role="button" aria-label="Go to homepage">
              <div className="w-10 h-10 relative overflow-hidden rounded-full border border-gray-300  ">
                <Image
                  src="/XDENTAL.png"
                  alt="Xdental Logo"
                  width={52}
                  height={52}
                  className="object-contain"
                />
              </div>
              <span className="text-3xl space-x-[-5px] font-[800] text-gray-900">XDent</span>
            </div>
          </div>

          <Breadcrumb className="hidden md:flex ml-4" />
        </div>

        <div className="flex items-center gap-2">

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Change language">
                  <Globe className="h-9 w-9" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {['en', 'ar', 'fr', 'es', 'pt'].map((lng) => (
                  <DropdownMenuItem
                    key={lng}
                    onClick={() => changeLanguage(lng)}
                    className={currentLanguage === lng ? 'bg-accent' : ''}
                  >
                    {
                      {
                        'en': 'English',
                        'ar': 'العربية',
                        'fr': 'Français',
                        'es': 'Español',
                        'pt': 'Português'
                      }[lng]
                    }
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" aria-label="Toggle dark mode">
              <Moon className="h-9 w-9" />
            </Button>

            {/* Auto-save Clock Icon */}
            {(pathname?.includes('/ToothSlice') || pathname?.includes('/PDFReport') || (pathname?.match(/\/patient\/[^\/]+\/[^\/]+$/) && !pathname?.includes('/ToothSlice') && !pathname?.includes('/PDFReport'))) && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Auto-save status"
                onClick={performAutoSave}
                className="relative"
              >
                <Clock
                  className={`h-9 w-9 transition-colors ${autoSaveStatus === 'saving' ? 'text-blue-500 animate-pulse' :
                    autoSaveStatus === 'saved' ? 'text-green-500' :
                      autoSaveStatus === 'error' ? 'text-red-500' :
                        'text-gray-600'
                    }`}
                />
                {autoSaveStatus === 'saving' && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                )}
              </Button>
            )}

            <NotificationDropdown userId={userInfo?.user_id} />

            <ProfileDropdown user={userInfo} />
          </div>
        </div>
      </div>
    </header>
  );
}