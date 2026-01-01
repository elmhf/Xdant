import React from 'react';
import { Plus, Cloud, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StorageStatsCards({ stats, onCreateBucket, loading }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 w-full h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!stats) return null;

    return (
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
                                strokeDashoffset={440 - (440 * ((stats.totalSizeGB || 0) / 10))} // Assuming 10GB soft limit for visual
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
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
                            {onCreateBucket && (
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl border-none"
                                    onClick={onCreateBucket}
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Create Bucket
                                </Button>
                            )}
                            <Button variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10 rounded-xl">
                                Storage Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Column */}
            <div className="flex flex-col gap-6">
                {/* Region Card - Blue Theme */}
                <div className="bg-blue-700 p-6 rounded-3xl border border-blue-600 shadow-lg relative overflow-hidden group h-full">
                    {/* Background Symbol */}
                    <div className="absolute -bottom-6 -right-6 text-white/10 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                        <Globe size={140} />
                    </div>

                    <div className="absolute top-0 right-0 p-16 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-white/20 rounded-2xl text-white border border-white/20 group-hover:scale-105 transition-transform duration-300 backdrop-blur-sm">
                                <Cloud size={24} />
                            </div>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 border border-white/20 text-xs font-medium text-white backdrop-blur-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                Online
                            </span>
                        </div>
                        <div className="mt-8">
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 mt-2">
                                <div>
                                    <p className="text-[10px] text-blue-100 font-medium mb-1 uppercase tracking-wider">Infrastructure</p>
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-sm">AWS S3</span>
                                        <span className="text-[10px] text-blue-100">Amazon Cloud</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-[10px] text-blue-100 font-medium mb-1 uppercase tracking-wider">Region</p>
                                    <div className="flex flex-col items-end">
                                        <span className="text-white font-bold text-sm">eu-central-1</span>
                                        <span className="text-[10px] text-white flex items-center gap-1">
                                            <Globe size={10} /> Frankfurt
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
