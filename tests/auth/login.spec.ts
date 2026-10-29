import { test, expect } from '../../src/fixtures/test';
import { routes } from '../../src/config/routes';

test.describe('Sign in / sign out', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('registered user can sign in and sign out', { tag: ['@smoke', '@auth', '@mobile'] }, async ({
    page,
    loginPage,
    registeredUser: user,
  }) => {
    await test.step('sign in', async () => {
      await loginPage.login(user.email, user.password);
      await loginPage.header.expectLoggedInAs(user.name);
    });

    await test.step('session survives reload and navigation', async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.goto(routes.products, { waitUntil: 'domcontentloaded' });
      await loginPage.header.expectLoggedInAs(user.name);
    });

    await test.step('sign out', async () => {
      await loginPage.header.logout();
      await loginPage.header.expectLoggedOut();
    });
  });

  test('wrong password shows an error', { tag: ['@smoke', '@auth', '@negative'] }, async ({
    page,
    loginPage,
    registeredUser: user,
  }) => {
    await loginPage.login(user.email, 'definitely-wrong-password');
    await expect(loginPage.loginError).toHaveText(/your email or password is incorrect/i);
    await expect(page).toHaveURL(/\/login/);
    await loginPage.header.expectLoggedOut();
  });

  test('unknown email shows the same generic error', { tag: ['@regression', '@auth', '@negative'] }, async ({ loginPage }) => {
    await loginPage.login(`qa-as-nobody-${Date.now()}@example.com`, 'whatever123');
    await expect(loginPage.loginError).toHaveText(/your email or password is incorrect/i);
  });

  test('empty email is blocked by browser validation', { tag: ['@regression', '@auth', '@negative'] }, async ({ page, loginPage }) => {
    await loginPage.loginPassword.fill('something');
    await loginPage.loginButton.click();
    expect(await loginPage.validationMessage(loginPage.loginEmail)).not.toBe('');
    await expect(page).toHaveURL(/\/login/);
  });
});
