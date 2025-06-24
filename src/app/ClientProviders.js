// app/components/ClientProviders.js
"use client";

import { I18nextProvider } from 'react-i18next';
import i18n from './language/i18n';
import { Toaster } from "@/components/ui/sonner";
import { NotificationProvider } from './component/jsFiles/NotificationProvider';
import Navbar from './component/navbar/NavBar';
import { LanguageProvider } from './language/LanguageProvider';
import { createContext, useState } from "react";
import PageLoader from './component/pageLoder/page.loder';

// إنشاء الـ Contexts

export default function ClientProviders({ children }) {

  // TODO: For SSR, get defaultLanguage from cookie or server prop
  const defaultLanguage = 'en';

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider defaultLanguage={defaultLanguage}>
            <NotificationProvider>
                <PageLoader />

                  <main className="flex flex-col w-full justify-center items-center  min-h-screen bg-background text-primary">
                    {/* Navbar */}
                    <Navbar />
                    {children}
                  </main>
                
                <Toaster className="z-[1050]" richColors />
            </NotificationProvider>
      </LanguageProvider>
    </I18nextProvider>
  );
}