"use client"
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl font-[500] transition-all border-0 cursor-pointer disabled:pointer-events-none disabled:opacity-50  ",
  {
    variants: {
      variant: {
        default: " bg-gradient-to-br  from-[#7564ed] to-[#6355d0] text-white hover:opacity-90 shadow-sm hover:shadow-md",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900",
        link: "text-[#7564ed] underline-offset-4 hover:underline",
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
      whileHover={{ cursor: "pointer" }}
      {...props}
    />
  )
}

export { Button, buttonVariants }
