import { test, expect } from '../../src/fixtures/test';
import { catalog } from '../../src/data/catalog';

test.describe('Product search', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.goto();
  });

  test('keyword search narrows the catalogue and finds a known product', { tag: ['@smoke', '@search', '@mobile'] }, async ({
    productsPage,
  }) => {
    const all = await productsPage.grid.count();
    await productsPage.search(catalog.searchTerm);
    const found = await productsPage.grid.count();

    expect(found).toBeGreaterThan(0);
    expect(found).toBeLessThan(all);
    expect(await productsPage.grid.names()).toContain(catalog.knownProduct.name);
  });

  test('UI search results match the search API', { tag: ['@regression', '@search', '@api'] }, async ({ productsPage, api }) => {
    await productsPage.search(catalog.searchTerm);
    const apiResult = await api.searchProduct(catalog.searchTerm);
    expect(apiResult.body.products.map((p) => p.name).sort()).toEqual((await productsPage.grid.names()).sort());
  });

  test('search results all relate to the keyword (name or category)', { tag: ['@regression', '@search'] }, async ({
    productsPage,
    api,
  }) => {
    await productsPage.search(catalog.searchTerm);
    const { body } = await api.searchProduct(catalog.searchTerm);
    const unrelated = body.products.filter(
      (p) => !new RegExp(catalog.searchTerm, 'i').test(`${p.name} ${p.category.category}`),
    );
    test.info().annotations.push({ type: 'unrelated-results', description: unrelated.map((p) => p.name).join(', ') || 'none' });
    expect.soft(unrelated, 'results that match neither name nor category').toEqual([]);
  });

  test('no match returns zero products without errors', { tag: ['@regression', '@search', '@negative'] }, async ({ productsPage }) => {
    await productsPage.search(catalog.noResultsTerm);
    await expect(productsPage.grid.cards).toHaveCount(0);
    await expect(productsPage.grid.title).toHaveText(/searched products/i);
  });

  for (const term of catalog.edgeTerms) {
    test(`special input is handled safely: ${JSON.stringify(term)}`, { tag: ['@regression', '@search', '@negative'] }, async ({
      page,
      productsPage,
    }) => {
      const dialogs: string[] = [];
      const serverErrors: string[] = [];
      page.on('dialog', async (d) => {
        dialogs.push(d.message());
        await d.dismiss();
      });
      page.on('response', (r) => {
        if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.url()}`);
      });

      await productsPage.search(term);

      expect(dialogs, 'no script should execute from search input').toEqual([]);
      expect(serverErrors, 'input should never cause a 5xx').toEqual([]);
    });
  }
});
