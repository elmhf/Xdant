import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProjectStorageCard({ stats, onCreateBucket, loading }) {
    if (loading) {
        return (
            <div className="bg-[#1c1c1c] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-gray-200 min-h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="bg-[#1c1c1c] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-gray-200">
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
    );
}
