import { expect, type Download, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { routes } from '../config/routes';
import { parseRupees } from '../utils/money';
import type { demoPayment } from '../data/testData';

export class CheckoutPage extends BasePage {
  readonly path = routes.checkout;
  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  readonly orderRows: Locator;
  readonly totalAmount: Locator;
  readonly comment: Locator;
  readonly placeOrder: Locator;
  readonly orderPlaced: Locator;
  readonly downloadInvoice: Locator;

  constructor(page: Page) {
    super(page);
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.orderRows = page.locator('#cart_info tbody tr[id^="product-"]');
    this.totalAmount = page.locator('#cart_info tbody tr').filter({ hasText: /total amount/i }).locator('.cart_total_price');
    this.comment = page.locator('textarea[name="message"]');
    this.placeOrder = page.getByRole('link', { name: /place order/i });
    this.orderPlaced = page.getByTestId('order-placed');
    this.downloadInvoice = page.getByRole('link', { name: /download invoice/i });
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.deliveryAddress).toBeVisible();
  }

  async readTotal(): Promise<number> {
    return parseRupees(await this.totalAmount.innerText());
  }

  async lineTotals(): Promise<number[]> {
    return (await this.orderRows.locator('.cart_total_price').allInnerTexts()).map(parseRupees);
  }

  async pay(card: typeof demoPayment, comment: string): Promise<void> {
    await this.comment.fill(comment);
    await this.placeOrder.click();
    await this.page.getByTestId('name-on-card').fill(card.nameOnCard);
    await this.page.getByTestId('card-number').fill(card.cardNumber);
    await this.page.getByTestId('cvc').fill(card.cvc);
    await this.page.getByTestId('expiry-month').fill(card.expiryMonth);
    await this.page.getByTestId('expiry-year').fill(card.expiryYear);
    await this.page.getByTestId('pay-button').click();
    await expect(this.orderPlaced).toBeVisible();
  }

  async fetchInvoice(): Promise<Download> {
    const [download] = await Promise.all([this.page.waitForEvent('download'), this.downloadInvoice.click()]);
    return download;
  }
}
