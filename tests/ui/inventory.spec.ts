import { expect, test } from '../../fixtures/ui.fixtures';
import type { InventoryPage } from '../../pages/InventoryPage';
import { SAUCE_USERS } from '../../utils/testData';

type SortCase = {
  option: string;
  label: string;
  tag: string;
  getValues: (inventoryPage: InventoryPage) => Promise<(string | number)[]>;
  sort: (values: (string | number)[]) => (string | number)[];
};

const SORT_CASES: SortCase[] = [
  {
    option: 'lohi',
    label: 'price low to high',
    tag: '@smoke',
    getValues: (inventoryPage) => inventoryPage.getPricesAsNumbers(),
    sort: (values) => [...(values as number[])].sort((a, b) => a - b),
  },
  {
    option: 'hilo',
    label: 'price high to low',
    tag: '@regression',
    getValues: (inventoryPage) => inventoryPage.getPricesAsNumbers(),
    sort: (values) => [...(values as number[])].sort((a, b) => b - a),
  },
  {
    option: 'az',
    label: 'name A to Z',
    tag: '@regression',
    getValues: (inventoryPage) => inventoryPage.itemNames.allTextContents(),
    sort: (values) => [...(values as string[])].sort((a, b) => a.localeCompare(b)),
  },
  {
    option: 'za',
    label: 'name Z to A',
    tag: '@regression',
    getValues: (inventoryPage) => inventoryPage.itemNames.allTextContents(),
    sort: (values) => [...(values as string[])].sort((a, b) => b.localeCompare(a)),
  },
];

// Trazable a docs/ui/inventory.feature
test.describe('Inventory', { tag: ['@ui', '@inventory'] }, () => {
  for (const { option, label, tag, getValues, sort } of SORT_CASES) {
    test(`sorts products by ${label} @TC-INV-01 ${tag}`, async ({ authenticatedPage }) => {
      await authenticatedPage.sortBy(option);

      const values = await getValues(authenticatedPage);
      expect(values).toEqual(sort(values));
    });
  }

  test('cart badge reflects the number of added products @TC-INV-03 @smoke', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await authenticatedPage.addProductToCart('Sauce Labs Bike Light');

    await expect(authenticatedPage.cartBadge).toHaveText('2');
  });

  test('removing a product from inventory updates the cart badge @TC-INV-04 @regression', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await authenticatedPage.addProductToCart('Sauce Labs Bike Light');
    await expect(authenticatedPage.cartBadge).toHaveText('2');

    await authenticatedPage.removeProductFromCart('Sauce Labs Backpack');

    await expect(authenticatedPage.cartBadge).toHaveText('1');
  });

  test('reset app state clears the cart badge @TC-INV-02 @regression', async ({ authenticatedPage }) => {
    await authenticatedPage.addProductToCart('Sauce Labs Backpack');
    await expect(authenticatedPage.cartBadge).toHaveText('1');

    await authenticatedPage.resetAppState();

    await expect(authenticatedPage.cartBadge).toHaveCount(0);
  });

  // Bug conocido de la app: para problem_user el sort no reordena los productos.
  // Verificado manualmente contra el sitio antes de escribir el test.
  test('known defect: sorting does not work for problem_user @TC-INV-05 @regression @known-defect', async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.problem.username, SAUCE_USERS.problem.password);
    await page.waitForURL('**/inventory.html');
    await inventoryPage.itemNames.first().waitFor();

    const namesBefore = await inventoryPage.itemNames.allTextContents();
    await inventoryPage.sortBy('za');
    const namesAfterSort = await inventoryPage.itemNames.allTextContents();

    expect(namesAfterSort).toEqual(namesBefore);
  });
});
