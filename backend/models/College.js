const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  address: String,
  phone: String,
  email: String,
  website: String
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);
