// app/layout.tsx or app/layout.js
"use client";
import { I18nextProvider } from 'react-i18next';
import i18n from './language/i18n';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { Toaster } from "@/components/ui/sonner";
import { NotificationProvider } from "./component/jsFiles/NotificationProvider";
import Navbar from "./component/navbar/NavBar";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from './language/LanguageProvider';
import { createContext, useState } from "react";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const ListFunctionButton = createContext();
export const NotificationContext = createContext();

export default function RootLayout({ children }) {

  const [NotificationMessage, setNotificationMessage] = useState();
  const [list, setlist] = useState({});

  return (


    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
     



      <body>
      <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <ListFunctionButton.Provider value={{ list, setlist }}>
          <NotificationProvider>

                <Navbar></Navbar>
                {children}


            <Toaster className="z-[1050]"  richColors />
          </NotificationProvider>
        </ListFunctionButton.Provider>
        </LanguageProvider>
        </I18nextProvider>
      </body>
    </html>
  );
}
