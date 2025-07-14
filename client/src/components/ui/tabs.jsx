"use client"

import React, { createContext, useContext, useState } from "react"

const TabsContext = createContext()

const Tabs = ({ defaultValue, value, onValueChange, children, className = "", ...props }) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef(({ className = "", ...props }, ref) => {
  const classes = `inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`

  return <div ref={ref} className={classes} {...props} />
})

const TabsTrigger = React.forwardRef(({ className = "", value, children, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext)
  const isSelected = selectedValue === value

  const classes = `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
    isSelected ? "bg-white text-gray-950 shadow-sm" : "hover:bg-gray-200 hover:text-gray-900"
  } ${className}`

  return (
    <button ref={ref} className={classes} onClick={() => onValueChange(value)} {...props}>
      {children}
    </button>
  )
})

const TabsContent = React.forwardRef(({ className = "", value, children, ...props }, ref) => {
  const { value: selectedValue } = useContext(TabsContext)

  if (selectedValue !== value) return null

  const classes = `mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})

TabsList.displayName = "TabsList"
TabsTrigger.displayName = "TabsTrigger"
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
