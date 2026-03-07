/** App Store Connect'te tanımlı ürün ID'leri (bundle: com.ggwp.app) */
export const IAP_PREMIUM_SKUS = [
  'com.ggwp.app.premium.weekly',
  'com.ggwp.app.premium.monthly',
] as const;

export const IAP_PENTAKILL_SKUS = [
  'com.ggwp.app.pentakill.single',
  'com.ggwp.app.pentakill.pack',
  'com.ggwp.app.pentakill.series',
] as const;

export type PremiumSku = (typeof IAP_PREMIUM_SKUS)[number];
export type PentakillSku = (typeof IAP_PENTAKILL_SKUS)[number];
