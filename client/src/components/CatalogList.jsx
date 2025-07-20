"use client"
import { useRef, useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import {
  Plus,
  Book,
  Edit,
  Trash2,
  UploadCloud,
  Shield,
  Zap,
  Users,
  FileText,
  Upload,
  X,
  Eye,
  Lock,
  Calendar,
  Tag,
  Filter,
  Package,
  Building2,
  ShoppingCart,
  Sparkles,
} from "lucide-react"
import yaml from "js-yaml"
import { importOpenapiCatalog } from "../api"
import { AppFooter, AppHeader } from "./AppLayout"

const roles = ["admin", "developer"]
const statusOptions = ["active", "inactive"]
const visibilityOptions = ["public", "private"]

export default function CatalogList({
  catalogs,
  onSelect,
  onEdit,
  onDelete,
  onImported,
  search,
  setSearch,
  onAddClick,
}) {
  // Dialog & form state
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importError, setImportError] = useState("")
  const [importing, setImporting] = useState(false)
  const [importedFileName, setImportedFileName] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [currentCatalog, setCurrentCatalog] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categoryOptions = ["order", "org", "inventory"]
  const fileInputRef = useRef(null)

  // Form fields
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#10b981",
    visibility: "public",
    category: "org",
    status: "active",
    accessRoles: [],
    tags: "",
    openapiSpec: null,
  })

  // Initialize form when editing
  useEffect(() => {
    if (isEditing && currentCatalog) {
      setForm({
        name: currentCatalog.name || "",
        description: currentCatalog.description || "",
        color: currentCatalog.color || "#10b981",
        category: currentCatalog.category || "org",
        visibility: currentCatalog.visibility || "public",
        status: currentCatalog.status || "active",
        accessRoles: currentCatalog.accessRoles || [],
        tags: currentCatalog.tags ? currentCatalog.tags.join(", ") : "",
        openapiSpec: currentCatalog.openapiSpec || null,
      })
      setImportedFileName(currentCatalog.openapiSpec ? "Current specification loaded" : "")
    }
  }, [isEditing, currentCatalog])

  // Filter catalogs based on search and category
  const filteredCatalogs = catalogs.filter((catalog) => {
    const matchesSearch =
      catalog.name.toLowerCase().includes(search.toLowerCase()) ||
      catalog.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "all" || catalog.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // File select and OpenAPI parse
  const handleFileChange = async (e) => {
    setImportError("")
    const file = e.target.files[0]
    setImportedFileName(file ? file.name : "")
    if (!file) return

    const ext = file.name.split(".").pop().toLowerCase()
    try {
      const text = await file.text()
      let spec
      if (ext === "json") {
        spec = JSON.parse(text)
      } else if (ext === "yaml" || ext === "yml") {
        spec = yaml.load(text)
      } else {
        setImportError("Only JSON or YAML files supported")
        return
      }
      setForm((f) => ({ ...f, openapiSpec: spec }))
    } catch (err) {
      setImportError("Failed to parse OpenAPI file: " + (err.message || "Unknown error"))
    }
  }

  // Field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === "accessRoles") {
      setForm((f) => ({
        ...f,
        accessRoles: checked ? [...f.accessRoles, value] : f.accessRoles.filter((role) => role !== value),
      }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  // Open edit dialog
  const handleEditClick = (catalog) => {
    setCurrentCatalog(catalog)
    setIsEditing(true)
    setShowImportDialog(true)
  }

  // Reset form when dialog closes
  const handleDialogOpenChange = (open) => {
    if (!open) {
      setIsEditing(false)
      setCurrentCatalog(null)
      setForm({
        name: "",
        description: "",
        color: "#10b981",
        category: "org",
        visibility: "public",
        status: "active",
        accessRoles: [],
        tags: "",
        openapiSpec: null,
      })
      setImportedFileName("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    setShowImportDialog(open)
  }

  // Submit form
  const handleImport = async (e) => {
    e.preventDefault()
    setImporting(true)
    setImportError("")

    if (!form.name.trim()) {
      setImportError("Catalog Name is required.")
      setImporting(false)
      return
    }

    if (!form.openapiSpec && !isEditing) {
      setImportError("OpenAPI (Swagger) file is required.")
      setImporting(false)
      return
    }

    let tagsArr = []
    if (form.tags.trim()) {
      tagsArr = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    }

    try {
      const catalogData = {
        name: form.name.trim(),
        description: form.description,
        color: form.color,
        category: form.category,
        visibility: form.visibility,
        status: form.status,
        accessRoles: form.accessRoles,
        tags: tagsArr,
        openapiSpec: form.openapiSpec,
      }

      if (isEditing && currentCatalog) {
        catalogData._id = currentCatalog._id
        await onEdit(catalogData)
      } else {
        await importOpenapiCatalog(catalogData)
      }

      setShowImportDialog(false)
      setForm({
        name: "",
        description: "",
        color: "#10b981",
        category: "org",
        visibility: "public",
        status: "active",
        accessRoles: [],
        tags: "",
        openapiSpec: null,
      })
      setImportedFileName("")
      setImporting(false)
      setIsEditing(false)
      setCurrentCatalog(null)
      if (onImported) onImported()
    } catch (err) {
      setImportError(
        "Failed to " + (isEditing ? "update" : "import") + ": " + (err.response?.data?.error || err.message),
      )
      setImporting(false)
    }
  }

  const clearFile = () => {
    setImportedFileName("")
    setForm((f) => ({ ...f, openapiSpec: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "order":
        return ShoppingCart
      case "org":
        return Building2
      case "inventory":
        return Package
      default:
        return Book
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "order":
        return "from-amber-400 to-yellow-500"
      case "org":
        return "from-emerald-400 to-green-500"
      case "inventory":
        return "from-lime-400 to-emerald-500"
      default:
        return "from-green-400 to-emerald-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-50">
      {/* Enhanced Header */}
      <AppHeader
        onAddCatalog={() => setShowImportDialog(true)}
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoryOptions={categoryOptions}
      />

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto mx-0">
          <DialogHeader className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-green-100 rounded-lg flex items-center justify-center">
                <UploadCloud className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {isEditing ? "Edit API" : "New API"}
                </DialogTitle>
                <p className="text-sm text-gray-500">
                  {isEditing ? "Update catalog details" : "Import OpenAPI specification"}
                </p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleImport} className="space-y-5 mt-4">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-600" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Name *</label>
                  <Input
                    name="name"
                    placeholder="User Management API"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={importing}
                    className="h-9 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
                  <Textarea
                    name="description"
                    placeholder="Brief description of the API catalog..."
                    value={form.description}
                    onChange={handleChange}
                    disabled={importing}
                    rows={2}
                    className="text-sm resize-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-gray-600" />
                Configuration
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Visibility</label>
                  <select
                    name="visibility"
                    value={form.visibility}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    disabled={importing}
                  >
                    {visibilityOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    disabled={importing}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  disabled={importing}
                  required
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">Access Roles</label>
                <div className="flex gap-3 p-2.5 bg-gradient-to-r from-yellow-50 to-green-50 rounded-md">
                  {roles.map((role) => (
                    <label key={role} className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="accessRoles"
                        value={role}
                        checked={form.accessRoles.includes(role)}
                        onChange={handleChange}
                        disabled={importing}
                        className="w-3.5 h-3.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="capitalize text-xs font-medium text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Tags</label>
                <Input
                  name="tags"
                  placeholder="auth, users, v1"
                  value={form.tags}
                  onChange={handleChange}
                  disabled={importing}
                  className="h-9 text-sm focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Comma separated</p>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <Upload className="w-4 h-4 mr-2 text-gray-600" />
                OpenAPI File {!isEditing && "*"}
              </h3>
              <div className="border-2 border-dashed border-green-200 rounded-lg p-4 text-center hover:border-green-300 transition-colors bg-gradient-to-r from-yellow-50/50 to-green-50/50">
                <UploadCloud className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700 mb-1">
                  {isEditing ? "Update OpenAPI file (optional)" : "Upload OpenAPI file"}
                </p>
                <p className="text-xs text-gray-500 mb-3">JSON or YAML format</p>
                <Input
                  type="file"
                  accept=".json,.yaml,.yml"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={importing}
                  required={!isEditing}
                  className="text-xs"
                />
                {importedFileName && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-medium text-green-800 truncate">{importedFileName}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearFile}
                        disabled={importing}
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {importError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-800">{importError}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDialogOpenChange(false)}
                disabled={importing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700 text-white"
                disabled={importing}
              >
                {importing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                    {isEditing ? "Updating..." : "Importing..."}
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                    {isEditing ? "Update" : "Import"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-green-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-green-700">Discover Amazing APIs</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API{" "}
            <span className="bg-gradient-to-r from-yellow-500 to-green-600 bg-clip-text text-transparent">Catalog</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive collection of APIs designed to power your applications
          </p>
        </div>

        {/* Enhanced Catalogs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCatalogs.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Book className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {search || selectedCategory !== "all" ? "No matching catalogs" : "No catalogs found"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {search || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first API catalog to get started"}
              </p>
              <Button
                onClick={onAddClick}
                className="bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create API
              </Button>
            </div>
          )}

          {filteredCatalogs.map((catalog) => {
            const CategoryIcon = getCategoryIcon(catalog.category)
            const gradientClass = getCategoryColor(catalog.category)

            return (
              <Card
                key={catalog._id}
                onClick={() => onSelect && onSelect(catalog)}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/90 backdrop-blur-sm hover:-translate-y-1 overflow-hidden rounded-xl"
              >
                <CardHeader className="pb-4 p-6 relative">
            
                  {/* Icon and Status */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r ${gradientClass}`}
                    >
                      <CategoryIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        variant={catalog.status === "inactive" ? "secondary" : "default"}
                        className={`text-xs px-2 py-1 ${catalog.status === "inactive"
                            ? "bg-gray-100 text-gray-600 border-gray-200"
                            : "bg-green-500 text-green-700 border-green-200"
                          }`}
                      >
                        {catalog.status === "inactive" ? "Inactive" : "Active"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200 flex items-center"
                      >
                        {catalog.visibility === "private" ? (
                          <Lock className="w-3 h-3 mr-1" />
                        ) : (
                          <Eye className="w-3 h-3 mr-1" />
                        )}
                        {catalog.visibility}
                      </Badge>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200 line-clamp-1">
                      {catalog.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                      {catalog.description || "No description available"}
                    </CardDescription>
                  </div>

                  {/* Edit/Delete Buttons */}
                  <div className="absolute top-[13.5rem] right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 p-0 bg-white/90 hover:bg-blue-50 hover:text-blue-600 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(catalog);
                      }}
                    >
                      <Edit className="w-10 h-10" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 p-0 bg-white/90 hover:bg-red-50 hover:text-red-600 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete && onDelete(catalog);
                      }}
                    >
                      <Trash2 className="w-8 h-8" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 p-6">
                  <div className="space-y-4">
                    {/* Tags */}
                    {Array.isArray(catalog.tags) && catalog.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {catalog.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {catalog.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500">
                              +{catalog.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Roles */}
                    {Array.isArray(catalog.accessRoles) && catalog.accessRoles.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-gray-400" />
                        <div className="flex gap-1">
                          {catalog.accessRoles.map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 border-yellow-200 capitalize"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(catalog.createdAt || Date.now()).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-green-600 group-hover:text-green-700 flex items-center">
                        Explore
                        <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
