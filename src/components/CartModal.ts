import { expect, type Locator, type Page } from '@playwright/test';

export class CartModal {
  readonly root: Locator;
  readonly continueShopping: Locator;
  readonly viewCart: Locator;

  constructor(page: Page) {
    this.root = page.locator('#cartModal');
    this.continueShopping = this.root.getByRole('button', { name: /continue shopping/i });
    this.viewCart = this.root.getByRole('link', { name: /view cart/i });
  }

  async expectAdded(): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.root).toContainText(/added/i);
  }

  async close(): Promise<void> {
    await this.continueShopping.click();
    await expect(this.root).toBeHidden();
  }
}
