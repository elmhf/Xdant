"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full bg-white p-4"
      suppressHydrationWarning
    >
      <div className="flex flex-wrap min-w-full flex-col md:flex-row items-center justify-center w-full ">
        {/* Left: Illustration */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="text-[300px] md:text-[350px] font-bold text-gray-900 tracking-tight">
            404
          </div>
        </div>

        {/* Right: Text Content */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 tracking-tight">
            Oops!
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-gray-400 max-w-md">
            We couldn't find the page <br className="hidden md:block" />
            you were looking for
          </h2>

          <Link
            href="/"
            className="group flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-300 mt-4"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Go home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}