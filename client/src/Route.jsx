// App.jsx or routes.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UnderConstruction from "./pages/under-construction";
import App from "./App";

<Router>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/under-construction" element={<UnderConstruction />} />
  </Routes>
</Router>
