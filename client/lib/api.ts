// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ---- TYPES ----

// Category Type
export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string; // (optional, for UI use)
  createdAt?: string;
  updatedAt?: string;
}

// Catalog Type
export interface Catalog {
  _id: string;
  name: string;
  description: string;
  color: string;
  // Use string for category (categoryId) or full Category object if populated
  category: string | Category;
  visibility: "public" | "private";
  status: "active" | "inactive";
  accessRoles: ("admin" | "developer")[];
  tags: string[];
  openapiSpec?: any;
  createdAt: string;
  updatedAt: string;
}

// API Endpoint Type
export interface Api {
  _id: string;
  catalogId: string;
  name: string;
  endpoint: string;
  method: string;
  description: string;
  version: string;
  status: string;
  tags: string[];
  openapiSpec?: any;
}

// Catalog Create/Update Type
export interface CreateCatalogData {
  name: string;
  description: string;
  color: string;
  category: string; // Should be category._id
  visibility?: "public" | "private";
  status?: "active" | "inactive";
  accessRoles?: ("admin" | "developer")[];
  tags?: string[];
  openapiSpec?: any;
  regions?: string[];
  businessTypes?: string[];
}

// ---- API FUNCTIONS ----

// -- Catalog API --
export const catalogApi = {
  getAll: async (filters?: {
  regions?: string[];
  businessTypes?: string[];
}): Promise<Catalog[]> => {
  const params = new URLSearchParams();

  filters?.regions?.forEach((id) => params.append("region", id));
  filters?.businessTypes?.forEach((id) => params.append("businessType", id));

  const query = params.toString();
  const res = await fetch(`${API_BASE_URL}/catalogs${query ? `?${query}` : ""}`);

  if (!res.ok) throw new Error("Failed to fetch catalogs");
  return res.json();
},

  getById: async (id: string): Promise<Catalog> => {
    const res = await fetch(`${API_BASE_URL}/catalogs/${id}`);
    if (!res.ok) throw new Error("Failed to fetch catalog");
    return res.json();
  },

  create: async (data: CreateCatalogData): Promise<Catalog> => {
    const res = await fetch(`${API_BASE_URL}/catalogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create catalog");
    return res.json();
  },

  update: async (id: string, data: Partial<CreateCatalogData>): Promise<Catalog> => {
    const res = await fetch(`${API_BASE_URL}/catalogs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update catalog");
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/catalogs/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete catalog");
  },

  getApis: async (catalogId: string): Promise<Api[]> => {
    const res = await fetch(`${API_BASE_URL}/catalogs/${catalogId}/apis`);
    if (!res.ok) throw new Error("Failed to fetch APIs");
    return res.json();
  },

  importOpenApi: async (data: {
    openapiSpec: any;
    name?: string;
    description?: string;
    color?: string;
    category: string; // categoryId
    visibility?: "public" | "private";
    status?: "active" | "inactive";
    accessRoles?: ("admin" | "developer")[];
    tags?: string[];
  }): Promise<{ catalog: Catalog; apis: Api[] }> => {
    const res = await fetch(`${API_BASE_URL}/catalogs/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to import OpenAPI spec");
    return res.json();
  },

  search: async (q: string): Promise<any[]> => {
    const res = await fetch(`${API_BASE_URL}/catalogs/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("Failed to search");
    return res.json();
  },
};

// -- Category API --
export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  },

  create: async (data: { name: string; description?: string }): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return res.json();
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update category");
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete category");
  },
};

