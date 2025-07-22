const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, default: '#6366f1' }, // optional: add icon, description, etc.
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
