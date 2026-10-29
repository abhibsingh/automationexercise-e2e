import { test, expect } from '@playwright/test';
import { parseRupees, parseInvoice } from '../../src/utils/money';
import { newUser } from '../../src/data/testData';
import { AD_HOSTS } from '../../src/config/routes';

test.describe('helpers', { tag: ['@unit', '@smoke'] }, () => {
  test('parseRupees reads shop prices', () => {
    expect(parseRupees('Rs. 500')).toBe(500);
    expect(parseRupees('Rs. 1,500')).toBe(1500);
    expect(() => parseRupees('free')).toThrow();
  });

  test('parseInvoice reads the invoice text', () => {
    expect(parseInvoice('Hi QA Auto12, Your total purchase amount is 1400. Thank you')).toEqual({
      customer: 'QA Auto12',
      amount: 1400,
    });
    expect(() => parseInvoice('something else')).toThrow(/Unexpected invoice format/);
  });

  test('generated users are unique and prefixed', () => {
    const emails = new Set(Array.from({ length: 300 }, () => newUser(2).email));
    expect(emails.size).toBe(300);
    for (const e of emails) expect(e).toMatch(/^qa-as-w2-.+@example\.com$/);
  });

  test('ad blocking matches ad hosts but not the shop', () => {
    expect(AD_HOSTS.test('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')).toBe(true);
    expect(AD_HOSTS.test('https://googleads.g.doubleclick.net/x')).toBe(true);
    expect(AD_HOSTS.test('https://automationexercise.com/products')).toBe(false);
  });
});
