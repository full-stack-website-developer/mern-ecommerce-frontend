import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SellerLayout from '../../components/layout/SellerLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FullPageLoader from '../../components/common/FullPageLoader';
import orderService from '../../services/order.service';
import toast from 'react-hot-toast';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    unfulfilled: { label: 'Unfulfilled', color: 'warning',  next: ['packed'] },
    packed:      { label: 'Packed',      color: 'primary',  next: ['shipped'] },
    shipped:     { label: 'Shipped',     color: 'info',     next: ['delivered'] },
    delivered:   { label: 'Delivered',   color: 'success',  next: [] },
    cancelled:   { label: 'Cancelled',   color: 'danger',   next: [] },
    returned:    { label: 'Returned',    color: 'danger',   next: [] },
};

const PAYMENT_STATUS_CONFIG = {
    pending:  { label: 'Pending',  color: 'warning' },
    paid:     { label: 'Paid',     color: 'success' },
    failed:   { label: 'Failed',   color: 'danger' },
    refunded: { label: 'Refunded', color: 'default' },
};

// ─── Timeline dot ─────────────────────────────────────────────────────────────
const TimelineDot = ({ active }) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
        ${active ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
        {active ? '✓' : ''}
    </div>
);

const TIMELINE = ['unfulfilled', 'packed', 'shipped', 'delivered'];

export default function SellerOrderDetail() {
    const { orderId } = useParams();
    const navigate    = useNavigate();
    const [order, setOrder]   = useState(null);
    const [loading, setLoading] = useState(true);

    // Fulfillment modal state
    const [showModal, setShowModal] = useState(false);
    const [nextStatus, setNextStatus] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier]   = useState('');
    const [sellerNote, setSellerNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await orderService.getOrderById(orderId);
            if (res.success) setOrder(res.data.order);
        } catch {
            toast.error('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrder(); }, [orderId]);

    const openModal = (status) => {
        setNextStatus(status);
        setTrackingNumber('');
        setCarrier('');
        setSellerNote('');
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!order?.subOrder?._id) return;
        setSubmitting(true);
        try {
            const res = await orderService.updateFulfillment(
                order._id,
                order.subOrder._id,
                {
                    fulfillmentStatus: nextStatus,
                    trackingNumber:    nextStatus === 'shipped' ? trackingNumber : undefined,
                    carrier:           nextStatus === 'shipped' ? carrier : undefined,
                    sellerNote:        sellerNote || undefined,
                }
            );
            if (res.success) {
                toast.success(`Status updated to ${nextStatus}`);
                setOrder(res.data.order);
                setShowModal(false);
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to update status');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <FullPageLoader />;
    if (!order)  return (
        <SellerLayout>
            <div className="text-center py-20 text-gray-500">Order not found.</div>
        </SellerLayout>
    );

    const sub = order.subOrder;
    const fulfillment = sub?.fulfillmentStatus ?? 'unfulfilled';
    const statusConf  = STATUS_CONFIG[fulfillment] ?? STATUS_CONFIG.unfulfilled;
    const payConf     = PAYMENT_STATUS_CONFIG[order.paymentStatus] ?? PAYMENT_STATUS_CONFIG.pending;
    const nextStatuses = statusConf.next;

    const timelineIdx = TIMELINE.indexOf(fulfillment);

    return (
        <SellerLayout>
            <div className="space-y-6 max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={() => navigate('/seller/orders')}
                            className="text-sm text-gray-500 hover:text-gray-800 mb-1 flex items-center gap-1">
                            ← Back to Orders
                        </button>
                        <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
                        <p className="text-sm text-gray-500">
                            Placed {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <Badge variant={payConf.color}>{payConf.label} ({order.paymentMethod?.toUpperCase()})</Badge>
                        <Badge variant={statusConf.color} className="text-sm px-3 py-1">{statusConf.label}</Badge>
                    </div>
                </div>

                {/* Fulfillment Timeline */}
                <Card>
                    <h2 className="font-semibold text-lg mb-4">Fulfillment Progress</h2>
                    <div className="flex items-center gap-0">
                        {TIMELINE.map((step, i) => {
                            const done    = i <= timelineIdx;
                            return (
                                <div key={step} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center">
                                        <TimelineDot active={done} />
                                        <span className={`text-xs mt-1 capitalize ${done ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                                            {STATUS_CONFIG[step]?.label}
                                        </span>
                                    </div>
                                    {i < TIMELINE.length - 1 && (
                                        <div className={`flex-1 h-1 mx-2 rounded ${i < timelineIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Tracking info */}
                    {sub?.trackingNumber && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                            <span className="font-medium text-blue-700">Tracking: </span>
                            <span className="text-blue-600">{sub.trackingNumber}</span>
                            {sub.carrier && <span className="text-gray-500 ml-2">via {sub.carrier}</span>}
                        </div>
                    )}

                    {/* Action buttons */}
                    {nextStatuses.length > 0 && order.status !== 'cancelled' && (
                        <div className="mt-4 flex gap-3">
                            {nextStatuses.map(s => (
                                <Button
                                    key={s}
                                    variant={s === 'cancelled' ? 'danger' : 'primary'}
                                    onClick={() => openModal(s)}
                                >
                                    Mark as {STATUS_CONFIG[s]?.label}
                                </Button>
                            ))}
                        </div>
                    )}

                    {order.status === 'cancelled' && (
                        <div className="mt-4 p-3 bg-red-50 rounded text-sm text-red-600 font-medium">
                            This order has been cancelled.
                        </div>
                    )}
                </Card>

                {/* Order Items */}
                <Card>
                    <h2 className="font-semibold text-lg mb-4">Your Items</h2>
                    <div className="divide-y">
                        {(sub?.items ?? []).map((item, i) => {
                            const prod = item.productId;
                            return (
                                <div key={i} className="flex items-center gap-4 py-4">
                                    <img
                                        src={prod?.mainImage || 'https://via.placeholder.com/80'}
                                        alt={prod?.name}
                                        className="w-16 h-16 rounded-lg object-cover border"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{prod?.name ?? 'Product'}</p>
                                        {item.variantId?.options && (
                                            <p className="text-xs text-gray-500">
                                                {Object.entries(item.variantId.options ?? {})
                                                    .map(([k, v]) => `${k}: ${v}`).join(', ')}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Order Summary + Shipping Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <h2 className="font-semibold text-lg mb-3">Shipping Address</h2>
                        {order.shippingAddress && (
                            <div className="text-sm text-gray-700 space-y-1">
                                <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                <p>{order.shippingAddress.phone}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <h2 className="font-semibold text-lg mb-3">Order Totals</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span>${(sub?.subtotal ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tax (10%)</span>
                                <span>${(sub?.tax ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-bold">
                                <span>Your Total</span>
                                <span>${(sub?.total ?? 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Customer info */}
                <Card>
                    <h2 className="font-semibold text-lg mb-3">Customer</h2>
                    <div className="text-sm text-gray-700">
                        {order.isGuest ? (
                            <p>Guest: {order.customer?.email}</p>
                        ) : (
                            <>
                                <p className="font-medium">{order.customer?.firstName} {order.customer?.lastName}</p>
                                <p className="text-gray-500">{order.customer?.email}</p>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            {/* ── Fulfillment Modal ─────────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">
                            Confirm: Mark as <span className="capitalize">{nextStatus}</span>
                        </h3>

                        {nextStatus === 'shipped' && (
                            <div className="space-y-3 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Tracking Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={trackingNumber}
                                        onChange={e => setTrackingNumber(e.target.value)}
                                        className="input-field w-full"
                                        placeholder="e.g. TRK-123456789"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Carrier (optional)</label>
                                    <input
                                        value={carrier}
                                        onChange={e => setCarrier(e.target.value)}
                                        className="input-field w-full"
                                        placeholder="e.g. TCS, Leopards, DHL"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Note (optional)</label>
                            <textarea
                                value={sellerNote}
                                onChange={e => setSellerNote(e.target.value)}
                                className="input-field w-full"
                                rows={2}
                                placeholder="Any note for the customer..."
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button
                                variant={nextStatus === 'cancelled' ? 'danger' : 'primary'}
                                onClick={handleSubmit}
                                disabled={submitting || (nextStatus === 'shipped' && !trackingNumber)}
                            >
                                {submitting ? 'Updating…' : `Confirm ${STATUS_CONFIG[nextStatus]?.label}`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
}
