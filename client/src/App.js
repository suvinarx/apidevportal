import { useEffect, useState } from "react"
import {
  getCatalogs,
  addCatalog,
  editCatalog,
  deleteCatalog,
  importOpenapiCatalog,
} from "./api"
import CatalogList from "./components/CatalogList"
import AddCatalogForm from "./components/AddCatalogForm"
import ApiWorkspace from "./components/ApiWorkspace" // This is your Redoc-based component!
import { getCatalogDetail } from "./api";

function App() {
  const [view, setView] = useState("catalogs") // catalogs | apis
  const [catalogs, setCatalogs] = useState([])
  const [selectedCatalog, setSelectedCatalog] = useState(null)
  const [searchCatalog, setSearchCatalog] = useState("")
  const [editCatalogData, setEditCatalogData] = useState(null)
  const [showAddCatalog, setShowAddCatalog] = useState(false)

  useEffect(() => {
    loadCatalogs()
  }, [])

  const loadCatalogs = async () => {
    const res = await getCatalogs()
    setCatalogs(res.data)
  }

  const handleAddCatalog = async (data) => {
    await addCatalog(data)
    setShowAddCatalog(false)
    await loadCatalogs()
  }

  const handleEditCatalog = async (data) => {
    await editCatalog(editCatalogData._id, data)
    setEditCatalogData(null)
    await loadCatalogs()
  }

  const handleDeleteCatalog = async (cat) => {
    if (window.confirm("Delete this catalog and all its APIs?")) {
      await deleteCatalog(cat._id)
      await loadCatalogs()
    }
  }

const handleSelectCatalog = async (catalog) => {
  // Fetch full catalog including openapiSpec
  const res = await getCatalogDetail(catalog._id);
  setSelectedCatalog(res.data);
  setView("apis");
};

  const handleBackToCatalogs = () => {
    setSelectedCatalog(null)
    setView("catalogs")
    loadCatalogs()
  }

  const filteredCatalogs = catalogs.filter((cat) =>
    cat.name.toLowerCase().includes(searchCatalog.toLowerCase())
  )

  return (
    <div className="bg-gray-100 min-h-screen">
      {view === "catalogs" && (
        <>
          <CatalogList
            catalogs={filteredCatalogs}
            onSelect={handleSelectCatalog}
            onAddClick={() => setShowAddCatalog(true)}
            search={searchCatalog}
            setSearch={setSearchCatalog}
            onEdit={setEditCatalogData}
            onDelete={handleDeleteCatalog}
            onImported={loadCatalogs}
          />

          {/* Add Catalog Dialog */}
          {/* <AddCatalogForm
            open={showAddCatalog}
            onSave={handleAddCatalog}
            onCancel={() => setShowAddCatalog(false)}
          /> */}

          {/* Edit Catalog Dialog */}
          {/* <AddCatalogForm
            open={!!editCatalogData}
            onSave={handleEditCatalog}
            onCancel={() => setEditCatalogData(null)}
            initial={editCatalogData}
          /> */}
        </>
      )}

      {view === "apis" && selectedCatalog && (
        <ApiWorkspace catalog={selectedCatalog} onBack={handleBackToCatalogs} />
      )}
    </div>
  )
}

export default App
