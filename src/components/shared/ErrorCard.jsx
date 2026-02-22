import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ErrorCard({ error, onClose, onRetry }) {
    const { t, i18n } = useTranslation('errorCard');
    const isPermissionError = error?.toLowerCase().includes('permission');
    const handleAction = onClose || onRetry;
    const isRTL = i18n.language === 'ar';

    if (isPermissionError) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-screen bg-transparent p-6 sm:p-10 animate-in fade-in duration-500 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="max-w-3xl w-full flex flex-col items-center">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={`fixed top-8 p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all ${isRTL ? 'right-8' : 'left-8'}`}
                        >
                            <ArrowLeft size={28} strokeWidth={2.5} className={isRTL ? 'rotate-180' : ''} />
                        </button>
                    )}

                    <div className="mb-6 sm:mb-8 relative transition-all">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-44 h-32 sm:h-44 bg-red-500/10 blur-[40px] sm:blur-[60px] rounded-full" />
                        <img
                            src="/error-cone.png"
                            alt={t('accessDenied')}
                            className="w-32 sm:w-44 md:w-48 h-auto object-contain relative z-10 drop-shadow-2xl animate-in zoom-in-50 duration-500 delay-100"
                        />
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 sm:mb-5 tracking-tight text-center">
                        {t('accessDenied')}
                    </h1>

                    <div className="bg-slate-50/50 backdrop-blur-sm border border-slate-200 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 md:p-8 w-full mb-6 sm:mb-8 shadow-sm max-w-xl">
                        <h2 className={`text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2.5 ${isRTL ? 'justify-center sm:justify-start' : 'justify-center sm:justify-start'}`}>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 text-[10px] flex-shrink-0">!</span>
                            {t('troubleshooting')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                            <div className={`space-y-1.5 ${isRTL ? 'text-center sm:text-right' : 'text-center sm:text-left'}`}>
                                <p className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-[#7564ed]">{t('step1Title')}</p>
                                <p className="text-slate-600 leading-relaxed text-[13px] sm:text-[14px]">{t('step1Desc')}</p>
                            </div>
                            <div className={`space-y-1.5 ${isRTL ? 'text-center sm:text-right' : 'text-center sm:text-left'}`}>
                                <p className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-[#7564ed]">{t('step2Title')}</p>
                                <p className="text-slate-600 leading-relaxed text-[13px] sm:text-[14px]">{t('step2Desc')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto px-4 sm:px-0">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="w-full sm:px-8 py-2.5 sm:py-3 bg-[#7564ed] text-white font-bold rounded-lg sm:rounded-xl hover:bg-[#6a4fd8] transition-all shadow-xl shadow-[#7564ed]/30 hover:scale-[1.02] active:scale-[0.98] text-sm"
                            >
                                {t('translation:common.tryAgain', { defaultValue: t('tryAgain') })}
                            </button>
                        )}
                        <button
                            onClick={onClose || (() => window.history.back())}
                            className="w-full sm:px-8 py-2.5 sm:py-3 bg-white text-slate-900 font-bold rounded-lg sm:rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98] text-sm"
                        >
                            {t('goBack')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center min-h-screen bg-transparent p-4 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="relative bg-white rounded-[32px] shadow-xl shadow-slate-200/50 w-full max-w-[400px] p-10 flex flex-col items-center text-center">
                {handleAction && (
                    <button
                        onClick={handleAction}
                        className={`absolute top-6 text-slate-400 hover:text-slate-600 transition-colors ${isRTL ? 'left-6' : 'right-6'}`}
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>
                )}

                <div className="mb-8 relative w-full flex justify-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full" />
                    <img
                        src="/error-cone.png"
                        alt={t('oops')}
                        className="w-48 h-auto object-contain relative z-10 drop-shadow-xl"
                    />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                    {t('oops')}
                </h2>

                <div className="text-slate-500 text-[15px] leading-relaxed mb-6">
                    <p>{t('generalError')} <span className="text-red-500 font-medium">{error}</span></p>
                </div>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="w-full py-3 bg-[#7564ed] text-white font-semibold rounded-2xl hover:bg-[#6a4fd8] transition-colors shadow-lg shadow-[#7564ed]/20"
                    >
                        {t('translation:common.tryAgain', { defaultValue: t('tryAgain') })}
                    </button>
                )}
            </div>
        </div>
    );
}
