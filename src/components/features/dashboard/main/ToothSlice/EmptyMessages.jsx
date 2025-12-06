"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import dataNotFound from '@/components/shared/lottie/Nodatafound.json';

// ✅ رسالة وقت ما فماش سلايس
export const NoSliceDataMessage = React.memo(({ view }) => (
    <motion.div
        className="bg-gray-100 rounded-lg text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
        <div className="text-gray-500 text-lg font-medium">
            Pas de slices pour {view}
        </div>
    </motion.div>
));
NoSliceDataMessage.displayName = "NoSliceDataMessage";

// ✅ رسالة إذا السن مفقود
export const MissingToothMessage = React.memo(({ toothNumber }) => (
    <motion.div
        className="relative rounded-lg flex flex-col justify-center h-full items-center text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
    >
        <span className="absolute top-2 left-2 font-[#0d0c22] text-3xl text-gray-800">
            Tooth Slices
        </span>
        <Lottie animationData={dataNotFound} className="w-[350px]" loop={true} />
        <p className="text-xl text-[#7564ed] font-medium opacity-50">
            There are no MPR for Missing tooth {toothNumber}
        </p>
    </motion.div>
));
MissingToothMessage.displayName = "MissingToothMessage";
