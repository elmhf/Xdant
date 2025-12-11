"use strict"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const DialogContext = React.createContext({
  isDesktop: true,
})

const Dialog = ({
  ...props
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [isOpen, setIsOpen] = React.useState(props.open)

  React.useEffect(() => {
    setIsOpen(props.open)
  }, [props.open])

  // Handle open state change safely
  const handleOpenChange = (open) => {
    setIsOpen(open)
    if (props.onOpenChange) {
      props.onOpenChange(open)
    }
  }

  return (
    <DialogContext.Provider value={{ isDesktop }}>
      {isDesktop ? (
        <DialogPrimitive.Root {...props} open={props.open !== undefined ? props.open : isOpen} onOpenChange={handleOpenChange} />
      ) : (
        <Drawer {...props} open={props.open !== undefined ? props.open : isOpen} onOpenChange={handleOpenChange} />
      )}
    </DialogContext.Provider>
  )
}

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props} />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isDesktop } = React.useContext(DialogContext)

  if (isDesktop) {
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[20%] z-50 grid w-full max-w-[650px] translate-x-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
            className
          )}
          {...props}>
          {children}
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  }

  return (
    <DrawerContent ref={ref} className={className} {...props}>
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted " />
      {children}
      <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DrawerClose>
    </DrawerContent>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}) => {
  const { isDesktop } = React.useContext(DialogContext)

  if (isDesktop) {
    return (
      <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props} />
    )
  }
  return <DrawerHeader className={cn("text-left", className)} {...props} />
}
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}) => {
  const { isDesktop } = React.useContext(DialogContext)

  if (isDesktop) {
    return (
      <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props} />
    )
  }
  return <DrawerFooter className={cn("pt-2", className)} {...props} />
}
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => {
  const { isDesktop } = React.useContext(DialogContext)

  if (isDesktop) {
    return (
      <DialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props} />
    )
  }
  return <DrawerTitle ref={ref} className={cn("text-left", className)} {...props} />
})
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { isDesktop } = React.useContext(DialogContext)

  if (isDesktop) {
    return (
      <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props} />
    )
  }
  return <DrawerDescription ref={ref} className={cn("text-left", className)} {...props} />
})
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
