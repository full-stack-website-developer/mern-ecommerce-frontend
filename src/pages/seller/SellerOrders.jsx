// import { useEffect, useMemo, useState } from 'react';
// import toast from 'react-hot-toast';
// import SellerLayout from '../../components/layout/SellerLayout';
// import Card from '../../components/common/Card';
// import Badge from '../../components/common/Badge';
// import Button from '../../components/common/Button';
// import Table from '../../components/common/Table';
// import FullPageLoader from '../../components/common/FullPageLoader';
// import orderService from '../../services/order.service';

// const STATUS_VARIANTS = {
//   unfulfilled: 'warning',
//   packed: 'primary',
//   shipped: 'info',
//   delivered: 'success',
//   returned: 'default',
//   cancelled: 'danger',
// };

// const FULFILLMENT_FILTERS = [
//   { label: 'All', value: '' },
//   { label: 'Unfulfilled', value: 'unfulfilled' },
//   { label: 'Packed', value: 'packed' },
//   { label: 'Shipped', value: 'shipped' },
//   { label: 'Delivered', value: 'delivered' },
//   { label: 'Cancelled', value: 'cancelled' },
// ];

// const SellerOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [ordersLoading, setOrdersLoading] = useState(true);
//   const [actionLoadingOrderId, setActionLoadingOrderId] = useState(null);
//   const [statusFilter, setStatusFilter] = useState('');

//   const fetchOrders = async (fulfillmentStatus = '') => {
//     setOrdersLoading(true);
//     try {
//       const res = await orderService.getOrders({
//         page: 1,
//         limit: 50,
//         fulfillmentStatus,
//       });

//       if (res.success) {
//         setOrders(res.data.orders || []);
//       }
//     } catch (err) {
//       toast.error(err.message || 'Failed to fetch seller orders');
//     } finally {
//       setOrdersLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders(statusFilter);
//   }, [statusFilter]);

//   const sortedOrders = useMemo(
//     () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
//     [orders]
//   );

//   const runFulfillmentAction = async (order, nextStatus) => {
//     setActionLoadingOrderId(order._id);
//     try {
//       const payload = { status: nextStatus };

//       if (nextStatus === 'shipped') {
//         const trackingNumber = window.prompt('Enter tracking number');
//         if (!trackingNumber) return;

//         const carrier = window.prompt('Enter carrier (optional)') || '';
//         payload.trackingNumber = trackingNumber.trim();
//         payload.carrier = carrier.trim();
//       }

//       const res = await orderService.updateFulfillmentStatus(order._id, payload);
//       if (!res.success) {
//         throw new Error('Failed to update fulfillment status');
//       }

//       setOrders((prev) =>
//         prev.map((o) => (o._id === order._id ? res.data.order : o))
//       );
//       toast.success(`Order moved to ${nextStatus}`);
//     } catch (err) {
//       toast.error(err.message || 'Action failed');
//     } finally {
//       setActionLoadingOrderId(null);
//     }
//   };

//   const renderActions = (order) => {
//     const isBusy = actionLoadingOrderId === order._id;

//     if (order.subOrderStatus === 'unfulfilled') {
//       return (
//         <div className="flex gap-2">
//           <Button size="sm" disabled={isBusy} onClick={() => runFulfillmentAction(order, 'packed')}>
//             Pack
//           </Button>
//           <Button size="sm" variant="danger" disabled={isBusy} onClick={() => runFulfillmentAction(order, 'cancelled')}>
//             Cancel
//           </Button>
//         </div>
//       );
//     }

//     if (order.subOrderStatus === 'packed') {
//       return (
//         <div className="flex gap-2">
//           <Button size="sm" disabled={isBusy} onClick={() => runFulfillmentAction(order, 'shipped')}>
//             Ship
//           </Button>
//           <Button size="sm" variant="danger" disabled={isBusy} onClick={() => runFulfillmentAction(order, 'cancelled')}>
//             Cancel
//           </Button>
//         </div>
//       );
//     }

//     if (order.subOrderStatus === 'shipped') {
//       return (
//         <Button size="sm" disabled={isBusy} onClick={() => runFulfillmentAction(order, 'delivered')}>
//           Mark Delivered
//         </Button>
//       );
//     }

//     return <span className="text-xs text-gray-500">No actions</span>;
//   };

//   if (ordersLoading) return <FullPageLoader />;

//   return (
//     <SellerLayout>
//       <div className="space-y-6">
//         <h1 className="text-3xl font-bold">My Orders</h1>

//         <Card>
//           <div className="mb-6 flex items-center justify-between">
//             <p className="text-sm text-gray-500">Manage packing, shipping, and delivery updates for your orders.</p>
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="input-field w-52"
//             >
//               {FULFILLMENT_FILTERS.map((filter) => (
//                 <option key={filter.value || 'all'} value={filter.value}>
//                   {filter.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <Table headers={['Order #', 'Customer', 'Items', 'Amount', 'Payment', 'Fulfillment', 'Tracking', 'Date', 'Actions']}>
//             {sortedOrders.map((order) => (
//               <tr key={order._id}>
//                 <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
//                 <td className="px-6 py-4 text-sm">{order.customer?.name || 'Guest'}</td>
//                 <td className="px-6 py-4 text-sm">{order.items.length} items</td>
//                 <td className="px-6 py-4 font-semibold">${order.total.toFixed(2)}</td>
//                 <td className="px-6 py-4 text-sm">
//                   <span className="uppercase">{order.paymentMethod}</span>
//                   <span className="ml-2 text-xs text-gray-500">({order.paymentStatus})</span>
//                 </td>
//                 <td className="px-6 py-4">
//                   <Badge variant={STATUS_VARIANTS[order.subOrderStatus] || 'default'}>
//                     {order.subOrderStatus}
//                   </Badge>
//                 </td>
//                 <td className="px-6 py-4 text-xs text-gray-600">
//                   {order.trackingNumber || '-'}
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
//                 <td className="px-6 py-4">{renderActions(order)}</td>
//               </tr>
//             ))}
//           </Table>
//         </Card>
//       </div>
//     </SellerLayout>
//   );
// };

// export default SellerOrders;


import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../components/layout/SellerLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import FullPageLoader from '../../components/common/FullPageLoader';
import orderService from '../../services/order.service';
import toast from 'react-hot-toast';

const FULFILLMENT_VARIANTS = {
    unfulfilled: 'warning',
    packed:      'primary',
    shipped:     'info',
    delivered:   'success',
    cancelled:   'danger',
    returned:    'danger',
};

const PAYMENT_VARIANTS = {
    pending:  'warning',
    paid:     'success',
    failed:   'danger',
    refunded: 'default',
};

export default function SellerOrders() {
    const [orders, setOrders]     = useState([]);
    const [loading, setLoading]   = useState(true);
    const [page, setPage]         = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal]       = useState(0);

    // Filters
    const [statusFilter, setStatusFilter]   = useState('');
    const [searchQuery,  setSearchQuery]    = useState('');

    const LIMIT = 10;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await orderService.getOrders({
                context: 'seller',
                page,
                limit: LIMIT,
                fulfillmentStatus: statusFilter || undefined,
                search: searchQuery || undefined,
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
    }, [page, statusFilter, searchQuery]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // Reset page when filter changes
    const handleFilterChange = (val) => { setStatusFilter(val); setPage(1); };

    return (
        <SellerLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Orders</h1>
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
                        <select
                            className="input-field w-44"
                            value={statusFilter}
                            onChange={e => handleFilterChange(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="unfulfilled">Unfulfilled</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="py-16 text-center text-gray-400">Loading orders…</div>
                    ) : orders.length === 0 ? (
                        <div className="py-16 text-center text-gray-400">No orders found.</div>
                    ) : (
                        <Table headers={['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Fulfillment', 'Date', 'Actions']}>
                            {orders.map(order => {
                                const sub = order.subOrder;
                                const fulfillment = sub?.fulfillmentStatus ?? 'unfulfilled';
                                return (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-sm">{order.orderNumber}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {order.isGuest
                                                ? <span className="italic text-gray-400">Guest</span>
                                                : `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim() || '—'
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-sm">{(sub?.items ?? []).length} item(s)</td>
                                        <td className="px-6 py-4 font-semibold text-sm">${(sub?.total ?? 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={PAYMENT_VARIANTS[order.paymentStatus] ?? 'default'}>
                                                {order.paymentStatus}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={FULFILLMENT_VARIANTS[fulfillment] ?? 'default'}>
                                                {fulfillment}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/seller/orders/${order._id}`}>
                                                <Button size="sm" variant="ghost">View</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </Table>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </Card>
            </div>
        </SellerLayout>
    );
}
