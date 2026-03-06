import { useContext } from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { CheckoutContext } from '../checkout.context';
import { CHECKOUT_ACTIONS } from '../checkout.reducer';
import checkoutService from '../../../services/checkout.service';
import { getOrderSummary } from '../checkout.selectors';
import useCartContext from '../../../hooks/useCartContext';
import useUserContext from '../../../hooks/useUserContext';
import usePlatformSettings from '../../../hooks/usePlatformSettings';
import toast from 'react-hot-toast';
import { calcTotals, groupItemsBySeller } from '../utils/orderCreationHelper';

// ─────────────────────────────────────────────────────────────────────────────
//  useCheckout — single interface for all checkout components
//
//  🎓 PAYMENT FLOWS:
//
//  COD:
//    placeOrder() → backend creates order → dispatch ORDER_SUCCESS
//
//  Stripe (Payment Intents flow):
//    placeOrder(stripe, elements) →
//      1. Backend creates order + PaymentIntent → returns clientSecret
//      2. stripe.confirmCardPayment(clientSecret, { card: cardElement })
//      3. On success → dispatch ORDER_SUCCESS
//      4. Stripe also sends webhook → backend marks order paid (server-side confirmation)
//
//  PayPal (handled by PayPalButtons component, NOT here):
//    PayPalButtons.createOrder → backend creates order → returns paypalOrderId
//    PayPalButtons.onApprove  → placePayPalOrder(paypalOrderId, internalOrderId)
//                             → backend captures → dispatch ORDER_SUCCESS
// ─────────────────────────────────────────────────────────────────────────────

const useCheckout = () => {
    const { state, dispatch } = useContext(CheckoutContext);
    const { cartItems, clearCart } = useCartContext();
    const { user } = useUserContext();
    const { settings: platformSettings } = usePlatformSettings();

    const orderSummary = getOrderSummary(cartItems, state, platformSettings);

    // ── Step navigation ───────────────────────────────────────────────────────
    const goToStep = (step) => dispatch({ type: CHECKOUT_ACTIONS.SET_STEP, payload: step });
    const nextStep = ()     => dispatch({ type: CHECKOUT_ACTIONS.NEXT_STEP });
    const prevStep = ()     => dispatch({ type: CHECKOUT_ACTIONS.PREV_STEP });

    // ── Address ───────────────────────────────────────────────────────────────
    const setAddressField = (field, value) =>
        dispatch({ type: CHECKOUT_ACTIONS.SET_ADDRESS_FIELD, payload: { field, value } });

    const setAddress = (addressObj) =>
        dispatch({ type: CHECKOUT_ACTIONS.SET_ADDRESS, payload: addressObj });

    const selectSavedAddress = (saved) =>
        dispatch({ type: CHECKOUT_ACTIONS.SELECT_SAVED_ADDRESS, payload: saved });

    // ── Shipping / Payment ────────────────────────────────────────────────────
    const setShippingMethod = (method) =>
        dispatch({ type: CHECKOUT_ACTIONS.SET_SHIPPING_METHOD, payload: method });

    const setPaymentMethod = (method) =>
        dispatch({ type: CHECKOUT_ACTIONS.SET_PAYMENT_METHOD, payload: method });

    // ── Coupon ────────────────────────────────────────────────────────────────
    const applyCoupon = async (code) => {
        dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: true });
        try {
            const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const res = await checkoutService.validateCoupon(code, subtotal);
            dispatch({ type: CHECKOUT_ACTIONS.APPLY_COUPON, payload: res.data });
            toast.success(`Coupon "${code}" applied! 🎉`);
        } catch (err) {
            const msg = err.data?.message || 'Invalid or expired coupon';
            dispatch({ type: CHECKOUT_ACTIONS.SET_ERROR, payload: msg });
            toast.error(msg);
        } finally {
            dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: false });
        }
    };

    const removeCoupon = () => {
        dispatch({ type: CHECKOUT_ACTIONS.REMOVE_COUPON });
        toast('Coupon removed.', { icon: '🗑️' });
    };

    // ── Build the order payload ───────────────────────────────────────────────
    // Shared between all payment methods
    const _buildOrderPayload = () => {
        const grouped = groupItemsBySeller(cartItems);

        const subOrder = Array.from(grouped.entries()).map(([sellerId, items]) => {
            const { subtotal, tax, total } = calcTotals(items);
            console.log(items)
            return {
                sellerId,
                subtotal,
                tax,
                total,
                items,
            };
        });

        const subtotal = subOrder.reduce((sum, s) => sum + s.subtotal, 0);
        const tax      = subOrder.reduce((sum, s) => sum + s.tax, 0);
        const total    = subtotal + tax + orderSummary.shippingCost - (orderSummary.couponDiscount || 0);

        return {
            subOrder,
            shippingAddress: state.address,
            shippingMethod:  state.shippingMethod,
            shippingCost:    orderSummary.shippingCost,
            paymentMethod:   state.paymentMethod,
            subtotal,
            tax,
            discount:        orderSummary.couponDiscount || 0,
            total,
            couponCode:      state.coupon?.code || null,
            guestEmail:      !user ? state.address.email : undefined,
        };
    };

    // const _buildOrderPayload = () => ({
    //   items: cartItems.map((item) => ({
    //     productId: item.productId?._id || item.productId,
    //     variantId: item.variantId?._id || item.variantId || null,
    //     quantity: item.quantity,
    //     price: item.price,
    //   })),
    //   address: state.address,
    //   shippingMethod: state.shippingMethod,
    //   paymentMethod: state.paymentMethod,
    //   couponCode: state.coupon?.code || null,
    //   guestEmail: !user ? state.address.email : undefined,
    // });

    // ── Place Order — COD + Stripe ────────────────────────────────────────────
    //
    //  stripe   — Stripe JS instance from useStripe() (only passed for Stripe method)
    //  elements — Stripe Elements instance from useElements() (same)

    const placeOrder = async (stripe = null, elements = null) => {
        dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: CHECKOUT_ACTIONS.CLEAR_ERROR });

        try {
            const payload = _buildOrderPayload();
            const res = await checkoutService.placeOrder(payload);
            const { order, clientSecret } = res.data;

            if (state.paymentMethod === 'cod') {
                await clearCart(user?.id);
                dispatch({ type: CHECKOUT_ACTIONS.ORDER_SUCCESS, payload: order });
                toast.success('Order placed successfully');
                return order;
            }

            if (state.paymentMethod === 'stripe') {
                if (!stripe || !elements) {
                    throw new Error('Stripe is not initialized. Please refresh and try again.');
                }

                if (!clientSecret) {
                    throw new Error('No client secret returned from server.');
                }

                const cardElement = elements.getElement(CardElement);
                if (!cardElement) {
                    throw new Error('Card details are missing.');
                }

                const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                    clientSecret,
                    {
                        payment_method: {
                            card: cardElement,
                            billing_details: {
                                name: `${state.address.firstName} ${state.address.lastName}`.trim(),
                                email: state.address.email,
                                phone: state.address.phone,
                            },
                        },
                    }
                );

                if (stripeError) {
                    throw new Error(stripeError.message);
                }

                if (paymentIntent?.status === 'succeeded') {
                    await clearCart(user?.id);
                    dispatch({ type: CHECKOUT_ACTIONS.ORDER_SUCCESS, payload: order });
                    toast.success('Payment successful');
                    return order;
                }

                throw new Error(`Unexpected payment status: ${paymentIntent?.status || 'unknown'}`);
            }

            throw new Error('Unsupported payment method selected');

        } catch (err) {
            const message = err.message || err.data?.message || 'Failed to place order. Please try again.';
            dispatch({ type: CHECKOUT_ACTIONS.SET_ERROR,   payload: message });
            dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: false });
            toast.error(message);
            return null;
        }
    };

    // ── PayPal: createOrder callback ──────────────────────────────────────────
    //
    //  Called by the PayPalButtons component to get a PayPal order ID.
    //  We create our internal order first, then tell PayPal how much to charge.

    const createPayPalOrder = async () => {
        dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: CHECKOUT_ACTIONS.CLEAR_ERROR });

        try {
            const payload = { ..._buildOrderPayload(), paymentMethod: 'paypal' };
            const res     = await checkoutService.placeOrder(payload);

            // Store internalOrderId in the closure via the returned value
            // PayPalButtons will pass this back to onApprove
            return {
                paypalOrderId:   res.data.paypalOrderId,
                internalOrderId: res.data.order._id,
            };
        } catch (err) {
            const message = err.data?.message || 'Failed to initialize PayPal. Please try again.';
            dispatch({ type: CHECKOUT_ACTIONS.SET_ERROR,   payload: message });
            dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: false });
            toast.error(message);
            throw err; // PayPal SDK needs the error to be thrown to close the popup
        }
    };

    // ── PayPal: onApprove callback ────────────────────────────────────────────
    //
    //  Called after buyer approves in the PayPal popup.
    //  We tell our backend to capture the funds.

    const capturePayPalOrder = async (paypalOrderId, internalOrderId) => {
        try {
            const res = await checkoutService.capturePayPalPayment(paypalOrderId, internalOrderId);
            const capturedOrder = res.data;

            await clearCart(user?.id);

            // We need the order object for the success screen — fetch it
            const orderRes = await checkoutService.getOrderById(internalOrderId);
            dispatch({ type: CHECKOUT_ACTIONS.ORDER_SUCCESS, payload: orderRes.data.order });
            dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: false });
            toast.success('Payment captured! Order confirmed 🎉');
            return capturedOrder;

        } catch (err) {
            const message = err.data?.message || 'Payment capture failed. Please contact support.';
            dispatch({ type: CHECKOUT_ACTIONS.SET_ERROR,   payload: message });
            dispatch({ type: CHECKOUT_ACTIONS.SET_LOADING, payload: false });
            toast.error(message);
            throw err;
        }
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    const resetCheckout = () => dispatch({ type: CHECKOUT_ACTIONS.RESET });

    return {
        state,
        orderSummary,
        isGuest: !user,
        user,
        cartItems,

        goToStep,
        nextStep,
        prevStep,

        setAddressField,
        setAddress,
        selectSavedAddress,

        setShippingMethod,
        setPaymentMethod,

        applyCoupon,
        removeCoupon,

        placeOrder,
        createPayPalOrder,
        capturePayPalOrder,
        resetCheckout,
    };
};

export default useCheckout;
