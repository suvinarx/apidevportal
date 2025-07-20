"use client"

import { Globe, Shield, Zap, Users, Plus, Search, Filter, Package, Building2, ShoppingCart, ShieldCheck } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"
import { Link } from "react-router-dom";

export function AppHeader({ onAddCatalog, search, setSearch, selectedCategory, setSelectedCategory, categoryOptions }) {
  const getCategoryIcon = (category) => {
    switch (category) {
      case "order":
        return ShoppingCart
      case "org":
        return Building2
      case "inventory":
        return Package
      default:
        return Filter
    }
  }

  return (
    <header className="border-b border-yellow-200/60 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
                Developer Portal
              </h1>
              <p className="text-xs text-gray-500">API Management Hub</p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex items-center space-x-4 flex-1 max-w-2xl mx-8">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search APIs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 text-sm border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-200 bg-white/80"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 h-10 bg-white/80 border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-200">
                <div className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = getCategoryIcon(selectedCategory)
                    return <IconComponent className="w-4 h-4 text-gray-500" />
                  })()}
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="w-[200px] bg-white shadow-lg">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    All Categories
                  </div>
                </SelectItem>
                {Array.isArray(categoryOptions) &&
                  categoryOptions.map((category) => {
                    const IconComponent = getCategoryIcon(category)
                    return (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </div>
                      </SelectItem>
                    )
                  })}

              </SelectContent>
            </Select>
          </div>

          {/* Right Section */}
          {/* Right Section */}
          <div className="flex items-center space-x-4">

            {/* Add Catalog Button */}
            {onAddCatalog && (
              <Button
                onClick={onAddCatalog}
                className="bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700 text-white backdrop-blur-sm hover:-translate-y-1 hover:shadow-lg overflow-hidden rounded-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add API
              </Button>
            )}
            {/* Admin Label */}
            <div className="flex items-center text-sm text-gray-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-600 mr-1" />
              Admin
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}

export function AppFooter() {
  return (
    <footer className="border-t border-yellow-200/60 bg-gradient-to-r from-yellow-50/80 to-green-50/80 mt-16">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-green-600 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
                Developer Portal
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Streamline API management with our comprehensive catalog platform designed for modern developers.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-yellow-100">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-yellow-100">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-yellow-100">
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/blank">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/blank">
                  API Reference
                </Link>
              </li>
              <li>
                <Link to="/blank">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link to="/blank">
                  Best Practices
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/blank">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/blank">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/blank">
                  Status Page
                </Link>
              </li>
              <li>
                <Link to="/blank">
                  <Mail className="w-3 h-3" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/blank">About Us</Link>
              </li>
              <li>
                <Link to="/blank">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blank">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/blank">
                  Press Kit
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-yellow-200/60 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2024 Developer Portal. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/blank">
              Privacy Policy
            </Link>
            <Link to="/blank">
              Terms of Service
            </Link>
            <Link to="/blank">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
