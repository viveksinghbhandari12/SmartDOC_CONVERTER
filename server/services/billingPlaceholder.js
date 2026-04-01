/**
 * Future: Stripe / Razorpay customer + subscription checks.
 * Wire this into route middleware when you add paid tiers.
 */
export function assertPaidFeature() {
  return (_req, _res, next) => next();
}
