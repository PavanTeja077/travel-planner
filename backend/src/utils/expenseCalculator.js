/**
 * Simplifies debts among a group of people.
 * @param {Array} expenses - Array of expense objects from DB
 * @returns {Array} List of transactions to settle debts
 */
const calculateSettlements = (expenses) => {
  const balances = {};

  // Calculate net balances for each user
  expenses.forEach(expense => {
    const paidByStr = expense.paidBy.toString();
    if (!balances[paidByStr]) balances[paidByStr] = 0;
    
    // The person who paid gets a positive balance
    balances[paidByStr] += expense.amount;

    // Subtract the splits from each person's balance
    expense.splitAmong.forEach(split => {
      const userStr = split.user.toString();
      if (!balances[userStr]) balances[userStr] = 0;
      balances[userStr] -= split.amount;
    });
  });

  const debtors = [];
  const creditors = [];

  for (const [user, balance] of Object.entries(balances)) {
    if (balance > 0.01) creditors.push({ user, amount: balance });
    else if (balance < -0.01) debtors.push({ user, amount: -balance });
  }

  // Sort by amount descending
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const amount = Math.min(debtor.amount, creditor.amount);
    
    settlements.push({
      from: debtor.user,
      to: creditor.user,
      amount: Math.round(amount * 100) / 100
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
};

module.exports = { calculateSettlements };
