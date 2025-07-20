import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  getCatalogs,
  editCatalog,
  deleteCatalog,
  getCatalogDetail,
} from "./api";
import CatalogList from "./components/CatalogList";
import ApiWorkspace from "./components/ApiWorkspace";
import UnderConstruction from "./pages/UnderConstruction";

function CatalogApp({ onNavigate }) {
  const [view, setView] = useState("catalogs"); // 'catalogs' or 'api'
  const [catalogs, setCatalogs] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [searchCatalog, setSearchCatalog] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    setLoading(true);
    try {
      const res = await getCatalogs();
      setCatalogs(res.data);
    } catch (error) {
      console.error("Failed to load catalogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCatalog = async (catalog) => {
    setLoading(true);
    try {
      const res = await getCatalogDetail(catalog._id);
      setSelectedCatalog(res.data);
      setView("api");
    } catch (error) {
      console.error("Failed to load catalog details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCatalogs = () => {
    setView("catalogs");
    setSelectedCatalog(null);
    loadCatalogs();
  };

  const handleEditCatalog = async (updatedCatalog) => {
    try {
      await editCatalog(updatedCatalog._id, updatedCatalog);
      loadCatalogs();
    } catch (error) {
      console.error("Failed to update catalog:", error);
    }
  };

  const handleDeleteCatalog = async (catalog) => {
    if (window.confirm(`Are you sure you want to delete "${catalog.name}"?`)) {
      try {
        await deleteCatalog(catalog._id);
        loadCatalogs();
      } catch (error) {
        console.error("Failed to delete catalog:", error);
      }
    }
  };

  const filteredCatalogs = catalogs.filter((cat) =>
    cat.name.toLowerCase().includes(searchCatalog.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      {view === "catalogs" && (
        <CatalogList
          catalogs={filteredCatalogs}
          onSelect={handleSelectCatalog}
          onEdit={handleEditCatalog}
          onDelete={handleDeleteCatalog}
          search={searchCatalog}
          setSearch={setSearchCatalog}
          onImported={loadCatalogs}
          onAddClick={() => setShowImportDialog(true)}
          showImportDialog={showImportDialog}
          setShowImportDialog={setShowImportDialog}
        />
      )}
      {view === "api" && selectedCatalog && (
        <ApiWorkspace catalog={selectedCatalog} onBack={handleBackToCatalogs} />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Main app route */}
        <Route path="/" element={<CatalogApp />} />

        {/* Under Construction routes */}
        <Route path="/blank" element={<UnderConstruction />} />
        <Route path="/careers" element={<UnderConstruction />} />
        <Route path="/blog" element={<UnderConstruction />} />
        <Route path="/contact-us" element={<UnderConstruction />} />
        <Route path="/press-kit" element={<UnderConstruction />} />
        <Route path="/privacy-policy" element={<UnderConstruction />} />
        <Route path="/terms-of-service" element={<UnderConstruction />} />
        <Route path="/cookie-policy" element={<UnderConstruction />} />

        {/* Fallback for any unmatched route */}
        <Route path="*" element={<UnderConstruction />} />
      </Routes>
    </Router>
  );
}

export default App;
