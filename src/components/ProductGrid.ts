import { expect, type Locator, type Page } from '@playwright/test';
import { parseRupees } from '../utils/money';

export interface ProductCard {
  id: number;
  name: string;
  price: number;
}

export class ProductGrid {
  readonly root: Locator;
  readonly title: Locator;
  readonly cards: Locator;

  constructor(page: Page) {
    this.root = page.locator('.features_items');
    this.title = this.root.locator('h2.title');
    this.cards = this.root.locator('.product-image-wrapper');
  }

  card(index: number): Locator {
    return this.cards.nth(index);
  }

  cardByName(name: string): Locator {
    return this.cards.filter({ has: this.root.page().locator('.productinfo p', { hasText: name }) });
  }

  async count(): Promise<number> {
    await expect(this.title).toBeVisible();
    return this.cards.count();
  }

  async read(index: number): Promise<ProductCard> {
    const info = this.card(index).locator('.productinfo');
    const id = Number(await info.locator('.add-to-cart').getAttribute('data-product-id'));
    return {
      id,
      name: (await info.locator('p').innerText()).trim(),
      price: parseRupees(await info.locator('h2').innerText()),
    };
  }

  async names(): Promise<string[]> {
    return (await this.root.locator('.productinfo p').allInnerTexts()).map((t) => t.trim());
  }

  addToCartButton(index: number): Locator {
    return this.card(index).locator('.productinfo .add-to-cart');
  }

  viewProductLink(index: number): Locator {
    return this.card(index).getByRole('link', { name: /view product/i });
  }
}
