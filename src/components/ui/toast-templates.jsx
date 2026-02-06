import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Check, X, AlertCircle } from "lucide-react";

/**
 * Custom Toast Component matching the specific design:
 * - Green Check Icon
 * - Title (e.g., "Changes saved")
 * - Countdown description
 * - Progress Bar
 */
const CustomSuccessToast = ({ t, title = "Changes saved", duration = 4000 }) => {
    const [timeLeft, setTimeLeft] = useState(Math.ceil(duration / 1000));
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPaused]);

    return (
        <div
            className="w-full relative flex flex-col bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden pointer-events-auto"
            style={{ width: '356px' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="p-4 flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-green-500 text-green-500 flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                    <h3 className="text-base font-bold text-gray-900 leading-none mb-2">
                        {title}
                    </h3>

                </div>

                {/* Close Button */}
                <button
                    onClick={() => toast.dismiss(t)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-100 mt-1">
                <div
                    className="h-full bg-green-500 origin-left"
                    style={{
                        animation: `progress ${duration}ms linear forwards`,
                        animationPlayState: isPaused ? 'paused' : 'running'
                    }}
                />
            </div>

            <style jsx global>{`
                @keyframes progress {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
};

const CustomErrorToast = ({ t, title = "Error occurred", duration = 4000 }) => {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div
            className="w-full relative flex flex-col bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden pointer-events-auto"
            style={{ width: '356px' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="p-4 flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center">
                    <X size={14} strokeWidth={3} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                    <h3 className="text-base font-bold text-gray-900 leading-none mb-2">
                        {title}
                    </h3>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => toast.dismiss(t)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-100 mt-1">
                <div
                    className="h-full bg-red-500 origin-left"
                    style={{
                        animation: `progress ${duration}ms linear forwards`,
                        animationPlayState: isPaused ? 'paused' : 'running'
                    }}
                />
            </div>
        </div>
    );
};

// Generic toast function
export const showToast = (templateName, title, options = {}) => {
    const duration = options.duration || 5000;

    switch (templateName) {
        case 'success':
            toast.custom((t) => (
                <CustomSuccessToast t={t} title={title} duration={duration} />
            ), { duration });
            break;

        case 'error':
            toast.custom((t) => (
                <CustomErrorToast t={t} title={title} duration={duration} />
            ), { duration });
            break;

        default:
            // Fallback to success or standard sonner toast if unknown
            toast.custom((t) => (
                <CustomSuccessToast t={t} title={title} duration={duration} />
            ), { duration });
            break;
    }
};

// Kept for backward compatibility if needed, but redirects to the new generic one
export const showSuccessToast = (title) => {
    showToast('success', title);
};
