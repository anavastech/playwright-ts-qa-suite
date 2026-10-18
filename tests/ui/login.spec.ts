import { expect, test } from '../../fixtures/ui.fixtures';
import { SAUCE_USERS } from '../../utils/testData';

// Casos trazables a docs/ui/login.feature
test.describe('Login', { tag: ['@ui', '@login'] }, () => {
  test('standard user can access the inventory page @TC-LOGIN-01 @smoke', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.standard.username, SAUCE_USERS.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('locked out user sees an error message @TC-LOGIN-02 @negative', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.lockedOut.username, SAUCE_USERS.lockedOut.password);

    await loginPage.expectError('Sorry, this user has been locked out');
  });

  test('empty credentials block form submission @TC-LOGIN-03 @negative', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', '');

    await loginPage.expectError('Username is required');
  });

  // performance_glitch_user es funcionalmente válido pero con latencia inducida:
  // se le da más tiempo explícito en vez de depender del timeout global del test.
  test('performance_glitch_user eventually logs in despite the delay @TC-LOGIN-04 @regression', async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.performanceGlitch.username, SAUCE_USERS.performanceGlitch.password);

    await expect(page).toHaveURL(/inventory\.html/, { timeout: 10_000 });
  });

  test('logout returns to the login page @TC-LOGIN-05 @smoke', async ({ page, authenticatedPage }) => {
    await authenticatedPage.logout();

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.getByPlaceholder('Username')).toBeVisible();
  });

  test('cannot access inventory directly after logging out @TC-LOGIN-06 @negative', async ({
    page,
    authenticatedPage,
  }) => {
    await authenticatedPage.logout();

    await page.goto('/inventory.html');

    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="error"]')).toContainText('You can only access');
  });
});
