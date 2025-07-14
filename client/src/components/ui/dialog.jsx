"use client"

import React, { createContext, useContext, useEffect } from "react"

const DialogContext = createContext()

const Dialog = ({ open, onOpenChange, children }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => onOpenChange(false)} />
          {/* Modal Content Container */}
          <div className="relative z-50 max-h-[90vh] overflow-auto">
            {/* Only render DialogContent when open */}
            {React.Children.map(children, (child) => {
              if (child?.type?.displayName === "DialogContent") {
                return child
              }
              return null
            })}
          </div>
        </div>
      )}
      {/* Render non-DialogContent children (like DialogTrigger) outside the modal */}
      {React.Children.map(children, (child) => {
        if (child?.type?.displayName !== "DialogContent") {
          return child
        }
        return null
      })}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ children, asChild, ...props }) => {
  const { onOpenChange } = useContext(DialogContext)

  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true),
      ...props,
    })
  }

  return (
    <button onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  )
}

const DialogContent = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { open } = useContext(DialogContext)

  if (!open) return null

  const classes = `bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 ${className}`

  // Prevent clicks inside the modal from closing it
  const handleContentClick = (e) => {
    e.stopPropagation()
  }

  return (
    <div ref={ref} className={classes} onClick={handleContentClick} {...props}>
      {children}
    </div>
  )
})

const DialogHeader = ({ className = "", ...props }) => {
  const classes = `flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`

  return <div className={classes} {...props} />
}

const DialogTitle = React.forwardRef(({ className = "", ...props }, ref) => {
  const classes = `text-lg font-semibold leading-none tracking-tight ${className}`

  return <h2 ref={ref} className={classes} {...props} />
})

DialogContent.displayName = "DialogContent"
DialogTitle.displayName = "DialogTitle"

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle }
