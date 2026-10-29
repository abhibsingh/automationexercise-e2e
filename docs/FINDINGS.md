# Findings

Issues and risks observed while building the suite against the live site. Each one is either asserted, annotated in the report, or handled in the framework.

| # | Finding | Severity | How the suite handles it |
|---|---|---|---|
| 1 | The API returns **HTTP 200 for errors** and puts the real status in `responseCode` in the body (405, 400, 404 all come back as HTTP 200). Monitoring and clients that trust HTTP status will miss failures. | Medium | API client returns both; tests assert the body code and annotate the HTTP status |
| 2 | **Unknown product id** (`/product_details/99999`) renders an empty product page instead of a 404. | Low | `product-detail.spec.ts` asserts no product is rendered and records the HTTP status |
| 3 | **Search has no empty state.** A search with no matches shows the heading and nothing else. | Low (UX) | `search.spec.ts` asserts zero cards and no error |
| 4 | **Search matches categories as well as names**, so "top" returns "Little Girls Mr. Panda Shirt" (category Tops & Shirts). Correct by design, but surprising to users. | Info | Test checks every result relates to the keyword by name or category |
| 5 | **Ads and full page interstitials** (`#google_vignette`) can cover buttons at random. | High for test stability | Blocked in the `page` fixture; count of blocked requests is annotated. `BLOCK_ADS=0` reproduces the problem |
| 6 | **Data is shared** across every visitor of a public demo site. Accounts or orders created by others can collide. | Medium for test stability | Unique prefixed emails per worker; every user deleted in teardown |
