"use client"

import React from "react"

const Card = React.forwardRef(({ className = "", ...props }, ref) => {
  const classes = `rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm ${className}`

  return <div ref={ref} className={classes} {...props} />
})

const CardHeader = React.forwardRef(({ className = "", ...props }, ref) => {
  const classes = `flex flex-col space-y-1.5 p-6 ${className}`

  return <div ref={ref} className={classes} {...props} />
})

const CardTitle = React.forwardRef(({ className = "", ...props }, ref) => {
  const classes = `text-2xl font-semibold leading-none tracking-tight ${className}`

  return <h3 ref={ref} className={classes} {...props} />
})

const CardDescription = React.forwardRef(({ className = "", ...props }, ref) => {
  const classes = `text-sm text-gray-500 ${className}`

  return <p ref={ref} className={classes} {...props} />
})

const CardContent = React.forwardRef(({ className = "", ...props }, ref) => {
  const classes = `p-6 pt-0 ${className}`

  return <div ref={ref} className={classes} {...props} />
})

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
