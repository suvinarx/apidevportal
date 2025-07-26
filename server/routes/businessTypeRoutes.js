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

    const businessType = new BusinessType({ name });
    await businessType.save();
    res.status(201).json(businessType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all business types
router.get('/', async (req, res) => {
  try {
    const typesWithCounts = await BusinessType.aggregate([
      {
        $lookup: {
          from: 'catalogs',               // join with catalogs collection
          localField: '_id',
          foreignField: 'businessTypes',
          as: 'catalogs',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          count: { $size: '$catalogs' },  // count how many catalogs matched
        },
      },
      { $sort: { name: 1 } }, // Optional: sort alphabetically
    ]);

    res.json(typesWithCounts);
  } catch (err) {
    console.error('Failed to fetch business types:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
