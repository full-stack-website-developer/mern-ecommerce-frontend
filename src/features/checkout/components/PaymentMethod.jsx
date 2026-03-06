import Card from '../../../components/common/Card';
import useCheckout from '../hooks/useCheckout';
import { PAYMENT_METHODS } from '../checkout.selectors';

// ─────────────────────────────────────────────────────────────────────────────
//  PaymentMethod — Step 3: choose HOW to pay
//
//  This component only handles method selection (COD / Stripe / PayPal).
//  The actual CardElement for Stripe lives in OrderSummary (the sidebar),
//  NOT here — because this step unmounts before the user clicks "Pay",
//  which would destroy the CardElement and make getElement() return null.
// ─────────────────────────────────────────────────────────────────────────────

const PaymentMethod = () => {
    const { state, setPaymentMethod, nextStep, prevStep } = useCheckout();

    return (
        <Card>
            <h2 className="text-xl font-bold mb-6">💳 Payment Method</h2>

            <div className="space-y-3">
                {Object.entries(PAYMENT_METHODS).map(([key, method]) => {
                    const isSelected = state.paymentMethod === key;
                    const isDisabled = method.disabled;

                    return (
                        <label
                            key={key}
                            className={`
                                flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all
                                ${isSelected && !isDisabled
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-200 bg-white'}
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
                            `}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={key}
                                checked={isSelected}
                                onChange={() => setPaymentMethod(key)}
                                className="mt-1 accent-blue-600"
                                disabled={isDisabled}
                            />
                            <div className={`flex-1 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{method.icon}</span>
                                    <span className="font-semibold text-gray-800">{method.label}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
                                {isDisabled && (
                                    <p className="text-xs text-red-500 mt-1">
                                        This payment method is currently not available.
                                    </p>
                                )}
                            </div>
                        </label>
                    );
                })}
            </div>

            {/* Contextual info */}
            <div className="mt-4">
                {state.paymentMethod === 'cod' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        <p className="font-medium mb-1">💵 How it works:</p>
                        <p>Place your order now. Pay cash when the delivery arrives. No advance payment needed.</p>
                    </div>
                )}
                {state.paymentMethod === 'stripe' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                        <p className="font-medium mb-1">💳 How it works:</p>
                        <p>You'll enter your card details on the next screen. Payment is processed securely by Stripe. Your card number never touches our server.</p>
                    </div>
                )}
                {state.paymentMethod === 'paypal' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                        <p className="font-medium mb-1">🅿️ How it works:</p>
                        <p>On the next screen, click the PayPal button. A secure PayPal popup will open for you to log in and approve.</p>
                    </div>
                )}
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    onClick={prevStep}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700
                               font-semibold py-3 px-6 rounded-lg transition"
                >
                    ← Back
                </button>
                <button
                    onClick={nextStep}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
                               font-semibold py-3 px-6 rounded-lg transition"
                >
                    Review Order →
                </button>
            </div>
        </Card>
    );
};

export default PaymentMethod;