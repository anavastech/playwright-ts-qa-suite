import { readFile } from 'node:fs/promises';
import { test as base } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { STORAGE_STATE } from '../playwright.config';

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
  // Fixture de autenticación: reutiliza la sesión que generó el proyecto
  // `ui-setup` en vez de loguearse por la UI en cada test. No se usa
  // `test.use({ storageState })` porque en un mismo spec conviven tests
  // logueados y no logueados (ej. login.spec.ts): la cookie se inyecta solo
  // en los tests que piden este fixture.
  authenticatedPage: async ({ page }, use) => {
    const { cookies } = JSON.parse(await readFile(STORAGE_STATE, 'utf-8'));
    await page.context().addCookies(cookies);

    const inventoryPage = new InventoryPage(page);
    await page.goto('/inventory.html');
    // goto espera el load del documento, pero el SPA renderiza el listado
    // un instante después. allTextContents()/count() no reintentan como sí
    // lo hacen las acciones (click, selectOption), por eso cualquier lectura
    // "bulk" inmediata podría leer el DOM antes de tiempo sin esta espera.
    await inventoryPage.itemNames.first().waitFor();
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
