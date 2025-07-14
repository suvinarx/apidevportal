"use client"

import React from "react"

const ScrollArea = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const classes = `relative overflow-hidden ${className}`

  return (
    <div ref={ref} className={classes} {...props}>
      <div className="h-full w-full overflow-auto">{children}</div>
    </div>
  )
})

ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
