# ROK Deal Hunter

**Find · Compare · Save**

ROK Deal Hunter is a community-built comparison and deal-intelligence web app for **Rise of Kingdoms**. It is designed to compare eligible bundles and purchase routes across countries, shops, currencies, payment methods and account-access requirements while preserving a transparent real-value calculation.

> Unofficial community tool. Not affiliated with Lilith Games.

## Current status — Deal Hunter 2.0

The project is actively migrating from the original Google Apps Script application to **Cloudflare**.

- **Cloudflare frontend:** deployed and live
- **Deal Hunter 2.0 UI:** in active development
- **Published data/API layer:** not complete yet
- **Google Apps Script app:** retained as the known-working fallback/reference

Live development deployment: `https://rok-deal-hunter.jici1203.workers.dev/`

The current Cloudflare UI includes the new global header/footer, cinematic Kingdom hero, standalone glowing ROK Deal Hunter crest, responsive mobile hero treatment and the desktop Hero → Deal Finder visual blend.

## Architecture

### Current Cloudflare application

- `public/` — static frontend assets and artwork
- `src/` — Cloudflare Worker/application source
- `wrangler.jsonc` — Cloudflare deployment configuration
- `package.json` — project scripts and development dependencies

### Legacy / reference application

The known-working Google Apps Script baseline remains in `app/`:

- `Code.gs`
- `Index.html`
- `JavaScript.html`
- `Styles.html`

Google Sheets remains the authoritative data center while the Cloudflare published data layer is being completed.

## Deal Hunter 2.0 design baseline

The current visual direction uses a dark navy interface with pink, purple and cool-blue neon accents.

Implemented UI milestones:

- Deal Hunter 2.0 global header and footer
- Responsive desktop/mobile navigation presentation
- Cinematic Kingdom hero artwork
- Standalone transparent `Logo_DEALHUNTER.png` crest
- Layered magenta/purple hero-logo glow
- Full-panorama mobile hero without aggressive side cropping
- Compact mobile hero composition to reduce first-screen scrolling
- Seamless desktop navy/purple hero dissolve
- Deal Finder overlapping the desktop hero transition

The Hero is treated as one continuous composition with the application rather than as a separate banner card.

## Functional recovery

The Cloudflare frontend is online, but the backend migration is still in progress. The current `getBootstrapData` compatibility path is waiting for the published data/API layer. Until that layer is complete, some data-driven features can show a backend-unavailable state.

Priority recovery flow:

**Country → eligible shops → bundles/deals → calculation → result**

No mock deal values should be introduced simply to make the production UI appear functional.

## Data principles

The application must preserve the existing Deal Hunter calculation and normalization logic rather than creating a second simplified data model.

- Country, language and display currency are separate contexts.
- Internationally available shops must remain available in eligible countries.
- Market-specific restrictions still take precedence.
- Identical bundle contents across shops should map to canonical/matched packages rather than be duplicated.
- Coupons, payment adjustments, fixed fees and eligibility rules belong in the effective checkout-price calculation.
- Account-access requirements and credential safety must remain visible and enforceable.
- Data freshness/evidence status must be distinguishable from verified current pricing.

## Development workflow

`main` is the Cloudflare deployment baseline used by the current development site. Changes should be tested before being treated as a stable production baseline.

For each UI build:

1. Update the current project files.
2. Commit with a focused summary.
3. Push to GitHub.
4. Let Cloudflare deploy the updated `main` baseline.
5. Verify desktop and mobile behavior on the live development deployment.

The Project Hub / OP list remains the authoritative implementation backlog and tracks completed UI milestones separately from functional backend recovery.

## Security

Never commit passwords, game credentials, payment credentials, API keys, tokens, `.env` files or other secrets.

Cloudflare secrets must be stored using the platform's secret/configuration facilities rather than exposed in the repository or frontend bundle. Public endpoints should expose only the data required by the public Deal Hunter experience.

## Documentation

Additional architecture and migration notes live in `docs/`. The changelog records shipped development milestones.

## Near-term priorities

- Complete the Cloudflare published data/API layer
- Restore the full data-driven Deal Hunter flow
- Replace the blocking backend-migration alert with a non-blocking service status
- Finish Deal Finder 2.0 filters and real data binding
- Correct international shop availability/routing across markets
- Normalize and match equivalent bundles across shops
- Build Deal Cards 2.0 from real price/value data
- Complete responsive/accessibility regression testing

---

**ROK Deal Hunter 2.0** — Find better routes. Compare real value. Keep more value for your kingdom.
