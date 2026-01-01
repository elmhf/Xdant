import React from 'react';
import { Cloud, Globe, Loader2 } from 'lucide-react';

export default function StorageRegionCard({ loading }) {
    if (loading) {
        return (
            <div className="bg-blue-700 p-6 rounded-3xl border border-blue-600 shadow-lg relative overflow-hidden group h-full min-h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
            </div>
        );
    }

    return (
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
    );
}
