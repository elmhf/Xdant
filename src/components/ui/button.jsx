"use client"
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-[500] transition-all border-0 cursor-pointer disabled:pointer-events-none disabled:opacity-50  ",
  {
    variants: {
      variant: {
        default: " text-white ",
        destructive: "bg-red-600 text-white",
        secondary: "bg-gray-100 text-gray-800",
        ghost: "text-gray-700",
        link: "text-green-700 underline-offset-4",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-4 py-1.5 text-sm",
        lg: "h-14 px-4 py-3 text-lg",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : motion.button

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      whileHover={{  cursor: "pointer" }}
      {...props}
    />
  )
}

export { Button, buttonVariants }
