const mongoose = require('mongoose');

const ApiSchema = new mongoose.Schema({
  catalogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Catalog', required: true },
  name: { type: String, required: true },
  endpoint: String,
  method: String,
  description: String,
  version: String,
  status: { type: String, default: 'active' }, // e.g., active, deprecated
  tags: [String],
  openapiSpec: Object, // <---- New field!
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true }); // <-- Adds createdAt and updatedAt

module.exports = mongoose.model('Api', ApiSchema);
