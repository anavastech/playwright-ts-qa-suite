import { faker } from '@faker-js/faker';
import { expect, test } from '../../fixtures/ui.fixtures';
import { SAUCE_USERS } from '../../utils/testData';

// Flujo E2E completo: agregar producto -> carrito -> checkout -> confirmación.
// Trazable a docs/ui/checkout.feature
test.describe('Checkout', { tag: ['@ui', '@checkout'] }, () => {
  test('completes a purchase end to end @TC-CHK-01 @smoke', async ({
    authenticatedPage,
    cartPage,
    checkoutPage,
  }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await expect(authenticatedPage.cartBadge).toHaveText('1');

    await authenticatedPage.goToCart();
    await cartPage.checkout();

    await checkoutPage.fillInfo(faker.person.firstName(), faker.person.lastName(), faker.location.zipCode());
    await expect(checkoutPage.summaryTotal).toBeVisible();

    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('cannot continue checkout without a postal code @TC-CHK-02 @negative', async ({
    authenticatedPage,
    cartPage,
    checkoutPage,
    page,
  }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await authenticatedPage.goToCart();
    await cartPage.checkout();

    await checkoutPage.firstNameInput.fill(faker.person.firstName());
    await checkoutPage.lastNameInput.fill(faker.person.lastName());
    await checkoutPage.continueButton.click();

    await expect(page.locator('[data-test="error"]')).toContainText('Postal Code is required');
  });

  test('order total matches subtotal plus tax @TC-CHK-03 @regression', async ({
    authenticatedPage,
    cartPage,
    checkoutPage,
  }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await authenticatedPage.addProductToCart('Sauce Labs Bike Light');

    await authenticatedPage.goToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo(faker.person.firstName(), faker.person.lastName(), faker.location.zipCode());

    const [subtotal, tax, total] = await Promise.all([
      checkoutPage.getSubtotal(),
      checkoutPage.getTax(),
      checkoutPage.getTotal(),
    ]);

    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  // Bug conocido de la app: error_user completa el checkout hasta el paso de
  // resumen, pero "Finish" no confirma la compra ni lo redirige a la
  // pantalla de confirmación. Verificado manualmente contra el sitio.
  test('known defect: error_user cannot finish checkout @TC-CHK-04 @regression @known-defect', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.error.username, SAUCE_USERS.error.password);
    await page.waitForURL('**/inventory.html');

    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo(faker.person.firstName(), faker.person.lastName(), faker.location.zipCode());

    await checkoutPage.finish();

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutPage.completeHeader).not.toBeVisible();
  });

  test('cancel on the information step returns to the cart @TC-CHK-05 @regression', async ({
    page,
    authenticatedPage,
    cartPage,
    checkoutPage,
  }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await authenticatedPage.goToCart();
    await cartPage.checkout();

    await checkoutPage.cancel();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.itemNames).toHaveCount(1);
  });

  test('cancel on the overview step returns to the inventory and keeps the cart @TC-CHK-06 @regression', async ({
    page,
    authenticatedPage,
    cartPage,
    checkoutPage,
  }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await authenticatedPage.goToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo(faker.person.firstName(), faker.person.lastName(), faker.location.zipCode());

    await checkoutPage.cancel();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(authenticatedPage.cartBadge).toHaveText('1');
  });
});
