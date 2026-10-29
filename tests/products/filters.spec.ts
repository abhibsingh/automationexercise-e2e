import { test, expect } from '../../src/fixtures/test';
import { catalog } from '../../src/data/catalog';
import { routes } from '../../src/config/routes';

test.describe('Category and brand filters', () => {
  test('every brand page shows exactly the count on its badge', { tag: ['@smoke', '@filters'] }, async ({ page, productsPage }) => {
    await productsPage.goto();
    const badges = await productsPage.filters.brandBadges();
    expect(badges.length).toBeGreaterThan(0);

    for (const badge of badges) {
      await test.step(`${badge.name}: ${badge.count}`, async () => {
        await page.goto(routes.brand(badge.name));
        await expect(productsPage.grid.title).toContainText(badge.name, { ignoreCase: true });
        await expect(productsPage.grid.cards).toHaveCount(badge.count);
      });
    }
  });

  test('brand counts add up to the full catalogue', { tag: ['@regression', '@filters'] }, async ({ productsPage, api }) => {
    await productsPage.goto();
    const total = await productsPage.grid.count();
    const badges = await productsPage.filters.brandBadges();
    const sum = badges.reduce((acc, b) => acc + b.count, 0);

    test.info().annotations.push({ type: 'counts', description: `catalogue=${total}, sum of brands=${sum}` });
    expect(sum).toBe(total);
    expect((await api.productsList()).body.products).toHaveLength(total);
  });

  for (const cat of catalog.categories) {
    test(`category ${cat.parent} > ${cat.name} shows only matching products`, { tag: ['@regression', '@filters'] }, async ({
      page,
      productsPage,
      productDetail,
    }) => {
      await productsPage.goto();
      await productsPage.filters.openCategory(cat.parent, cat.name);

      await expect(productsPage.grid.title).toContainText(`${cat.parent} - ${cat.name} Products`, { ignoreCase: true });
      const count = await productsPage.grid.count();
      expect(count).toBeGreaterThan(0);

      const first = await productsPage.grid.read(0);
      await page.goto(routes.productDetails(first.id));
      await expect(productDetail.field('Category')).toContainText(`${cat.parent} > `);
    });
  }
});
