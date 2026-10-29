# Coverage Summary

**34 browser tests, 5 API tests, 4 helper unit tests.** Every area has at least one negative or edge case.

## How the original brief maps onto this site

| Brief requirement | Here | Tests |
|---|---|---|
| Sign up with verification, through onboarding | UI sign up with full account form, account created, logged in, backend login verified, account deleted | `auth/signup.spec.ts` |
| Sign in / sign out, invalid credentials | Sign in, reload and navigate keep session, sign out; wrong password, unknown email, empty email | `auth/login.spec.ts` |
| Search + 2 filters, counts make sense | Keyword search narrows catalogue; brand pages equal badge counts; brand counts sum to catalogue; category pages only show that category; UI search equals API search | `products/search.spec.ts`, `products/filters.spec.ts` |
| Company / people profile, panel and full view | Grid card to detail page: same name and price, all attributes present | `products/product-detail.spec.ts` |
| Lists: create, add, remove, delete | Cart: add two, verify lines and totals, remove one, remove last shows empty state; same product twice merges | `cart/cart.spec.ts` |
| Paid action, balance goes down | Checkout: address equals registered data, total equals sum of lines, payment, order placed | `checkout/order.spec.ts` |
| Export and validate the file | Download invoice, parse it, customer and amount must match | `checkout/order.spec.ts` |
| Negative case per area | Duplicate email, invalid email, wrong password, unknown email, no results, injection style input, unknown product id, checkout while logged out | across specs |
| API setup / teardown (extra) | Users created and deleted via API in fixtures | `src/fixtures/test.ts` |
| Extras | API contract tests, accessibility (axe), page health, cross browser and mobile smoke | `api/`, `extras/` |

## Skipped and why

| Item | Reason |
|---|---|
| Combining brand and category filters | The site does not support combining them; each is its own page |
| Real payment | Demo shop accepts any card; only the dummy flow is exercised |
| Contact us form with file upload | Lower risk than the purchase path; first on the roadmap |
| Visual regression | Ads and rotating carousel make screenshots noisy; planned for stable pages with masks |
| Load and security testing | Out of scope for a shared public site |
