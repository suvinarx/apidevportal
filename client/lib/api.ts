const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Catalog {
  _id: string
  name: string
  description: string
  color: string
  category: "order" | "org" | "inventory"
  visibility: "public" | "private"
  status: "active" | "inactive"
  accessRoles: ("admin" | "developer")[]
  tags: string[]
  openapiSpec?: any
  createdAt: string
  updatedAt: string
}

export interface Api {
  _id: string
  catalogId: string
  name: string
  endpoint: string
  method: string
  description: string
  version: string
  status: string
  tags: string[]
  openapiSpec?: any
}

export interface CreateCatalogData {
  name: string
  description: string
  color: string
  category: "order" | "org" | "inventory"
  visibility?: "public" | "private"
  status?: "active" | "inactive"
  accessRoles?: ("admin" | "developer")[]
  tags?: string[]
  openapiSpec?: any
}

// Catalog API functions
export const catalogApi = {
  // Get all catalogs
  getAll: async (): Promise<Catalog[]> => {
    const response = await fetch(`${API_BASE_URL}/catalogs`)
    if (!response.ok) throw new Error("Failed to fetch catalogs")
    return response.json()
  },

  // Get single catalog
  getById: async (id: string): Promise<Catalog> => {
    const response = await fetch(`${API_BASE_URL}/catalogs/${id}`)
    if (!response.ok) throw new Error("Failed to fetch catalog")
    return response.json()
  },

  // Create catalog
  create: async (data: CreateCatalogData): Promise<Catalog> => {
    const response = await fetch(`${API_BASE_URL}/catalogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create catalog")
    return response.json()
  },

  // Update catalog
  update: async (id: string, data: Partial<CreateCatalogData>): Promise<Catalog> => {
    const response = await fetch(`${API_BASE_URL}/catalogs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update catalog")
    return response.json()
  },

  // Delete catalog
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/catalogs/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete catalog")
  },

  // Get APIs in catalog
  getApis: async (catalogId: string): Promise<Api[]> => {
    const response = await fetch(`${API_BASE_URL}/catalogs/${catalogId}/apis`)
    if (!response.ok) throw new Error("Failed to fetch APIs")
    return response.json()
  },

  // Import OpenAPI spec
  importOpenApi: async (data: {
    openapiSpec: any
    name?: string
    description?: string
    color?: string
    category: "order" | "org" | "inventory"
    visibility?: "public" | "private"
    status?: "active" | "inactive"
    accessRoles?: ("admin" | "developer")[]
    tags?: string[]
  }): Promise<{ catalog: Catalog; apis: Api[] }> => {
    const response = await fetch(`${API_BASE_URL}/catalogs/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to import OpenAPI spec")
    return response.json()
  },

  search: async (q: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/catalogs/search?q=${encodeURIComponent(q)}`);
    if (!response.ok) throw new Error("Failed to search");
    return response.json();
  },
}

