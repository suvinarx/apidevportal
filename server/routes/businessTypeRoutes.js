const express = require('express');
const router = express.Router();
const BusinessType = require('../models/BusinessType');

// Create a new business type
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const businessType = new BusinessType({ name, code });
    await businessType.save();
    res.status(201).json(businessType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all business types
router.get('/', async (req, res) => {
  try {
    const types = await BusinessType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
