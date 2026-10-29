import { expect, type Locator, type Page } from '@playwright/test';

export class Header {
  readonly nav: Locator;
  readonly loggedInAs: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly loginLink: Locator;
  readonly cartLink: Locator;
  readonly productsLink: Locator;

  constructor(private readonly page: Page) {
    this.nav = page.locator('.shop-menu');
    this.loggedInAs = this.nav.getByText(/Logged in as/i);
    this.logoutLink = this.nav.getByRole('link', { name: /logout/i });
    this.deleteAccountLink = this.nav.getByRole('link', { name: /delete account/i });
    this.loginLink = this.nav.getByRole('link', { name: /signup \/ login/i });
    this.cartLink = this.nav.getByRole('link', { name: /cart/i });
    this.productsLink = this.nav.getByRole('link', { name: /products/i });
  }

  async expectLoggedInAs(name: string): Promise<void> {
    await expect(this.loggedInAs).toContainText(name);
    await expect(this.logoutLink).toBeVisible();
  }

  async expectLoggedOut(): Promise<void> {
    await expect(this.loginLink).toBeVisible();
    await expect(this.loggedInAs).toBeHidden();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
    await expect(this.page).toHaveURL(/\/login/);
  }
}
