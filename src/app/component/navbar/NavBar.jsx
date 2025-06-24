"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Moon, ChevronRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from 'next/navigation';
import Link from "next/link";
import { LayoutControls } from "./controlLayOut";
import { useTranslation } from 'react-i18next';

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

  // Ensure hydration matches by using effect
  useEffect(() => {
    setIsMounted(true);
    
    // Retrieve saved language
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
    
    // Set document language and direction
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
  }, []);

  // Prevent hydration mismatches by checking mount state
  if (!isMounted) {
    return null;
  }

  const reportData = {
    patientName: t('navbar.patientName') || "Felicia Hall",
    title: t('navbar.reportTitle') || "CBCT AI Report",
    date: "Jan 27, 2025"
  };

  const breadcrumbItems = [
    { label: t('navbar.home'), href: "/" },
    { label: t('navbar.patients'), href: "/patients" },
    { label: reportData.patientName, href: `/patients/${reportData.patientName.toLowerCase().replace(' ', '-')}` },
    { label: reportData.title, href: "#", isCurrent: true },
  ];

  const goToAnotherPage = () => {
    router.push('/Report');
  };

  const handlePrintAnalyses = () => {
    window.print();
  };

  const changeLanguage = (lng) => {
    setCurrentLanguage(lng);
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('preferredLanguage', lng);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="container flex items-center justify-between px-6 py-3 mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-full bg-transparent">
            <nav className="flex items-center text-sm text-muted-foreground" aria-label="Breadcrumb">
              {breadcrumbItems.map((item, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
                  {item.isCurrent ? (
                    <span className="font-medium text-foreground" aria-current="page">
                      {item.label}
                    </span>
                  ) : (
                    <Link 
                      href={item.href} 
                      className="hover:text-foreground hover:underline"
                      prefetch={false}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            style={{
              '--background': '#6a5acd',
              '--background-hover': '#625a97',
            }}
            className={"bg-[var(--background)] hover:bg-[var(--background-hover)]"}
            variant="default" 
            size="sm"
            onClick={goToAnotherPage}
          >
            <Printer className="mr-2 h-4 w-4" />
            {t('navbar.print')}
          </Button>

          <Button 
            variant="outline"
            size="icon"
            className="mr-2"
            aria-label="الصفحة الرئيسية"
            onClick={() => router.push('/')}
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          
          <LayoutControls />
          
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
            
            <div className="flex items-center gap-2 ml-2">
              <Avatar>
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback>{userData.fallback}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {userData.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}