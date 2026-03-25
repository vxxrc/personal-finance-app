import { describe, it, expect } from 'vitest';
import { calculateNetWorth, formatCurrency } from './calculations';

describe('calculateNetWorth', () => {
  it('should calculate correct net worth with all positive values', () => {
    const profile = {
      bankBalance: 10000,
      stocksValue: 5000,
      cryptoValue: 2000,
      creditCardDue: 0,
    };
    expect(calculateNetWorth(profile)).toBe(17000);
  });

  it('should subtract credit card due from total', () => {
    const profile = {
      bankBalance: 10000,
      stocksValue: 5000,
      cryptoValue: 2000,
      creditCardDue: 3000,
    };
    // 10000 + 5000 + 2000 - 3000 = 14000
    expect(calculateNetWorth(profile)).toBe(14000);
  });

  it('should handle zero values correctly', () => {
    const profile = {
      bankBalance: 10000,
      stocksValue: 0,
      cryptoValue: 0,
      creditCardDue: 0,
    };
    expect(calculateNetWorth(profile)).toBe(10000);
  });

  it('should handle negative net worth correctly', () => {
    const profile = {
      bankBalance: 1000,
      stocksValue: 0,
      cryptoValue: 0,
      creditCardDue: 5000,
    };
    // 1000 + 0 + 0 - 5000 = -4000
    expect(calculateNetWorth(profile)).toBe(-4000);
  });

  it('should handle missing profile gracefully', () => {
    expect(calculateNetWorth(null)).toBe(0);
    expect(calculateNetWorth(undefined)).toBe(0);
  });

  it('should handle missing properties gracefully', () => {
    const profile = {
      bankBalance: 10000,
      // missing stocksValue, cryptoValue, creditCardDue
    };
    expect(calculateNetWorth(profile)).toBe(10000);
  });

  it('should handle decimal values correctly', () => {
    const profile = {
      bankBalance: 10000.50,
      stocksValue: 5000.25,
      cryptoValue: 2000.75,
      creditCardDue: 3000.10,
    };
    // 10000.50 + 5000.25 + 2000.75 - 3000.10 = 14001.40
    expect(calculateNetWorth(profile)).toBeCloseTo(14001.40, 2);
  });
});

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(10000)).toBe('₹10,000');
    expect(formatCurrency(1000)).toBe('₹1,000');
    expect(formatCurrency(100)).toBe('₹100');
  });

  it('should hide numbers when hidden is true', () => {
    expect(formatCurrency(10000, true)).toBe('₹ ••••••');
    expect(formatCurrency(999999, true)).toBe('₹ ••••••');
  });

  it('should handle zero correctly', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('should handle negative numbers correctly', () => {
    expect(formatCurrency(-5000)).toBe('-₹5,000');
  });
});
