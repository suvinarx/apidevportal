// src/components/ApiWorkspace.jsx
"use client";

import { RedocStandalone } from "redoc";
import { Button } from "./ui/button";
import { ArrowLeft, Book, ChevronRight, Home } from "lucide-react";
import { AppHeader, AppFooter } from "./AppLayout";

export default function ApiWorkspace({ catalog, onBack }) {
  if (!catalog?.openapiSpec) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center space-x-3 mb-4">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">No API Documentation Found</h1>
        </div>
        <p className="text-gray-500">
          This catalog does not contain an OpenAPI (Swagger) file.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{`
        .redoc-branding {
          display: none !important;
        }
      `}</style>

      <AppHeader />

      {/* Enhanced Navigation Bar */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Catalog
              </Button>

              <div className="hidden md:flex items-center text-sm">
                <a
                  href="/"
                  className="flex items-center text-gray-500 hover:text-indigo-600"
                >
                  <Home className="w-4 h-4 mr-1.5" />
                  Home
                </a>
                <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                <a
                  href="/catalogs"
                  className="text-gray-500 hover:text-indigo-600"
                >
                  API Catalogs
                </a>
                <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                <span className="font-medium text-gray-700 truncate max-w-xs">
                  {catalog.name}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                style={{
                  backgroundColor: `${catalog?.color || "#6366f1"}20`,
                  border: `1px solid ${catalog?.color || "#6366f1"}40`,
                }}
              >
                <Book
                  className="w-4 h-4"
                  style={{ color: catalog?.color || "#6366f1" }}
                />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs">
                {catalog.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: "calc(100vh - 124px)" }}>
        <RedocStandalone
          spec={catalog.openapiSpec}
          options={{
            theme: {
              colors: { primary: { main: catalog?.color || "#6366f1" } },
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
  );
}
