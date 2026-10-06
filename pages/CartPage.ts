import type { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly cartItems: Locator;
  readonly itemNames: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.cartItems = page.locator('.cart_item');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
  }

  async checkout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  removeFromCartByName(productName: string): Locator {
    const item = this.cartItems.filter({ hasText: productName });
    return item.getByRole('button', { name: /remove/i });
  }

  async removeProductFromCart(productName: string) {
    await this.removeFromCartByName(productName).click();
  }
}
