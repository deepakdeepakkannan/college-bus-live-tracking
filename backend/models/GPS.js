const mongoose = require('mongoose');

const gpsSchema = new mongoose.Schema({
  busId: { type: String, required: true },
  latitude: Number,
  longitude: Number,
  speed: Number,
  timestamp: { type: Date, default: Date.now },
  status: String
}, { timestamps: true });

module.exports = mongoose.model('GPS', gpsSchema);
