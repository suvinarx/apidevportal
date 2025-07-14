// models/Catalog.js
const mongoose = require('mongoose');

const CatalogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  color: String,
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  accessRoles: [{ type: String, enum: ['admin', 'developer'] }], // Can add more roles
  tags: [String],
  openapiSpec: Object,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Catalog', CatalogSchema);
