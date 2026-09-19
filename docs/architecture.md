# Architecture

RoK Deal Hunter separates application logic from live comparison data.

## Application
Google Apps Script serves the web app. The source baseline consists of `Code.gs`, `Index.html`, `JavaScript.html` and `Styles.html`.

## Data center
Google Sheets is the authoritative live source for shops, markets, routing, packages, prices, currencies, payments, translations and player settings.

## GitHub
GitHub stores source code, documentation and change history. It is not the live price database.

## Release rule
`main` must remain a known-working state. New work is developed on feature branches and merged only after it has been tested.
