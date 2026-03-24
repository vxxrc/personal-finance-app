/**
 * Calculate total net worth
 * @param {Object} profile - User profile with financial data
 * @returns {number} Total net worth
 */
export const calculateNetWorth = (profile) => {
  if (!profile) return 0;

  const bankBalance = profile.bankBalance || 0;
  const stocksValue = profile.stocksValue || 0;
  const cryptoValue = profile.cryptoValue || 0;
  const creditCardDue = profile.creditCardDue || 0;

  return bankBalance + stocksValue + cryptoValue - creditCardDue;
};

/**
 * Calculate progress toward a goal
 * @param {number} current - Current amount
 * @param {number} target - Target amount
 * @returns {number} Progress percentage (0-100)
 */
export const calculateGoalProgress = (current, target) => {
  if (!target || target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

/**
 * Calculate monthly savings needed to reach goal
 * @param {number} currentAmount - Current saved amount
 * @param {number} targetAmount - Goal amount
 * @param {Date} targetDate - Goal deadline
 * @param {number} monthlyInvestment - Amount already being invested monthly (default 0)
 * @returns {number} Additional monthly savings needed
 */
export const calculateMonthlySavingsNeeded = (currentAmount, targetAmount, targetDate, monthlyInvestment = 0) => {
  const now = new Date();
  const monthsRemaining = Math.max(
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
    (targetDate.getMonth() - now.getMonth()),
    1
  );

  // Calculate how much the regular investments will contribute by the target date
  const investmentContribution = monthlyInvestment * monthsRemaining;

  // Remaining amount needed after accounting for regular investments
  const remainingAmount = targetAmount - currentAmount - investmentContribution;

  // Additional monthly savings needed
  return Math.max(remainingAmount / monthsRemaining, 0);
};

/**
 * Calculate total expenses for a time period
 * @param {Array} expenses - Array of expense objects
 * @param {Date} startDate - Start date filter
 * @param {Date} endDate - End date filter
 * @returns {number} Total expenses
 */
export const calculateTotalExpenses = (expenses, startDate, endDate) => {
  if (!expenses || expenses.length === 0) return 0;

  return expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    })
    .reduce((total, expense) => total + expense.amount, 0);
};

/**
 * Group expenses by category
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Expenses grouped by category
 */
export const groupExpensesByCategory = (expenses) => {
  if (!expenses || expenses.length === 0) return {};

  return expenses.reduce((acc, expense) => {
    const category = expense.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        count: 0,
        expenses: []
      };
    }
    acc[category].total += expense.amount;
    acc[category].count += 1;
    acc[category].expenses.push(expense);
    return acc;
  }, {});
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {boolean} hidden - Whether to hide the amount
 * @returns {string} Formatted currency string or masked string
 */
export const formatCurrency = (amount, hidden = false) => {
  if (hidden) {
    return '₹ ••••••';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
