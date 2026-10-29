import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { routes } from '../config/routes';
import { parseRupees } from '../utils/money';

export interface CartLine {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export class CartPage extends BasePage {
  readonly path = routes.cart;
  readonly rows: Locator;
  readonly emptyMessage: Locator;
  readonly checkoutButton: Locator;
  readonly checkoutLoginModal: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('#cart_info_table tbody tr');
    this.emptyMessage = page.locator('#empty_cart');
    this.checkoutButton = page.getByText('Proceed To Checkout');
    this.checkoutLoginModal = page.locator('#checkoutModal');
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.rows.first().or(this.page.locator('#empty_cart:visible'))).toBeVisible();
  }

  row(productId: number): Locator {
    return this.page.locator(`#product-${productId}`);
  }

  async lines(): Promise<CartLine[]> {
    const out: CartLine[] = [];
    for (const row of await this.rows.all()) {
      out.push({
        id: Number((await row.getAttribute('id'))?.replace('product-', '')),
        name: (await row.locator('.cart_description h4').innerText()).trim(),
        price: parseRupees(await row.locator('.cart_price').innerText()),
        quantity: Number((await row.locator('.cart_quantity').innerText()).trim()),
        total: parseRupees(await row.locator('.cart_total').innerText()),
      });
    }
    return out;
  }

  async remove(productId: number): Promise<void> {
    const row = this.row(productId);
    await Promise.all([
      this.page.waitForResponse((r) => r.url().includes(`/delete_cart/${productId}`) && r.ok()),
      row.locator('.cart_quantity_delete').click(),
    ]);
    await expect(row).toHaveCount(0);
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
