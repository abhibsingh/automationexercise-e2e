# Test Strategy

## Risk based priorities

| Area | Why it matters | Priority | Depth |
|---|---|---|---|
| Checkout, totals, invoice | Money and trust | P0 | Smoke: totals, address, invoice parsed |
| Sign up / sign in | Gate to purchase | P0 | Smoke, plus negatives |
| Search and filters | How customers find products | P0 | Counts and API consistency |
| Cart | Direct path to revenue | P1 | Totals, merge, remove |
| Product detail | Read only | P2 | Attributes match the grid |

## Layers

E2E proves journeys are wired together. Permutations belong lower: the API tests check contracts (status codes, missing parameters, unsupported methods) in milliseconds. Helper unit tests protect the parsers that the E2E assertions rely on.

## Flakiness

**Prevent:** no sleeps; unique data per worker; API setup and teardown; ads blocked at the network layer; invariants instead of fixed numbers.

**Detect:** CI runs with 1 retry and reports a pass on retry as *flaky*. `scripts/flaky-report.ts` keeps a history and prints each test's flake rate over the last 30 runs in the job summary.

**Respond:** flake rate of 5% or more over 10 or more runs means tag `@quarantine`, open a ticket and assign an owner. Quarantined tests still run nightly in a non blocking job. Quarantine expires after two weeks: fix it or delete it.

## Release fit

| Stage | Runs | Blocking |
|---|---|---|
| Pull request | Typecheck + `@smoke` | Yes |
| Merge to main / staging | Full regression, sharded | Yes |
| Nightly | Full regression + quarantine + flaky trend | Alerts |
| Production | Read only smoke (browse, search, product detail) | Triggers rollback |

## Roadmap

1. Contact form with file upload, subscription, recommended items
2. Visual regression on stable pages with dynamic regions masked
3. Contract tests on all documented API endpoints, including schema validation
4. Cart persistence across login, and checkout with a changed address
5. Dashboard of pass rate, duration and flake rate per area
