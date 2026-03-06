// import { useEffect, useMemo, useState } from 'react';
// import { Link } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Badge from '../../components/common/Badge';
// import Button from '../../components/common/Button';
// import Table from '../../components/common/Table';
// import FullPageLoader from '../../components/common/FullPageLoader';
// import orderService from '../../services/order.service';

// const STATUS_VARIANTS = {
//   created: 'warning',
//   confirmed: 'primary',
//   cancelled: 'danger',
//   refunded: 'default',
//   closed: 'success',
// };

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [statusFilter, setStatusFilter] = useState('');

//   useEffect(() => {
//     const fetchOrders = async () => {
//       setLoading(true);
//       try {
//         const res = await orderService.getOrders({ page: 1, limit: 50, status: statusFilter });
//         if (res.success) {
//           setOrders(res.data.orders || []);
//         }
//       } catch (err) {
//         toast.error(err.message || 'Failed to fetch orders');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [statusFilter]);

//   const sortedOrders = useMemo(
//     () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
//     [orders]
//   );

//   if (loading) return <FullPageLoader />;

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <h1 className="text-3xl font-bold">My Orders</h1>

//         <Card>
//           <div className="mb-6 flex items-center justify-between">
//             <h2 className="text-xl font-bold">Order History</h2>
//             <select className="input-field w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//               <option value="">All Orders</option>
//               <option value="created">created</option>
//               <option value="confirmed">confirmed</option>
//               <option value="closed">closed</option>
//               <option value="cancelled">cancelled</option>
//               <option value="refunded">refunded</option>
//             </select>
//           </div>

//           <Table headers={['Order #', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions']}>
//             {sortedOrders.map((order) => {
//               const itemCount = (order.subOrder || []).reduce((sum, sub) => sum + (sub.items?.length || 0), 0);
//               return (
//                 <tr key={order._id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.orderNumber}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{itemCount} items</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${order.total.toFixed(2)}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.paymentStatus}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <Badge variant={STATUS_VARIANTS[order.status] || 'default'}>{order.status}</Badge>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <Link to={`/orders/${order._id}`}>
//                       <Button variant="ghost" className="text-sm">
//                         View Details
//                       </Button>
//                     </Link>
//                   </td>
//                 </tr>
//               );
//             })}
//           </Table>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default Orders;

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import orderService from '../../services/order.service';
import toast from 'react-hot-toast';

const ORDER_STATUS_VARIANTS = {
    created: 'warning', confirmed: 'primary', cancelled: 'danger', refunded: 'default', closed: 'success',
};

export default function Orders() {
    const [orders,     setOrders]     = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [page,       setPage]       = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const LIMIT = 10;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await orderService.getOrders({ context: 'user', page, limit: LIMIT, status: statusFilter || undefined });
            if (res.success) {
                setOrders(res.data.orders);
                setTotalPages(res.data.totalPages ?? Math.ceil(res.data.total / LIMIT));
            }
        } catch { toast.error('Failed to load orders'); }
        finally   { setLoading(false); }
    }, [page, statusFilter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Orders</h1>
                    <select className="input-field w-44" value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                        <option value="">All Orders</option>
                        <option value="created">Created</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="closed">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <Card>
                    {loading ? (
                        <div className="py-16 text-center text-gray-400">Loading…</div>
                    ) : orders.length === 0 ? (
                        <div className="py-16 text-center text-gray-400">No orders yet.</div>
                    ) : (
                        <Table headers={['Order #', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions']}>
                            {orders.map(order => {
                                const itemCount = (order.subOrder ?? []).reduce((sum, s) => sum + (s.items?.length ?? 0), 0);
                                return (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium">{order.orderNumber}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">{itemCount} item(s)</td>
                                        <td className="px-6 py-4 text-sm font-semibold">${(order.total ?? 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm uppercase text-gray-500">{order.paymentMethod}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={ORDER_STATUS_VARIANTS[order.status] ?? 'default'}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/orders/${order._id}`}>
                                                <Button variant="ghost" size="sm">View Details</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </Table>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-4">
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}