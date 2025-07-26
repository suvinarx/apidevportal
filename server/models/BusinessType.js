const mongoose = require('mongoose');

const BusinessTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('BusinessType', BusinessTypeSchema);
