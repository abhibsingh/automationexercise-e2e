import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductGrid } from '../components/ProductGrid';
import { FilterSidebar } from '../components/FilterSidebar';
import { CartModal } from '../components/CartModal';
import { routes } from '../config/routes';

export class ProductsPage extends BasePage {
  readonly path = routes.products;
  readonly grid: ProductGrid;
  readonly filters: FilterSidebar;
  readonly cartModal: CartModal;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.grid = new ProductGrid(page);
    this.filters = new FilterSidebar(page);
    this.cartModal = new CartModal(page);
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.grid.title).toBeVisible();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await Promise.all([this.page.waitForURL(/[?&]search=/, { waitUntil: 'domcontentloaded' }), this.searchButton.click()]);
    await expect(this.grid.title).toHaveText(/searched products/i);
  }

  async addToCart(index: number): Promise<void> {
    await this.grid.addToCartButton(index).click();
    await this.cartModal.expectAdded();
    await this.cartModal.close();
  }
}
