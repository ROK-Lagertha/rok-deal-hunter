const CONFIG = {
  SPREADSHEET_ID: '1cvqYpz-CGfDuzJXUKYyutqszhmqdjeemDlVrnG3wjmI',
  APP_NAME: 'RoK Deal Hunter',

  SHEETS: {
    PACKAGES: 'Packages',
    SHOPS: 'Shops',
    PRICES: 'Prices',
    PAYMENTS: 'Payments',
    COUPONS: 'Coupons',
    COMPONENTS: 'Package Components',
    SHOP_MARKETS: 'Shop Markets',
    TRANSLATIONS: 'Translations',
    MARKETS: 'Markets',
    CURRENCIES: 'Currencies',
    PAYMENT_MARKETS: 'Payment Markets'
  }
};


/* =========================================================
   WEB APP
   ========================================================= */

function doGet() {
  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setTitle(CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}


function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}


/* =========================================================
   SPREADSHEET HELPERS
   ========================================================= */

function getSpreadsheet_() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}


function getSheetObjects_(sheetName) {

  const sheet = getSpreadsheet_().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0].map(function(header) {
    return String(header).trim();
  });

  return values.slice(1)
    .filter(function(row) {
      return row.some(function(cell) {
        return cell !== '' && cell !== null;
      });
    })
    .map(function(row) {

      const obj = {};

      headers.forEach(function(header, index) {
        obj[header] = row[index];
      });

      return obj;
    });
}


function marketCodeMatches_(storedMarket, requestedMarket) {

  const requested = normalize_(requestedMarket);

  return String(storedMarket || '')
    .split('|')
    .map(function(value) {
      return normalize_(value);
    })
    .filter(Boolean)
    .indexOf(requested) !== -1;
}


function normalize_(value) {
  return String(value == null ? '' : value).trim();
}


function upper_(value) {
  return normalize_(value).toUpperCase();
}


function number_(value) {

  if (typeof value === 'number') {
    return value;
  }

  if (value === '' || value == null) {
    return null;
  }

  const cleaned = String(value)
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(/%/g, '')
    .replace(',', '.');

  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : null;
}


function boolean_(value) {

  if (value === true) return true;
  if (value === false) return false;

  const text = upper_(value);

  return (
    text === 'TRUE' ||
    text === 'YES' ||
    text === 'JA' ||
    text === '1'
  );
}


function firstValue_(object, names) {

  for (let i = 0; i < names.length; i++) {

    const key = names[i];

    if (
      Object.prototype.hasOwnProperty.call(object, key) &&
      object[key] !== '' &&
      object[key] != null
    ) {
      return object[key];
    }
  }

  return '';
}


/* =========================================================
   TRANSLATIONS / I18N
   ========================================================= */

function getTranslations_() {

  const sheet = getSpreadsheet_().getSheetByName(CONFIG.SHEETS.TRANSLATIONS);

  if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 2) {
    return {
      languages: [],
      translations: {}
    };
  }

  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0].map(normalize_);

  const languageColumns = [];

  for (let column = 1; column < headers.length; column++) {

    const language = headers[column];

    if (language && upper_(language) !== 'NOTES') {
      languageColumns.push({
        name: language,
        column: column
      });
    }
  }

  const translations = {};

  languageColumns.forEach(function(language) {
    translations[language.name] = {};
  });

  values.slice(1).forEach(function(row) {

    const key = normalize_(row[0]);

    if (!key) return;

    languageColumns.forEach(function(language) {

      const value = normalize_(row[language.column]);

      if (value) {
        translations[language.name][key] = value;
      }
    });
  });

  return {
    languages: languageColumns.map(function(language) {
      return language.name;
    }),
    translations: translations
  };
}


function getLanguageMeta_() {

  return {
    'Deutsch': { code: 'de', dir: 'ltr' },
    'English': { code: 'en', dir: 'ltr' },
    'Français': { code: 'fr', dir: 'ltr' },
    'Español': { code: 'es', dir: 'ltr' },
    'العربية': { code: 'ar', dir: 'rtl' },
    'Türkçe': { code: 'tr', dir: 'ltr' },
    'Русский': { code: 'ru', dir: 'ltr' },
    'Українська': { code: 'uk', dir: 'ltr' },
    'Oʻzbekcha': { code: 'uz', dir: 'ltr' },
    'ไทย': { code: 'th', dir: 'ltr' },
    'Tiếng Việt': { code: 'vi', dir: 'ltr' },
    'Bahasa Indonesia': { code: 'id', dir: 'ltr' },
    'Bahasa Melayu': { code: 'ms', dir: 'ltr' },
    'සිංහල': { code: 'si', dir: 'ltr' },
    'தமிழ்': { code: 'ta', dir: 'ltr' },
    'Português (Brasil)': { code: 'pt-BR', dir: 'ltr' },
    'Nederlands': { code: 'nl', dir: 'ltr' },
    'Қазақша': { code: 'kk', dir: 'ltr' },
  'Suomi': { code: 'fi', dir: 'ltr' }
  };
}


/* =========================================================
   BACKEND TEST
   ========================================================= */

function testBackendConnection() {

  const spreadsheet = getSpreadsheet_();

  const requiredSheets = [
    CONFIG.SHEETS.PACKAGES,
    CONFIG.SHEETS.SHOPS,
    CONFIG.SHEETS.PRICES,
    CONFIG.SHEETS.PAYMENTS,
    CONFIG.SHEETS.COMPONENTS,
    CONFIG.SHEETS.SHOP_MARKETS,
    CONFIG.SHEETS.TRANSLATIONS
  ];

  const found = [];
  const missing = [];

  requiredSheets.forEach(function(sheetName) {

    if (spreadsheet.getSheetByName(sheetName)) {
      found.push(sheetName);
    } else {
      missing.push(sheetName);
    }
  });

  const result = {
    success: missing.length === 0,
    spreadsheet: spreadsheet.getName(),
    foundSheets: found,
    missingSheets: missing,
    timestamp: new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/* =========================================================
   BOOTSTRAP DATA
   Data required when the website loads
   ========================================================= */

function getBootstrapData() {

  const packages = getSheetObjects_(CONFIG.SHEETS.PACKAGES);
  const translationData = getTranslations_();
  const marketRows = getSheetObjects_(CONFIG.SHEETS.MARKETS);
  const currencyRows = getSheetObjects_(CONFIG.SHEETS.CURRENCIES);

  const packageList = packages
    .filter(function(row) {

      const active = boolean_(
        firstValue_(row, ['Active', 'Enabled'])
      );

      const frontendVisible = boolean_(
        firstValue_(row, ['Frontend Visible'])
      );

      /*
       * The Packages sheet is the authoritative product catalog.
       * Only active products explicitly marked for the frontend
       * are shown in the package selector.
       *
       * Shop-specific vouchers, funding routes and value-credit
       * routes remain in the data model but stay hidden here.
       */

      return active && frontendVisible;
    })
    .map(function(row) {

      return {
        id: normalize_(firstValue_(row, ['Package ID'])),
        name: normalize_(firstValue_(row, ['Package'])),
        referenceEUR: number_(
          firstValue_(row, ['Reference EUR'])
        ),
        mappingMode: upper_(
          firstValue_(row, ['Mapping Mode'])
        )
      };
    });


  /*
   * Markets come from the authoritative Markets sheet.
   * This keeps the market selector aligned with all supported UI regions,
   * even when a market has no optimizer-eligible shop yet.
   */

  const markets = marketRows
    .filter(function(row) {
      return boolean_(firstValue_(row, ['Active', 'Enabled']));
    })
    .map(function(row) {
      return {
        code: upper_(firstValue_(row, ['Market Code', 'Code'])),
        name: normalize_(firstValue_(row, ['Market', 'Name'])),
        defaultCurrency: upper_(firstValue_(row, ['Default Currency', 'Currency']))
      };
    })
    .filter(function(item) {
      return item.code && item.name;
    })
    .sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });


  /*
   * Currency values also come from the authoritative Currencies sheet.
   * The frontend receives both the ISO code and a human-readable name.
   */

  const currencies = currencyRows
    .filter(function(row) {
      return boolean_(firstValue_(row, ['Active', 'Enabled']));
    })
    .map(function(row) {
      return {
        code: upper_(firstValue_(row, ['Currency Code', 'Code'])),
        name: normalize_(firstValue_(row, ['Currency', 'Name'])),
        symbol: normalize_(firstValue_(row, ['Symbol'])),
        unitsPerEUR: number_(firstValue_(row, ['Units per EUR'])) || (upper_(firstValue_(row, ['Currency Code', 'Code'])) === 'EUR' ? 1 : null)
      };
    })
    .filter(function(item) {
      return item.code && item.name;
    });

  /*
   * Languages and UI translations come from the Translations sheet.
   * English is used by the frontend as the fallback language.
   */

  const languages = translationData.languages;
  const translations = translationData.translations;
  const languageMeta = getLanguageMeta_();

  return {
    success: true,

    packages: packageList,

    markets: markets,

    languages: languages,

    translations: translations,

    languageMeta: languageMeta,

    fallbackLanguage: 'English',

    currencies: currencies,

    /* Payment controls are country-driven. The frontend loads them only
       after the selected market and access level are known. */
    paymentMethods: [],

    accessLevels: [
      {
        level: 1,
        name: 'UID only'
      },
      {
        level: 2,
        name: 'Verification allowed'
      },
      {
        level: 3,
        name: 'Self-login allowed'
      },
      {
        level: 4,
        name: 'Operator access allowed'
      }
    ],

    dealModes: [
      {
        code: 'CHEAPEST',
        name: 'Cheapest'
      },
      {
        code: 'ONE_SHOP',
        name: 'One shop only'
      },
      {
        code: 'SIMPLE',
        name: 'Simple'
      }
    ]
  };
}


/* =========================================================
   MAIN DEAL ENGINE
   ========================================================= */

function findBestDeal(request) {

  request = request || {};

  const packageId = normalize_(request.packageId);
  const quantity = Math.max(1, parseInt(request.quantity || 1, 10));
  const market = upper_(request.market || 'DE');
  const maxAccess = Math.min(4, Math.max(1, parseInt(request.maxAccess || 3, 10)));
  const acceptedPayments = Array.isArray(request.paymentMethods)
    ? request.paymentMethods.map(upper_)
    : ['PAYPAL', 'CARD'];
  const shopMode = upper_(request.shopMode || 'ALL');
  const acceptedShops = shopMode === 'SELECTED' && Array.isArray(request.shopIds)
    ? request.shopIds.map(normalize_).filter(Boolean)
    : [];
  const dealMode = upper_(request.dealMode || 'CHEAPEST');
  const resultCount = Math.min(4, Math.max(1, parseInt(request.resultCount || 1, 10)));
  const newCustomerShopIds = Array.isArray(request.newCustomerShopIds)
    ? request.newCustomerShopIds.map(normalize_).filter(Boolean)
    : [];

  if (!packageId) throw new Error('No package selected.');

  const packages = getSheetObjects_(CONFIG.SHEETS.PACKAGES);
  const components = getSheetObjects_(CONFIG.SHEETS.COMPONENTS);
  const packageRow = packages.find(function(row) {
    return normalize_(firstValue_(row, ['Package ID'])) === packageId;
  });
  if (!packageRow) throw new Error('Unknown package: ' + packageId);

  const packageName = normalize_(firstValue_(packageRow, ['Package']));
  const referenceEUR = number_(firstValue_(packageRow, ['Reference EUR']));
  const mappingMode = upper_(firstValue_(packageRow, ['Mapping Mode']));
  let requiredComponents = [];

  if (mappingMode === 'COMPOSITE') {
    requiredComponents = components.filter(function(row) {
      return normalize_(firstValue_(row, ['Composite Package ID'])) === packageId;
    }).map(function(row) {
      return {
        tierId: normalize_(firstValue_(row, ['Component Tier ID'])),
        quantity: (number_(firstValue_(row, ['Quantity'])) || 1) * quantity
      };
    });
  } else {
    const lookupId = normalize_(firstValue_(packageRow, ['Price Lookup ID'])) || packageId;
    requiredComponents = [{ tierId: lookupId, quantity: quantity }];
  }

  if (!requiredComponents.length) {
    return { success: true, status: 'ROUTE_NOT_BUILT', packageId: packageId,
      packageName: packageName, message: 'No component route exists for this package.' };
  }

  /*
   * IMPORTANT: Checkout fees are cart/order costs, not item costs.
   * We therefore build candidate assignments first and apply the payment
   * percentage + fixed fee exactly once per shop cart.
   */
  let routeResult;
  let rankedShopResults = [];

  /* When the user asks for multiple results, rank complete shop routes.
     Each shop gets its own cheapest valid cart + cheapest accepted verified
     payment. This gives genuine shop alternatives instead of several payment
     variants of the same shop. */
  if (resultCount > 1) {
    rankedShopResults = findTopShopRoutes_({
      components: requiredComponents, market: market, maxAccess: maxAccess,
      paymentMethods: acceptedPayments, shopMode: shopMode, shopIds: acceptedShops,
      newCustomerShopIds: newCustomerShopIds,
      limit: resultCount,
      directPackageId: mappingMode === 'COMPOSITE' ? packageId : '',
      directQuantity: quantity
    });
    routeResult = rankedShopResults.length
      ? rankedShopResults[0]
      : { found: false, missingComponents: requiredComponents };
  } else {
    if (dealMode === 'ONE_SHOP') {
      routeResult = findOneShopRoute_({
        components: requiredComponents, market: market, maxAccess: maxAccess,
        paymentMethods: acceptedPayments, shopMode: shopMode, shopIds: acceptedShops,
        newCustomerShopIds: newCustomerShopIds
      });
    } else {
      routeResult = findCheapestCartRoute_({
        components: requiredComponents, market: market, maxAccess: maxAccess,
        paymentMethods: acceptedPayments, shopMode: shopMode, shopIds: acceptedShops,
        newCustomerShopIds: newCustomerShopIds
      });
    }

    /* A composite may also be sold directly as one SKU. Compare that direct
       offer against the decomposed route. */
    if (mappingMode === 'COMPOSITE') {
      const direct = findCheapestCartRoute_({
        components: [{ tierId: packageId, quantity: quantity }],
        market: market, maxAccess: maxAccess, paymentMethods: acceptedPayments,
        shopMode: shopMode, shopIds: acceptedShops,
        newCustomerShopIds: newCustomerShopIds
      });
      if (direct.found && (!routeResult.found || direct.totalEUR < routeResult.totalEUR)) {
        routeResult = direct;
      }
    }
  }

  const finalComponents = routeResult.found ? routeResult.components : [];
  const status = routeResult.found ? 'COMPLETE' : 'NO_ELIGIBLE_DEAL';
  const bestEUR = routeResult.found ? routeResult.totalEUR : null;
  const officialEUR = referenceEUR != null ? referenceEUR * quantity : null;
  const savingEUR = (bestEUR != null && officialEUR != null) ? officialEUR - bestEUR : null;
  const savingPercent = (savingEUR != null && officialEUR > 0) ? (savingEUR / officialEUR) * 100 : null;

  return {
    success: true, status: status, packageId: packageId, packageName: packageName,
    quantity: quantity, market: market, dealMode: dealMode, shopMode: shopMode,
    resultCount: resultCount, selectedShopIds: acceptedShops, officialEUR: officialEUR,
    bestEUR: bestEUR, knownSubtotalEUR: bestEUR, savingEUR: savingEUR,
    savingPercent: savingPercent, components: finalComponents,
    missingComponents: routeResult.missingComponents || [],
    routes: rankedShopResults.length
      ? rankedShopResults.map(function(item) { return groupRoutesByShop_(item.components)[0]; }).filter(Boolean)
      : groupRoutesByShop_(finalComponents),
    generatedAt: new Date().toISOString()
  };
}

/* =========================================================
   MARKET-AWARE PRICE FALLBACK
   ========================================================= */

function getMarketCurrency_(markets, market) {
  const code = upper_(market);
  const row = markets.find(function(item) {
    return upper_(firstValue_(item, ['Market Code', 'Code'])) === code;
  });
  return row ? upper_(firstValue_(row, [
    'Default Currency',
    'Currency Code',
    'Currency'
  ])) : '';
}


function isAvailableMarketConfig_(row) {
  if (!row) return false;

  const availability = upper_(firstValue_(row, ['Availability']));
  const eligible = boolean_(firstValue_(row, [
    'Eligible for Optimizer',
    'Optimizer Eligible'
  ]));

  if (!eligible) return false;

  /* Explicit negative / pending states must never become a fallback. */
  if (
    availability.indexOf('PENDING') !== -1 ||
    availability.indexOf('VERIFY') !== -1 ||
    availability.indexOf('STOCK_VARIABLE') !== -1 ||
    availability.indexOf('INDIRECT') !== -1 ||
    availability.indexOf('UNAVAILABLE') !== -1
  ) {
    return false;
  }

  return availability.indexOf('AVAILABLE') !== -1;
}


function getShopMarketConfig_(shopMarkets, shopId, market) {
  const normalizedShopId = normalize_(shopId);
  const normalizedMarket = upper_(market);

  const rows = shopMarkets.filter(function(row) {
    return normalize_(firstValue_(row, ['Shop ID'])) === normalizedShopId;
  });

  const exact = rows.find(function(row) {
    return upper_(firstValue_(row, ['Market Code', 'Market', 'Country Code'])) === normalizedMarket;
  });

  /* An explicit usable country route always wins. */
  if (isAvailableMarketConfig_(exact)) return exact;

  const global = rows.find(function(row) {
    return upper_(firstValue_(row, ['Market Code', 'Market', 'Country Code'])) === 'GLOBAL';
  });

  /* If the country row is only incomplete/pending, a verified global route
     may still serve that country. This is the core all-market fallback. */
  if (isAvailableMarketConfig_(global)) return global;

  return null;
}


function getPreferredPriceRows_(prices, shopId, packageId, market, shopMarkets, markets) {
  const requestedMarket = upper_(market);
  const marketCurrency = getMarketCurrency_(markets, requestedMarket);
  const marketConfig = getShopMarketConfig_(shopMarkets, shopId, requestedMarket);

  if (!marketConfig) return [];

  const routeCurrency = upper_(firstValue_(marketConfig, ['Charged Currency']));
  const base = prices.filter(function(row) {
    return normalize_(firstValue_(row, ['Shop ID'])) === shopId &&
      normalize_(firstValue_(row, ['Package ID'])) === packageId &&
      boolean_(firstValue_(row, ['Verified']));
  });

  if (!base.length) return [];

  function rank(row) {
    const storedMarket = upper_(firstValue_(row, ['Market Code']));
    const currency = upper_(firstValue_(row, ['Currency']));

    /* 1. Country-specific price is authoritative. */
    if (marketCodeMatches_(storedMarket, requestedMarket)) return 0;

    /* 2. Explicit GLOBAL/ALL price is the canonical fallback. */
    if (marketCodeMatches_(storedMarket, 'GLOBAL') || marketCodeMatches_(storedMarket, 'ALL')) return 1;

    /* 3. Use the currency declared by the resolved Shop Markets route.
          This makes AVAILABLE_GLOBAL_EUR work for every EUR market and
          GLOBAL/USD work for worldwide routes without hard-coding countries. */
    if (routeCurrency && routeCurrency !== 'TO_VERIFY' && currency === routeCurrency) return 2;

    /* 4. If the route does not declare a usable currency, use the market's
          default currency from Markets (e.g. EUR for NL/FI/AT/BE). */
    if (marketCurrency && currency === marketCurrency) return 3;

    return 99;
  }

  let bestRank = 99;
  base.forEach(function(row) {
    bestRank = Math.min(bestRank, rank(row));
  });

  if (bestRank === 99) return [];

  let preferred = base.filter(function(row) {
    return rank(row) === bestRank;
  });

  /* Keep only the newest capture inside the selected route/currency. */
  let newest = '';
  preferred.forEach(function(row) {
    const stamp = normalize_(firstValue_(row, ['Timestamp', 'Verified At']));
    if (stamp > newest) newest = stamp;
  });

  if (newest) {
    preferred = preferred.filter(function(row) {
      return normalize_(firstValue_(row, ['Timestamp', 'Verified At'])) === newest;
    });
  }

  return preferred;
}


/* =========================================================
   SHOP SELECTION FILTER
   The user's shop selection can only reduce the already
   market/access-eligible shop set. It can never add a shop.
   ========================================================= */

function filterEligibleShopIdsBySelection_(eligibleShopIds, shopMode, shopIds) {

  const mode = upper_(shopMode || 'ALL');

  if (mode !== 'SELECTED') {
    return eligibleShopIds;
  }

  const selected = new Set(
    (Array.isArray(shopIds) ? shopIds : [])
      .map(normalize_)
      .filter(Boolean)
  );

  const filtered = new Set();

  eligibleShopIds.forEach(function(shopId) {
    if (selected.has(shopId)) {
      filtered.add(shopId);
    }
  });

  return filtered;
}


/* =========================================================
   TIER OPTIMIZER
   ========================================================= */

function getTierCandidates_(options) {
  const prices = getSheetObjects_(CONFIG.SHEETS.PRICES);
  const shops = getSheetObjects_(CONFIG.SHEETS.SHOPS);
  const shopMarkets = getSheetObjects_(CONFIG.SHEETS.SHOP_MARKETS);
  const payments = getSheetObjects_(CONFIG.SHEETS.PAYMENTS);
  const markets = getSheetObjects_(CONFIG.SHEETS.MARKETS);
  const coupons = getSheetObjects_(CONFIG.SHEETS.COUPONS);
  const newCustomerShopIds = Array.isArray(options.newCustomerShopIds)
    ? options.newCustomerShopIds.map(normalize_)
    : [];
  const eligibleShopIds = filterEligibleShopIdsBySelection_(
    getEligibleShopIds_(shops, shopMarkets, options.market, options.maxAccess),
    options.shopMode,
    options.shopIds
  );
  const candidates = [];

  eligibleShopIds.forEach(function(shopId) {
    const shop = shops.find(function(row) {
      return normalize_(firstValue_(row, ['Shop ID'])) === shopId;
    });
    if (!shop) return;

    const paymentOptions = getVerifiedPaymentOptions_(shopId, options.paymentMethods, payments);
    /* Unknown checkout cost must never be silently treated as zero. */
    if (!paymentOptions.length) return;

    const preferredRows = getPreferredPriceRows_(prices, shopId, options.tierId,
      options.market, shopMarkets, markets);

    let best = null;
    preferredRows.forEach(function(priceRow) {
      /* Final EUR is the merchandise price after the stored coupon. Payment
         cost is deliberately NOT taken from Checkout Effective EUR here,
         because fixed checkout fees belong to the cart, not every item. */
      const priceEUR = number_(firstValue_(priceRow, ['Price EUR']));
      const couponCode = normalize_(firstValue_(priceRow, ['Coupon']));
      const couponRow = couponCode ? coupons.find(function(row) {
        return normalize_(firstValue_(row, ['Shop ID'])) === shopId &&
          normalize_(firstValue_(row, ['Code'])) === couponCode;
      }) : null;
      const newCustomerOnly = couponRow
        ? boolean_(firstValue_(couponRow, ['New Customer Only']))
        : false;
      const newCustomerSelected = newCustomerShopIds.indexOf(shopId) !== -1;
      const couponApplied = !!couponCode && (!newCustomerOnly || newCustomerSelected);

      if (priceEUR == null) return;

      let unitCouponDiscountEUR = 0;
      if (couponApplied) {
        const storedDiscount = number_(firstValue_(priceRow, ['Coupon Discount EUR']));
        if (storedDiscount != null) {
          unitCouponDiscountEUR = Math.max(0, storedDiscount);
        } else if (couponRow && upper_(firstValue_(couponRow, ['Type'])) === 'PERCENT') {
          const couponRate = number_(firstValue_(couponRow, ['Value'])) || 0;
          unitCouponDiscountEUR = Math.max(0, priceEUR * couponRate);
        }
      }

      const unitBaseEUR = Math.max(0, priceEUR - unitCouponDiscountEUR);
      const merchandiseSubtotalEUR = unitBaseEUR * options.quantity;
      const payment = selectCheapestPaymentForSubtotal_(paymentOptions, merchandiseSubtotalEUR);
      if (!payment) return;

      const candidate = {
        found: true, tierId: options.tierId, quantity: options.quantity,
        shopId: shopId, shopName: normalize_(firstValue_(shop, ['Shop'])),
        purchaseUrl: getMarketPurchaseUrl_(shop, shopMarkets, shopId, options.market),
        accessLevel: getMarketAccessLevel_(shop, shopMarkets, shopId, options.market),
        payment: payment.method, paymentStatus: payment.status,
        paymentRate: payment.rate || 0, paymentFixedEUR: payment.fixedEUR || 0,
        paymentOptions: paymentOptions,
        coupon: couponCode,
        couponApplied: couponApplied,
        newCustomerCouponAvailable: !!couponCode && newCustomerOnly,
        newCustomerSelected: newCustomerSelected,
        basePriceEUR: priceEUR,
        couponDiscountEUR: unitCouponDiscountEUR * options.quantity,
        unitBaseEUR: unitBaseEUR, unitPriceEUR: unitBaseEUR,
        merchandiseSubtotalEUR: merchandiseSubtotalEUR,
        subtotalEUR: merchandiseSubtotalEUR,
        priceStatus: marketCodeMatches_(firstValue_(priceRow, ['Market Code']), options.market)
          ? 'VERIFIED_MARKET' : 'VERIFIED_GLOBAL_FALLBACK'
      };
      if (!best || candidate.merchandiseSubtotalEUR < best.merchandiseSubtotalEUR) best = candidate;
    });
    if (best) candidates.push(best);
  });
  return candidates;
}

function findBestTierDeal_(options) {
  const candidates = getTierCandidates_(options);
  if (!candidates.length) return { found: false, tierId: options.tierId,
    quantity: options.quantity, status: 'NO_ELIGIBLE_DEAL' };

  /* Single-tier convenience result. Fixed payment fee is applied once. */
  candidates.forEach(function(c) {
    const fee = c.merchandiseSubtotalEUR * c.paymentRate + c.paymentFixedEUR;
    c.paymentFeeEUR = fee;
    c.subtotalEUR = c.merchandiseSubtotalEUR + fee;
    c.unitPriceEUR = c.subtotalEUR / c.quantity;
  });
  candidates.sort(function(a, b) { return a.subtotalEUR - b.subtotalEUR; });
  return candidates[0];
}

function priceAssignedComponents_(components) {
  const carts = {};
  components.forEach(function(item) {
    if (!carts[item.shopId]) carts[item.shopId] = { merchandise: 0, items: [] };
    carts[item.shopId].merchandise += item.merchandiseSubtotalEUR;
    carts[item.shopId].items.push(item);
  });

  let total = 0;
  Object.keys(carts).forEach(function(shopId) {
    const cart = carts[shopId];
    const sample = cart.items[0];
    const payment = selectCheapestPaymentForSubtotal_(sample.paymentOptions || [], cart.merchandise);
    if (!payment) return;
    const fee = cart.merchandise * (payment.rate || 0) + (payment.fixedEUR || 0);
    cart.items.forEach(function(item) {
      const share = cart.merchandise > 0 ? item.merchandiseSubtotalEUR / cart.merchandise : 0;
      item.payment = payment.method;
      item.paymentStatus = payment.status;
      item.paymentRate = payment.rate || 0;
      item.paymentFixedEUR = payment.fixedEUR || 0;
      item.paymentFeeEUR = fee * share;
      item.subtotalEUR = item.merchandiseSubtotalEUR + item.paymentFeeEUR;
      item.unitPriceEUR = item.subtotalEUR / item.quantity;
    });
    total += cart.merchandise + fee;
  });
  return total;
}

function findCheapestCartRoute_(options) {
  const candidateSets = options.components.map(function(component) {
    return getTierCandidates_({ tierId: component.tierId, quantity: component.quantity,
      market: options.market, maxAccess: options.maxAccess, paymentMethods: options.paymentMethods,
      shopMode: options.shopMode, shopIds: options.shopIds,
      newCustomerShopIds: options.newCustomerShopIds });
  });

  const missing = [];
  candidateSets.forEach(function(set, i) {
    if (!set.length) missing.push({ found: false, tierId: options.components[i].tierId,
      quantity: options.components[i].quantity, status: 'NO_ELIGIBLE_DEAL' });
  });
  if (missing.length) return { found: false, missingComponents: missing };

  let best = null;
  function walk(index, chosen) {
    if (index === candidateSets.length) {
      const copy = chosen.map(function(x) { return Object.assign({}, x); });
      const total = priceAssignedComponents_(copy);
      if (!best || total < best.totalEUR) best = { found: true, totalEUR: total, components: copy };
      return;
    }
    candidateSets[index].forEach(function(candidate) {
      chosen.push(candidate); walk(index + 1, chosen); chosen.pop();
    });
  }
  walk(0, []);
  return best || { found: false, missingComponents: missing };
}

/* =========================================================
   TOP SHOP ROUTES
   ========================================================= */

function findTopShopRoutes_(options) {
  const shops = getSheetObjects_(CONFIG.SHEETS.SHOPS);
  const shopMarkets = getSheetObjects_(CONFIG.SHEETS.SHOP_MARKETS);
  const eligibleShopIds = Array.from(
    filterEligibleShopIdsBySelection_(
      getEligibleShopIds_(shops, shopMarkets, options.market, options.maxAccess),
      options.shopMode,
      options.shopIds
    )
  );

  const routes = [];

  eligibleShopIds.forEach(function(shopId) {
    let bestForShop = null;

    const chosen = [];
    let valid = true;
    options.components.forEach(function(component) {
      const candidate = getTierCandidates_({
        tierId: component.tierId, quantity: component.quantity,
        market: options.market, maxAccess: options.maxAccess,
        paymentMethods: options.paymentMethods,
        shopMode: 'SELECTED', shopIds: [shopId],
        newCustomerShopIds: options.newCustomerShopIds
      }).find(function(c) { return c.shopId === shopId; });
      if (!candidate) { valid = false; return; }
      chosen.push(Object.assign({}, candidate));
    });

    if (valid && chosen.length) {
      const total = priceAssignedComponents_(chosen);
      bestForShop = { found: true, shopId: shopId, totalEUR: total, components: chosen };
    }

    /* Composite products may also exist as a direct SKU at the same shop.
       Compare both representations inside that shop before ranking shops. */
    if (options.directPackageId) {
      const directCandidate = getTierCandidates_({
        tierId: options.directPackageId,
        quantity: options.directQuantity || 1,
        market: options.market, maxAccess: options.maxAccess,
        paymentMethods: options.paymentMethods,
        shopMode: 'SELECTED', shopIds: [shopId],
        newCustomerShopIds: options.newCustomerShopIds
      }).find(function(c) { return c.shopId === shopId; });

      if (directCandidate) {
        const directComponents = [Object.assign({}, directCandidate)];
        const directTotal = priceAssignedComponents_(directComponents);
        if (!bestForShop || directTotal < bestForShop.totalEUR) {
          bestForShop = {
            found: true, shopId: shopId, totalEUR: directTotal,
            components: directComponents
          };
        }
      }
    }

    if (bestForShop) routes.push(bestForShop);
  });

  routes.sort(function(a, b) {
    return a.totalEUR - b.totalEUR || String(a.shopId).localeCompare(String(b.shopId));
  });

  return routes.slice(0, Math.min(4, Math.max(1, Number(options.limit) || 1)));
}


/* =========================================================
   MARKET-SPECIFIC SHOP CONFIG
   ========================================================= */

function getMarketPurchaseUrl_(shop, shopMarkets, shopId, market) {
  const marketConfig = getShopMarketConfig_(shopMarkets, shopId, market);
  const marketUrl = marketConfig
    ? normalize_(firstValue_(marketConfig, ['Purchase URL', 'URL']))
    : '';
  return marketUrl || normalize_(firstValue_(shop, ['URL']));
}

function getMarketAccessLevel_(shop, shopMarkets, shopId, market) {
  const marketConfig = getShopMarketConfig_(shopMarkets, shopId, market);
  const marketAccess = marketConfig
    ? number_(firstValue_(marketConfig, ['Access Level']))
    : null;
  return marketAccess || number_(firstValue_(shop, ['Access Level'])) || 4;
}


/* =========================================================
   MARKET ELIGIBILITY
   ========================================================= */

function getEligibleShopIds_(
  shops,
  shopMarkets,
  market,
  maxAccess
) {

  const eligible = new Set();
  const requestedMarket = upper_(market);

  shops.forEach(function(shop) {
    const shopId = normalize_(firstValue_(shop, ['Shop ID']));
    if (!shopId) return;

    if (!boolean_(firstValue_(shop, ['Active']))) return;

    /* Resolve country first, then GLOBAL. The resolver is data-driven and
       therefore applies to every active market in Markets without a country
       allow-list in code. */
    const marketConfig = getShopMarketConfig_(
      shopMarkets,
      shopId,
      requestedMarket
    );

    if (!marketConfig) return;

    const access =
      number_(firstValue_(marketConfig, ['Access Level'])) ||
      number_(firstValue_(shop, ['Access Level'])) ||
      4;

    if (access <= maxAccess) {
      eligible.add(shopId);
    }
  });

  return eligible;
}


/* =========================================================
   PAYMENT SELECTION
   ========================================================= */

function paymentMethodCode_(method) {
  const m = upper_(method).replace(/[\s_\-\/]+/g, ' ').trim();
  if (m.indexOf('PAYPAL') !== -1) return 'PAYPAL';
  if (m.indexOf('VISA') !== -1 || m.indexOf('MASTER') !== -1 || m === 'CARD') return 'CARD';
  if (m.indexOf('APPLE') !== -1) return 'APPLEPAY';
  if (m.indexOf('GOOGLE') !== -1) return 'GOOGLEPAY';
  if (m.indexOf('IDEAL') !== -1 || m.indexOf('WERO') !== -1) return 'IDEAL_WERO';
  if (m.indexOf('BLIK') !== -1) return 'BLIK';
  if (m.indexOf('BANCONTACT') !== -1) return 'BANCONTACT';
  if (m === 'EPS' || m.indexOf('EPS ') === 0) return 'EPS';
  if (m.indexOf('KLARNA') !== -1) return 'KLARNA';
  if (m.indexOf('TRUSTLY') !== -1) return 'TRUSTLY';
  if (m.indexOf('SWISH') !== -1) return 'SWISH';
  if (m.indexOf('VIPPS') !== -1) return 'VIPPS';
  if (m.indexOf('MOBILEPAY') !== -1 || m.indexOf('MOBILE PAY') !== -1) return 'MOBILEPAY';
  if (m.indexOf('MB WAY') !== -1) return 'MBWAY';
  if (m.indexOf('MULTIBANCO') !== -1) return 'MULTIBANCO';
  if (m.indexOf('BIZUM') !== -1) return 'BIZUM';
  if (m.indexOf('PIX') !== -1) return 'PIX';
  if (m.indexOf('FPX') !== -1) return 'FPX';
  if (m.indexOf('PAYNOW') !== -1) return 'PAYNOW';
  if (m.indexOf('PROMPTPAY') !== -1) return 'PROMPTPAY';
  if (m.indexOf('ALIPAYHK') !== -1 || m.indexOf('ALIPAY HK') !== -1) return 'ALIPAYHK';
  if (m.indexOf('PAYME') !== -1 || m.indexOf('PAY ME') !== -1) return 'PAYME';
  if (m.indexOf('TWINT') !== -1) return 'TWINT';
  if (m.indexOf('PAYPAY') !== -1) return 'PAYPAY';
  if (m.indexOf('KONBINI') !== -1) return 'KONBINI';
  if (m.indexOf('KAKAOPAY') !== -1 || m.indexOf('KAKAO PAY') !== -1) return 'KAKAOPAY';
  if (m.indexOf('GCASH') !== -1) return 'GCASH';
  if (m.indexOf('GRABPAY') !== -1 || m.indexOf('GRAB PAY') !== -1) return 'GRABPAY';
  if (m.indexOf('DOKU') !== -1) return 'DOKU';
  if (m.indexOf('OXXO') !== -1) return 'OXXO';
  if (m.indexOf('CASH APP') !== -1) return 'CASHAPPPAY';
  if (m.indexOf('LINE PAY') !== -1 || m.indexOf('LINEPAY') !== -1) return 'LINEPAY';
  if (m.indexOf('SHOPEEPAY') !== -1 || m.indexOf('SHOPEE PAY') !== -1) return 'SHOPEEPAY';
  if (m.indexOf('MYCARD') !== -1 || m.indexOf('MY CARD') !== -1) return 'MYCARD';
  if (m.indexOf('QIWI') !== -1) return 'QIWI';
  if (m.indexOf('BANK') !== -1 || m.indexOf('PAY BY BANK') !== -1) return 'BANK';
  return m.replace(/[^A-Z0-9]+/g, '_');
}

function getShopOptionsForMarket(market, maxAccess) {
  market = upper_(market || 'DE');
  maxAccess = Math.min(4, Math.max(1, parseInt(maxAccess || 3, 10)));
  const shops = getSheetObjects_(CONFIG.SHEETS.SHOPS);
  const shopMarkets = getSheetObjects_(CONFIG.SHEETS.SHOP_MARKETS);
  const eligible = getEligibleShopIds_(shops, shopMarkets, market, maxAccess);
  return shops.filter(function(row) {
    return eligible.has(normalize_(firstValue_(row, ['Shop ID'])));
  }).map(function(row) {
    const id = normalize_(firstValue_(row, ['Shop ID']));
    return {
      id: id,
      name: normalize_(firstValue_(row, ['Shop'])) || id,
      accessLevel: getMarketAccessLevel_(row, shopMarkets, id, market)
    };
  }).sort(function(a,b){ return a.name.localeCompare(b.name); });
}

function getPaymentOptionsForMarket(market, maxAccess) {
  market = upper_(market || 'DE');
  maxAccess = Math.min(4, Math.max(1, parseInt(maxAccess || 3, 10)));

  const marketRows = getSheetObjects_(CONFIG.SHEETS.PAYMENT_MARKETS);
  const payments = getSheetObjects_(CONFIG.SHEETS.PAYMENTS);
  const shops = getSheetObjects_(CONFIG.SHEETS.SHOPS);
  const shopMarkets = getSheetObjects_(CONFIG.SHEETS.SHOP_MARKETS);
  const eligibleShopIds = getEligibleShopIds_(shops, shopMarkets, market, maxAccess);

  let relevant = marketRows.filter(function(row) {
    return upper_(firstValue_(row, ['Market Code'])) === market &&
      boolean_(firstValue_(row, ['Available to User', 'Available', 'Active']));
  });
  if (!relevant.length) {
    relevant = marketRows.filter(function(row) {
      return upper_(firstValue_(row, ['Market Code'])) === 'GLOBAL' &&
        boolean_(firstValue_(row, ['Available to User', 'Available', 'Active']));
    });
  }

  const supportedByCode = {};
  payments.forEach(function(row) {
    const shopId = normalize_(firstValue_(row, ['Shop ID']));
    if (!eligibleShopIds.has(shopId)) return;
    const method = normalize_(firstValue_(row, ['Method']));
    if (!method) return;
    const code = paymentMethodCode_(method);
    if (!supportedByCode[code]) supportedByCode[code] = [];
    if (supportedByCode[code].indexOf(shopId) === -1) supportedByCode[code].push(shopId);
  });

  return relevant.map(function(row) {
    const name = normalize_(firstValue_(row, ['Payment Method', 'Method']));
    const code = paymentMethodCode_(name);
    const shopsForMethod = supportedByCode[code] || [];
    return {
      code: code,
      name: name,
      preferenceTier: upper_(firstValue_(row, ['Preference Tier'])) || 'DEFAULT',
      priority: number_(firstValue_(row, ['Priority'])) || 999,
      category: upper_(firstValue_(row, ['Category'])),
      availableInTrackedShops: shopsForMethod.length > 0,
      shopCount: shopsForMethod.length
    };
  }).filter(function(item) {
    /* The UI only shows methods that can actually be used at at least one
       currently eligible tracked shop. Country relevance alone is not enough. */
    return item.availableInTrackedShops;
  }).sort(function(a, b) {
    const tier = { HIGH: 0, MEDIUM: 1, LOW: 2, DEFAULT: 3 };
    const aTier = Object.prototype.hasOwnProperty.call(tier, a.preferenceTier)
      ? tier[a.preferenceTier] : 9;
    const bTier = Object.prototype.hasOwnProperty.call(tier, b.preferenceTier)
      ? tier[b.preferenceTier] : 9;
    return aTier - bTier ||
      a.priority - b.priority || a.name.localeCompare(b.name);
  });
}

function getVerifiedPaymentOptions_(shopId, acceptedPayments, paymentRows) {
  const normalizedAccepted = acceptedPayments.map(function(x) {
    return paymentMethodCode_(x);
  });

  return paymentRows.filter(function(row) {
    return normalize_(firstValue_(row, ['Shop ID'])) === shopId;
  }).map(function(row) {
    const method = normalize_(firstValue_(row, ['Method']));
    if (normalizedAccepted.indexOf(paymentMethodCode_(method)) === -1) return null;
    if (!boolean_(firstValue_(row, ['Active']))) return null;

    const rawRate = firstValue_(row, ['Fee %', 'Fee Rate', 'Percent Fee']);
    const rawFixed = firstValue_(row, ['Fixed Fee EUR', 'Fixed EUR', 'Fixed Fee']);
    const hasRate = rawRate !== '' && rawRate != null;
    const hasFixed = rawFixed !== '' && rawFixed != null;
    const rate = hasRate ? (number_(rawRate) || 0) : 0;
    const fixedEUR = hasFixed ? (number_(rawFixed) || 0) : 0;
    const priority = number_(firstValue_(row, ['Priority'])) || 999;
    const costStatus = upper_(firstValue_(row, ['Cost Data Status']));
    const costVerified =
      costStatus === 'VERIFIED' ||
      costStatus === 'COST_VERIFIED' ||
      (costStatus === '' && (hasRate || hasFixed));

    if (!costVerified) return null;

    return {
      compatible: true,
      method: method,
      status: 'COST_VERIFIED',
      rate: rate,
      fixedEUR: fixedEUR,
      priority: priority
    };
  }).filter(Boolean);
}

function selectCheapestPaymentForSubtotal_(paymentOptions, merchandiseSubtotalEUR) {
  const subtotal = Number(merchandiseSubtotalEUR) || 0;
  if (!paymentOptions || !paymentOptions.length) return null;

  return paymentOptions.slice().sort(function(a, b) {
    const aFee = subtotal * (a.rate || 0) + (a.fixedEUR || 0);
    const bFee = subtotal * (b.rate || 0) + (b.fixedEUR || 0);
    return aFee - bFee || a.priority - b.priority || a.method.localeCompare(b.method);
  })[0];
}

function selectPayment_(shopId, acceptedPayments, paymentRows, merchandiseSubtotalEUR) {
  const options = getVerifiedPaymentOptions_(shopId, acceptedPayments, paymentRows);
  const selected = selectCheapestPaymentForSubtotal_(options, merchandiseSubtotalEUR || 0);
  if (selected) return selected;
  return { compatible: false, method: '', status: 'NO_ACCEPTED_PAYMENT' };
}

function paymentMatches_(code, method) {
  return paymentMethodCode_(code) === paymentMethodCode_(method);
}


/* =========================================================
   ONE SHOP ROUTE
   ========================================================= */

function findOneShopRoute_(options) {
  const shops = getSheetObjects_(CONFIG.SHEETS.SHOPS);
  const shopMarkets = getSheetObjects_(CONFIG.SHEETS.SHOP_MARKETS);
  const eligibleShopIds = Array.from(
    filterEligibleShopIdsBySelection_(
      getEligibleShopIds_(shops, shopMarkets, options.market, options.maxAccess),
      options.shopMode,
      options.shopIds
    )
  );
  const routes = [];

  eligibleShopIds.forEach(function(shopId) {
    const chosen = [];
    let valid = true;
    options.components.forEach(function(component) {
      const candidate = getTierCandidates_({ tierId: component.tierId, quantity: component.quantity,
        market: options.market, maxAccess: options.maxAccess,
        paymentMethods: options.paymentMethods,
        shopMode: 'SELECTED', shopIds: [shopId],
        newCustomerShopIds: options.newCustomerShopIds }).find(function(c) { return c.shopId === shopId; });
      if (!candidate) { valid = false; return; }
      chosen.push(Object.assign({}, candidate));
    });
    if (!valid) return;
    const total = priceAssignedComponents_(chosen);
    routes.push({ found: true, shopId: shopId, totalEUR: total, components: chosen });
  });

  routes.sort(function(a, b) { return a.totalEUR - b.totalEUR; });
  return routes.length ? routes[0] : { found: false };
}

/* =========================================================
   GROUP ROUTES BY SHOP
   ========================================================= */

function groupRoutesByShop_(components) {

  const grouped = {};


  components.forEach(function(item) {

    if (!item.found) return;


    if (!grouped[item.shopId]) {

      grouped[item.shopId] = {
        shopId: item.shopId,
        shopName: item.shopName,
        purchaseUrl: item.purchaseUrl,
        payment: item.payment,
        paymentStatus: item.paymentStatus,
        accessLevel: item.accessLevel,
        coupon: item.coupon,
        couponApplied: item.couponApplied,
        newCustomerCouponAvailable: item.newCustomerCouponAvailable,
        newCustomerSelected: item.newCustomerSelected,
        baseMerchandiseEUR: 0,
        couponDiscountEUR: 0,
        merchandiseSubtotalEUR: 0,
        paymentFeeEUR: 0,
        subtotalEUR: 0,
        components: []
      };
    }


    grouped[item.shopId]
      .components
      .push({
        tierId: item.tierId,
        quantity: item.quantity,
        unitPriceEUR: item.unitPriceEUR,
        subtotalEUR: item.subtotalEUR
      });


    grouped[item.shopId].baseMerchandiseEUR +=
      (item.basePriceEUR != null ? item.basePriceEUR * item.quantity : item.merchandiseSubtotalEUR);
    grouped[item.shopId].couponDiscountEUR += item.couponDiscountEUR || 0;
    grouped[item.shopId].merchandiseSubtotalEUR += item.merchandiseSubtotalEUR || 0;
    grouped[item.shopId].paymentFeeEUR += item.paymentFeeEUR || 0;
    grouped[item.shopId].subtotalEUR += item.subtotalEUR;
  });


  return Object.keys(grouped)
    .map(function(key) {
      return grouped[key];
    })
    .sort(function(a, b) {
      return a.subtotalEUR - b.subtotalEUR;
    });
}