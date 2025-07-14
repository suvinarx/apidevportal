const express = require('express');
const router = express.Router();
const Catalog = require('../models/Catalog');
const Api = require('../models/Api');
const yaml = require("js-yaml");
// Get all catalogs
router.get('/', async (req, res) => {
  try {
    const catalogs = await Catalog.find();
    res.json(catalogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a catalog
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const catalog = new Catalog({ name, description, color });
    await catalog.save();
    res.status(201).json(catalog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all APIs in a catalog
router.get('/:catalogId/apis', async (req, res) => {
  try {
    const apis = await Api.find({ catalogId: req.params.catalogId });
    res.json(apis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new API to a catalog
router.post('/:catalogId/apis', async (req, res) => {
  try {
    const { name, endpoint, method, description, version, status, tags,openapiSpec } = req.body;
    const api = new Api({
      catalogId: req.params.catalogId,
      name,
      endpoint,
      method,
      description,
      version,
      status,
      tags,
      openapiSpec
    });
    await api.save();
    res.status(201).json(api);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit Catalog
router.put('/:catalogId', async (req, res) => {
  try {
    const {
      name,
      description,
      color,
      visibility,
      status,
      accessRoles,
      tags,
      openapiSpec
    } = req.body;
    const updated = await Catalog.findByIdAndUpdate(
      req.params.catalogId,
      {
        name,
        description,
        color,
        visibility,
        status,
        accessRoles,
        tags,
        openapiSpec,
        updatedAt: Date.now()
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Catalog (and its APIs)
router.delete('/:catalogId', async (req, res) => {
  try {
    await Api.deleteMany({ catalogId: req.params.catalogId });
    await Catalog.findByIdAndDelete(req.params.catalogId);
    res.json({ message: "Catalog and its APIs deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single catalog by ID, including its OpenAPI spec
router.get('/:catalogId', async (req, res) => {
  try {
    const catalog = await Catalog.findById(req.params.catalogId);
    if (!catalog) return res.status(404).json({ error: "Catalog not found" });
    res.json(catalog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Bulk import OpenAPI endpoints
router.post('/:catalogId/apis/import', async (req, res) => {
  try {
    const { openapiSpec } = req.body;
    if (!openapiSpec || !openapiSpec.paths) {
      return res.status(400).json({ error: "OpenAPI spec missing or invalid." });
    }
    const { paths, info } = openapiSpec;
    const version = (info && info.version) || "1.0.0";
    const newApis = [];
    for (const path in paths) {
      for (const method in paths[path]) {
        const operation = paths[path][method];
        const api = new Api({
          catalogId: req.params.catalogId,
          name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
          endpoint: path,
          method: method.toUpperCase(),
          description: operation.description || "",
          version,
          status: "active",
          tags: operation.tags || [],
          openapiSpec: openapiSpec, // Save full spec, or you could save per-endpoint
        });
        await api.save();
        newApis.push(api);
      }
    }
    res.status(201).json({ message: `Imported ${newApis.length} APIs`, apis: newApis });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Import OpenAPI file, create catalog, add all APIs
// routes/catalogs.js
router.post('/import', async (req, res) => {
  try {
    const {
      openapiSpec,
      name,
      description,
      color,
      visibility,
      status,
      accessRoles,
      tags
    } = req.body;

    if (!openapiSpec || !openapiSpec.info || !openapiSpec.paths) {
      return res.status(400).json({ error: "OpenAPI spec missing info or paths." });
    }

    // Use OpenAPI info as fallback
    const info = openapiSpec.info;
    const catalog = new Catalog({
      name: name || info.title || "Imported API Catalog",
      description: description || info.description || "",
      color: color || "#3B82F6",
      visibility: visibility || 'public',
      status: status || 'active',
      accessRoles: accessRoles && accessRoles.length ? accessRoles : ['admin'],
      tags: tags && tags.length ? tags : [],
      openapiSpec
    });

    await catalog.save();

    // Save endpoints as APIs (same as before)
    const version = info.version || "1.0.0";
    let newApis = [];
    for (const path in openapiSpec.paths) {
      for (const method in openapiSpec.paths[path]) {
        const operation = openapiSpec.paths[path][method];
        const api = new Api({
          catalogId: catalog._id,
          name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
          endpoint: path,
          method: method.toUpperCase(),
          description: operation.description || "",
          version,
          status: "active",
          tags: operation.tags || [],
          openapiSpec
        });
        await api.save();
        newApis.push(api);
      }
    }

    res.status(201).json({ message: `Imported catalog and ${newApis.length} APIs`, catalog, apis: newApis });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
