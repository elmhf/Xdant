"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const LottiePlayer = dynamic(
  () => import("@lottiefiles/react-lottie-player").then(mod => mod.Player),
  { ssr: false }
);
import animationData from "./Lottie/404.json";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-8">
      <div className="w-64 h-64 mb-4">
        <LottiePlayer autoplay loop src={animationData} style={{ height: '100%', width: '100%' }} />
      </div>
      <h1 className="text-5xl font-bold text-red-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">الصفحة غير موجودة</h2>
      <p className="text-gray-600 mb-6">عذراً، الصفحة التي تبحث عنها غير متوفرة.</p>
      <Link href="/">
        <span className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">العودة للصفحة الرئيسية</span>
      </Link>
    </div>
  );
} 