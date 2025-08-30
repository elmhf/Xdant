"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Globe, Moon, ChevronRight, Printer, Building, ChevronDown } from "lucide-react";
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
import { useRouter, usePathname } from 'next/navigation';
import Link from "next/link";
import { LayoutControls } from "./controlLayOut";
import { useTranslation } from 'react-i18next';
import { logout } from '@/utils/jwtUtils';
import useUserStore from '../profile/store/userStore';
import Image from 'next/image';

const userData = {
  name: "Paul Fisher",
  fallback: "PF"
};

export default function Navbar() {
  
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();

  // State to manage client-side rendering
  const [isMounted, setIsMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
  
  // Get store data with memoization
  const userInfo = useUserStore(state => state.userInfo);
  const getUserInfo = useUserStore(state => state.getUserInfo);
  const clinicsInfo = useUserStore(state => state.clinicsInfo);
  const currentClinicId = useUserStore(state => state.currentClinicId);
  const setCurrentClinicId = useUserStore(state => state.setCurrentClinicId);
  const fetchMyClinics = useUserStore(state => state.fetchMyClinics);
  const getCurrentClinic = useUserStore(state => state.getCurrentClinic);
  
  // Memoize data loading function
  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        getUserInfo(),
        fetchMyClinics()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [getUserInfo, fetchMyClinics]);
  
  useEffect(() => {
    setIsMounted(true);
    // Retrieve saved language
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    
    // Load data
    loadData();
    
  }, [i18n, loadData]);

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

  if (!isMounted || loading) {
    return (
      <div className="w-full flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="container flex items-center justify-between px-6 py-3 mx-auto">
        <div className="flex items-center gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/") } tabIndex={0} role="button" aria-label="Go to homepage">
              <div className="w-8 h-8 relative">
                <Image
                  src="/XDENTAL.png"
                  alt="Xdental Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">Xdental</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Change language">
                  <Globe className="h-5 w-5" />
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
              <Moon className="h-5 w-5" />
            </Button>
            
            <ProfileDropdown user={userInfo} />
          </div>
        </div>
      </div>
    </header>
  );
}