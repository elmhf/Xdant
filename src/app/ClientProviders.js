// app/components/ClientProviders.js
"use client";

import { I18nextProvider } from 'react-i18next';
import i18n from './language/i18n';
import { Toaster } from "@/components/ui/sonner";
import { NotificationProvider } from './component/jsFiles/NotificationProvider';
import Navbar from './component/navbar/NavBar';
import { LanguageProvider } from './language/LanguageProvider';
import { createContext, useState } from "react";
import PageLoader from './component/pageLoder/page.loderfdfsdfsgss';

// إنشاء الـ Contexts

export default function ClientProviders({ children }) {

  // TODO: For SSR, get defaultLanguage from cookie or server prop
  const defaultLanguage = 'en';

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider defaultLanguage={defaultLanguage}>
            <NotificationProvider>
  

                  <main className="flex flex-col w-full min-h-screen h-screen bg-background text-primary">
                    <div className="flex-1 max-h-full min-h-0 w-full flex flex-col items-center justify-center">
                      {children}
                    </div>
                  </main>
                
                <Toaster className="z-[1050]" richColors />
            </NotificationProvider>
      </LanguageProvider>
    </I18nextProvider>
  );
}