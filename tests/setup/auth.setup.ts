import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { STORAGE_STATE } from '../../playwright.config';
import { SAUCE_USERS } from '../../utils/testData';

// Se loguea una sola vez por corrida y guarda la sesión (cookie
// "session-username") en disco. El fixture `authenticatedPage` la reutiliza,
// así los tests que parten logueados no repiten el login por la UI. Los
// tests de login sí lo ejercitan por la UI, que es lo que validan.
setup('authenticate as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(SAUCE_USERS.standard.username, SAUCE_USERS.standard.password);
  await page.waitForURL('**/inventory.html');

  await page.context().storageState({ path: STORAGE_STATE });
});
