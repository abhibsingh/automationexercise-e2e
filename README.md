# Automation Exercise E2E Suite

End to end suite for [automationexercise.com](https://automationexercise.com), built with **Playwright + TypeScript**.

It is a working demo of the framework I designed for a B2B data platform assignment (search, profiles, lists, paid actions, exports). The same architecture is applied here to a public practice shop, so it can be run by anyone with no credentials.

| Doc | What's in it |
|---|---|
| [docs/COVERAGE.md](docs/COVERAGE.md) | What is covered, how each journey maps to the original brief, what was skipped |
| [docs/FINDINGS.md](docs/FINDINGS.md) | Bugs and risks the suite surfaced on the live site |
| [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md) | Risk model, flakiness strategy, CI and release fit, roadmap |
| [docs/VIDEO_SCRIPT.md](docs/VIDEO_SCRIPT.md) | Outline of the 10 minute walkthrough |

## Quick start

```bash
npm ci
npx playwright install --with-deps chromium
npm test                 # everything
npm run test:smoke       # fast release gate
npm run report           # open the HTML report
```

No `.env` is required. Every test user is created through the public API and deleted afterwards. `.env.example` lists the optional knobs.

| Command | Runs |
|---|---|
| `npm run test:smoke` | `@smoke` tests |
| `npm run test:regression` | everything except `@quarantine` |
| `npm run test:api` | API tests only, no browser |
| `npx playwright test --grep @cart` | one area by tag |
| `npm run test:headed` | watch it in a real browser |
| `npm run test:ui` | Playwright UI mode |
| `CROSS_BROWSER=1 npm run test:smoke` | adds Firefox, WebKit and a mobile viewport |
| `BLOCK_ADS=0 npm run test:headed` | run with ads enabled, to show why they are blocked |

## Structure

```
src/
  config/      env + routes + ad host pattern
  api/         typed client for the public API (setup, teardown, contract checks)
  pages/       page objects: Login, Signup, Products, ProductDetail, Cart, Checkout
  components/  reused UI pieces: Header, ProductGrid, FilterSidebar, CartModal
  fixtures/    page objects, API client, ad blocking, users created and deleted via API
  data/        unique user factory, catalogue facts, demo payment data
  utils/       price and invoice parsers
tests/
  unit/        helper tests, no browser
  api/         API contract tests, no browser
  auth/  products/  cart/  checkout/  extras/
scripts/       flaky test trend report
.github/       PR smoke + nightly sharded regression
```

## Key decisions

1. **Playwright + TypeScript.** Deterministic, fast, with traces, fixtures, projects and sharding built in. A release gate must give the same answer twice.
2. **API for setup and teardown, UI for the journey under test.** The sign up journey is tested through the UI once. Every other test gets a fresh user from `POST /api/createAccount` and loses it in teardown via `DELETE /api/deleteAccount`, even when the test fails. Faster, isolated, parallel safe.
3. **Ads are blocked at the network layer.** The site serves Google ads and full page interstitials that randomly cover buttons. The `page` fixture aborts requests to ad hosts and records how many it blocked. This removes the biggest source of flakiness without hiding real app behaviour.
4. **Assert invariants, not snapshots of data.** Brand page counts must equal their badge, brand counts must add up to the catalogue, UI search must equal API search, cart line total must equal price times quantity, invoice amount must equal the order total.
5. **Money paths get the deepest checks.** Checkout verifies the address against what was registered, the order total against the lines, and parses the downloaded invoice.
6. **No sleeps.** Waits are web first assertions, `waitForURL`, `waitForResponse` and `waitForEvent('download')`.
7. **Locators.** The site exposes `data-qa` hooks, so `testIdAttribute` is set to `data-qa`. Elsewhere roles and visible text are preferred over CSS.

## Reporting and debugging

On failure: trace, video and screenshot. Specs use `test.step`, and annotations carry context (test user, counts, ads blocked, a11y summary). The invoice file is attached to the report.

To debug: open the report, click the failing test, read the step and message, open the trace, check DOM snapshots, the Network tab and the Console.

## CI

| Workflow | Trigger | What |
|---|---|---|
| `pr-smoke.yml` | PRs and pushes to `main` | typecheck, test discovery, `@smoke` |
| `nightly-regression.yml` | nightly or manual | 3 shards, merged HTML report, GitHub Pages, flaky trend summary, quarantine job, optional Slack |
