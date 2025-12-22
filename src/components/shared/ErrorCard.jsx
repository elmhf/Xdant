import React from 'react';
import { X } from 'lucide-react';

export default function ErrorCard({ error, onClose, onRetry }) {
    // Determine the action handler
    const handleAction = onClose || onRetry;

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
            <div className="relative bg-white rounded-[32px] shadow-xl shadow-slate-200/50 w-full max-w-[400px] p-10 flex flex-col items-center text-center">
                {handleAction && (
                    <button
                        onClick={handleAction}
                        className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>
                )}

                <div className="mb-8 relative w-full flex justify-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full" />
                    <img
                        src="/error-cone.png"
                        alt="Error"
                        className="w-48 h-auto object-contain relative z-10 drop-shadow-xl"
                    />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                    Oops, Something Went Wrong!
                </h2>

                <p className="text-slate-500 text-[15px] leading-relaxed">
                    {/* Use the specific text requested, ignoring the error message for the main display to match the screenshot exactly */}
                    We apologize for the inconvenience. It seems there was an error processing your request
                </p>
            </div>
        </div>
    );
}
