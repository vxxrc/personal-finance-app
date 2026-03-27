import { describe, it, expect } from 'vitest';

/**
 * These tests verify the transaction logic that updates bank balance and credit card due.
 * This logic is in Dashboard.jsx but we're testing it in isolation here.
 */

// Simulate the applyTransactionEffect function
function applyTransactionEffect(expenseData, profile) {
  const updates = {};

  // Handle INCOME
  if (expenseData.type === 'income') {
    if (expenseData.paymentMethod === 'bank') {
      updates.bankBalance = (profile.bankBalance || 0) + expenseData.amount;
    } else if (expenseData.paymentMethod === 'credit') {
      updates.creditCardDue = (profile.creditCardDue || 0) - expenseData.amount;
    }
  }
  // Handle EXPENSE
  else {
    if (expenseData.category === 'Investments') {
      updates.bankBalance = (profile.bankBalance || 0) - expenseData.amount;
      if (expenseData.subCategory === 'Stocks') {
        updates.stocksValue = (profile.stocksValue || 0) + expenseData.amount;
      } else if (expenseData.subCategory === 'Crypto') {
        updates.cryptoValue = (profile.cryptoValue || 0) + expenseData.amount;
      }
    } else {
      if (expenseData.paymentMethod === 'bank') {
        updates.bankBalance = (profile.bankBalance || 0) - expenseData.amount;
      } else if (expenseData.paymentMethod === 'credit') {
        updates.creditCardDue = (profile.creditCardDue || 0) + expenseData.amount;
      }
    }
  }

  return { ...profile, ...updates };
}

// Simulate the reverseTransactionEffect function
function reverseTransactionEffect(expense, profile) {
  const updates = {};

  if (expense.type === 'income') {
    if (expense.paymentMethod === 'bank') {
      updates.bankBalance = (profile.bankBalance || 0) - expense.amount;
    } else if (expense.paymentMethod === 'credit') {
      updates.creditCardDue = (profile.creditCardDue || 0) + expense.amount;
    }
  } else {
    if (expense.category === 'Investments') {
      updates.bankBalance = (profile.bankBalance || 0) + expense.amount;
      if (expense.subCategory === 'Stocks') {
        updates.stocksValue = (profile.stocksValue || 0) - expense.amount;
      } else if (expense.subCategory === 'Crypto') {
        updates.cryptoValue = (profile.cryptoValue || 0) - expense.amount;
      }
    } else {
      if (expense.paymentMethod === 'bank') {
        updates.bankBalance = (profile.bankBalance || 0) + expense.amount;
      } else if (expense.paymentMethod === 'credit') {
        updates.creditCardDue = (profile.creditCardDue || 0) - expense.amount;
      }
    }
  }

  return { ...profile, ...updates };
}

describe('Income Transactions', () => {
  const initialProfile = {
    bankBalance: 10000,
    stocksValue: 5000,
    cryptoValue: 2000,
    creditCardDue: 3000,
  };

  it('should add income to bank when payment method is bank', () => {
    const transaction = {
      type: 'income',
      amount: 5000,
      paymentMethod: 'bank',
      category: 'Income',
      subCategory: 'Salary',
    };

    const result = applyTransactionEffect(transaction, initialProfile);

    expect(result.bankBalance).toBe(15000); // 10000 + 5000
    expect(result.creditCardDue).toBe(3000); // unchanged
  });

  it('should reduce credit card due when income paid to credit card', () => {
    const transaction = {
      type: 'income',
      amount: 2000,
      paymentMethod: 'credit',
      category: 'Income',
      subCategory: 'Bonus',
    };

    const result = applyTransactionEffect(transaction, initialProfile);

    expect(result.bankBalance).toBe(10000); // unchanged
    expect(result.creditCardDue).toBe(1000); // 3000 - 2000
  });

  it('should handle credit card income that exceeds due amount', () => {
    const transaction = {
      type: 'income',
      amount: 5000,
      paymentMethod: 'credit',
      category: 'Income',
      subCategory: 'Refund',
    };

    const result = applyTransactionEffect(transaction, initialProfile);

    expect(result.creditCardDue).toBe(-2000); // 3000 - 5000
  });
});

describe('Expense Transactions', () => {
  const initialProfile = {
    bankBalance: 10000,
    stocksValue: 5000,
    cryptoValue: 2000,
    creditCardDue: 3000,
  };

  it('should deduct bank expense from bank balance', () => {
    const transaction = {
      type: 'expense',
      amount: 1000,
      paymentMethod: 'bank',
      category: 'Daily',
      subCategory: 'Groceries',
    };

    const result = applyTransactionEffect(transaction, initialProfile);

    expect(result.bankBalance).toBe(9000); // 10000 - 1000
    expect(result.creditCardDue).toBe(3000); // unchanged
  });

  it('should increase credit card due when expense paid by credit', () => {
    const transaction = {
      type: 'expense',
      amount: 500,
      paymentMethod: 'credit',
      category: 'Daily',
      subCategory: 'Dining',
    };

    const result = applyTransactionEffect(transaction, initialProfile);

    expect(result.bankBalance).toBe(10000); // unchanged
    expect(result.creditCardDue).toBe(3500); // 3000 + 500
  });

  it('should handle stock investment correctly', () => {
    const transaction = {
      type: 'expense',
      amount: 2000,
      paymentMethod: 'bank',
      category: 'Investments',
      subCategory: 'Stocks',
    };

    const result = applyTransactionEffect(transaction, initialProfile);

    expect(result.bankBalance).toBe(8000); // 10000 - 2000
    expect(result.stocksValue).toBe(7000); // 5000 + 2000
  });

  it('should handle crypto investment correctly', () => {
    const transaction = {
      type: 'expense',
      amount: 1000,
      paymentMethod: 'bank',
      category: 'Investments',
      subCategory: 'Crypto',
    };

    const result = applyTransactionEffect(transaction, initialProfile);

    expect(result.bankBalance).toBe(9000); // 10000 - 1000
    expect(result.cryptoValue).toBe(3000); // 2000 + 1000
  });
});

describe('Transaction Reversals (Delete/Edit)', () => {
  const initialProfile = {
    bankBalance: 10000,
    stocksValue: 5000,
    cryptoValue: 2000,
    creditCardDue: 3000,
  };

  it('should reverse bank income correctly', () => {
    const transaction = {
      type: 'income',
      amount: 5000,
      paymentMethod: 'bank',
    };

    const result = reverseTransactionEffect(transaction, initialProfile);

    expect(result.bankBalance).toBe(5000); // 10000 - 5000
  });

  it('should reverse credit card income correctly', () => {
    const transaction = {
      type: 'income',
      amount: 2000,
      paymentMethod: 'credit',
    };

    const result = reverseTransactionEffect(transaction, initialProfile);

    expect(result.creditCardDue).toBe(5000); // 3000 + 2000
  });

  it('should reverse bank expense correctly', () => {
    const transaction = {
      type: 'expense',
      amount: 1000,
      paymentMethod: 'bank',
      category: 'Daily',
    };

    const result = reverseTransactionEffect(transaction, initialProfile);

    expect(result.bankBalance).toBe(11000); // 10000 + 1000
  });

  it('should reverse credit card expense correctly', () => {
    const transaction = {
      type: 'expense',
      amount: 500,
      paymentMethod: 'credit',
      category: 'Daily',
    };

    const result = reverseTransactionEffect(transaction, initialProfile);

    expect(result.creditCardDue).toBe(2500); // 3000 - 500
  });

  it('should reverse stock investment correctly', () => {
    const transaction = {
      type: 'expense',
      amount: 2000,
      category: 'Investments',
      subCategory: 'Stocks',
    };

    const result = reverseTransactionEffect(transaction, initialProfile);

    expect(result.bankBalance).toBe(12000); // 10000 + 2000
    expect(result.stocksValue).toBe(3000); // 5000 - 2000
  });
});

describe('Edit Scenarios (Reverse + Apply)', () => {
  it('should correctly handle editing income from bank to credit card', () => {
    let profile = {
      bankBalance: 10000,
      stocksValue: 5000,
      cryptoValue: 2000,
      creditCardDue: 3000,
    };

    const oldTransaction = {
      type: 'income',
      amount: 5000,
      paymentMethod: 'bank',
    };

    const newTransaction = {
      type: 'income',
      amount: 5000,
      paymentMethod: 'credit',
    };

    // Reverse old
    profile = reverseTransactionEffect(oldTransaction, profile);
    expect(profile.bankBalance).toBe(5000); // 10000 - 5000

    // Apply new
    profile = applyTransactionEffect(newTransaction, profile);
    expect(profile.bankBalance).toBe(5000); // unchanged from previous
    expect(profile.creditCardDue).toBe(-2000); // 3000 - 5000
  });

  it('should correctly handle editing expense from bank to credit card', () => {
    let profile = {
      bankBalance: 10000,
      stocksValue: 5000,
      cryptoValue: 2000,
      creditCardDue: 3000,
    };

    const oldTransaction = {
      type: 'expense',
      amount: 1000,
      paymentMethod: 'bank',
      category: 'Daily',
    };

    const newTransaction = {
      type: 'expense',
      amount: 1000,
      paymentMethod: 'credit',
      category: 'Daily',
    };

    // Reverse old
    profile = reverseTransactionEffect(oldTransaction, profile);
    expect(profile.bankBalance).toBe(11000); // 10000 + 1000

    // Apply new
    profile = applyTransactionEffect(newTransaction, profile);
    expect(profile.bankBalance).toBe(11000); // unchanged
    expect(profile.creditCardDue).toBe(4000); // 3000 + 1000
  });
});

describe('Net Worth Invariants', () => {
  it('should maintain net worth when moving expense from bank to credit', () => {
    let profile = {
      bankBalance: 10000,
      stocksValue: 5000,
      cryptoValue: 2000,
      creditCardDue: 3000,
    };

    const initialNetWorth = profile.bankBalance + profile.stocksValue + profile.cryptoValue - profile.creditCardDue;

    const bankTransaction = {
      type: 'expense',
      amount: 1000,
      paymentMethod: 'bank',
      category: 'Daily',
    };

    profile = applyTransactionEffect(bankTransaction, profile);

    const netWorthAfterBank = profile.bankBalance + profile.stocksValue + profile.cryptoValue - profile.creditCardDue;
    expect(netWorthAfterBank).toBe(initialNetWorth - 1000);

    // Now reverse and apply as credit
    profile = reverseTransactionEffect(bankTransaction, profile);

    const creditTransaction = {
      type: 'expense',
      amount: 1000,
      paymentMethod: 'credit',
      category: 'Daily',
    };

    profile = applyTransactionEffect(creditTransaction, profile);

    const netWorthAfterCredit = profile.bankBalance + profile.stocksValue + profile.cryptoValue - profile.creditCardDue;
    expect(netWorthAfterCredit).toBe(initialNetWorth - 1000);
  });
});

describe('Edit Amount Scenarios', () => {
  it('should correctly edit credit card expense amount without adding extra', () => {
    let profile = {
      bankBalance: 10000,
      stocksValue: 5000,
      cryptoValue: 2000,
      creditCardDue: 3000,
    };

    // Original transaction: 500 on credit card
    const oldTransaction = {
      type: 'expense',
      amount: 500,
      paymentMethod: 'credit',
      category: 'Daily',
      subCategory: 'Dining',
    };

    // Apply original
    profile = applyTransactionEffect(oldTransaction, profile);
    expect(profile.creditCardDue).toBe(3500); // 3000 + 500

    // Now EDIT to 1000 instead of 500
    const newTransaction = {
      type: 'expense',
      amount: 1000, // Changed from 500 to 1000
      paymentMethod: 'credit',
      category: 'Daily',
      subCategory: 'Dining',
    };

    // Reverse old
    profile = reverseTransactionEffect(oldTransaction, profile);
    expect(profile.creditCardDue).toBe(3000); // Back to original

    // Apply new
    profile = applyTransactionEffect(newTransaction, profile);
    expect(profile.creditCardDue).toBe(4000); // 3000 + 1000
    expect(profile.bankBalance).toBe(10000); // Unchanged

    // Net worth should be reduced by 1000 total (the new amount)
    const netWorth = profile.bankBalance + profile.stocksValue + profile.cryptoValue - profile.creditCardDue;
    expect(netWorth).toBe(13000); // 10000 + 5000 + 2000 - 4000
  });

  it('should correctly edit bank expense amount without adding extra', () => {
    let profile = {
      bankBalance: 10000,
      stocksValue: 5000,
      cryptoValue: 2000,
      creditCardDue: 3000,
    };

    // Original transaction: 500 from bank
    const oldTransaction = {
      type: 'expense',
      amount: 500,
      paymentMethod: 'bank',
      category: 'Daily',
    };

    // Apply original
    profile = applyTransactionEffect(oldTransaction, profile);
    expect(profile.bankBalance).toBe(9500); // 10000 - 500

    // Edit to 1000
    const newTransaction = {
      type: 'expense',
      amount: 1000,
      paymentMethod: 'bank',
      category: 'Daily',
    };

    // Reverse old, apply new
    profile = reverseTransactionEffect(oldTransaction, profile);
    expect(profile.bankBalance).toBe(10000); // Back to original

    profile = applyTransactionEffect(newTransaction, profile);
    expect(profile.bankBalance).toBe(9000); // 10000 - 1000

    const netWorth = profile.bankBalance + profile.stocksValue + profile.cryptoValue - profile.creditCardDue;
    expect(netWorth).toBe(13000); // 9000 + 5000 + 2000 - 3000
  });

  it('should correctly edit credit card income amount', () => {
    let profile = {
      bankBalance: 10000,
      stocksValue: 5000,
      cryptoValue: 2000,
      creditCardDue: 3000,
    };

    // Original: 1000 income to credit card
    const oldTransaction = {
      type: 'income',
      amount: 1000,
      paymentMethod: 'credit',
    };

    profile = applyTransactionEffect(oldTransaction, profile);
    expect(profile.creditCardDue).toBe(2000); // 3000 - 1000

    // Edit to 2000
    const newTransaction = {
      type: 'income',
      amount: 2000,
      paymentMethod: 'credit',
    };

    profile = reverseTransactionEffect(oldTransaction, profile);
    expect(profile.creditCardDue).toBe(3000); // Back to original

    profile = applyTransactionEffect(newTransaction, profile);
    expect(profile.creditCardDue).toBe(1000); // 3000 - 2000

    const netWorth = profile.bankBalance + profile.stocksValue + profile.cryptoValue - profile.creditCardDue;
    expect(netWorth).toBe(16000); // 10000 + 5000 + 2000 - 1000
  });
});
