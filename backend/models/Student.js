const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registerNumber: { type: String, required: true, unique: true },
  department: String,
  year: String,
  busNumber: String,
  stop: String
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
