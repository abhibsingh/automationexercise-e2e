import { test, expect } from '../../src/fixtures/test';
import { routes } from '../../src/config/routes';

test.describe('Sign up', () => {
  test('new user signs up through the UI and lands logged in', { tag: ['@smoke', '@auth'] }, async ({
    page,
    loginPage,
    signupPage,
    newUserData: user,
    api,
  }) => {
    await test.step('start sign up with a unique email', async () => {
      await loginPage.goto();
      await loginPage.startSignup(user.name, user.email);
      await signupPage.waitUntilReady();
    });

    await test.step('fill account and address details', async () => {
      await signupPage.fillAccountDetails(user);
    });

    await test.step('account is created and user is logged in', async () => {
      await signupPage.submit();
      await signupPage.header.expectLoggedInAs(user.name);
    });

    await test.step('backend agrees: the new credentials are valid', async () => {
      expect((await api.verifyLogin(user.email, user.password)).responseCode).toBe(200);
    });

    await test.step('delete account through the UI', async () => {
      await page.goto(routes.deleteAccount);
      await expect(page.getByTestId('account-deleted')).toBeVisible();
      expect((await api.verifyLogin(user.email, user.password)).responseCode).toBe(404);
    });
  });

  test('sign up with an email that already exists is rejected', { tag: ['@regression', '@auth', '@negative'] }, async ({
    loginPage,
    registeredUser,
  }) => {
    await loginPage.goto();
    await loginPage.startSignup('Someone Else', registeredUser.email);
    await expect(loginPage.signupError).toHaveText(/email address already exist/i);
  });

  test('sign up with an invalid email is blocked by validation', { tag: ['@regression', '@auth', '@negative'] }, async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.startSignup('No Email', 'not-an-email');
    expect(await loginPage.validationMessage(loginPage.signupEmail)).not.toBe('');
    await expect(page).toHaveURL(/\/login/);
  });
});
