"use client";
import React, { useState, useEffect } from 'react';
import { Home, Users, Settings, LogOut, Menu, X, Building2, FileText, User, ChevronRight, Database, Blocks, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { logoutAdmin } from '@/utils/adminUtils';

import Image from 'next/image';

export default function AdminDashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [adminProfile, setAdminProfile] = useState(null);
    const pathname = usePathname();

    const fetchProfile = async () => {
        try {
            const res = await adminService.getAdminProfile();
            if (res.user) {
                setAdminProfile(res.user);
            }
        } catch (error) {
            console.error("Failed to fetch admin profile", error);
        }
    };

    useEffect(() => {
        fetchProfile();

        // Listen for profile updates
        const handleProfileUpdate = () => {
            fetchProfile();
        };

        window.addEventListener('admin-profile-updated', handleProfileUpdate);

        return () => {
            window.removeEventListener('admin-profile-updated', handleProfileUpdate);
        };
    }, []);

    const handleLogout = async () => {
        await logoutAdmin();
    };

    const menuItems = [
        { icon: Home, label: 'Overview', href: '/admin/dashboard' },
        { icon: Users, label: 'Users', href: '/admin/dashboard/users' },
        { icon: User, label: 'Patients', href: '/admin/dashboard/patients' },
        { icon: Building2, label: 'Clinics', href: '/admin/dashboard/clinics' },
        { icon: FileText, label: 'Reports', href: '/admin/dashboard/reports' },
        { icon: Database, label: 'Storage', href: '/admin/dashboard/storage' }, // Added Storage
        {
            icon: Settings,
            label: 'Settings',
            href: '/admin/dashboard/settings',
            subItems: [
                { label: 'Profile & Account', href: '/admin/dashboard/settings/profile' },
                { label: 'System Configuration', href: '/admin/dashboard/settings/system' },
            ]
        },
        { icon: AlertTriangle, label: 'Incident Reports', href: '/admin/dashboard/incident-reports' },
        { icon: Blocks, label: 'Integrations', href: '/admin/dashboard/integration' },
    ];

    return (
        <div className="min-h-screen bg-[#e4e7eb] flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-20 flex items-center px-8 gap-3">
                        <Image src="/XDENTAL.png" width={32} height={32} alt="XDENTAL" className="w-8 h-8 rounded-lg object-contain" />
                        <span className="text-3xl font-bold text-gray-900 tracking-tight">
                            XDENTAL
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <div key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-md font-medium transition-all duration-200 group ${isActive
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon size={20} className={`transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`} />
                                        {item.label}
                                    </Link>
                                    {item.subItems && (
                                        <div className="ml-9 mt-1 space-y-0.5 border-l border-gray-100 pl-3">
                                            {item.subItems.map((subItem) => (
                                                <Link
                                                    key={subItem.href}
                                                    href={subItem.href}
                                                    className={`block px-3 py-2 text-md rounded-lg transition-colors ${pathname === subItem.href
                                                        ? 'text-gray-900 font-medium bg-gray-50'
                                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Admin Profile Card */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="bg-[#1a1c2e] rounded-2xl p-4 text-white shadow-xl shadow-indigo-100/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#7564ed] flex items-center justify-center text-white font-bold text-sm ring-4 ring-[#7564ed]/20">
                                    {adminProfile?.first_name?.[0] || 'A'}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-semibold text-sm truncate text-gray-100">
                                        {adminProfile?.first_name} {adminProfile?.last_name}
                                    </h4>
                                    <p className="text-xs text-gray-400 truncate">
                                        {adminProfile?.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full bg-white/10 hover:bg-white/20 active:bg-white/5 text-white text-xs font-medium py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col min-w-0 bg-[#e4e7eb]">
                {/* Top Bar / Breadcrumbs */}
                <header className=" h-16 flex items-center px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-1 text-sm">
                        {/* Logo Icon */}
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-rose-500 via-purple-500 to-blue-500 shadow-sm shrink-0"></div>


                        {/* Dynamic Breadcrumbs */}
                        <div className="flex items-center gap-1">
                            {pathname.split('/').filter(p => p && p !== 'admin').map((segment, index, array) => {
                                const isLast = index === array.length - 1;
                                const pathLabels = {
                                    'dashboard': 'Dashboard',
                                    'users': 'User Management',
                                    'patients': 'Patient Management',
                                    'clinics': 'Clinic Management',
                                    'reports': 'Reports',
                                    'incident-reports': 'Incident Reports',
                                    'storage': 'Storage',
                                    'settings': 'Settings',
                                    'profile': 'Profile',
                                    'system': 'System Configuration',
                                    'integration': 'Integrations',
                                };

                                const label = pathLabels[segment.toLowerCase()] || decodeURIComponent(segment);

                                return (
                                    <div key={index} className="flex items-center gap-1">
                                        {index > 0 && <ChevronRight className="w-8 h-8 text-[#7564ed]" />}
                                        <span className={`text-xl ${isLast ? 'font-semibold text-gray-900' : 'font-medium text-[#7564ed]'}`}>
                                            {label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </header>

                {/* Page Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-64px)] p-6">
                    {children}
                </div>
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed   inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
