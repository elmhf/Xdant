import * as React from "react"
import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  label,
  required = false,
  error,
  ...props
}) {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          // Base styles matching the design
          "flex h-11 w-full text-semibold rounded-2xl border-1 border-gray-300 bg-white px-4 py-3",
          "text-sm text-gray-600 bg-white",
          "hover:border-[#7564ed] hover:border-2",
          "focus:border-[#7564ed] focus:border-2 focus:outline-none focus:ring-0",
          "transition-colors duration-200",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
export { Input }
