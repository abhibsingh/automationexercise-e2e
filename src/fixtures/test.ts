import { test as base, expect } from '@playwright/test';
import { env } from '../config/env';
import { AD_HOSTS } from '../config/routes';
import { AutomationExerciseApi } from '../api/AutomationExerciseApi';
import { newUser, type TestUser } from '../data/testData';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

type Fixtures = {
  api: AutomationExerciseApi;
  newUserData: TestUser;
  registeredUser: TestUser;
  loggedInUser: TestUser;
  loginPage: LoginPage;
  signupPage: SignupPage;
  productsPage: ProductsPage;
  productDetail: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use, testInfo) => {
    if (env.blockAds) {
      let blocked = 0;
      await page.route(AD_HOSTS, (route) => {
        blocked++;
        return route.abort();
      });
      await use(page);
      testInfo.annotations.push({ type: 'ad-requests-blocked', description: String(blocked) });
    } else {
      await use(page);
    }
  },

  api: async ({ request }, use) => use(new AutomationExerciseApi(request)),

  newUserData: async ({ api }, use, testInfo) => {
    const user = newUser(testInfo.workerIndex);
    await use(user);
    // the test may or may not have created this user through the UI; delete if it exists
    await api.deleteAccount(user.email, user.password).catch(() => undefined);
  },

  registeredUser: async ({ api }, use, testInfo) => {
    const user = newUser(testInfo.workerIndex);
    const created = await api.createAccount(user);
    expect(created.responseCode, `API setup failed: ${created.body.message}`).toBe(201);
    testInfo.annotations.push({ type: 'test-user', description: user.email });
    await use(user);
    const deleted = await api.deleteAccount(user.email, user.password);
    if (deleted.responseCode !== 200) {
      testInfo.annotations.push({ type: 'cleanup-failed', description: `${user.email}: ${deleted.body.message}` });
    }
  },

  loggedInUser: async ({ registeredUser, loginPage }, use) => {
    await loginPage.goto();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await loginPage.header.expectLoggedInAs(registeredUser.name);
    await use(registeredUser);
  },

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productDetail: async ({ page }, use) => use(new ProductDetailPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});

export { expect };
