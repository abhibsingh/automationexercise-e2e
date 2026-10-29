import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartModal } from '../components/CartModal';
import { routes } from '../config/routes';
import { parseRupees } from '../utils/money';

export class ProductDetailPage extends BasePage {
  readonly path = routes.products;
  readonly info: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly quantity: Locator;
  readonly addToCartButton: Locator;
  readonly cartModal: CartModal;
  readonly reviewName: Locator;
  readonly reviewEmail: Locator;
  readonly reviewText: Locator;
  readonly reviewSubmit: Locator;
  readonly reviewSuccess: Locator;

  constructor(page: Page) {
    super(page);
    this.info = page.locator('.product-information');
    this.name = this.info.locator('h2');
    this.price = this.info.locator('span > span').first();
    this.quantity = page.locator('#quantity');
    this.addToCartButton = this.info.getByRole('button', { name: /add to cart/i });
    this.cartModal = new CartModal(page);
    this.reviewName = page.locator('#name');
    this.reviewEmail = page.locator('#email');
    this.reviewText = page.locator('#review');
    this.reviewSubmit = page.locator('#button-review');
    this.reviewSuccess = page.getByText(/thank you for your review/i);
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.name).toBeVisible();
  }

  async open(id: number): Promise<void> {
    await this.page.goto(routes.productDetails(id));
  }

  field(label: 'Category' | 'Availability' | 'Condition' | 'Brand'): Locator {
    return this.info.locator('p').filter({ hasText: new RegExp(`^\\s*${label}:`) });
  }

  async readPrice(): Promise<number> {
    return parseRupees(await this.price.innerText());
  }

  async addToCart(quantity: number): Promise<void> {
    await this.quantity.fill(String(quantity));
    await this.addToCartButton.click();
    await this.cartModal.expectAdded();
    await this.cartModal.close();
  }
}
