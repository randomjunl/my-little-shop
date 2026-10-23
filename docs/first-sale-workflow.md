# First-sale workflow and verification

Only administrators have Payload accounts and manage listings or purchase requests.
Visitors browse published products and submit contact details without an account.
A request is not a confirmed reservation. Payment and handoff are arranged outside the app.

## Create and publish a listing

1. Sign in at `/admin` and open Products → Create New.
2. Enter a unique slug, description, price, category, listing type, and delivery options.
3. Set availability to Available and inventory greater than zero.
4. Add photos with descriptive alternative text. The first photo is the shop cover.
5. Save Draft. Confirm `/products/SLUG` returns 404 to visitors and the shop omits it.
6. Publish changes. Confirm the shop links to the product and the gallery works.

## Submit and review a request

1. Open the public product page on desktop or mobile.
2. Enter name, email, an offered delivery preference, and an optional message.
3. Submit once and check the confirmation explains that the item is not reserved.
4. In Payload → Purchase requests, find the New request and review its private contact details.

Submitting does not reduce inventory. The server checks the current published listing,
availability, inventory, and delivery options. Basic spam protection uses a honeypot
and a ten-minute check for repeated requests from the same email for the same product.

## Manage a request

Save form edits before using request actions. Status is controlled through the actions,
not by editing the status field directly.

| Action | Required request status | Result |
| --- | --- | --- |
| Accept request | New | Request becomes Accepted; product becomes Reserved and links to that request. Inventory is unchanged. |
| Decline request | New | Request becomes Declined; product is unchanged. |
| Cancel request | New | Request becomes Cancelled; product is unchanged. |
| Cancel request | Accepted | Request becomes Cancelled; its matching reservation clears and product becomes Available. Inventory is unchanged. |
| Complete sale | Accepted | Request becomes Completed; its matching product becomes Sold, inventory becomes 0, and reservation clears. |

Accept, cancel, complete, and decline require administrator authentication. Related writes
run in a MongoDB transaction. An accepted request can release or complete only its own
reservation. Competing requests must not both reserve the same listing. On a conflict
or uncertain network result, reload and inspect the saved state before retrying.

After accepting, arrange payment and handoff privately using the contact details.
Use Complete sale only after those steps are actually complete, except for explicitly
disposable verification records.

## Verification record — 2026-10-15

Local development verification for issue #8 used the disposable `first-sale-test` listing
with price $1, inventory 1, pickup only, and two existing notebook photos.

- Created a draft through the signed-in Payload UI. Anonymous detail returned HTTP 404;
  the public API and shop omitted the listing.
- Published through Payload. Anonymous detail returned HTTP 200 and the shop linked to it.
  Both photos loaded; selecting a thumbnail changed the main image.
- Submitted `First-sale desktop test` and `First-sale mobile test` through the browser.
  Both appeared in Payload as New, linked to the test product. The mobile test used a
  390 × 844 viewport with no horizontal overflow and omitted the optional message.
- Both submissions showed the non-reservation confirmation. Product stayed Available,
  inventory 1.
- Accepted the desktop request through Payload. Request became Accepted, public product
  became Reserved, inventory stayed 1, and the request form disappeared.
- Completed the simulated sale through Payload. Request became Completed, public product
  became Sold, inventory became 0, and the request form remained absent.
- Anonymous product create/update/delete, request list/detail/create/update, user list,
  version history, and all four request actions returned HTTP 403.
- Public product JSON omitted the private reservation relationship. A new request for
  the sold test listing returned HTTP 409.
- Earlier live lifecycle verification during issue #7 tested concurrent acceptance:
  exactly one request accepted and held the reservation. It also checked cancellation,
  decline, completion, and rejection of repeated actions using temporary records that
  were removed afterward.

The test listing and two browser-created requests remain for inspection. The desktop
request is Completed; the mobile request remains New and does not hold a reservation.
No actual payment, email exchange, or physical handoff occurred. Mobile verification
used a browser viewport, not physical hardware. These checks apply to the local app;
they do not establish production deployment readiness.

## Current scope

- A request covers one whole listing; there is no cart or requested quantity. Completion
  marks the entire listing sold, including listings whose inventory was greater than one.
- No automated payment processing or seller notification delivery is part of this flow.
- The duplicate check is not an atomic rate limiter; simultaneous visitor submissions
  can race. Stronger spam controls remain a deployment follow-up.
- MongoDB transaction support is required for request management actions.
