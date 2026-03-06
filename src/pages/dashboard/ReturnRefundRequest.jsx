import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import dashboardService from '../../services/dashboard.service';
import orderService from '../../services/order.service';

const statusVariant = {
    pending: 'warning',
    approved: 'primary',
    completed: 'success',
    rejected: 'danger',
};

const ReturnRefundRequest = () => {
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const [requests, setRequests] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [disputeLoadingId, setDisputeLoadingId] = useState(null);

    const [form, setForm] = useState({
        orderRef: '',
        requestType: 'return',
        itemKey: '',
        reason: 'defective',
        quantity: 1,
        details: '',
    });

    const [resolvedItem, setResolvedItem] = useState({ itemName: '', sellerId: '' });

    const loadOrders = async () => {
        try {
            setOrdersLoading(true);
            const res = await orderService.getOrders({
                context: 'user',
                page: 1,
                limit: 100,
            });

            if (res.success) {
                setOrders(res.data.orders || []);
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to load your orders');
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadRequests = async () => {
        try {
            const res = await dashboardService.getReturnRequests();
            if (res.success) setRequests(res.data.requests || []);
        } catch (err) {
            toast.error(err?.message || 'Failed to load requests');
        }
    };

    useEffect(() => {
        loadOrders();
        loadRequests();
    }, []);

    const selectedOrder = useMemo(
        () => orders.find((order) => order.orderNumber === form.orderRef) || null,
        [orders, form.orderRef]
    );

    const selectedOrderItems = useMemo(() => {
        if (!selectedOrder?.subOrder?.length) return [];

        return selectedOrder.subOrder.flatMap((sub) =>
            (sub.items || []).map((item, idx) => {
                const productName = item.productId?.name || 'Unknown item';
                const productId = item.productId?._id || item.productId || idx;
                const sellerId = sub.sellerId?._id || sub.sellerId || '';
                const sellerLabel = sub.sellerId?.businessName || `Seller ${String(sellerId).slice(-6)}`;

                return {
                    value: `${sub._id || 'sub'}:${productId}:${idx}`,
                    itemName: productName,
                    sellerId,
                    sellerLabel,
                    maxQuantity: item.quantity || 1,
                    label: `${productName} • Qty ${item.quantity || 1} • ${sellerLabel}`,
                };
            })
        );
    }, [selectedOrder]);

    const selectedItem = useMemo(
        () => selectedOrderItems.find((item) => item.value === form.itemKey) || null,
        [selectedOrderItems, form.itemKey]
    );

    const onOrderChange = (orderRef) => {
        setForm((prev) => ({
            ...prev,
            orderRef,
            itemKey: '',
            quantity: 1,
        }));
        setResolvedItem({ itemName: '', sellerId: '' });
    };

    const onItemChange = (itemKey) => {
        const next = selectedOrderItems.find((item) => item.value === itemKey);
        if (!next) {
            setForm((prev) => ({ ...prev, itemKey: '', quantity: 1 }));
            setResolvedItem({ itemName: '', sellerId: '' });
            return;
        }

        setForm((prev) => ({
            ...prev,
            itemKey,
            quantity: 1,
        }));

        setResolvedItem({
            itemName: next.itemName,
            sellerId: next.sellerId,
        });
    };

    const submitRequest = async () => {
        if (!form.orderRef) {
            toast.error('Please select an order');
            return;
        }
        if (!selectedItem?.itemName || !selectedItem?.sellerId) {
            toast.error('Please select an item from the selected order');
            return;
        }
        if (!Number.isFinite(Number(form.quantity)) || Number(form.quantity) < 1) {
            toast.error('Quantity must be at least 1');
            return;
        }
        if (Number(form.quantity) > Number(selectedItem.maxQuantity || 1)) {
            toast.error(`You can request up to ${selectedItem.maxQuantity} item(s)`);
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                orderRef: form.orderRef,
                sellerId: selectedItem.sellerId,
                itemName: selectedItem.itemName,
                requestType: form.requestType,
                reason: form.reason,
                quantity: Number(form.quantity),
                details: form.details,
            };

            const res = await dashboardService.createReturnRequest(payload);
            if (res.success) {
                setRequests((prev) => [res.data.request, ...prev]);
                setForm({
                    orderRef: '',
                    requestType: 'return',
                    itemKey: '',
                    reason: 'defective',
                    quantity: 1,
                    details: '',
                });
                setResolvedItem({ itemName: '', sellerId: '' });
                toast.success('Request submitted');
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const raiseDispute = async (request) => {
        try {
            setDisputeLoadingId(request._id);
            const res = await dashboardService.createReturnRequestDispute(request._id, {
                reason: request.details || request.reason,
            });
            if (res.success) {
                toast.success(`Dispute ${res.data.dispute.disputeNumber} submitted`);
                await loadRequests();
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to raise dispute');
        } finally {
            setDisputeLoadingId(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Return & Refund Requests</h1>

                <Card>
                    <h2 className="text-xl font-bold mb-4">New Request</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Select your order and item. We auto-fill seller and item details for a faster request.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                            <select
                                className="input-field"
                                value={form.orderRef}
                                onChange={(e) => onOrderChange(e.target.value)}
                                disabled={ordersLoading}
                            >
                                <option value="">{ordersLoading ? 'Loading orders...' : 'Select an order'}</option>
                                {orders.map((order) => {
                                    const itemsCount = (order.subOrder || []).reduce(
                                        (sum, sub) => sum + ((sub.items || []).length),
                                        0
                                    );
                                    return (
                                        <option key={order._id} value={order.orderNumber}>
                                            {order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()} • {itemsCount} items
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
                            <select
                                className="input-field"
                                value={form.itemKey}
                                onChange={(e) => onItemChange(e.target.value)}
                                disabled={!selectedOrder}
                            >
                                <option value="">{selectedOrder ? 'Select an item' : 'Select order first'}</option>
                                {selectedOrderItems.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                            <select
                                className="input-field"
                                value={form.requestType}
                                onChange={(e) => setForm((prev) => ({ ...prev, requestType: e.target.value }))}
                            >
                                <option value="return">Return Item</option>
                                <option value="refund">Refund</option>
                                <option value="exchange">Exchange</option>
                            </select>
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                            <select
                                className="input-field"
                                value={form.reason}
                                onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                            >
                                <option value="defective">Defective / Not as described</option>
                                <option value="wrong">Wrong item received</option>
                                <option value="changed">Changed my mind</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="w-full md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                            <select
                                className="input-field"
                                value={String(form.quantity)}
                                onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                                disabled={!selectedItem}
                            >
                                {!selectedItem ? (
                                    <option value="1">Select item first</option>
                                ) : (
                                    Array.from({ length: Number(selectedItem.maxQuantity || 1) }, (_, i) => i + 1).map((qty) => (
                                        <option key={qty} value={qty}>{qty}</option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {selectedItem && (
                        <div className="mb-4 rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-700">
                            <p><span className="font-medium">Item:</span> {resolvedItem.itemName}</p>
                            <p><span className="font-medium">Seller:</span> {selectedItem.sellerLabel}</p>
                        </div>
                    )}

                    <Textarea
                        label="Additional details (optional)"
                        rows={4}
                        value={form.details}
                        onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
                    />

                    <div className="mt-4">
                        <Button variant="primary" onClick={submitRequest} disabled={submitting || !orders.length}>
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold mb-6">My Requests</h2>
                    <Table headers={['Request #', 'Order ID', 'Item', 'Type', 'Status', 'Date', 'Actions']}>
                        {requests.map((req) => (
                            <tr key={req._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{req.requestNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{req.orderRef}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.itemName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{req.requestType}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant={statusVariant[req.status] || 'default'}>{req.status}</Badge>
                                    {req.isDisputed && <Badge variant="danger" className="ml-2">disputed</Badge>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {req.status === 'rejected' && !req.isDisputed ? (
                                        <Button
                                            variant="outline"
                                            className="text-sm px-3 py-1"
                                            onClick={() => raiseDispute(req)}
                                            disabled={disputeLoadingId === req._id}
                                        >
                                            {disputeLoadingId === req._id ? 'Submitting...' : 'Raise Dispute'}
                                        </Button>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </Table>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ReturnRefundRequest;
