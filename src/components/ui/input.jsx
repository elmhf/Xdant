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
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          // Base styles matching the design
          "flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-3",
          "text-sm text-gray-900 placeholder:text-gray-500",
          "transition-all duration-200 ease-in-out",
          
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20",
          "focus:border-purple-500",
          
          // Hover states
          "hover:border-gray-300",
          
          // Error states
          error && "border-red-300 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20",
          
          // Disabled states
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-75",
          

          
          // File input specific styles
          "file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0",
          "file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700",
          "file:hover:bg-purple-100 file:cursor-pointer",
          "dark:file:bg-purple-900 dark:file:text-purple-300",
          
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
