const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true }, // Storing base amount (assuming INR for this app)
  currency: { type: String, default: 'INR' },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splitAmong: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number }
  }],
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
