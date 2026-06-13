const Expense = require('../models/Expense');
const { calculateSettlements } = require('../utils/expenseCalculator');

// @route   GET /api/expenses/:itineraryId
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ itineraryId: req.params.itineraryId }).populate('paidBy', 'name');
    
    // For demo purposes, we'll mock some data if none exist
    if (expenses.length === 0) {
      return res.json({ expenses: [], settlements: [] });
    }

    // Call our calculator utility
    // We need to format the expenses properly for the calculator
    // The calculator expects an array of { paidBy: id, amount, splitAmong: [{user: id, amount}] }
    
    // In a real app we'd populate everything, but let's just pass raw expenses for calculation
    const rawExpenses = await Expense.find({ itineraryId: req.params.itineraryId });
    const rawSettlements = calculateSettlements(rawExpenses);

    // Map IDs to Names for settlements
    const Itinerary = require('../models/Itinerary');
    const itinerary = await Itinerary.findById(req.params.itineraryId).populate('groupMembers', 'name');
    
    const userMap = {};
    if (itinerary) {
      itinerary.groupMembers.forEach(member => {
        userMap[member._id.toString()] = member.name;
      });
    }

    const settlements = rawSettlements.map(s => ({
      from: { name: userMap[s.from] || 'User' },
      to: { name: userMap[s.to] || 'User' },
      amount: s.amount
    }));

    res.json({ expenses, settlements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/expenses/:itineraryId
const addExpense = async (req, res) => {
  try {
    const { desc, amount } = req.body;
    
    // Check if itinerary exists to find members
    const Itinerary = require('../models/Itinerary');
    const itinerary = await Itinerary.findById(req.params.itineraryId);
    
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Split amount equally among group members for simplicity
    const memberCount = itinerary.groupMembers.length;
    const splitAmount = Number(amount) / memberCount;
    
    const splitAmong = itinerary.groupMembers.map(memberId => ({
      user: memberId,
      amount: splitAmount
    }));

    const newExpense = await Expense.create({
      itineraryId: req.params.itineraryId,
      description: desc,
      amount: Number(amount),
      paidBy: req.user._id, // Real authenticated user
      splitAmong: splitAmong
    });

    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getExpenses, addExpense, deleteExpense };
