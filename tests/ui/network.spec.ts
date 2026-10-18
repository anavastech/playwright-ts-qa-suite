import { faker } from '@faker-js/faker';
import { expect, test } from '../../fixtures/ui.fixtures';
import { UI_BASE_URL } from '../../playwright.config';
import { SAUCE_USERS } from '../../utils/testData';

// Resiliencia ante fallos de red y reporte de errores, simulados con
// page.route(): se intercepta el tráfico del navegador para abortarlo o
// responderlo con un mock, sin depender de que el fallo ocurra de verdad.
// Trazable a docs/ui/network.feature
test.describe('Network', { tag: ['@ui', '@network'] }, () => {
  test('catalog stays usable when product images fail to load @TC-NET-01 @regression', async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    await page.route('**/*.{jpg,jpeg,png}', (route) => route.abort());

    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.standard.username, SAUCE_USERS.standard.password);

    await expect(inventoryPage.itemNames).toHaveCount(6);
    await expect(inventoryPage.itemPrices).toHaveCount(6);
    // Sin la imagen, el alt es lo único que identifica el producto para un
    // lector de pantalla o cuando el texto alternativo se muestra en su lugar.
    for (const image of await page.locator('.inventory_item img').all()) {
      await expect(image).toHaveAttribute('alt', /\S/);
    }

    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('purchase completes when third-party services are down @TC-NET-02 @regression', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    // Todo lo que no sea el propio sitio (Google Fonts, telemetría de
    // backtrace.io) falla: la compra no debería depender de terceros.
    const appHost = new URL(UI_BASE_URL).hostname;
    const blockedRequests: string[] = [];
    await page.route(
      (url) => url.hostname !== appHost,
      (route) => {
        blockedRequests.push(route.request().url());
        return route.abort();
      }
    );

    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.standard.username, SAUCE_USERS.standard.password);
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo(faker.person.firstName(), faker.person.lastName(), faker.location.zipCode());
    await checkoutPage.finish();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    // Confirma que el escenario realmente se ejercitó: si el sitio dejara de
    // llamar a terceros, este test pasaría sin probar nada.
    expect(blockedRequests.length).toBeGreaterThan(0);
  });

  test('error_user add-to-cart failure is reported to error monitoring @TC-NET-03 @regression @known-defect', async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    // route.fulfill responde con un mock: el test verifica qué se envía al
    // servicio de monitoreo sin mandar reportes reales a backtrace.io.
    await page.route('https://submit.backtrace.io/**', (route) =>
      route.fulfill({ status: 200, json: { response: 'ok' } })
    );
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.error.username, SAUCE_USERS.error.password);

    const errorReport = page.waitForRequest('https://submit.backtrace.io/**');
    await inventoryPage.addProductToCart('Sauce Labs Bolt T-Shirt');

    expect((await errorReport).postData()).toContain('Failed to add item to the cart');
    expect(pageErrors).toContain('Failed to add item to the cart.');
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });
});
