import { test as base } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { SAUCE_USERS } from '../utils/testData';

type UiFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  productDetailPage: ProductDetailPage;
  authenticatedPage: InventoryPage;
};

export const test = base.extend<UiFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  // Fixture de autenticación: evita repetir el login en cada test que
  // necesita partir ya logueado (checkout, carrito, etc.).
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.standard.username, SAUCE_USERS.standard.password);
    await page.waitForURL('**/inventory.html');
    // waitForURL solo confirma el cambio de URL (history API); el listado
    // puede tardar un instante más en renderizar. allTextContents()/count()
    // no reintentan como sí lo hacen las acciones (click, selectOption), por
    // eso cualquier lectura "bulk" inmediatamente después del login podría
    // leer el DOM antes de tiempo si no esperamos este render.
    await inventoryPage.itemNames.first().waitFor();
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
