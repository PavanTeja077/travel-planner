const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:itineraryId').get(protect, getExpenses).post(protect, addExpense);
router.route('/expense/:id').delete(protect, deleteExpense);

module.exports = router;
