"use client"

import type React from "react"

import { Search, LogOut, X } from "lucide-react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { catalogApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Catalog } from "@/lib/api"

interface DashboardHeaderProps {
  catalogs?: Catalog[]
  handleViewDocumentation?: (catalog: Catalog) => void
}

export default function DashboardHeader({ catalogs = [], handleViewDocumentation = () => { } }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownResults, setDropdownResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Check login status on component mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  // Focus search input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Handle escape key to close search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false)
        setSearchQuery("")
        setShowDropdown(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isSearchOpen])

  const performSearch = async (value: string) => {
    try {
      const data = await catalogApi.search(value)
      setDropdownResults(data)
    } catch (err) {
      console.error("Search error:", err)
      setDropdownResults([])
      toast({
        title: "Search error",
        description: "Failed to perform search",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (searchTimeout) clearTimeout(searchTimeout)

    if (!value.trim()) {
      setDropdownResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    setShowDropdown(true)

    setSearchTimeout(
      setTimeout(async () => {
        await performSearch(value)
      }, 300),
    )
  }

  const handleSearchResultClick = (item: any) => {
    setShowDropdown(false)
    setSearchQuery("")
    setIsSearchOpen(false)

    if (item.type === "catalog") {
      const cat = catalogs.find((c) => c._id === item.id)
      if (cat) handleViewDocumentation(cat)
    } else if (item.type === "api" && item.catalogId) {
      const cat = catalogs.find((c) => c._id === item.catalogId)
      if (cat) {
        handleViewDocumentation(cat)
        setTimeout(() => {
          const pathForHash = item.name.replace(/^\//, "").replace(/\//g, "~1")
          window.location.hash = `#/paths/~1${pathForHash}`
        }, 500)
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    window.location.href = "/login"
  }

  const openSearch = () => {
    setIsSearchOpen(true)
  }

  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setShowDropdown(false)
  }

  return (
    <>
      <header className="w-full bg-white fixed top-0 z-40 shadow">
        <div className="max-w-[1700px] mx-auto">
          {/* Single header row with logo/title on left and icons on right */}
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left side - Logo and title */}
            <div className="flex items-center space-x-4">
              <Image src="/images/logo/logo.png" alt="Logo" width={120} height={120} />
              <span className="text-xl font-bold text-gray-800">API Developer Portal</span>
            </div>

            {/* Right side - Search and logout icons */}
            <div className="flex items-center space-x-4">
              {isLoggedIn && (
                <LogOut
                  className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#006b50] transition-colors duration-200"
                  onClick={logout}
                />
              )}
              <Search
                className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#006b50] transition-colors duration-200"
                onClick={openSearch}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Compact Search Dropdown */}
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-20 z-40" onClick={closeSearch} />

          {/* Search Dropdown */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="w-full mx-auto">
              <div
                className="bg-white rounded-lg shadow-xl border border-gray-200 animate-in slide-in-from-top duration-200"
                style={{ height: "280px" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 max-w-7xl mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900">Search</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500">Press ESC to close</span>
                    <button onClick={closeSearch} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Search Input */}
                <div className="px-6 py-4 max-w-7xl mx-auto">
                  <div className="relative" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Enter Product, API, or keywords"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-[#006b50] focus:outline-none focus:ring-2 focus:ring-[#006b50] focus:ring-opacity-20 transition-all"
                    />
                  </div>
                </div>

                {/* Search Results */}
                <div className="px-6 pb-4 flex-1 overflow-hidden max-w-7xl mx-auto">
                  {showDropdown && (
                    <div className="bg-gray-50 rounded-lg border border-gray-100 max-h-32 overflow-auto">
                      {isSearching ? (
                        <div className="px-4 py-3 text-gray-500 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Searching...
                        </div>
                      ) : dropdownResults.length > 0 ? (
                        <div className="py-1">
                          {dropdownResults.map((item) => (
                            <div
                              key={`${item.type}-${item.id}`}
                              className="px-4 py-2 hover:bg-white cursor-pointer transition-colors mx-1 rounded"
                              onClick={() => handleSearchResultClick(item)}
                            >
                              {item.type === "api" ? (
                                <>
                                  <div className="flex items-center gap-2 mb-1">
                                    {item.method && (
                                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-medium uppercase">
                                        {item.method}
                                      </span>
                                    )}
                                    <span className="font-mono text-[#006b50] font-medium text-sm">{item.name}</span>
                                  </div>
                                  <div className="text-xs text-gray-500">{item.catalogName}</div>
                                </>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                                    Catalog
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : searchQuery.trim() && !isSearching ? (
                        <div className="px-4 py-6 text-gray-500 text-center">
                          <div className="text-sm mb-1">No results found</div>
                          <div className="text-xs">Try different keywords</div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
