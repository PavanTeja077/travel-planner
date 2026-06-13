const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  groupMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  startDate: { type: Date },
  endDate: { type: Date },
  destinations: [{
    location: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    date: { type: Date },
    notes: { type: String }
  }],
  documents: [{
    name: { type: String },
    url: { type: String },
    uploader: { type: String },
    size: { type: String }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
