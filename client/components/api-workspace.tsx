"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Book, ChevronRight, Home, Loader2 } from "lucide-react"
import { type Catalog, catalogApi } from "@/lib/api"
import { RedocStandalone } from 'redoc';


// const RedocStandalone = ({ spec, options }: { spec: any; options: any }) => {
//   return (
//     <div className="p-8 bg-white">
//       <div className="max-w-4xl mx-auto">
//         <h2 className="text-2xl font-bold mb-4">API Documentation</h2>
//         <div className="bg-gray-50 p-4 rounded-lg">
//           <p className="text-sm text-gray-600 mb-4">
//             OpenAPI Specification Preview (Install 'redoc' package for full documentation)
//           </p>
//           <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded border">
//             {JSON.stringify(spec, null, 2)}
//           </pre>
//         </div>
//       </div>
//     </div>
//   )
// }

interface ApiWorkspaceProps {
  catalogId: string
  onBack: () => void
}

export default function ApiWorkspace({ catalogId, onBack }: ApiWorkspaceProps) {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [redocLoaded, setRedocLoaded] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true)
        const catalogData = await catalogApi.getById(catalogId)
        setCatalog(catalogData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load catalog")
      } finally {
        setLoading(false)
      }
    }

    if (catalogId) {
      fetchCatalog()
    }
  }, [catalogId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
        <p className="text-gray-600">Loading API documentation...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Button>
          <h1 className="text-xl font-bold text-red-600 mb-2">Error Loading Documentation</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!catalog?.openapiSpec) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Button>
          <h1 className="text-xl font-bold mb-2">No API Documentation Found</h1>
          <p className="text-gray-600">This catalog does not contain an OpenAPI specification.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{`
        .redoc-branding {
          display: none !important;
        }
      `}</style>

      {/* Enhanced Navigation Bar */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-emerald-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Catalog
              </Button>
              <div className="hidden md:flex items-center text-sm">
                <span className="flex items-center text-gray-500">
                  <Home className="w-4 h-4 mr-1.5" />
                  Home
                </span>
                <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                <span className="text-gray-500">API Catalogs</span>
                <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                <span className="font-medium text-gray-700 truncate max-w-xs">{catalog.name}</span>
              </div>
            </div>
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                style={{
                  backgroundColor: `${catalog?.color || "#059669"}20`,
                  border: `1px solid ${catalog?.color || "#059669"}40`,
                }}
              >
                <Book className="w-4 h-4" style={{ color: catalog?.color || "#059669" }} />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs">{catalog.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: "calc(100vh - 124px)" }}>
        <RedocStandalone
          spec={catalog.openapiSpec}
          onLoaded={() => setRedocLoaded(true)}
          options={{
            theme: {
              colors: { primary: { main: catalog?.color || "#059669" } },
              typography: { fontSize: "15px", fontFamily: "inherit" },
            },
            hideDownloadButton: true,
            nativeScrollbars: true,
            pathInMiddlePanel: true,
            expandResponses: "200,201",
            expandSingleSchemaField: true,
          }}
        />
      </div>
    </div>
  )
}
