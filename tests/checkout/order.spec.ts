import * as fs from 'fs';
import { test, expect } from '../../src/fixtures/test';
import { catalog } from '../../src/data/catalog';
import { demoPayment } from '../../src/data/testData';
import { parseInvoice } from '../../src/utils/money';

test.describe('Checkout and invoice', () => {
  test('logged in user places an order and the invoice is correct', { tag: ['@smoke', '@checkout'] }, async ({
    loggedInUser: user,
    productDetail,
    cartPage,
    checkoutPage,
  }, testInfo) => {
    const items = [
      { ...catalog.knownProduct, qty: 2 },
      { ...catalog.secondProduct, qty: 1 },
    ];
    const expectedTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    await test.step('add products with quantities', async () => {
      for (const item of items) {
        await productDetail.open(item.id);
        await productDetail.addToCart(item.qty);
      }
    });

    await test.step('checkout shows the registered address', async () => {
      await cartPage.goto();
      await cartPage.proceedToCheckout();
      await checkoutPage.waitUntilReady();
      for (const part of [`${user.firstName} ${user.lastName}`, user.address1, user.city, user.zipcode, user.country, user.mobile]) {
        await expect(checkoutPage.deliveryAddress).toContainText(part);
        await expect(checkoutPage.billingAddress).toContainText(part);
      }
    });

    await test.step('order total equals the sum of the lines', async () => {
      const lines = await checkoutPage.lineTotals();
      expect(lines.reduce((a, b) => a + b, 0)).toBe(expectedTotal);
      expect(await checkoutPage.readTotal()).toBe(expectedTotal);
    });

    await test.step('pay with the demo card', async () => {
      await checkoutPage.pay(demoPayment, `qa-as automated order ${testInfo.testId}`);
    });

    await test.step('invoice file names the customer and the right amount', async () => {
      const download = await checkoutPage.fetchInvoice();
      const filePath = testInfo.outputPath(download.suggestedFilename());
      await download.saveAs(filePath);
      await testInfo.attach('invoice', { path: filePath });

      const invoice = parseInvoice(fs.readFileSync(filePath, 'utf-8'));
      expect(invoice.customer).toBe(`${user.firstName} ${user.lastName}`);
      expect(invoice.amount).toBe(expectedTotal);
    });
  });
});
