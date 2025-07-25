const express = require('express');
const router = express.Router();
const Region = require('../models/Region');

// Create a new region
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const region = new Region({ name, code });
    await region.save();
    res.status(201).json(region);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all regions
router.get('/', async (req, res) => {
  try {
    const regions = await Region.find();
    res.json(regions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
