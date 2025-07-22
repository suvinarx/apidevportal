const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const category = new Category({ name, color, description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete category
router.delete('/:categoryId', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.categoryId);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
