const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
  description: { type: String, trim: true, default: '', maxlength: 280 }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
