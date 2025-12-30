"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Database,
    Cloud,
    FileImage,
    FileText,
    Server,
    HardDrive,
    Trash2,
    Plus,
    MoreVertical,
    Download,
    Loader2,
    Folder,
    Globe
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

export default function StoragePage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const data = await adminService.getStorageStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch storage stats", error);
            toast.error("Failed to load storage statistics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchStats();

        // Optional: Poll every 30 seconds for live updates
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (bucketName) => {
        if (!bucketName) return <Database size={18} className="text-gray-500" />;
        const lower = bucketName.toLowerCase();
        if (lower.includes('image') || lower.includes('avatar')) return <FileImage size={18} className="text-emerald-500" />;
        if (lower.includes('backup')) return <Database size={18} className="text-amber-500" />;
        if (lower.includes('doc') || lower.includes('report') || lower.includes('record')) return <FileText size={18} className="text-indigo-500" />;
        return <Server size={18} className="text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p>Loading Supabase Storage...</p>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            {/* Header / Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Usage Card */}
                <div className="md:col-span-2 bg-[#1c1c1c] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-gray-200">
                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 h-full">
                        {/* Circular Progress Mockup */}
                        <div className="relative w-40 h-40 shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" className="stroke-gray-700 fill-none" strokeWidth="12" />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    className="stroke-emerald-500 fill-none"
                                    strokeWidth="12"
                                    strokeDasharray="440"
                                    strokeDashoffset={440 - (440 * ((stats.totalSizeGB || 0) / 10))} // Assuming 10GB soft limit for visual, or just visual
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {/* Visual % based on arbitrary quota, or just show GB */}
                                <span className="text-3xl font-bold">{stats.totalSizeGB || '0'}</span>
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">GB Used</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div>
                                <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-emerald-500 font-mono text-xs uppercase tracking-wider">Supabase Storage</span>
                                </div>
                                <h3 className="text-2xl font-bold">Project Storage</h3>
                                <p className="text-gray-400">Total usage <span className="font-bold text-white">{stats.totalSize}</span> across all buckets.</p>
                            </div>
                            <div className="flex gap-4 justify-center md:justify-start">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl border-none">
                                    Manage Buckets
                                </Button>
                                <Button variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10 rounded-xl">
                                    Storage Settings
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Column */}
                <div className="grid grid-rows-2 gap-6">
                    {/* Region Card - Dark Theme */}
                    <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-gray-800 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-16 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-white/5 rounded-2xl text-emerald-500 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                                    <Cloud size={24} />
                                </div>
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Online
                                </span>
                            </div>
                            <div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 mt-2">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-wider">Infrastructure</p>
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold text-sm">AWS S3</span>
                                            <span className="text-[10px] text-gray-500">Amazon Cloud</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-wider">Region</p>
                                        <div className="flex flex-col items-end">
                                            <span className="text-white font-bold text-sm">eu-central-1</span>
                                            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                                                <Globe size={10} /> Frankfurt
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Files Card - White Theme with Gradient Icon */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 p-8 bg-indigo-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Objects</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">
                                        {stats.totalFiles.toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100">
                                    <FileText size={24} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 uppercase tracking-wide">
                                    Live
                                </span>
                                <span className="text-xs text-gray-400">
                                    Across {stats.buckets.length} buckets
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Buckets</h3>
                    <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stats.buckets.map((bucket) => (
                        <Link href={`/admin/dashboard/storage/${bucket.label}`} key={bucket.label} className="block group">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="text-gray-600 group-hover:text-emerald-600 transition-colors shrink-0">
                                        <Folder size={20} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium text-gray-700 truncate">{bucket.label}</span>
                                        <span className="text-xs text-gray-500 font-mono">{bucket.size}</span>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Files Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Recent Objects</h3>
                    <Button variant="ghost" size="sm">Explore Storage</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Name</th>
                                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Bucket</th>
                                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Size</th>
                                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Uploaded</th>
                                <th className="text-right py-3 px-6 text-sm font-medium text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recentFiles.map((file, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                {getIcon(file.bucket)}
                                            </div>
                                            <span className="font-medium text-gray-900 truncate max-w-[200px]" title={file.name}>{file.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-6">
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                                            {file.bucket}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-sm text-gray-500">{file.size}</td>
                                    <td className="py-3 px-6 text-sm text-gray-500">{file.date}</td>
                                    <td className="py-3 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900">
                                                <Download size={16} />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
