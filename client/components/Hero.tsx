import { Search } from "lucide-react";
import React from "react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
import { catalogApi } from "@/lib/api";

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  catalogs: any[];
  handleViewDocumentation: (catalog: any) => void;
  toast: any;
  dropdownResults: any[];
  setDropdownResults: (results: any[]) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  searchTimeout: NodeJS.Timeout | undefined;
  setSearchTimeout: (timeout: NodeJS.Timeout) => void;
}

const Hero: React.FC<HeroProps> = ({
  searchQuery,
  setSearchQuery,
  catalogs,
  handleViewDocumentation,
  toast,
  dropdownResults,
  setDropdownResults,
  showDropdown,
  setShowDropdown,
  isSearching,
  setIsSearching,
  searchTimeout,
  setSearchTimeout,
}) => {
  const performSearch = async (value: string) => {
    try {
      const data = await catalogApi.search(value);
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
  };

  return (
    <div className="mt-[110px] h-[450px] bg-[url('/images/cookie-bg.jpg')] ">
      <div className="w-[1550px] mx-auto h-full flex items-center justify-end px-12">
        <div className="w-[350px] bg-white px-8 py-10 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Search API</h1>

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
                    await performSearch(value);
                  }, 300)
                ); // 300ms debounce delay
              }}
              className="pl-10  bg-gray-50 border-gray-200 "
            />
            {showDropdown && (
              <div className="absolute z-50 left-0 w-full bg-white border rounded shadow-lg mt-2 max-h-64 overflow-auto">
                {isSearching ? (
                  <div className="px-4 py-2 text-gray-500 flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Searching...
                  </div>
                ) : dropdownResults.length > 0 ? (
                  dropdownResults.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="px-4 py-2 hover:bg-emerald-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setShowDropdown(false);
                        setSearchQuery("");
                        if (item.type === "catalog") {
                          const cat = catalogs.find((c) => c._id === item.id);
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
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">
                            {item.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Catalog
                          </Badge>
                        </div>
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
        </div>
      </div>
    </div>
  );
};

export default Hero;
