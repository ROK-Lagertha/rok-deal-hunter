# RoK Deal Hunter

RoK Deal Hunter is a Google Apps Script web app for comparing eligible Rise of Kingdoms top-up routes across markets, shops, currencies, payment methods and account-access requirements.

## Architecture

- **Google Apps Script** — application and backend
- **Google Sheets** — authoritative live data center
- **GitHub** — source control, documentation and change history

## Source files

The known-working Apps Script baseline is stored in `app/`:

- `Code.gs`
- `Index.html`
- `JavaScript.html`
- `Styles.html`

## Branching rule

- `main` = known-working baseline only
- New work = dedicated `feature/*` branch
- Merge into `main` only after the Apps Script version has been tested

## Security

Never commit passwords, game credentials, payment credentials, API keys, tokens, `.env` files or other secrets.

## Data

The Google Sheet remains the live data source. Shop prices, routes, markets, currencies and payment data are not duplicated into this repository unless deliberately exported for documentation or backup.
