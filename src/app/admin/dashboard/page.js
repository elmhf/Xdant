"use client"
import React, { useEffect, useState } from 'react';
import { Users, Building2, UserRound, FileText } from 'lucide-react';
import { adminService } from '@/services/adminService';
import RecentUsersTable from '@/components/admin/RecentUsersTable';
import RecentClinicsTable from '@/components/admin/RecentClinicsTable';
import RecentPatientsTable from '@/components/admin/RecentPatientsTable';
import RecentReportsTable from '@/components/admin/RecentReportsTable';

import DashboardChart from '@/components/admin/DashboardChart';
import IncidentReportsCard from '@/components/admin/IncidentReportsCard';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        users: 0,
        clinics: 0,
        patients: 0,
        reports: 0
    });
    const [data, setData] = useState({
        users: [],
        clinics: [],
        patients: [],
        reports: [],
        incidentReports: [],
        chartData: []
    });
    const [loading, setLoading] = useState(true);

    const [adminName, setAdminName] = useState('Admin');

    const fetchStats = async () => {
        try {
            // Fetch Admin Profile
            try {
                const profileRes = await adminService.getAdminProfile();
                if (profileRes.user) {
                    const name = profileRes.user.first_name || profileRes.user.name || profileRes.user.email?.split('@')[0] || 'Admin';
                    setAdminName(name);
                }
            } catch (e) {
                console.error("Failed to fetch admin profile", e);
            }

            // Fetch top 5 items (index 0 to 4) for tables + counts
            const [usersData, clinicsData, patientsData, reportsData, incidentReportsData] = await Promise.all([
                adminService.getAllUsers('0', '4'),
                adminService.getAllClinics('0', '4'),
                adminService.getAllPatients('0', '4'),
                adminService.getAllReports('0', '4'),
                adminService.getIncidentReports('0', '7')
            ]);

            // Update counts
            setStats({
                users: usersData.count || 0,
                clinics: clinicsData.count || 0,
                patients: patientsData.count || 0,
                reports: reportsData.count || 0
            });

            // Update list data
            setData({
                users: usersData.data || [],
                clinics: clinicsData.data || clinicsData.clinics || [],
                patients: patientsData.data || patientsData.patients || [],
                reports: reportsData.data || [],
                incidentReports: incidentReportsData.data || [],
            });

        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="space-y-8 ">
            {/* Dashboard Grid Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Premium Welcome Banner (2/3 width) */}
                <div className="lg:col-span-2">
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#7564ed] to-[#5b4bc4] rounded-3xl p-8 h-full text-white  flex flex-col justify-center">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

                        {/* Stars/Sparkles SVGs */}
                        <svg className="absolute top-8 right-12 text-white/30 w-16 h-16 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C12 0 13.5 10.5 24 12C13.5 13.5 12 24 12 24C12 24 10.5 13.5 0 12C10.5 10.5 12 0 12 0Z" />
                        </svg>
                        <svg className="absolute bottom-8 top-20 right-20 text-white/20 w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C12 0 13.5 10.5 24 12C13.5 13.5 12 24 12 24C12 24 10.5 13.5 0 12C10.5 10.5 12 0 12 0Z" />
                        </svg>

                        <div className="relative z-10 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-indigo-100 font-medium text-sm uppercase tracking-wider">
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold text-white">ONLINE</span>
                                <span>Admin Dashboard</span>
                            </div>

                            <p className="text-3xl md:text-5xl font-bold tracking-tight mt-2">
                                Welcome back, {adminName}! 
                            </p>

                            <p className="text-lg text-indigo-100 max-w-xl mt-2 font-medium">
                                Manage your website, users, and clinics from here. Check the latest reports and performance metrics.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Incident Reports (1/3 width, Spans 2 Rows) */}
                <div className="lg:col-span-1 lg:row-span-2">
                    <IncidentReportsCard reports={data.incidentReports} loading={loading} />
                </div>

                {/* Dashboard Chart (Bottom Left - 2 Cols) */}
                <div className="lg:col-span-2">
                    <DashboardChart />
                </div>
            </div>

            {/* Data Tables Grid */}
            <div className="grid bg-white grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentUsersTable users={data.users} loading={loading} onRefresh={fetchStats} />
                <RecentClinicsTable clinics={data.clinics} loading={loading} />
                <RecentPatientsTable patients={data.patients} loading={loading} />
                <RecentReportsTable reports={data.reports} loading={loading} />
            </div>
        </div>
    );
}
