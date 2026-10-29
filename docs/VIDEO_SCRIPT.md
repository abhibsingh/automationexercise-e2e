# Walkthrough Video (10 minutes max)

Record with Loom or QuickTime at 1080p. Terminal font 16pt or larger.

| Time | Segment | Show | Say |
|---|---|---|---|
| 0:00 to 0:45 | Intro | README | Goal: a reliable, debuggable release gate. Same architecture as the assignment, applied to a public shop so it runs with no credentials |
| 0:45 to 3:00 | Suite running | `npm run test:headed -- --grep @smoke` then `npx playwright test`, then `npm run report` | Projects (unit, api, chromium), tags, parallel workers. In the report: steps, annotations (test user, ads blocked, counts), attached invoice |
| 3:00 to 6:00 | Failing test and debugging | In `tests/cart/cart.spec.ts` change `expect(line.quantity).toBe(1)` to `toBe(2)` and run that file | Report shows the failing step and message; open the trace; step through actions; DOM snapshot; Network tab shows the cart call; revert and rerun green |
| 6:00 to 6:45 | Why ads are blocked | `BLOCK_ADS=0 npm run test:headed -- tests/cart` | Show an interstitial covering the page; explain the fixture and the annotation |
| 6:45 to 9:15 | Code walkthrough | `playwright.config.ts`, `src/fixtures/test.ts`, one page object + `ProductGrid`, `checkout/order.spec.ts`, CI workflows | API setup and teardown, components reused, no sleeps, invariants, invoice parsing, sharding, merged report, flaky trend, quarantine |
| 9:15 to 10:00 | Wrap up | `docs/COVERAGE.md`, `docs/FINDINGS.md` | Mapping to the brief, findings, top roadmap items |
