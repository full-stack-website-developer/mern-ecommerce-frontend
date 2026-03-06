import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Card from '../../../components/common/Card';
import useCheckout from '../hooks/useCheckout';
import { SHIPPING_METHODS } from '../checkout.selectors';
import usePlatformSettings from '../../../hooks/usePlatformSettings';

// ─────────────────────────────────────────────────────────────────────────────
//  OrderSummary — sidebar shown on ALL checkout steps
//
//  🎓 WHY IS CardElement HERE (not in PaymentMethod)?
//
//  React unmounts step components when you navigate away.
//  PaymentMethod (step 3) is unmounted by the time the user reaches Review (step 4).
//  elements.getElement(CardElement) returns null for unmounted elements →
//  stripe.confirmCardPayment() throws "card should be an object, got null".
//
//  Fix: keep <CardElement> in this sidebar which is always mounted.
//  We hide it with className="hidden" on non-review steps — it stays in the DOM
//  so getElement() always finds it when Pay is clicked.
// ─────────────────────────────────────────────────────────────────────────────

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize:        '16px',
            color:           '#1f2937',
            fontFamily:      'ui-sans-serif, system-ui, sans-serif',
            fontSmoothing:   'antialiased',
            '::placeholder': { color: '#9ca3af' },
            iconColor:       '#6b7280',
        },
        invalid: { color: '#ef4444', iconColor: '#ef4444' },
    },
};

const OrderSummary = ({ showCoupon = false, showPlaceOrder = false }) => {
    const { cartItems, state, orderSummary, placeOrder, applyCoupon, removeCoupon } = useCheckout();
    const { settings } = usePlatformSettings();
    const [couponInput, setCouponInput] = useState('');
    const [cardError,   setCardError]   = useState(null);
    const [cardReady,   setCardReady]   = useState(false);

    const stripe   = useStripe();
    const elements = useElements();

    const isStripe = state.paymentMethod === 'stripe';
    const isPayPal = state.paymentMethod === 'paypal';
    const formatMoney = (value) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency || 'USD',
    }).format(value || 0);

    const getButtonLabel = () => {
        const total = formatMoney(orderSummary.total);
        if (isStripe) return `🔒 Pay ${total} by Card`;
        return `🛒 Place Order ${total}`;
    };

    const handlePlaceOrder = () => {
        if (isStripe && !cardReady) {
            setCardError('Please enter your complete card details.');
            return;
        }
        placeOrder(stripe, elements);
    };

    const shouldShowButton = showPlaceOrder && !isPayPal;

    return (
        <Card className="sticky top-4">
            <h2 className="text-xl font-bold mb-5">🧾 Order Summary</h2>

            {/* Cart items */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item, i) => {
                    const name = item.productId?.name || item.name || 'Product';
                    return (
                        <div key={i} className="flex justify-between text-sm">
                            <div className="flex-1 pr-2">
                                <p className="font-medium text-gray-800 truncate">{name}</p>
                                <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                            </div>
                            <span className="font-medium text-gray-700 whitespace-nowrap">
                                {formatMoney(item.price * item.quantity)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatMoney(orderSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>Shipping ({SHIPPING_METHODS[state.shippingMethod]?.label})</span>
                    <span>{formatMoney(orderSummary.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>Tax ({Number(settings.taxRate || 0)}%)</span>
                    <span>{formatMoney(orderSummary.tax)}</span>
                </div>
                {state.coupon && (
                    <div className="flex justify-between text-green-600">
                        <span>Coupon ({state.coupon.code})</span>
                        <span>-{formatMoney(orderSummary.couponDiscount)}</span>
                    </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-base text-gray-900">
                    <span>Total</span>
                    <span>{formatMoney(orderSummary.total)}</span>
                </div>
            </div>

            {/* Coupon */}
            {showCoupon && (
                <div className="mt-4">
                    {state.coupon ? (
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg text-sm">
                            <span className="text-green-700 font-medium">🎉 "{state.coupon.code}" applied</span>
                            <button onClick={removeCoupon} className="text-red-500 text-xs hover:underline">Remove</button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Coupon code"
                                value={couponInput}
                                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                                           focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <button
                                onClick={() => { if (couponInput) { applyCoupon(couponInput); setCouponInput(''); } }}
                                disabled={!couponInput || state.loading}
                                className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg
                                           hover:bg-gray-900 disabled:opacity-40 transition"
                            >
                                Apply
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Stripe CardElement ────────────────────────────────────────────
                Always rendered (so getElement() works), hidden via CSS when not
                on the review step or when another payment method is chosen.     */}
            <div className={showPlaceOrder && isStripe ? 'mt-4' : 'hidden'}>
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                    <span>🔒</span> Encrypted card details never touch our servers.
                </p>
                <div className="p-3 border border-gray-300 rounded-lg bg-white
                                focus-within:ring-2 focus-within:ring-blue-300
                                focus-within:border-blue-400 transition-all">
                    <CardElement
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={(e) => {
                            setCardError(e.error?.message || null);
                            setCardReady(e.complete);
                        }}
                    />
                </div>
                {cardError && (
                    <p className="mt-1.5 text-sm text-red-600">⚠️ {cardError}</p>
                )}
                <p className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                    🧪 Test: <strong>4242 4242 4242 4242</strong> · Any future date · Any CVC
                </p>
            </div>

            {/* Place Order / Pay button */}
            {shouldShowButton && (
                <>
                    <button
                        onClick={handlePlaceOrder}
                        disabled={state.loading || (isStripe && !stripe)}
                        className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                                   text-white font-semibold py-3 px-6 rounded-xl transition
                                   flex items-center justify-center gap-2"
                    >
                        {state.loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {isStripe ? 'Processing payment...' : 'Placing order...'}
                            </>
                        ) : (
                            getButtonLabel()
                        )}
                    </button>

                    {state.error && (
                        <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            ⚠️ {state.error}
                        </p>
                    )}
                </>
            )}

            {/* PayPal notice */}
            {showPlaceOrder && isPayPal && (
                <p className="mt-4 text-xs text-center text-gray-400 bg-gray-50 p-3 rounded-lg">
                    🅿️ Use the PayPal button in the order review to complete payment.
                </p>
            )}
        </Card>
    );
};

export default OrderSummary;
