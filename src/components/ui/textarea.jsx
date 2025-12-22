import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        className,
        // الأساسيات[]
        "flex w-full rounded-2xl border-1 border-gray-400 bg-white px-3 py-2 text-base shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        // الألوان و الـ placeholder
        "border-input placeholder:text-muted-foreground dark:bg-input/30",
        // التأثير وقت الـ focus
        "  focus:border-[#6366f1]"
      )}
      {...props}
    />
  );
}

export { Textarea };
