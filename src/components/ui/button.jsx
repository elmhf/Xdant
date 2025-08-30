import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2  whitespace-nowrap rounded-full text-base font-bold transition-all  disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black-600 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-green-600 text-white hover:bg-white-700",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border-3 border-gray-300 bg-transparant text-gray-800 hover:bg-gray-50",
        secondary:
          "bg-gray-100 text-gray-800 hover:bg-gray-200",
        ghost:
          "hover:bg-gray-100 text-gray-700",
        link: "text-green-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-8 py-2",
        sm: "h-9 rounded-full px-5 py-1.5 text-sm",
        lg: "h-14 rounded-full px-10 py-3 text-lg",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
