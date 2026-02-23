"use client";

import React from 'react';
import { ChevronRight, ChevronDown, BookOpen, Globe, Users, Zap } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export default function GettingStartedSidebar({ activeId, onSelect }) {
    const { t } = useTranslation();

    const menuItems = [
        {
            id: 'getting-started',
            title: t('gettingStarted.menu.title', 'Get Started'),
            icon: BookOpen,
            hasSubmenu: true,
            isOpen: true,
            children: [
                { id: 'account-customization', title: t('gettingStarted.menu.accountCustomization') },
                { id: 'patient-card-overview', title: t('gettingStarted.menu.patientCardOverview') },
                { id: 'panoramic-analysis', title: t('gettingStarted.menu.panoramicAnalysis') },
                { id: 'cbct-analysis', title: t('gettingStarted.menu.cbctAnalysis') },
            ],
        },
    ];

    return (
        <aside className="w-80 h-full border-r border-gray-100 bg-white flex flex-col p-4 overflow-y-auto">
            <div className="space-y-2">
                {menuItems.map((item) => (
                    <div key={item.id} className="space-y-1">
                        <button
                            onClick={() => onSelect(item.id)}
                            className={clsx(
                                "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left",
                                activeId === item.id ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={clsx(
                                    "w-5 h-5 transition-colors",
                                    activeId === item.id ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                )} />
                                <span className="text-sm font-medium">{item.title}</span>
                            </div>
                            {item.hasSubmenu && (
                                item.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                            )}
                        </button>

                        {item.children && item.isOpen && (
                            <div className="ml-9 space-y-1">
                                {item.children.map((child) => (
                                    <button
                                        key={child.id}
                                        onClick={() => onSelect(child.id)}
                                        className={clsx(
                                            "w-full p-2 text-sm rounded-lg transition-colors text-left",
                                            activeId === child.id ? "text-blue-600 font-semibold" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                        )}
                                    >
                                        {child.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
}
