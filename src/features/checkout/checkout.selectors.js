// ─────────────────────────────────────────────────────────────────────────────
//  checkout.selectors.js  — pure calculation functions, no side-effects
// ─────────────────────────────────────────────────────────────────────────────

export const SHIPPING_METHODS = {
    standard:  { label: 'Standard Shipping',  multiplier: 1, days: '5-7 business days' },
    express:   { label: 'Express Shipping',   multiplier: 2, days: '2-3 business days' },
    overnight: { label: 'Overnight Shipping', multiplier: 3, days: 'Next business day'  },
};

const DEFAULT_PLATFORM_SETTINGS = {
    currency: 'USD',
    defaultShippingCost: 10,
    freeShippingThreshold: 100,
    taxRate: 10,
};

// ── Payment methods ───────────────────────────────────────────────────────────
//
//  🎓 NOTE ON requiresRedirect:
//  COD    → false  (order placed, show success immediately)
//  Stripe → false  (card confirmed inline via Stripe Elements)
//  PayPal → false  (PayPal handles via popup, not full page redirect)
//
//  🎓 NOTE ON stripeCard:
//  When true, a CardElement input is shown in the PaymentMethod step.

export const PAYMENT_METHODS = {
    cod: {
        label:            'Cash on Delivery',
        icon:             '💵',
        description:      'Pay when your order arrives at your door. No advance payment.',
        requiresRedirect: false,
        stripeCard:       false,
        disabled:         false,
    },
    stripe: {
        label:            'Credit / Debit Card',
        icon:             '💳',
        description:      'Secure payment via Stripe. All major cards accepted.',
        requiresRedirect: false,
        stripeCard:       true,   // Render CardElement in PaymentMethod step
        disabled:         false,
    },
    paypal: {
        label:            'PayPal',
        icon:             '🅿️',
        description:      'Pay with your PayPal account or card via PayPal.',
        requiresRedirect: false,
        stripeCard:       false,
        disabled:         true,
    },
};

// ── Calculation helpers ───────────────────────────────────────────────────────

export const getSubtotal = (cartItems) =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const getShippingCost = (methodKey, subtotal = 0, platform = DEFAULT_PLATFORM_SETTINGS) => {
    const threshold = Number(platform.freeShippingThreshold || 0);
    if (threshold > 0 && subtotal >= threshold) return 0;

    const base = Number(platform.defaultShippingCost || 0);
    const method = SHIPPING_METHODS[methodKey] || SHIPPING_METHODS.standard;
    return Number((base * (method.multiplier || 1)).toFixed(2));
};

export const getTax = (subtotal, platform = DEFAULT_PLATFORM_SETTINGS) =>
    subtotal * (Number(platform.taxRate || 0) / 100);

export const getCouponDiscount = (coupon, subtotal) => {
    if (!coupon) return 0;
    if (coupon.type === 'percent') return subtotal * (coupon.discount / 100);
    if (coupon.type === 'fixed')   return Math.min(coupon.discount, subtotal);
    return 0;
};

export const getTotal = (subtotal, shippingCost, tax, couponDiscount = 0) =>
    Math.max(0, subtotal + shippingCost + tax - couponDiscount);

// Complete summary object — used by useCheckout and OrderSummary
export const getOrderSummary = (cartItems, checkoutState, platform = DEFAULT_PLATFORM_SETTINGS) => {
    const subtotal       = getSubtotal(cartItems);
    const shippingCost   = getShippingCost(checkoutState.shippingMethod, subtotal, platform);
    const tax            = getTax(subtotal, platform);
    const couponDiscount = getCouponDiscount(checkoutState.coupon, subtotal);
    const total          = getTotal(subtotal, shippingCost, tax, couponDiscount);

    return { subtotal, shippingCost, tax, couponDiscount, total };
};

// Address validation
export const isAddressValid = (
  address,
  { usingSavedAddress = false, isGuest = false } = {}
) => {
  if (usingSavedAddress) return true;

  const baseRequired = ['firstName', 'phone', 'street', 'city', 'state', 'country'];
  const required = isGuest ? [...baseRequired, 'email'] : baseRequired;

  return required.every(field => address?.[field]?.toString().trim());
};
