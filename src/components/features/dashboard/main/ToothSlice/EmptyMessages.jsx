"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import dataNotFound from '@/components/shared/lottie/Nodatafound.json';
import { useTranslation } from 'react-i18next';

// ✅ رسالة وقت ما فماش سلايس
export const NoSliceDataMessage = React.memo(({ view }) => {
    const { t } = useTranslation();
    return (
        <motion.div
            className="bg-gray-100 rounded-2xl text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-gray-500 text-lg font-medium">
                {t('dashboard.noSlices', { view })}
            </div>
        </motion.div>
    );
});
NoSliceDataMessage.displayName = "NoSliceDataMessage";

// ✅ رسالة إذا السن مفقود
export const MissingToothMessage = React.memo(({ toothNumber }) => {
    const { t } = useTranslation();
    return (
        <motion.div
            className="relative rounded-2xl flex flex-col justify-center h-full items-center text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <span className="absolute top-2 left-2 font-[#0d0c22] text-3xl text-gray-800">
                {t('dashboard.toothSlices')}
            </span>
            <Lottie animationData={dataNotFound} className="w-[350px]" loop={true} />
            <p className="text-xl text-[#7564ed] font-medium opacity-50">
                {t('dashboard.noMprMissing', { toothNumber })}
            </p>
        </motion.div>
    );
});
MissingToothMessage.displayName = "MissingToothMessage";
