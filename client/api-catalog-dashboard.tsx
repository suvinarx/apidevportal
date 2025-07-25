"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ShoppingCart,
  Building,
  Package,
  Grid3X3,
  Code,
  TagIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  type Catalog,
  catalogApi,
  type CreateCatalogData,
  categoryApi,
  type Category,
} from "@/lib/api";
import ApiWorkspace from "@/components/api-workspace";

// Category type
import { ComponentType } from "react";
import { LucideProps } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";

type CategoryWithIcon = Category & {
  icon?: ComponentType<LucideProps>;
};
const defaultCategories = [
  { id: "all", name: "All", icon: Grid3X3 },
  { id: "order", name: "Order", icon: ShoppingCart },
  { id: "org", name: "Org", icon: Building },
  { id: "inventory", name: "Inventory", icon: Package },
];

const RedocStandalone = ({ spec, options }: { spec: any; options: any }) => {
  return (
    <div className="p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">API Documentation</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            OpenAPI Specification Preview
          </p>
          <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded border">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

function FileSizeErrorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl shadow-xl border border-red-200 bg-white animate-fade-in">
        <DialogHeader className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-semibold text-red-600">
            File Too Large
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            The file you are trying to upload exceeds the 1MB size limit. Please
            select a smaller file.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full text-red-600 border-red-200 hover:bg-red-50 transition"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const getCategoryColor = (
  category?: string | { _id: string; name: string }
) => {
  const categoryName = typeof category === "string" ? category : category?.name;
  if (!categoryName)
    return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-50 transition-colors";

  switch (categoryName.toLowerCase()) {
    case "order":
      return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-50 transition-colors";
    case "org":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-50 transition-colors";
    case "inventory":
      return "bg-slate-100 text-slate-800 border-slate-300";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-50 transition-colors";
  }
};

const getStatusColor = (status?: string) => {
  if (!status) return "bg-gray-100 text-gray-800";
  switch (status.toLowerCase()) {
    case "active":
      return "bg-blue-100 text-blue-800 hover:bg-blue-50 transition-colors";
    case "inactive":
      return "bg-red-100 text-red-800 text-xs hover:bg-red-50 transition-colors";
    default:
      return "bg-gray-50 text-gray-800";
  }
};

const getVisibilityColor = (visibility?: string) => {
  if (!visibility) return "bg-gray-100 text-gray-800";
  switch (visibility.toLowerCase()) {
    case "public":
      return "bg-green-100 text-green-800";
    case "private":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function APICatalogDashboard() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"dashboard" | "workspace">(
    "dashboard"
  );
  const [workspaceCatalogId, setWorkspaceCatalogId] = useState<string | null>(
    null
  );
  const [openApiFile, setOpenApiFile] = useState<File | null>(null);
  const [openApiFileError, setOpenApiFileError] = useState<string | null>(null);
  const [dropdownResults, setDropdownResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [isFileSizeErrorModalOpen, setIsFileSizeErrorModalOpen] =
    useState(false);
  // Category management states
  const [categories, setCategories] = useState<CategoryWithIcon[]>([]);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });
  const [regions, setRegions] = useState<{ _id: string; name: string }[]>([]);
  const [businessTypes, setBusinessTypes] = useState<
    { _id: string; name: string }[]
  >([]);

  const fetchMetaData: () => Promise<void> = async () => {
    try {
      const [regionRes, businessTypeRes] = await Promise.all([
        fetch(`${API_BASE_URL}/regions`),
        fetch(`${API_BASE_URL}/business-types`),
      ]);

      const regionData = await regionRes.json();
      const businessTypeData = await businessTypeRes.json();

      setRegions(regionData);
      setBusinessTypes(businessTypeData);
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    }
  };
  useEffect(() => {
    fetchMetaData();
  }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateCatalogData>({
    name: "",
    description: "",
    color: "#059669",
    category: "", // Will be set when categories load
    visibility: "public",
    status: "active",
    accessRoles: ["admin"],
    tags: [],
    regions: [],
    businessTypes: [],
  });

  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      const data = await catalogApi.getAll();
      setCatalogs(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to load catalogs. Please check if the backend is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data: Category[] = await categoryApi.getAll();
      const categoriesWithAll = [
        { _id: "all", name: "All", createdAt: "", updatedAt: "" },
        ...data,
      ] as CategoryWithIcon[];
      setCategories(categoriesWithAll);

      if (!formData.category && categoriesWithAll.length > 1) {
        setFormData((prev) => ({
          ...prev,
          category: categoriesWithAll[1]._id,
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const filteredCatalogs = catalogs.filter((catalog) => {
    // Handle both ObjectId string and populated category object
    const catalogCategoryId =
      typeof catalog.category === "string"
        ? catalog.category
        : catalog.category?._id;

    const matchesCategory =
      selectedCategory === "all" || catalogCategoryId === selectedCategory;
    const matchesSearch =
      catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalog.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalog.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const handleEdit = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
    setFormData({
      name: catalog.name,
      description: catalog.description || "",
      color: catalog.color || "#059669",
      category: catalog.category as string, // Ensure this is a string ID
      visibility: catalog.visibility,
      status: catalog.status,
      accessRoles: catalog.accessRoles,
      tags: catalog.tags,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
    setIsDetailDrawerOpen(true);
  };

  const handleViewDocumentation = (catalog: Catalog) => {
    setWorkspaceCatalogId(catalog._id);
    setCurrentView("workspace");
  };

  const confirmDelete = async () => {
    if (selectedCatalog) {
      try {
        await catalogApi.delete(selectedCatalog._id);
        setCatalogs(
          catalogs.filter((catalog) => catalog._id !== selectedCatalog._id)
        );
        toast({
          title: "Success",
          description: "Catalog deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete catalog",
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedCatalog(null);
      }
    }
  };

  const handleSubmit = async (isEdit: boolean) => {
    try {
      // When a valid OpenAPI file is attached, use the /import endpoint (only on ADD, not Edit)
      if (!isEdit && formData.openapiSpec) {
        const response = await fetch(`${API_BASE_URL}/catalogs/import`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok)
          throw new Error("Failed to import catalog from OpenAPI");
        const { catalog } = await response.json();
        setCatalogs([...catalogs, catalog]);
        setIsAddModalOpen(false);
        toast({
          title: "Success",
          description: "Catalog imported from OpenAPI file!",
        });
      } else if (isEdit && selectedCatalog) {
        const updated = await catalogApi.update(selectedCatalog._id, formData);
        setCatalogs(
          catalogs.map((cat) =>
            cat._id === selectedCatalog._id ? updated : cat
          )
        );
        setIsEditModalOpen(false);
        toast({
          title: "Success",
          description: "Catalog updated successfully",
        });
      } else {
        const newCatalog = await catalogApi.create(formData);
        setCatalogs([...catalogs, newCatalog]);
        setIsAddModalOpen(false);
        toast({
          title: "Success",
          description: "Catalog created successfully",
        });
      }
      setFormData({
        name: "",
        description: "",
        color: "#059669",
        category: "", // Will be set when categories load
        visibility: "public",
        status: "active",
        accessRoles: ["admin"],
        tags: [],
      });
      setOpenApiFile(null);
      setOpenApiFileError(null);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${
          isEdit ? "update" : formData.openapiSpec ? "import" : "create"
        } catalog`,
        variant: "destructive",
      });
    }
  };

  const [tagsInput, setTagsInput] = useState((formData.tags || []).join(", "));

  useEffect(() => {
    setTagsInput((formData.tags || []).join(", "));
  }, [formData.tags]);

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setFormData({ ...formData, tags });
  };

  // Handle category creation
  const handleAddCategory = async () => {
    if (!categoryFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    // Check if category already exists locally (as UI feedback only)
    const categoryExists = categories.some(
      (cat) => cat.name.toLowerCase() === categoryFormData.name.toLowerCase()
    );

    if (categoryExists) {
      toast({
        title: "Error",
        description: "Category already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      // POST to backend
      const newCategory = await categoryApi.create(categoryFormData);

      function toCategoryWithIcon(cat: Category): CategoryWithIcon {
        return {
          ...cat,
          icon: Package as any,
        };
      }

      setCategories([...categories, toCategoryWithIcon(newCategory)]);

      // Reset form
      setCategoryFormData({ name: "", description: "" });
      setIsAddCategoryModalOpen(false);

      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  if (currentView === "workspace" && workspaceCatalogId) {
    return (
      <ApiWorkspace
        catalogId={workspaceCatalogId}
        onBack={() => {
          setCurrentView("dashboard");
          setWorkspaceCatalogId(null);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-emerald-100 shadow-sm">
        <div className="px-6 py-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-emerald-700">API Platform</h1>
        </div>
        <nav className="p-4">
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category._id;
              return (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {Icon ? (
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-emerald-600" : "text-gray-400"
                      }`}
                    />
                  ) : null}
                  <span className="font-medium">{category.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1 h-6 bg-gradient-to-b from-emerald-400 to-yellow-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                API Developer Platform
              </h2>
              {loading && (
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or path..."
                  value={searchQuery}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    // Clear previous timeout
                    if (searchTimeout) clearTimeout(searchTimeout);
                    // Don't search if query is empty
                    if (!value.trim()) {
                      setDropdownResults([]);
                      setShowDropdown(false);
                      return;
                    }
                    setIsSearching(true);
                    setShowDropdown(true);
                    // Set new timeout with debounce
                    setSearchTimeout(
                      setTimeout(async () => {
                        try {
                          const data = await catalogApi.search(value);
                          console.log("Search results:", data); // Debugging
                          setDropdownResults(data);
                        } catch (err) {
                          console.error("Search error:", err);
                          setDropdownResults([]);
                          toast({
                            title: "Search error",
                            description: "Failed to perform search",
                            variant: "destructive",
                          });
                        } finally {
                          setIsSearching(false);
                        }
                      }, 300)
                    ); // 300ms debounce delay
                  }}
                  className="pl-10 w-80 bg-gray-50 border-gray-200 focus:border-emerald-300 focus:ring-emerald-200"
                />
                {showDropdown && (
                  <div className="absolute z-50 left-0 w-full bg-white border rounded shadow mt-2 max-h-64 overflow-auto">
                    {isSearching ? (
                      <div className="px-4 py-2 text-gray-500 flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Searching...
                      </div>
                    ) : dropdownResults.length > 0 ? (
                      dropdownResults.map((item) => (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="px-4 py-2 hover:bg-emerald-50 cursor-pointer"
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery("");
                            if (item.type === "catalog") {
                              const cat = catalogs.find(
                                (c) => c._id === item.id
                              );
                              if (cat) handleViewDocumentation(cat);
                            } else if (item.type === "api" && item.catalogId) {
                              const cat = catalogs.find(
                                (c) => c._id === item.catalogId
                              );
                              if (cat) {
                                handleViewDocumentation(cat);
                                setTimeout(() => {
                                  const pathForHash = item.name
                                    .replace(/^\//, "")
                                    .replace(/\//g, "~1");
                                  window.location.hash = `#/paths/~1${pathForHash}`;
                                }, 500);
                              }
                            }
                          }}
                        >
                          {item.type === "api" ? (
                            <>
                              <div className="flex items-center gap-2">
                                {item.method && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.method}
                                  </Badge>
                                )}
                                <span className="font-mono text-emerald-600">
                                  {item.name}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.catalogName}
                              </div>
                            </>
                          ) : (
                            <span className="font-semibold text-gray-800">
                              {item.name}
                            </span>
                          )}
                        </div>
                      ))
                    ) : searchQuery.trim() && !isSearching ? (
                      <div className="px-4 py-2 text-gray-500">
                        No results found
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New API
              </Button>
            </div>
          </div>
        </header>

        {/* API Grid */}
        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading catalogs...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCatalogs.map((catalog) => (
                <Card
                  key={catalog._id}
                  className="group hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 border-gray-200 hover:border-emerald-200 bg-white cursor-pointer"
                  onClick={() => handleViewDocumentation(catalog)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: catalog.color || "#059669",
                            }}
                          />
                          <CardTitle className="text-lg font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors">
                            {catalog.name}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getCategoryColor(catalog.category)}>
                            {typeof catalog.category === "string"
                              ? categories.find(
                                  (cat) => cat._id === catalog.category
                                )?.name || catalog.category
                              : catalog.category?.name || "Unknown"}
                          </Badge>
                          <Badge className={getStatusColor(catalog.status)}>
                            {catalog.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(catalog);
                          }}
                          className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(catalog);
                          }}
                          className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(catalog);
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                      {catalog.description || "No description available"}
                    </CardDescription>
                    <div className="space-y-3">
                      <Badge
                        className={getVisibilityColor(catalog.visibility)}
                        variant="outline"
                      >
                        {catalog.visibility}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {catalog.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {catalog.tags.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs text-gray-500"
                          >
                            +{catalog.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!loading && filteredCatalogs.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No APIs found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit API Modal */}
      <FileSizeErrorModal
        isOpen={isFileSizeErrorModalOpen}
        onClose={() => setIsFileSizeErrorModalOpen(false)}
      />
      <Dialog
        open={isAddModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedCatalog(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-emerald-700">
              {isEditModalOpen ? "Edit API Catalog" : "Add New API"}
            </DialogTitle>
            <DialogDescription>
              {isEditModalOpen
                ? "Update the catalog details"
                : "Create a new API catalog with all necessary details."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid ">
              <div className="space-y-2">
                <Label htmlFor="name">Catalog Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter catalog name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this catalog contains..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat) => cat._id !== "all")
                      .map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    <div className="border-t mt-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => setIsAddCategoryModalOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                      </Button>
                    </div>
                  </SelectContent>
                </Select>
              </div>
              {/* Region Availability */}
              <div className="space-y-2">
                <Label>Region Availability</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal truncate"
                    >
                      {formData.regions?.length
                        ? regions
                            .filter((r) => formData.regions?.includes(r._id))
                            .map((r) => r.name)
                            .join(", ")
                        : "Select regions"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] max-h-64 overflow-y-auto p-2">
                    {regions.map((region) => (
                      <div
                        key={region._id}
                        className="flex items-center px-2 py-2 rounded cursor-pointer hover:bg-emerald-50"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            regions: prev.regions?.includes(region._id)
                              ? prev.regions.filter((id) => id !== region._id)
                              : [...(prev.regions || []), region._id],
                          }));
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.regions?.includes(region._id)}
                          readOnly
                          className="accent-emerald-600 mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {region.name}
                        </span>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal truncate"
                    >
                      {formData.businessTypes?.length
                        ? businessTypes
                            .filter((b) =>
                              formData.businessTypes?.includes(b._id)
                            )
                            .map((b) => b.name)
                            .join(", ")
                        : "Select business types"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] max-h-64 overflow-y-auto p-2">
                    {businessTypes.map((type) => (
                      <div
                        key={type._id}
                        className="flex items-center px-2 py-2 rounded cursor-pointer hover:bg-emerald-50"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            businessTypes: prev.businessTypes?.includes(
                              type._id
                            )
                              ? prev.businessTypes.filter(
                                  (id) => id !== type._id
                                )
                              : [...(prev.businessTypes || []), type._id],
                          }));
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.businessTypes?.includes(type._id)}
                          readOnly
                          className="accent-emerald-600 mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {type.name}
                        </span>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, visibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onBlur={() => handleTagsChange(tagsInput)}
                placeholder="Enter tags separated by commas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openapi">Import OpenAPI File (optional)</Label>
              <div
                className={`      relative flex flex-col items-center justify-center border-2 border-dashed       ${
                  openApiFileError
                    ? "border-red-400 bg-red-50"
                    : "border-emerald-200 bg-emerald-50/60"
                }      rounded-lg p-5 cursor-pointer transition      hover:border-emerald-400 hover:bg-emerald-100/70      focus-within:ring-2 focus-within:ring-emerald-400    `}
                tabIndex={0}
                onClick={() => document.getElementById("openapi")?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    document.getElementById("openapi")?.click();
                }}
                style={{ minHeight: "90px" }}
              >
                <input
                  id="openapi"
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.yaml,.yml"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  tabIndex={-1}
                  onClick={(e) => e.stopPropagation()} // Prevent bubbling to div to fix double dialog
                  onChange={async (e) => {
                    setOpenApiFileError(null);
                    const file = e.target.files?.[0];

                    if (!file) {
                      setOpenApiFile(null);
                      setFormData({ ...formData, openapiSpec: undefined });
                      return;
                    }

                    if (file.size > 1048576) {
                      // Clear file input so user can re-select same file later if needed
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      setOpenApiFile(null);
                      setFormData({ ...formData, openapiSpec: undefined });
                      setIsFileSizeErrorModalOpen(true);
                      return;
                    }

                    const ext = file.name.split(".").pop()?.toLowerCase();
                    if (!["json", "yml", "yaml"].includes(ext || "")) {
                      setOpenApiFileError(
                        "Only .json, .yml, and .yaml files are supported."
                      );
                      setFormData({ ...formData, openapiSpec: undefined });
                      return;
                    }

                    try {
                      let openapiSpec;
                      const text = await file.text();
                      if (ext === "json") openapiSpec = JSON.parse(text);
                      else
                        openapiSpec = (await import("js-yaml")).default.load(
                          text
                        );
                      setFormData({ ...formData, openapiSpec });
                      setOpenApiFile(file);
                    } catch (err: unknown) {
                      setOpenApiFileError(
                        "File parsing failed: " +
                          (err instanceof Error
                            ? err.message
                            : "Invalid format")
                      );
                      setFormData({ ...formData, openapiSpec: undefined });
                    }
                  }}
                />
                <div className="flex flex-col items-center text-center pointer-events-none">
                  <svg
                    className="w-8 h-8 mb-2 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16v-8m0 0l-4 4m4-4l4 4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="block font-medium text-emerald-700 text-sm">
                    Drag &amp; drop your OpenAPI/Swagger file here
                  </span>
                  <span className="block text-xs text-gray-600 mt-1">
                    or{" "}
                    <span className="text-emerald-600 underline">
                      click to choose file
                    </span>
                    <br />
                    <span className="text-gray-500">(.json, .yaml, .yml)</span>
                  </span>
                  {openApiFile && !openApiFileError && (
                    <div className="text-xs text-emerald-700 pt-2">
                      Attached: <b>{openApiFile.name}</b>
                    </div>
                  )}
                  {openApiFileError && (
                    <div className="text-xs text-red-600 pt-2">
                      {openApiFileError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleSubmit(isEditModalOpen)}
            >
              {isEditModalOpen ? "Update Catalog" : "Create New API"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog
        open={isAddCategoryModalOpen}
        onOpenChange={setIsAddCategoryModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-emerald-700">
              Add New Category
            </DialogTitle>
            <DialogDescription>
              Create a new category for organizing your API catalogs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryFormData.name}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    name: e.target.value,
                  })
                }
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={categoryFormData.description}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Describe this category..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddCategoryModalOpen(false);
                setCategoryFormData({ name: "", description: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleAddCategory}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Details Drawer */}
      <Sheet open={isDetailDrawerOpen} onOpenChange={setIsDetailDrawerOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto px-0">
          {selectedCatalog && (
            <>
              <div className="px-8 pt-6 pb-3 border-b bg-gradient-to-br from-emerald-50 to-white rounded-t-lg">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-semibold text-emerald-800 flex items-center gap-3">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ background: selectedCatalog.color }}
                    />
                    {selectedCatalog.name}
                  </SheetTitle>
                  <SheetDescription className="text-base mt-2 text-gray-700">
                    {selectedCatalog.description || "No description available"}
                  </SheetDescription>
                </SheetHeader>
              </div>
              <div className="px-8 py-6 flex flex-col gap-6">
                {/* Meta Info as description list */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <dt className="text-gray-500 font-medium">Category</dt>
                    <dd className="mt-1">
                      <Badge
                        className={getCategoryColor(selectedCatalog.category)}
                      >
                        {typeof selectedCatalog.category === "string"
                          ? selectedCatalog.category
                          : selectedCatalog.category?.name || "Unknown"}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Status</dt>
                    <dd className="mt-1">
                      <Badge className={getStatusColor(selectedCatalog.status)}>
                        {selectedCatalog.status}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Visibility</dt>
                    <dd className="mt-1">
                      <Badge
                        className={getVisibilityColor(
                          selectedCatalog.visibility
                        )}
                      >
                        {selectedCatalog.visibility}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Access Roles</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {selectedCatalog.accessRoles?.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {role}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Tags</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {selectedCatalog.tags.length === 0 && (
                        <span className="text-gray-400">—</span>
                      )}
                      {selectedCatalog.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center"
                        >
                          <TagIcon className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Created</dt>
                    <dd className="mt-1">
                      {new Date(selectedCatalog.createdAt).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Last Updated</dt>
                    <dd className="mt-1">
                      {new Date(selectedCatalog.updatedAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>
                {/* Divider */}
                <div className="border-t pt-6">
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        setIsDetailDrawerOpen(false);
                        handleViewDocumentation(selectedCatalog);
                      }}
                      disabled={!selectedCatalog.openapiSpec}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      View Documentation
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setIsDetailDrawerOpen(false);
                        handleEdit(selectedCatalog);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
                {/* Inline Doc Preview */}
                {selectedCatalog.openapiSpec && (
                  <div className="mt-6">
                    <div className="mb-2 font-semibold text-gray-800 text-lg">
                      Quick API Doc Preview
                    </div>
                    <div className="border rounded bg-gray-50">
                      <RedocStandalone
                        spec={selectedCatalog.openapiSpec}
                        options={{
                          theme: {
                            colors: {
                              primary: {
                                main: selectedCatalog?.color || "#059669",
                              },
                            },
                            typography: {
                              fontSize: "14px",
                              fontFamily: "inherit",
                            },
                          },
                          hideDownloadButton: true,
                          nativeScrollbars: true,
                          expandResponses: "200,201",
                          expandSingleSchemaField: true,
                        }}
                      />
                      {/* If Redoc is not installed, fallback: */}
                      {/* <pre className="text-xs p-4">{JSON.stringify(selectedCatalog.openapiSpec, null, 2)}</pre> */}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Catalog</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCatalog?.name}"? This
              action cannot be undone and will also delete all associated APIs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
