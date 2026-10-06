import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '../../fixtures/ui.fixtures';
import { SAUCE_USERS } from '../../utils/testData';

// Chequeo de accesibilidad (WCAG 2.0 A/AA) sobre las pantallas clave del
// flujo de compra. No reemplaza una auditoría manual, pero atrapa
// regresiones de accesibilidad introducidas sin darse cuenta (contraste,
// labels, roles ARIA, etc.). Trazable a docs/accessibility.feature
test.describe('Accessibility', () => {
  test('login page has no WCAG 2.0 A/AA violations @TC-A11Y-01 @regression', async ({ page, loginPage }) => {
    await loginPage.goto();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });

  test('inventory page has no WCAG 2.0 A/AA violations @TC-A11Y-02 @regression', async ({
    page,
    // biome-ignore lint/correctness/noUnusedFunctionParameters: solo se usa por su efecto de login
    authenticatedPage,
  }) => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });

  test('checkout information step has no WCAG 2.0 A/AA violations @TC-A11Y-03 @regression', async ({
    page,
    authenticatedPage,
    cartPage,
  }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await authenticatedPage.goToCart();
    await cartPage.checkout();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });

  // locked_out_user agrega un mensaje de error en pantalla: lo chequeamos
  // aparte porque los textos de error son un punto típico de regresiones
  // de accesibilidad (contraste, falta de rol "alert", etc.).
  test('login error message has no WCAG 2.0 A/AA violations @TC-A11Y-04 @regression', async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.lockedOut.username, SAUCE_USERS.lockedOut.password);

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(results.violations).toEqual([]);
  });
});
