import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import orderService from '../../services/order.service';
import toast from 'react-hot-toast';

const ORDER_STATUS_VARIANTS = {
    created:   'warning',
    confirmed: 'primary',
    cancelled: 'danger',
    refunded:  'default',
    closed:    'success',
};

const PAYMENT_VARIANTS = {
    pending:  'warning',
    paid:     'success',
    failed:   'danger',
    refunded: 'default',
};

// ── Modal for status update ────────────────────────────────────────────────────
function StatusModal({ order, onClose, onSaved }) {
    const [status,        setStatus]        = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [adminNote,     setAdminNote]     = useState(order.adminNote ?? '');
    const [submitting,    setSubmitting]    = useState(false);

    const handleSave = async () => {
        if (!status && !paymentStatus) return toast.error('Select at least one change');
        setSubmitting(true);
        try {
            const res = await orderService.adminUpdateOrderStatus(order._id, {
                status:        status || undefined,
                paymentStatus: paymentStatus || undefined,
                adminNote:     adminNote || undefined,
            });
            if (res.success) {
                toast.success('Order updated');
                onSaved(res.data.order);
                onClose();
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to update order');
        } finally {
            setSubmitting(false);
        }
    };

    const orderStatusOptions = {
        created:   ['confirmed', 'cancelled'],
        confirmed: ['cancelled', 'closed'],
        cancelled: [],
        refunded:  [],
        closed:    [],
    }[order.status] ?? [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                <h3 className="text-lg font-bold mb-1">Update Order</h3>
                <p className="text-sm text-gray-500 mb-4">{order.orderNumber}</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Order Status</label>
                        <select className="input-field w-full" value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="">— No change —</option>
                            {orderStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Current: {order.status}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Payment Status</label>
                        <select className="input-field w-full" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                            <option value="">— No change —</option>
                            {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                                <option value="paid">Mark as Paid (COD collected)</option>
                            )}
                            <option value="refunded">Refunded</option>
                            <option value="failed">Failed</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Current: {order.paymentStatus}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Admin Note</label>
                        <textarea
                            className="input-field w-full"
                            rows={2}
                            value={adminNote}
                            onChange={e => setAdminNote(e.target.value)}
                            placeholder="Internal note (not shown to customer)"
                        />
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-5">
                    <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} disabled={submitting}>
                        {submitting ? 'Saving…' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminOrders() {
    const [orders,     setOrders]     = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [page,       setPage]       = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total,      setTotal]      = useState(0);

    const [statusFilter,  setStatusFilter]  = useState('');
    const [payFilter,     setPayFilter]     = useState('');
    const [searchQuery,   setSearchQuery]   = useState('');
    const [editingOrder,  setEditingOrder]  = useState(null);

    const LIMIT = 15;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await orderService.getOrders({
                context: 'admin',
                page,
                limit:         LIMIT,
                status:        statusFilter || undefined,
                paymentStatus: payFilter    || undefined,
                search:        searchQuery  || undefined,
            });
            if (res.success) {
                setOrders(res.data.orders);
                setTotal(res.data.total);
                setTotalPages(res.data.totalPages ?? Math.ceil(res.data.total / LIMIT));
            }
        } catch {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, payFilter, searchQuery]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleOrderSaved = (updated) => {
        setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Orders Management</h1>
                    <span className="text-sm text-gray-500">{total} total orders</span>
                </div>

                <Card>
                    {/* Filters */}
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        <input
                            type="text"
                            placeholder="Search by order #..."
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                            className="input-field max-w-xs"
                        />
                        <select className="input-field w-44" value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                            <option value="">All Order Statuses</option>
                            <option value="created">Created</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                            <option value="closed">Closed</option>
                        </select>
                        <select className="input-field w-44" value={payFilter}
                            onChange={e => { setPayFilter(e.target.value); setPage(1); }}>
                            <option value="">All Payment Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="py-16 text-center text-gray-400">Loading orders…</div>
                    ) : orders.length === 0 ? (
                        <div className="py-16 text-center text-gray-400">No orders found.</div>
                    ) : (
                        <Table headers={['Order #', 'Customer', 'Sellers', 'Total', 'Payment', 'Status', 'Date', 'Actions']}>
                            {orders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm font-medium">{order.orderNumber}</td>
                                    <td className="px-4 py-4 text-sm text-gray-600">
                                        {order.isGuest
                                            ? <span className="italic text-gray-400">Guest</span>
                                            : `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim() || order.customer?.email || '—'
                                        }
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                        {(order.subOrder ?? []).length} seller(s)
                                    </td>
                                    <td className="px-4 py-4 text-sm font-semibold">
                                        ${(order.total ?? 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={PAYMENT_VARIANTS[order.paymentStatus] ?? 'default'}>
                                                {order.paymentStatus}
                                            </Badge>
                                            <span className="text-xs text-gray-400 uppercase">{order.paymentMethod}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Badge variant={ORDER_STATUS_VARIANTS[order.status] ?? 'default'}>
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-4 flex gap-2">
                                        <Link to={`/admin/orders/${order._id}`}>
                                            <Button size="sm" variant="ghost">View</Button>
                                        </Link>
                                        <Button size="sm" variant="outline" onClick={() => setEditingOrder(order)}>
                                            Update
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-4">
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    )}
                </Card>
            </div>

            {editingOrder && (
                <StatusModal
                    order={editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onSaved={handleOrderSaved}
                />
            )}
        </AdminLayout>
    );
}
