import { type Locator, type Page } from '@playwright/test';

export interface BrandBadge {
  name: string;
  count: number;
}

export class FilterSidebar {
  readonly categories: Locator;
  readonly brands: Locator;

  constructor(private readonly page: Page) {
    this.categories = page.locator('#accordian');
    this.brands = page.locator('.brands-name');
  }

  async brandBadges(): Promise<BrandBadge[]> {
    const links = this.brands.getByRole('link');
    const out: BrandBadge[] = [];
    for (const link of await links.all()) {
      const count = Number((await link.locator('span').innerText()).replace(/\D/g, ''));
      const name = ((await link.textContent()) ?? '').replace(/\(\d+\)/, '').trim();
      out.push({ name, count });
    }
    return out;
  }

  async openBrand(name: string): Promise<void> {
    await this.brands.getByRole('link', { name: new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }).click();
  }

  async openCategory(parent: string, categoryId: number): Promise<void> {
    await this.categories.locator(`a[href="#${parent}"]`).click();
    await this.page.locator(`#${parent} a[href="/category_products/${categoryId}"]`).click();
  }
}
