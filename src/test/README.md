# Test Suite Documentation

## Overview
This test suite ensures the correctness of financial calculations and transaction logic in the personal finance app. All tests must pass before deploying changes.

## Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode (auto-rerun on file changes)
npm test

# Run tests with UI
npm run test:ui
```

## Test Files

### 1. `calculations.test.js`
Tests for all calculation functions in `src/services/calculations.js`.

**Coverage:**
- Net worth calculation with various scenarios
- Currency formatting
- Edge cases (null values, decimals, negatives)

**Key Tests:**
- ✅ Correct net worth: Bank + Stocks + Crypto - Credit Due
- ✅ Handles missing/zero values
- ✅ Handles negative net worth
- ✅ Decimal precision
- ✅ Currency formatting with privacy mode

### 2. `transactionLogic.test.js`
Tests for transaction effects on account balances.

**Coverage:**
- Income transactions (bank vs credit card)
- Expense transactions (bank vs credit card)
- Investment transactions (stocks, crypto)
- Transaction reversals (edit/delete)
- Complex edit scenarios

**Key Tests:**

**Income:**
- ✅ Income to bank → increases bank balance
- ✅ Income to credit card → reduces credit card due
- ✅ Credit card income can exceed due amount (negative due)

**Expenses:**
- ✅ Bank expense → decreases bank balance
- ✅ Credit card expense → increases credit card due
- ✅ Stock investment → decreases bank, increases stocks
- ✅ Crypto investment → decreases bank, increases crypto

**Reversals:**
- ✅ Deleting transactions correctly reverses effects
- ✅ Editing transactions (reverse old + apply new) works correctly
- ✅ Net worth is maintained when switching payment methods

## Test Invariants

These properties MUST always hold true:

1. **Net Worth Formula:** `netWorth = bankBalance + stocksValue + cryptoValue - creditCardDue`

2. **Transaction Consistency:**
   - Adding then deleting a transaction returns to original state
   - Editing a transaction amount should only change that specific account

3. **Payment Method Independence:**
   - Moving expense from bank to credit should not change net worth
   - Only changes which account is affected

4. **Investment Flow:**
   - Investments always decrease bank balance
   - Investments increase corresponding asset (stocks/crypto)

## Adding New Tests

When adding new financial features, add tests for:
1. Happy path scenarios
2. Edge cases (zero, negative, very large numbers)
3. Invalid input handling
4. Transaction reversibility

## Test Failures

If tests fail:
1. **DO NOT** skip or modify tests to make them pass
2. **FIX** the underlying bug in the code
3. Tests represent the correct behavior - code must match

## Coverage Goals

Target: 100% coverage for:
- `src/services/calculations.js`
- Transaction logic in `Dashboard.jsx`
- Balance update functions

## Pre-Deployment Checklist

Before every deployment:
- [ ] All tests pass (`npm run test:run`)
- [ ] No console errors in test output
- [ ] New features have corresponding tests
- [ ] Manual testing confirms test scenarios

---

**Remember:** These tests exist because we had bugs that affected real user data. Never deploy without passing tests.
