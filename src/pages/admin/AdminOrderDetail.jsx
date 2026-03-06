import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FullPageLoader from '../../components/common/FullPageLoader';
import orderService from '../../services/order.service';
import toast from 'react-hot-toast';

const ORDER_STATUS_VARIANTS = {
    created: 'warning', confirmed: 'primary', cancelled: 'danger', refunded: 'default', closed: 'success',
};
const PAYMENT_VARIANTS = {
    pending: 'warning', paid: 'success', failed: 'danger', refunded: 'default',
};
const FULFILLMENT_VARIANTS = {
    unfulfilled: 'warning', packed: 'primary', shipped: 'info', delivered: 'success', cancelled: 'danger',
};

export default function AdminOrderDetail() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [order, setOrder]     = useState(null);
    const [loading, setLoading] = useState(true);

    // Update modal
    const [showModal,    setShowModal]    = useState(false);
    const [newStatus,    setNewStatus]    = useState('');
    const [newPayStatus, setNewPayStatus] = useState('');
    const [adminNote,    setAdminNote]    = useState('');
    const [submitting,   setSubmitting]   = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await orderService.getOrderById(id);
                if (res.success) setOrder(res.data.order);
            } catch { toast.error('Failed to load order'); }
            finally { setLoading(false); }
        })();
    }, [id]);

    const openModal = () => {
        setNewStatus('');
        setNewPayStatus('');
        setAdminNote(order?.adminNote ?? '');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!newStatus && !newPayStatus) return toast.error('Select at least one change');
        setSubmitting(true);
        try {
            const res = await orderService.adminUpdateOrderStatus(order._id, {
                status:        newStatus    || undefined,
                paymentStatus: newPayStatus || undefined,
                adminNote:     adminNote    || undefined,
            });
            if (res.success) {
                toast.success('Order updated');
                setOrder(res.data.order);
                setShowModal(false);
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to update');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <FullPageLoader />;
    if (!order)  return <AdminLayout><div className="text-center py-20 text-gray-500">Order not found.</div></AdminLayout>;

    const nextOrderStatuses = {
        created:   ['confirmed', 'cancelled'],
        confirmed: ['cancelled', 'closed'],
        cancelled: [], refunded: [], closed: [],
    }[order.status] ?? [];

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={() => navigate('/admin/orders')}
                            className="text-sm text-gray-500 hover:text-gray-800 mb-1">
                            ← Back to Orders
                        </button>
                        <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <Badge variant={PAYMENT_VARIANTS[order.paymentStatus]}>{order.paymentStatus}</Badge>
                        <Badge variant={ORDER_STATUS_VARIANTS[order.status]} className="text-sm px-3 py-1">{order.status}</Badge>
                        {nextOrderStatuses.length > 0 && (
                            <Button variant="primary" onClick={openModal}>Update Status</Button>
                        )}
                    </div>
                </div>

                {/* Customer + Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <h3 className="font-semibold mb-2 text-sm text-gray-500 uppercase">Customer</h3>
                        {order.isGuest ? (
                            <p className="text-sm italic text-gray-400">Guest: {order.customer?.email}</p>
                        ) : (
                            <div className="text-sm">
                                <p className="font-medium">{order.customer?.firstName} {order.customer?.lastName}</p>
                                <p className="text-gray-500">{order.customer?.email}</p>
                            </div>
                        )}
                    </Card>
                    <Card>
                        <h3 className="font-semibold mb-2 text-sm text-gray-500 uppercase">Payment</h3>
                        <p className="text-sm uppercase font-medium">{order.paymentMethod}</p>
                        <Badge variant={PAYMENT_VARIANTS[order.paymentStatus]} className="mt-1">{order.paymentStatus}</Badge>
                        {order.gatewayTransactionId && (
                            <p className="text-xs text-gray-400 mt-1 truncate">{order.gatewayTransactionId}</p>
                        )}
                    </Card>
                    <Card>
                        <h3 className="font-semibold mb-2 text-sm text-gray-500 uppercase">Totals</h3>
                        <div className="text-sm space-y-1">
                            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${(order.subtotal ?? 0).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>${(order.tax ?? 0).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>${(order.shippingCost ?? 0).toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold border-t pt-1"><span>Total</span><span>${(order.total ?? 0).toFixed(2)}</span></div>
                        </div>
                    </Card>
                </div>

                {/* Sub-orders per seller */}
                <Card>
                    <h2 className="font-semibold text-lg mb-4">Sub-Orders by Seller</h2>
                    <div className="space-y-6">
                        {(order.subOrder ?? []).map((sub, idx) => (
                            <div key={sub._id ?? idx} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-sm">
                                        Seller: {sub.sellerId?.businessName ?? String(sub.sellerId).slice(-8)}
                                    </h3>
                                    <Badge variant={FULFILLMENT_VARIANTS[sub.fulfillmentStatus] ?? 'default'}>
                                        {sub.fulfillmentStatus}
                                    </Badge>
                                </div>
                                {sub.trackingNumber && (
                                    <p className="text-xs text-blue-600 mb-2">
                                        📦 {sub.trackingNumber} {sub.carrier ? `(${sub.carrier})` : ''}
                                    </p>
                                )}
                                <div className="divide-y">
                                    {(sub.items ?? []).map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2">
                                            <img src={item.productId?.mainImage || 'https://via.placeholder.com/50'}
                                                className="w-10 h-10 rounded object-cover border" alt="" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{item.productId?.name ?? 'Product'}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-semibold">${(sub.total ?? 0).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Shipping Address */}
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

                {/* Admin note */}
                {order.adminNote && (
                    <Card>
                        <h2 className="font-semibold text-lg mb-2">Admin Note</h2>
                        <p className="text-sm text-gray-600">{order.adminNote}</p>
                    </Card>
                )}
            </div>

            {/* Status Update Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Update Order {order.orderNumber}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Order Status</label>
                                <select className="input-field w-full" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                    <option value="">— No change (current: {order.status}) —</option>
                                    {nextOrderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Status</label>
                                <select className="input-field w-full" value={newPayStatus} onChange={e => setNewPayStatus(e.target.value)}>
                                    <option value="">— No change (current: {order.paymentStatus}) —</option>
                                    {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && <option value="paid">Mark COD as Paid</option>}
                                    <option value="refunded">Refunded</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Admin Note</label>
                                <textarea className="input-field w-full" rows={2} value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)} placeholder="Internal note..." />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end mt-5">
                            <Button variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
                            <Button variant="primary" onClick={handleSave} disabled={submitting}>
                                {submitting ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}