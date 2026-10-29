import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { TestUser } from '../data/testData';

export class SignupPage extends BasePage {
  readonly path = '/signup';
  readonly heading: Locator;
  readonly accountCreated: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByText(/enter account information/i);
    this.accountCreated = page.getByTestId('account-created');
    this.continueButton = page.getByTestId('continue-button');
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async fillAccountDetails(u: TestUser): Promise<void> {
    await this.page.locator(`#id_gender${u.title === 'Mr' ? 1 : 2}`).check();
    await expect(this.page.getByTestId('name')).toHaveValue(u.name);
    await expect(this.page.getByTestId('email')).toHaveValue(u.email);
    await this.page.getByTestId('password').fill(u.password);
    await this.page.getByTestId('days').selectOption(u.birthDay);
    await this.page.getByTestId('months').selectOption(u.birthMonth);
    await this.page.getByTestId('years').selectOption(u.birthYear);
    await this.page.locator('#newsletter').check();
    await this.page.locator('#optin').check();
    await this.page.getByTestId('first_name').fill(u.firstName);
    await this.page.getByTestId('last_name').fill(u.lastName);
    await this.page.getByTestId('company').fill(u.company);
    await this.page.getByTestId('address').fill(u.address1);
    await this.page.getByTestId('address2').fill(u.address2);
    await this.page.getByTestId('country').selectOption(u.country);
    await this.page.getByTestId('state').fill(u.state);
    await this.page.getByTestId('city').fill(u.city);
    await this.page.getByTestId('zipcode').fill(u.zipcode);
    await this.page.getByTestId('mobile_number').fill(u.mobile);
  }

  async submit(): Promise<void> {
    await this.page.getByTestId('create-account').click();
    await expect(this.accountCreated).toBeVisible();
    await this.continueButton.click();
  }
}
