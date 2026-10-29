import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures/test';
import { routes } from '../../src/config/routes';

for (const path of [routes.home, routes.products, routes.cart, routes.login]) {
  test(`health: ${path} loads without JS errors or 5xx`, { tag: ['@smoke', '@health'] }, async ({ page }) => {
    const pageErrors: string[] = [];
    const serverErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    page.on('response', (r) => {
      if (r.status() >= 500 && new URL(r.url()).hostname.includes('automationexercise')) serverErrors.push(`${r.status()} ${r.url()}`);
    });

    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.shop-menu')).toBeVisible();
    expect(pageErrors, 'uncaught exceptions').toEqual([]);
    expect(serverErrors, '5xx responses').toEqual([]);
  });
}

const KNOWN_A11Y_ISSUES = ['button-name'];

for (const path of [routes.home, routes.login]) {
  test(`a11y: ${path} has no critical violations`, { tag: ['@regression', '@a11y'] }, async ({ page }, testInfo) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.shop-menu')).toBeVisible();
    const axePage = page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'];
    const results = await new AxeBuilder({ page: axePage }).withTags(['wcag2a', 'wcag2aa']).analyze();
    await testInfo.attach('axe-results.json', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });

    const summary = results.violations.map((v) => `${v.impact}: ${v.id} (${v.nodes.length})`);
    testInfo.annotations.push({ type: 'a11y-violations', description: summary.join('; ') || 'none' });
    const critical = results.violations.filter((v) => v.impact === 'critical');
    const known = critical.filter((v) => KNOWN_A11Y_ISSUES.includes(v.id)).map((v) => v.id);
    const fresh = critical.filter((v) => !KNOWN_A11Y_ISSUES.includes(v.id)).map((v) => `${v.id}: ${v.help}`);
    if (known.length) testInfo.annotations.push({ type: 'known-issue', description: `a11y baseline: ${known.join(', ')} (see docs/FINDINGS.md #7)` });
    expect(fresh, `new critical a11y violations:\n${fresh.join('\n')}`).toEqual([]);
  });
}
