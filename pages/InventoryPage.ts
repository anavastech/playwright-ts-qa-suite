import type { Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.inventoryItems = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }

  async resetAppState() {
    await this.menuButton.click();
    await this.resetAppStateLink.click();
  }

  // El link del nombre y el de la imagen comparten aria-label ("View details
  // for X"), por eso se scopea al item y se toma el de tipo "title-link".
  // La URL cambia (history API) antes de que el SPA termine de renderizar el
  // detalle, por eso esperamos "back-to-products" en vez de solo la URL.
  async goToProductDetail(productName: string) {
    const item = this.inventoryItems.filter({ hasText: productName });
    await item.locator('[data-test$="-title-link"]').click();
    await this.page.locator('[data-test="back-to-products"]').waitFor();
  }

  addToCartByName(productName: string): Locator {
    const item = this.inventoryItems.filter({ hasText: productName });
    return item.getByRole('button', { name: /add to cart/i });
  }

  removeFromCartByName(productName: string): Locator {
    const item = this.inventoryItems.filter({ hasText: productName });
    return item.getByRole('button', { name: /remove/i });
  }

  async addProductToCart(productName: string) {
    await this.addToCartByName(productName).click();
  }

  async removeProductFromCart(productName: string) {
    await this.removeFromCartByName(productName).click();
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async sortBy(option: string) {
    await this.sortDropdown.selectOption(option);
  }

  async getPricesAsNumbers(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }
}
