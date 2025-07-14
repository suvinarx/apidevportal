"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Search,
  Plus,
  Book,
  Edit,
  Trash2,
  UploadCloud,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Globe,
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
} from "lucide-react";
import yaml from "js-yaml";
import { importOpenapiCatalog } from "../api";
import { AppFooter, AppHeader } from "./AppLayout";

const roles = ["admin", "developer"];
const statusOptions = ["active", "inactive"];
const visibilityOptions = ["public", "private"];

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
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importedFileName, setImportedFileName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentCatalog, setCurrentCatalog] = useState(null);
  const fileInputRef = useRef(null);

  // Form fields
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#6366f1",
    visibility: "public",
    status: "active",
    accessRoles: [],
    tags: "",
    openapiSpec: null,
  });

  // Initialize form when editing
  useEffect(() => {
    if (isEditing && currentCatalog) {
      setForm({
        name: currentCatalog.name || "",
        description: currentCatalog.description || "",
        color: currentCatalog.color || "#6366f1",
        visibility: currentCatalog.visibility || "public",
        status: currentCatalog.status || "active",
        accessRoles: currentCatalog.accessRoles || [],
        tags: currentCatalog.tags ? currentCatalog.tags.join(", ") : "",
        openapiSpec: currentCatalog.openapiSpec || null,
      });
      setImportedFileName(currentCatalog.openapiSpec ? "Current specification loaded" : "");
    }
  }, [isEditing, currentCatalog]);

  // File select and OpenAPI parse
  const handleFileChange = async (e) => {
    setImportError("");
    const file = e.target.files[0];
    setImportedFileName(file ? file.name : "");
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    try {
      const text = await file.text();
      let spec;
      if (ext === "json") {
        spec = JSON.parse(text);
      } else if (ext === "yaml" || ext === "yml") {
        spec = yaml.load(text);
      } else {
        setImportError("Only JSON or YAML files supported");
        return;
      }
      setForm((f) => ({ ...f, openapiSpec: spec }));
    } catch (err) {
      setImportError(
        "Failed to parse OpenAPI file: " + (err.message || "Unknown error")
      );
    }
  };

  // Field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "accessRoles") {
      setForm((f) => ({
        ...f,
        accessRoles: checked
          ? [...f.accessRoles, value]
          : f.accessRoles.filter((role) => role !== value),
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Open edit dialog
  const handleEditClick = (catalog) => {
    setCurrentCatalog(catalog);
    setIsEditing(true);
    setShowImportDialog(true);
  };

  // Reset form when dialog closes
  const handleDialogOpenChange = (open) => {
    if (!open) {
      setIsEditing(false);
      setCurrentCatalog(null);
      setForm({
        name: "",
        description: "",
        color: "#6366f1",
        visibility: "public",
        status: "active",
        accessRoles: [],
        tags: "",
        openapiSpec: null,
      });
      setImportedFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    setShowImportDialog(open);
  };

  // Submit form
  const handleImport = async (e) => {
    e.preventDefault();
    setImporting(true);
    setImportError("");

    if (!form.name.trim()) {
      setImportError("Catalog Name is required.");
      setImporting(false);
      return;
    }

    if (!form.openapiSpec && !isEditing) {
      setImportError("OpenAPI (Swagger) file is required.");
      setImporting(false);
      return;
    }

    let tagsArr = [];
    if (form.tags.trim()) {
      tagsArr = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    try {
      const catalogData = {
        name: form.name.trim(),
        description: form.description,
        color: form.color,
        visibility: form.visibility,
        status: form.status,
        accessRoles: form.accessRoles,
        tags: tagsArr,
        openapiSpec: form.openapiSpec,
      };

      if (isEditing && currentCatalog) {
        catalogData._id = currentCatalog._id;
        await onEdit(catalogData);
      } else {
        await importOpenapiCatalog(catalogData);
      }

      setShowImportDialog(false);
      setForm({
        name: "",
        description: "",
        color: "#6366f1",
        visibility: "public",
        status: "active",
        accessRoles: [],
        tags: "",
        openapiSpec: null,
      });
      setImportedFileName("");
      setImporting(false);
      setIsEditing(false);
      setCurrentCatalog(null);
      if (onImported) onImported();
    } catch (err) {
      setImportError(
        "Failed to " + (isEditing ? "update" : "import") + ": " + (err.response?.data?.error || err.message)
      );
      setImporting(false);
    }
  };

  const clearFile = () => {
    setImportedFileName("");
    setForm((f) => ({ ...f, openapiSpec: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50">
      {/* Refined Header */}
      <AppHeader onAddCatalog={() => setShowImportDialog(true)} />
      {/* Refined Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto mx-0">
          <DialogHeader className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <UploadCloud className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {isEditing ? "Edit Catalog" : "New Catalog"}
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
                    className="h-9 text-sm"
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
                    className="text-sm resize-none"
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
                    className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
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
                <label className="text-xs font-medium text-gray-700 mb-2 block">Access Roles</label>
                <div className="flex gap-3 p-2.5 bg-gray-50 rounded-md">
                  {roles.map((role) => (
                    <label key={role} className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="accessRoles"
                        value={role}
                        checked={form.accessRoles.includes(role)}
                        onChange={handleChange}
                        disabled={importing}
                        className="w-3.5 h-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                  className="h-9 text-sm"
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

              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-indigo-300 transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
                  <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-800 truncate">{importedFileName}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearFile}
                        disabled={importing}
                        className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-800"
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
      <main className="container mx-auto px-4 sm:px-6 py-6">
        {/* Search Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">API Catalog</h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">Discover and manage your API collections</p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search catalogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm border-gray-200 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>

        {/* Compact Catalogs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {catalogs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Book className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No catalogs found</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                Create your first API catalog to get started
              </p>
              <Button onClick={onAddClick} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Catalog
              </Button>
            </div>
          )}

          {catalogs.map((catalog) => (
            <Card
              key={catalog._id}
              className="relative group hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200/60 hover:border-gray-300 bg-white hover:-translate-y-0.5"
            >
              <CardHeader className="pb-3 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200"
                    style={{
                      backgroundColor: `${catalog.color || "#6366f1"}15`,
                      border: `1px solid ${catalog.color || "#6366f1"}25`,
                    }}
                  >
                    <Book className="w-5 h-5" style={{ color: catalog.color || "#6366f1" }} />
                  </div>

                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(catalog)
                      }}
                    >
                      <Edit className="w-8 h-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete && onDelete(catalog)
                      }}
                    >
                      <Trash2 className="w-8 h-8" />
                    </Button>
                  </div>
                </div>

                <div onClick={() => onSelect && onSelect(catalog)} className="space-y-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-1">
                    {catalog.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-600 line-clamp-2 leading-relaxed h-8">
                    {catalog.description || "No description"}
                  </CardDescription>

                  {/* Status and Visibility */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Badge
                      variant={catalog.status === "inactive" ? "secondary" : "default"}
                      className={`text-xs px-1.5 py-0.5 absolute bottom-2/3 right-4 ${
                        catalog.status === "inactive"
                          ? "bg-gray-100 text-gray-600 border-gray-200"
                          : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {catalog.status === "inactive" ? "Inactive" : "Active"}
                    </Badge>

                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                      {catalog.visibility === "private" ? (
                        <Lock className="w-2.5 h-2.5 mr-1" />
                      ) : (
                        <Eye className="w-2.5 h-2.5 mr-1" />
                      )}
                      {catalog.visibility}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent onClick={() => onSelect && onSelect(catalog)} className="pt-0 p-4">
                <div className="space-y-2.5">
                  {/* Tags */}
                  {Array.isArray(catalog.tags) && catalog.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {catalog.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {catalog.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-50 text-gray-500">
                            +{catalog.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Access Roles */}
                  {Array.isArray(catalog.accessRoles) && catalog.accessRoles.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <div className="flex gap-1">
                        {catalog.accessRoles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-200 capitalize"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(catalog.createdAt || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700">Explore →</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Minimal Footer */}
          <AppFooter/>
    </div>
  );
}