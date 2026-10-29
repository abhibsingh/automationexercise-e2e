import { randomUUID } from 'crypto';
import { env } from '../config/env';

export function uniqueSuffix(workerIndex = 0): string {
  return `w${workerIndex}-${Date.now().toString(36)}-${randomUUID().slice(0, 6)}`;
}

export function newUser(workerIndex = 0) {
  const suffix = uniqueSuffix(workerIndex);
  return {
    name: `${env.dataPrefix} ${suffix}`,
    email: `${env.dataPrefix}-${suffix}@example.com`,
    password: `Qa!${randomUUID().slice(0, 10)}`,
    title: 'Mr' as const,
    birthDay: '15',
    birthMonth: '6',
    birthMonthName: 'June',
    birthYear: '1990',
    firstName: 'QA',
    lastName: `Auto${suffix.replace(/[^a-z0-9]/gi, '').slice(-6)}`,
    company: `${env.dataPrefix} Test Co`,
    address1: '42 Automation Street',
    address2: 'Suite 7',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Noida',
    zipcode: '201301',
    mobile: '9000000000',
  };
}

export type TestUser = ReturnType<typeof newUser>;

/** Dummy values the demo shop accepts. Not a real card. */
export const demoPayment = {
  nameOnCard: 'QA Automation',
  cardNumber: '4111111111111111',
  cvc: '123',
  expiryMonth: '12',
  expiryYear: '2030',
} as const;
