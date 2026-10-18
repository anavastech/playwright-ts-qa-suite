import { expect, test } from '../../fixtures/ui.fixtures';

// Trazable a docs/ui/product-detail.feature
test.describe('Product detail', { tag: ['@ui', '@product-detail'] }, () => {
  test('shows the same name and price as the inventory listing @TC-PROD-01 @smoke', async ({
    authenticatedPage,
    productDetailPage,
  }) => {
    const item = authenticatedPage.inventoryItems.filter({ hasText: 'Sauce Labs Bike Light' });
    const listedPrice = await item.locator('.inventory_item_price').textContent();

    await authenticatedPage.goToProductDetail('Sauce Labs Bike Light');

    await expect(productDetailPage.name).toHaveText('Sauce Labs Bike Light');
    await expect(productDetailPage.price).toHaveText(listedPrice ?? '');
  });

  test('can add and remove a product from its detail page @TC-PROD-02 @regression', async ({
    authenticatedPage,
    productDetailPage,
  }) => {
    await authenticatedPage.goToProductDetail('Sauce Labs Backpack');

    await productDetailPage.addToCart();
    await expect(productDetailPage.removeButton).toBeVisible();
    await expect(authenticatedPage.cartBadge).toHaveText('1');

    await productDetailPage.removeFromCart();
    await expect(productDetailPage.addToCartButton).toBeVisible();
    await expect(authenticatedPage.cartBadge).toHaveCount(0);
  });

  test('back to products returns to the inventory page without losing the cart @TC-PROD-03 @regression', async ({
    page,
    authenticatedPage,
    productDetailPage,
  }) => {
    await authenticatedPage.goToProductDetail('Sauce Labs Backpack');
    await productDetailPage.addToCart();

    await productDetailPage.backToProducts();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(authenticatedPage.cartBadge).toHaveText('1');
  });
});
