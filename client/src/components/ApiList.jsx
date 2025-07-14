import { useState } from "react";

export default function ApiList({ apis, onBack, onSelectApi, onAddClick, search, setSearch, catalog, onEditApi, onDeleteApi }) {
    const uniqueTags = [...new Set(apis.flatMap(api => api.tags || []))];
    const [selectedTag, setSelectedTag] = useState("");

    const filteredApis = apis
      .filter(api => api.name.toLowerCase().includes(search.toLowerCase()))
      .filter(api => selectedTag === "" || (api.tags || []).includes(selectedTag));

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <button onClick={onBack} className="mb-4 text-blue-700 hover:underline">&larr; Back to Catalogs</button>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{catalog.name} - APIs</h2>
                <button onClick={onAddClick} className="bg-blue-600 text-white px-4 py-2 rounded shadow">+ Add API</button>
            </div>
            <input
                className="block w-full border px-3 py-2 rounded mb-2"
                placeholder="Search APIs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {/* Tag filter pills */}
            <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setSelectedTag("")}
                  className={`px-2 py-1 rounded text-sm ${selectedTag === "" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                  All
                </button>
                {uniqueTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2 py-1 rounded text-sm ${selectedTag === tag ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                    {tag}
                  </button>
                ))}
            </div>

            <div className="space-y-2">
                {filteredApis.length === 0 && (
                    <div className="text-gray-500">No APIs found in this catalog.</div>
                )}

                {filteredApis.map((api) => (
                    <div key={api._id} className="p-3 rounded shadow bg-white cursor-pointer hover:bg-blue-50 flex justify-between items-center">
                        <div
                            className="flex-1"
                            onClick={() => onSelectApi(api)}
                        >
                            <div className="font-semibold">{api.name} <span className={`text-xs px-2 py-1 ml-2 rounded ${api.status === "deprecated" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{api.status}</span></div>
                            <div className="text-gray-600">{api.description}</div>
                            <div className="text-xs text-gray-400">{api.method} {api.endpoint} | v{api.version} {api.tags && api.tags.length > 0 && " | " + api.tags.join(", ")}</div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={e => { e.stopPropagation(); onEditApi(api); }} className="text-blue-600 px-2">Edit</button>
                            <button onClick={e => { e.stopPropagation(); onDeleteApi(api); }} className="text-red-600 px-2">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
