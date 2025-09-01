const express = require('express');
const router = express.Router();
const Catalog = require('../models/Catalog');
const Api = require('../models/Api');
const yaml = require("js-yaml");
const { default: mongoose } = require('mongoose');

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);

    // Search catalogs
    const catalogs = await Catalog.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    });

    // Search APIs
    const apis = await Api.find({
      $or: [
        { endpoint: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ]
    }).populate('catalogId', 'name');

    // Format results
    res.json([
      ...catalogs.map(c => ({
        type: 'catalog',
        id: c._id,
        name: c.name,
        catalogName: c.name
      })),
      ...apis.map(a => ({
        type: 'api',
        id: a._id,
        name: a.endpoint,  // will show the path (eg: /pet)
        method: a.method,
        catalogId: a.catalogId?._id,
        catalogName: a.catalogId?.name
      }))
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all catalogs
router.get("/", async (req, res) => {
  try {
    // const { region, businessType } = req.query;
    const { region } = req.query;

    const matchStage = {};

    // Handle region filter (can be string or array)
    if (region) {
      const regionIds = Array.isArray(region)
        ? region.map((id) => new mongoose.Types.ObjectId(id))
        : [new mongoose.Types.ObjectId(region)];
      matchStage["regions"] = { $in: regionIds };
    }

    // Handle businessType filter (can be string or array)
    // if (businessType) {
    //   const businessTypeIds = Array.isArray(businessType)
    //     ? businessType.map((id) => new mongoose.Types.ObjectId(id))
    //     : [new mongoose.Types.ObjectId(businessType)];
    //   matchStage["businessTypes"] = { $in: businessTypeIds };
    // }

    const catalogs = await Catalog.aggregate([
      { $match: matchStage },

      {
        $lookup: {
          from: "regions",
          localField: "regions",
          foreignField: "_id",
          as: "regionDetails",
        },
      },
      // {
      //   $lookup: {
      //     from: "businesstypes",
      //     localField: "businessTypes",
      //     foreignField: "_id",
      //     as: "businessTypeDetails",
      //   },
      // },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          category: 1,
          visibility: 1,
          status: 1,
          tags: 1,
          openApiFileUrl: 1,
          regionDetails: { _id: 1, name: 1, code: 1 },
          // businessTypeDetails: { _id: 1, name: 1, code: 1 },
        },
      },
    ]);

    res.json(catalogs);
  } catch (err) {
    console.error("Failed to fetch catalogs:", err);
    res.status(500).json({ error: err.message });
  }
});


// Create a catalog
router.post('/', async (req, res) => {
  try {
    const { name, description, color, category, regions } = req.body;
    const catalog = new Catalog({ name, description, color, category, regions });
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
    const { name, endpoint, method, description, version, status, tags, openapiSpec } = req.body;
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
      category,
      // businessTypes,
      regions,
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
        category,
        // businessTypes,
        regions,
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
      tags,
      category
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
      category: category || 'order', // Default to 'order' if not provided
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
