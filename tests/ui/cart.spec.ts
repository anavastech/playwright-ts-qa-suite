import { expect, test } from '../../fixtures/ui.fixtures';

// Trazable a docs/ui/cart.feature
test.describe('Cart', { tag: ['@ui', '@cart'] }, () => {
  test('continue shopping returns to the inventory without losing the cart @TC-CART-01 @smoke', async ({
    page,
    authenticatedPage,
    cartPage,
  }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await authenticatedPage.goToCart();

    await cartPage.continueShopping();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(authenticatedPage.cartBadge).toHaveText('1');
  });

  test('can remove a product directly from the cart page @TC-CART-02 @regression', async ({
    authenticatedPage,
    cartPage,
  }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await authenticatedPage.addProductToCart('Sauce Labs Bike Light');
    await authenticatedPage.goToCart();
    await expect(cartPage.itemNames).toHaveCount(2);

    await cartPage.removeProductFromCart('Sauce Labs Backpack');

    await expect(cartPage.itemNames).toHaveCount(1);
    await expect(authenticatedPage.cartBadge).toHaveText('1');
  });

  // Comportamiento real verificado contra la app: "Reset App State" limpia el
  // badge del carrito de inmediato, pero la lista de items ya renderizada en
  // cart.html no se actualiza hasta que la página vuelve a renderizarse
  // (navegación o reload). Documentamos el comportamiento actual, no el ideal.
  test('known defect: reset app state clears the badge but not the rendered cart list @TC-CART-03 @regression @known-defect', async ({
    authenticatedPage,
    cartPage,
  }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await authenticatedPage.goToCart();
    await expect(cartPage.itemNames).toHaveCount(1);

    await authenticatedPage.resetAppState();

    await expect(authenticatedPage.cartBadge).toHaveCount(0);
    await expect(cartPage.itemNames).toHaveCount(1);
  });
});
