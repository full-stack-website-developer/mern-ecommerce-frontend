import apiClient, { ApiError } from '../api/api.client';

// ─────────────────────────────────────────────────────────────────────────────
//  Checkout Service
//  All API calls related to checkout and payments.
// ─────────────────────────────────────────────────────────────────────────────

class CheckoutService {

    // ── Place order (all payment methods) ─────────────────────────────────────
    //
    //  Payload: { items, address, shippingMethod, paymentMethod, couponCode, guestEmail? }
    //
    //  Response by payment method:
    //    COD:    { order }
    //    Stripe: { order, clientSecret }
    //    PayPal: { order, paypalOrderId }

    async placeOrder(payload) {
        try {
            return await apiClient.post('/orders', payload);
        } catch (error) {
            throw this._handleError(error);
        }
    }

    // ── Capture PayPal payment ─────────────────────────────────────────────────
    //
    //  Called after buyer approves in the PayPal popup.
    //  paypalOrderId:  the ID returned by PayPal SDK (from createOrder callback)
    //  orderId:        our internal MongoDB order ID

    async capturePayPalPayment(paypalOrderId, orderId) {
        try {
            return await apiClient.post(`/payments/paypal/capture/${paypalOrderId}`, { orderId });
        } catch (error) {
            throw this._handleError(error);
        }
    }

    // ── Other endpoints ───────────────────────────────────────────────────────

    async getOrderById(orderId) {
        try {
            return await apiClient.get(`/orders/${orderId}`);
        } catch (error) {
            throw this._handleError(error);
        }
    }

    async getSavedAddresses(userId) {
        try {
            return await apiClient.get(`/addresses/${userId}`);
        } catch (error) {
            throw this._handleError(error);
        }
    }

    async validateCoupon(code, subtotal = null) {
        try {
            const qs = new URLSearchParams({ code: String(code || '') });
            if (subtotal != null) qs.set('subtotal', String(subtotal));
            return await apiClient.get(`/coupons/validate?${qs.toString()}`);
        } catch (error) {
            throw this._handleError(error);
        }
    }

    _handleError(error) {
        if (error instanceof ApiError) return error;
        return new ApiError('An unexpected error occurred', 500, error);
    }
}

export default new CheckoutService();
