"use client";

import { useDentalStore } from "@/stores/dataStore";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import emptyAnimation from "@/components/shared/lottie/empty.json";

function Page() {
  const { hasData, isLoading } = useDentalStore();

  // Animation Variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (typeof window === "undefined") {
    // Skip client-only logic during SSR/build
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg text-gray-500"
        >
          جاري تحميل البيانات...
        </motion.p>
      </div>
    );
  }

  if (!hasData()) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeIn}
        className="flex flex-col items-center justify-center h-screen gap-6 px-4 text-center"
      >
        <Lottie
          animationData={emptyAnimation}
          loop={true}
          className="w-64 h-64"
        />
        <h1 className="text-2xl font-bold text-gray-800">لا توجد بيانات متاحة</h1>
        <p className="text-gray-500 max-w-md">
          لم يتم العثور على أي بيانات لعرض التقرير. يرجى التأكد من إدخال البيانات أولاً.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 mt-4 text-white bg-primary rounded-lg shadow-md"
          onClick={() => window.location.href = "/dashboard/upload"}
        >
          الذهاب لإدخال البيانات
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div></div>
  );
}

export default Page;