const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
