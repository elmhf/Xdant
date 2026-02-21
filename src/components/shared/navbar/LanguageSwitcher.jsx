"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Globe, ChevronDown } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher({ className }) {
    const { t, i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState('en');

    useEffect(() => {
        // Sync the displayed language code from i18n
        setCurrentLanguage(i18n.language || 'en');
    }, [i18n.language]);

    const changeLanguage = useCallback((lng) => {
        setCurrentLanguage(lng);
        i18n.changeLanguage(lng);
        document.documentElement.lang = lng;
        document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('preferredLanguage', lng);
    }, [i18n]);

    return (
        <div className={className}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-12 w-12 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors" aria-label={t('common.changeLanguage')}>
                        <Globe className="h-11 w-11 text-gray-600" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-gray-100">
                    {['en', 'ar', 'fr', 'es', 'pt'].map((lng) => (
                        <DropdownMenuItem
                            key={lng}
                            onClick={() => changeLanguage(lng)}
                            className={`flex items-center justify-between px-4 py-2 cursor-pointer rounded-lg transition-colors ${currentLanguage === lng ? 'bg-[#7564ed] text-white hover:bg-[#6a4fd8]' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span className="font-medium">
                                {
                                    {
                                        'en': 'English',
                                        'ar': 'العربية',
                                        'fr': 'Français',
                                        'es': 'Español',
                                        'pt': 'Português'
                                    }[lng]
                                }
                            </span>
                            {currentLanguage === lng && (
                                <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default LanguageSwitcher;
