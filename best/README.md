# BEST surface

Cloudflare Worker exposing the cottage as a public [BEST](https://behavioralstate.io/) service (spec 0.9.17).

| Route | Purpose |
|---|---|
| `/.well-known/best` | Discovery manifest |
| `/best/commands` | `RequestBooking`: emails a booking request to the owner |
| `/best/queries` | `property-description`, `property-features`, `availability`, `booking-quote` |
| `/best/workflows` | `book-a-stay` recipe |
| `/booked.ics` | Airbnb calendar proxy used by the website (15 minute edge cache) |

Property facts and prices come from `../src/property.json`, shared with the website.

## Behaviour

- Booking requests are emailed through FormSubmit (`FORMSUBMIT_URL`). Setting the `RESEND_API_KEY` secret plus `RESEND_FROM` and `RESEND_TO` switches delivery to Resend.
- Command ids are idempotency keys kept for 7 days in the `Ledger` Durable Object.
- Accepted booking requests are limited to 3 per 10 minutes and 10 per day per client (IPv4 address or IPv6 /64). Reads are limited to 60 per minute.

## Development

```sh
npm ci
npm run check
npm test
npm run dev
```

CI tests every push and deploys with `wrangler deploy` when the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets are set.
