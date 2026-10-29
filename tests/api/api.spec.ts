import { test, expect } from '../../src/fixtures/test';
import { catalog } from '../../src/data/catalog';
import { newUser } from '../../src/data/testData';

test.describe('Public API', () => {
  test('products list returns the full catalogue', { tag: ['@smoke', '@api'] }, async ({ api }) => {
    const res = await api.productsList();
    expect(res.responseCode).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.products.find((p) => p.id === catalog.knownProduct.id)?.name).toBe(catalog.knownProduct.name);
  });

  test('POST to products list is rejected', { tag: ['@regression', '@api', '@negative'] }, async ({ api }) => {
    const res = await api.postToProductsList();
    expect(res.responseCode).toBe(405);
    expect(res.body.message).toMatch(/not supported/i);
    test.info().annotations.push({ type: 'http-status-vs-body', description: `HTTP ${res.httpStatus}, body ${res.responseCode}` });
  });

  test('search without the parameter is a bad request', { tag: ['@regression', '@api', '@negative'] }, async ({ api }) => {
    const res = await api.searchProduct();
    expect(res.responseCode).toBe(400);
    expect(res.body.message).toMatch(/search_product parameter is missing/i);
  });

  test('account lifecycle: create, verify, delete, verify again', { tag: ['@smoke', '@api'] }, async ({ api }, testInfo) => {
    const user = newUser(testInfo.workerIndex);

    expect((await api.createAccount(user)).responseCode).toBe(201);
    expect((await api.createAccount(user)).responseCode, 'duplicate email must be rejected').toBe(400);
    expect((await api.verifyLogin(user.email, user.password)).responseCode).toBe(200);
    expect((await api.verifyLogin(user.email, 'wrong-password')).responseCode).toBe(404);
    expect((await api.deleteAccount(user.email, user.password)).responseCode).toBe(200);
    expect((await api.verifyLogin(user.email, user.password)).responseCode).toBe(404);
  });

  test('verify login without email is a bad request', { tag: ['@regression', '@api', '@negative'] }, async ({ api }) => {
    const res = await api.verifyLoginWithoutEmail('whatever');
    expect(res.responseCode).toBe(400);
  });
});
