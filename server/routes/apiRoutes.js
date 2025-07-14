const express = require('express');
const router = express.Router();
const Api = require('../models/Api');

// Get details of a specific API
router.get('/:apiId', async (req, res) => {
  try {
    const api = await Api.findById(req.params.apiId);
    if (!api) return res.status(404).json({ error: 'API not found' });
    res.json(api);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dummy test endpoint
router.post('/:apiId/test', async (req, res) => {
  try {
    // In real use: Lookup API config and call real endpoint
    // For now: Return a dummy response
    const api = await Api.findById(req.params.apiId);
    if (!api) return res.status(404).json({ error: 'API not found' });
    // Simulate different responses based on method/endpoint
    res.json({
      success: true,
      message: `Test for API: ${api.name}`,
      input: req.body,
      response: {
        result: "This is a mock response",
        status: 200
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit API
router.put('/:apiId', async (req, res) => {
  try {
    const { name, endpoint, method, description, version, status, tags, openapiSpec } = req.body;
    const updated = await Api.findByIdAndUpdate(
      req.params.apiId,
      { name, endpoint, method, description, version, status, tags, openapiSpec, updatedAt: Date.now() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete API
router.delete('/:apiId', async (req, res) => {
  try {
    await Api.findByIdAndDelete(req.params.apiId);
    res.json({ message: "API deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
