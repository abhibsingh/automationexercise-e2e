import { test, expect } from '../../src/fixtures/test';
import { catalog } from '../../src/data/catalog';
import type { ProductCard } from '../../src/components/ProductGrid';

test.describe('Cart', () => {
  test('add, check totals, remove', { tag: ['@smoke', '@cart'] }, async ({ productsPage, cartPage }) => {
    const added: ProductCard[] = [];

    await test.step('add the first two products from the grid', async () => {
      await productsPage.goto();
      added.push(await productsPage.grid.read(0), await productsPage.grid.read(1));
      await productsPage.addToCart(0);
      await productsPage.addToCart(1);
    });

    await test.step('cart shows exactly those products with correct totals', async () => {
      await cartPage.goto();
      const lines = await cartPage.lines();
      expect(lines.map((l) => l.id).sort()).toEqual(added.map((a) => a.id).sort());
      for (const line of lines) {
        const card = added.find((a) => a.id === line.id)!;
        expect(line.name).toBe(card.name);
        expect(line.price).toBe(card.price);
        expect(line.quantity).toBe(1);
        expect(line.total).toBe(line.price * line.quantity);
      }
    });

    await test.step('remove one product, the other stays', async () => {
      await cartPage.remove(added[0].id);
      await expect(cartPage.rows).toHaveCount(1);
      await expect(cartPage.row(added[1].id)).toBeVisible();
    });

    await test.step('remove the last product shows the empty state', async () => {
      await cartPage.remove(added[1].id);
      await expect(cartPage.emptyMessage).toBeVisible();
      await expect(cartPage.emptyMessage).toContainText(/cart is empty/i);
    });
  });

  test('quantity from the detail page is respected in the total', { tag: ['@regression', '@cart'] }, async ({
    productDetail,
    cartPage,
  }) => {
    const p = catalog.knownProduct;
    await productDetail.open(p.id);
    await productDetail.addToCart(3);

    await cartPage.goto();
    const [line] = await cartPage.lines();
    expect(line).toMatchObject({ id: p.id, quantity: 3, price: p.price, total: p.price * 3 });
  });

  test('adding the same product twice increases quantity, not rows', { tag: ['@regression', '@cart'] }, async ({
    productsPage,
    cartPage,
  }) => {
    await productsPage.goto();
    const card = await productsPage.grid.read(0);
    await productsPage.addToCart(0);
    await productsPage.addToCart(0);

    await cartPage.goto();
    await expect(cartPage.rows).toHaveCount(1);
    const [line] = await cartPage.lines();
    expect(line).toMatchObject({ id: card.id, quantity: 2, total: card.price * 2 });
  });

  test('checkout while logged out asks the user to log in', { tag: ['@regression', '@cart', '@negative'] }, async ({
    page,
    productsPage,
    cartPage,
  }) => {
    await productsPage.goto();
    await productsPage.addToCart(0);
    await cartPage.goto();
    await cartPage.proceedToCheckout();

    await expect(cartPage.checkoutLoginModal).toBeVisible();
    await expect(cartPage.checkoutLoginModal).toContainText(/register \/ login/i);
    await expect(page).toHaveURL(/view_cart/);
  });
});
