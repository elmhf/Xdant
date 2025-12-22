import React from 'react';
import { WifiOff, RotateCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ErrorConnect({ onRetry, onClearCache }) {
    return (
        <div className="flex w-full flex-col items-center justify-center min-h-screen gap-6 p-6 max-w-md mx-auto">
            {/* 3D Visual - Reusing the cone or using a dedicated connection icon */}
            <div className="relative w-full flex justify-center mb-2">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full" />
                <div className="w-32 h-32 bg-white rounded-[32px] shadow-lg shadow-red-100 flex items-center justify-center relative z-10 border border-red-50">
                    <WifiOff className="w-16 h-16 text-red-400" strokeWidth={1.5} />
                </div>
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Connection Failed</h2>
                <p className="text-slate-500 text-base max-w-[280px] mx-auto leading-relaxed">
                    We couldn't load the report data. Please check your connection and try again.
                </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-[240px]">
                <Button
                    onClick={onRetry}
                    className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white rounded-2xl h-12 text-base font-medium shadow-sm active:scale-95 transition-all"
                >
                    <RotateCw className="w-5 h-5 mr-2" />
                    Try Again
                </Button>

                {onClearCache && process.env.NODE_ENV === "development" && (
                    <Button
                        onClick={onClearCache}
                        variant="ghost"
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl h-10 text-sm"
                    >
                        Clear Cache
                    </Button>
                )}
            </div>
        </div>
    );
}
