# Cloudflare migration

Ready: static frontend, Worker entry point, health endpoints, RPC adapter, Wrangler config.

Pending: published Cloudflare data layer and migration of getBootstrapData, getShopOptionsForMarket, getPaymentOptionsForMarket and findBestDeal.

The existing app/ directory remains the Apps Script reference/fallback during migration.

Deploy from repository root with `npx wrangler deploy`. During migration use only `feature/deal-settings`. Never commit credentials or secrets.
