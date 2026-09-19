# Shop Routing

## Routing principles

1. Resolve market eligibility from shop/market routing data.
2. A verified country-specific route takes precedence over a global route.
3. A verified global route may serve a country when its eligibility rules allow it.
4. Indirect voucher/balance routes remain separate from direct top-up routes.
5. Local-version or server-specific routes must not be treated as international-server routes without verification.
6. Unsupported, pending and unverified routes must not silently win the optimizer.
7. Unknown payment costs must not be treated as zero.
8. Display currency does not prove checkout currency or market availability.

## Account access
Access levels are cumulative: a configured maximum allows all lower levels.
