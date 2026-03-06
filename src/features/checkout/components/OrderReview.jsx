import { useRef } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import Card from '../../../components/common/Card';
import useCheckout from '../hooks/useCheckout';
import { CHECKOUT_STEPS } from '../checkout.reducer';
import { SHIPPING_METHODS, PAYMENT_METHODS } from '../checkout.selectors';
import usePlatformSettings from '../../../hooks/usePlatformSettings';

// ─────────────────────────────────────────────────────────────────────────────
//  OrderReview — Final step before placing the order
//
//  🎓 PAYPAL BUTTONS EXPLAINED:
//  <PayPalButtons> renders PayPal's hosted button (loaded via PayPal JS SDK).
//  It handles all the popup, login, and approval flow internally.
//
//  createOrder: Called when user clicks the PayPal button.
//    → We create our internal order + a PayPal order via backend.
//    → Return the PayPal order ID to the SDK so it can open the popup.
//
//  onApprove: Called after user approves in the popup.
//    → We call our backend to capture the payment.
//    → On success, dispatch ORDER_SUCCESS.
//
//  For COD and Stripe, the "Place Order" button is in OrderSummary sidebar.
// ─────────────────────────────────────────────────────────────────────────────

const ReviewRow = ({ label, value }) => (
    <div className="flex justify-between text-sm py-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-800">{value}</span>
    </div>
);

const OrderReview = () => {
    const { state, goToStep, prevStep, createPayPalOrder, capturePayPalOrder, orderSummary } = useCheckout();
    const { settings } = usePlatformSettings();
    const { address, shippingMethod, paymentMethod } = state;
    const formatMoney = (value) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency || 'USD',
    }).format(value || 0);

    const shipping = SHIPPING_METHODS[shippingMethod];
    const payment  = PAYMENT_METHODS[paymentMethod];

    // We need to pass the internalOrderId from createOrder to onApprove
    // PayPal doesn't support async state easily, so we use a ref
    const internalOrderIdRef = useRef(null);

    const handlePayPalCreateOrder = async () => {
        try {
            const { paypalOrderId, internalOrderId } = await createPayPalOrder();
            internalOrderIdRef.current = internalOrderId;
            return paypalOrderId; // SDK needs this string to open the popup
        } catch {
            throw new Error('Could not initialize payment'); // Closes the PayPal popup
        }
    };

    const handlePayPalApprove = async (data) => {
        // data.orderID = PayPal order ID returned after approval
        await capturePayPalOrder(data.orderID, internalOrderIdRef.current);
    };

    return (
        <Card>
            <h2 className="text-xl font-bold mb-6">✅ Review Your Order</h2>

            {/* ── Shipping Address ── */}
            <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">📍 Shipping Address</h3>
                    <button
                        onClick={() => goToStep(CHECKOUT_STEPS.ADDRESS)}
                        className="text-blue-600 text-sm hover:underline"
                    >
                        Edit
                    </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    <p className="font-medium">{address.firstName} {address.lastName}</p>
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state} {address.postalCode}</p>
                    <p>{address.country}</p>
                    <p className="text-gray-500 mt-1">{address.phone}</p>
                    {address.email && <p className="text-gray-500">{address.email}</p>}
                </div>
            </div>

            {/* ── Shipping Method ── */}
            <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">📦 Shipping Method</h3>
                    <button
                        onClick={() => goToStep(CHECKOUT_STEPS.SHIPPING)}
                        className="text-blue-600 text-sm hover:underline"
                    >
                        Edit
                    </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    <ReviewRow label="Method"   value={shipping?.label} />
                    <ReviewRow label="Delivery" value={shipping?.days} />
                    <ReviewRow label="Cost"     value={formatMoney(orderSummary.shippingCost)} />
                </div>
            </div>

            {/* ── Payment Method ── */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">💳 Payment</h3>
                    <button
                        onClick={() => goToStep(CHECKOUT_STEPS.PAYMENT)}
                        className="text-blue-600 text-sm hover:underline"
                    >
                        Edit
                    </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    <ReviewRow label="Method" value={`${payment?.icon} ${payment?.label}`} />
                    {paymentMethod === 'stripe' && (
                        <p className="text-xs text-gray-400 mt-1">🔒 Card ending added in previous step</p>
                    )}
                </div>
            </div>

            {/* ── PayPal Buttons (only shown for PayPal method) ── */}
            {paymentMethod === 'paypal' && (
                <div className="mb-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-700 font-medium mb-3 text-center">
                            Total: <span className="font-bold">{formatMoney(orderSummary.total)}</span>
                        </p>
                        <PayPalButtons
                            style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                            disabled={state.loading}
                            createOrder={handlePayPalCreateOrder}
                            onApprove={handlePayPalApprove}
                            onError={(err) => {
                                console.error('[PayPal Error]', err);
                            }}
                            onCancel={() => {
                                // User closed the PayPal popup without paying — no action needed
                            }}
                        />
                        {state.error && (
                            <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                ⚠️ {state.error}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Back button ── */}
            <button
                onClick={prevStep}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700
                           font-semibold py-3 px-6 rounded-lg transition"
            >
                ← Back to Payment
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
                By placing your order, you agree to our Terms & Privacy Policy.
            </p>
        </Card>
    );
};

export default OrderReview;
