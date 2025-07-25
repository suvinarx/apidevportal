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
    const regionsWithCounts = await Region.aggregate([
      {
        $lookup: {
          from: 'catalogs', // collection name of catalogs
          localField: '_id',
          foreignField: 'regions',
          as: 'catalogs',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          count: { $size: '$catalogs' }, // count of linked catalogs
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    res.json(regionsWithCounts);
  } catch (err) {
    console.error('Failed to fetch regions:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
