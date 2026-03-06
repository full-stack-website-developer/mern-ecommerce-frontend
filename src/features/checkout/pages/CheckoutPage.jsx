// ============================================================
//  CheckoutPage — The Orchestrator
//
//  🎓 PROVIDER SETUP:
//
//  <PayPalScriptProvider> — Loads the PayPal JS SDK script.
//    Must wrap any component using <PayPalButtons>.
//    clientId comes from your .env (VITE_PAYPAL_CLIENT_ID).
//
//  <Elements stripe={stripePromise}> — Loads Stripe.js and provides
//    the stripe context. Must wrap any component using useStripe(),
//    useElements(), or <CardElement>.
//
//  Both providers are placed here (not in main.jsx) because they're
//  only needed on the checkout page — don't over-provision providers.
// ============================================================

import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

import MainLayout from '../../../components/layout/MainLayout';
import Breadcrumb from '../../../components/common/Breadcrumb';
import CheckoutProvider from '../checkout.context';
import CheckoutSteps from '../components/Checkoutsteps';
import ShippingAddressForm from '../components/ShippingAddressForm';
import ShippingMethod from '../components/ShippingMethod';
import PaymentMethod from '../components/PaymentMethod';
import OrderReview from '../components/OrderReview';
import OrderSummary from '../components/OrderSummary';
import OrderSuccess from '../components/OrderSuccess';
import useCheckout from '../hooks/useCheckout';
import { CHECKOUT_STEPS } from '../checkout.reducer';
import useCartContext from '../../../hooks/useCartContext';
import usePlatformSettings from '../../../hooks/usePlatformSettings';

// ── Initialize Stripe once (outside component to avoid re-creation) ───────────
//
//  🎓 loadStripe() is called once at module level.
//  It returns a Promise<Stripe> — the Elements provider handles the async wait.
//  VITE_STRIPE_PUBLISHABLE_KEY is the pk_test_... key (safe to expose to frontend).

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ── PayPal script options ─────────────────────────────────────────────────────
// ── Inner component (inside all providers) ───────────────────────────────────
const CheckoutContent = () => {
    const navigate = useNavigate();
    const { cartItems } = useCartContext();
    const { state, goToStep } = useCheckout();

    useEffect(() => {
        if (cartItems.length === 0 && !state.placedOrder) {
            navigate('/cart');
        }
    }, [cartItems.length, state.placedOrder, navigate]);

    if (state.placedOrder) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    <OrderSuccess />
                </div>
            </MainLayout>
        );
    }

    const stepComponents = {
        [CHECKOUT_STEPS.ADDRESS]:  <ShippingAddressForm />,
        [CHECKOUT_STEPS.SHIPPING]: <ShippingMethod />,
        [CHECKOUT_STEPS.PAYMENT]:  <PaymentMethod />,
        [CHECKOUT_STEPS.REVIEW]:   <OrderReview />,
    };

    const isReviewStep = state.currentStep === CHECKOUT_STEPS.REVIEW;

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Cart', href: '/cart' },
                        { label: 'Checkout', href: '/checkout' },
                    ]}
                />

                <h1 className="text-3xl font-bold mb-6 mt-4">Checkout</h1>

                <CheckoutSteps
                    currentStep={state.currentStep}
                    onStepClick={goToStep}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {stepComponents[state.currentStep]}
                    </div>
                    <div className="lg:col-span-1">
                        <OrderSummary
                            showCoupon={true}
                            showPlaceOrder={isReviewStep}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

// ── Outer wrapper: providers ──────────────────────────────────────────────────
const CheckoutPage = () => (
    <CheckoutWrapper />
);

const CheckoutWrapper = () => {
    const { settings } = usePlatformSettings();

    const paypalOptions = useMemo(() => ({
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: (settings.currency || 'USD').toUpperCase(),
        intent: 'capture',
        components: 'buttons',
    }), [settings.currency]);

    return (
        <PayPalScriptProvider options={paypalOptions} key={paypalOptions.currency}>
            <Elements stripe={stripePromise}>
                <CheckoutProvider>
                    <CheckoutContent />
                </CheckoutProvider>
            </Elements>
        </PayPalScriptProvider>
    );
};

export default CheckoutPage;
