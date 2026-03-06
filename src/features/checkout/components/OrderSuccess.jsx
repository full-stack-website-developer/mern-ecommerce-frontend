import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useCheckout from '../hooks/useCheckout';
import checkoutService from '../../../services/checkout.service';
import MainLayout from '../../../components/layout/MainLayout';

const PAYMENT_LABELS = {
    cod:    '💵 Cash on Delivery',
    stripe: '💳 Credit / Debit Card',
    paypal: '🅿️ PayPal',
};

const OrderSuccessPage = () => {
    const { state, resetCheckout } = useCheckout();
    const [searchParams] = useSearchParams();

    const [order,   setOrder  ] = useState(state.placedOrder || null);
    const [loading, setLoading] = useState(!state.placedOrder);
    const [error,   setError  ] = useState(null);

    const orderIdFromUrl = searchParams.get('orderId');

    // ── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (state.placedOrder) {
            setLoading(false);
            return;
        }

        if (!orderIdFromUrl) {
            setError('No order information found.');
            setLoading(false);
            return;
        }

        checkoutService.getOrderById(orderIdFromUrl)
            .then(res => setOrder(res.data?.order))
            .catch(() => setError('Could not load order details. Please check your email.'))
            .finally(() => setLoading(false));
    }, [orderIdFromUrl]);

    // ── Poll once after 3s for Stripe webhook to update paymentStatus ─────────
    // The success page renders before Stripe's webhook fires and updates the DB.
    // One re-fetch after a short delay is enough to show the correct "Paid" status.
    useEffect(() => {
        if (!order?._id) return;
        if (order.paymentMethod !== 'stripe') return;
        if (order.paymentStatus === 'paid') return;   // already paid, no need

        const timer = setTimeout(async () => {
            try {
                const res = await checkoutService.getOrderById(order._id);
                setOrder(res.data?.order);
            } catch(err) {
                console.log(err)
                // silent — worst case it stays "pending" and user can refresh
            }
        }, 3000); // 3 seconds is enough for the webhook round-trip locally

        return () => clearTimeout(timer);
    }, [order?._id, order?.paymentStatus]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent
                                        rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Confirming your payment...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }


    return (
        <div className="max-w-lg mx-auto py-12 px-4 text-center">

            <div className="text-7xl mb-4">{error ? '❌' : '🎉'}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {error ? 'Something went wrong' : 'Order Confirmed!'}
            </h1>

            {error ? (
                <p className="text-red-500 mb-6">{error}</p>
            ) : (
                <p className="text-gray-500 mb-6">
                    Thank you for your order! A confirmation has been sent to your email.
                </p>
            )}

            {order && (
                <>
                    <div className="bg-blue-50 rounded-xl p-4 mb-5">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Order Number</p>
                        <p className="text-2xl font-bold text-blue-600">{order.orderNumber}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 text-left text-sm mb-6 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total</span>
                            <span className="font-bold text-gray-900">${order.total?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Payment Method</span>
                            <span className="font-medium text-gray-700">
                                {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Payment Status</span>
                            {order.paymentStatus === 'paid' ? (
                                <span className="text-green-600 font-medium">✅ Paid</span>
                            ) : order.paymentStatus === 'failed' ? (
                                <span className="text-red-600 font-medium">❌ Failed</span>
                            ) : (
                                <span className="text-yellow-600 font-medium flex items-center gap-1.5">
                                    <span className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin inline-block" />
                                    Confirming...
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Shipping</span>
                            <span className="capitalize text-gray-700">{order.shippingMethod}</span>
                        </div>
                    </div>

                    {order.paymentMethod === 'cod' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 mb-5 text-left">
                            <p className="font-medium">💵 Cash on Delivery</p>
                            <p>Please have the exact amount ready when your order arrives.</p>
                        </div>
                    )}
                </>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {order?._id && (
                    <Link
                        to={`/orders/${order._id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white
                                    font-semibold py-3 px-6 rounded-lg transition"
                    >
                        Track My Order
                    </Link>
                )}
                <Link
                    to="/products"
                    onClick={resetCheckout}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700
                                font-semibold py-3 px-6 rounded-lg transition"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;