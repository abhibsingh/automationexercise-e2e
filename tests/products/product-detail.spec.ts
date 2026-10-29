import { test, expect } from '../../src/fixtures/test';
import { catalog } from '../../src/data/catalog';
import { routes } from '../../src/config/routes';

test.describe('Product detail', () => {
  test('detail page matches the card the user clicked', { tag: ['@smoke', '@product'] }, async ({ page, productsPage, productDetail }) => {
    await productsPage.goto();
    const card = await productsPage.grid.read(0);

    await productsPage.grid.viewProductLink(0).click();
    await productDetail.waitUntilReady();

    await expect(page).toHaveURL(routes.productDetails(card.id));
    await expect(productDetail.name).toHaveText(card.name);
    expect(await productDetail.readPrice()).toBe(card.price);
    for (const field of ['Category', 'Availability', 'Condition', 'Brand'] as const) {
      await expect(productDetail.field(field)).toBeVisible();
    }
  });

  test('known product shows the expected attributes', { tag: ['@regression', '@product'] }, async ({ productDetail }) => {
    const p = catalog.knownProduct;
    await productDetail.open(p.id);
    await expect(productDetail.name).toHaveText(p.name);
    expect(await productDetail.readPrice()).toBe(p.price);
    await expect(productDetail.field('Category')).toContainText(p.category);
    await expect(productDetail.field('Brand')).toContainText(p.brand);
  });

  test('review can be submitted', { tag: ['@regression', '@product'] }, async ({ productDetail }) => {
    await productDetail.open(catalog.knownProduct.id);
    await productDetail.reviewName.fill('QA Automation');
    await productDetail.reviewEmail.fill('qa-as-review@example.com');
    await productDetail.reviewText.fill('Automated review from the E2E suite.');
    await productDetail.reviewSubmit.click();
    await expect(productDetail.reviewSuccess).toBeVisible();
  });

  test('unknown product id does not render a product', { tag: ['@regression', '@product', '@negative'] }, async ({
    page,
    productDetail,
  }) => {
    const response = await page.goto(routes.productDetails(catalog.invalidProductId), { waitUntil: 'domcontentloaded' });
    test.info().annotations.push({ type: 'http-status', description: String(response?.status()) });
    await expect(productDetail.name).toHaveText('');
    await expect(productDetail.field('Brand')).toHaveText(/^\s*Brand:\s*$/);
    const addToCartShown = await productDetail.addToCartButton.isVisible();
    test.info().annotations.push({ type: 'known-issue', description: `empty product template rendered; add to cart visible: ${addToCartShown} (see docs/FINDINGS.md #2)` });
  });
});
