// import { useEffect, useMemo, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Badge from '../../components/common/Badge';
// import Button from '../../components/common/Button';
// import checkoutService from '../../services/checkout.service';
// import FullPageLoader from '../../components/common/FullPageLoader';

// const GLOBAL_STATUS_VARIANTS = {
//   created: 'warning',
//   confirmed: 'primary',
//   cancelled: 'danger',
//   refunded: 'default',
//   closed: 'success',
// };

// const FULFILLMENT_VARIANTS = {
//   unfulfilled: 'warning',
//   packed: 'primary',
//   shipped: 'info',
//   delivered: 'success',
//   returned: 'default',
//   cancelled: 'danger',
// };

// const OrderDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrder = async () => {
//       setLoading(true);
//       try {
//         const res = await checkoutService.getOrderById(id);
//         if (res.success) {
//           setOrder(res.data.order);
//         }
//       } catch (err) {
//         toast.error(err.message || 'Could not load order details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrder();
//   }, [id]);

//   const lineItems = useMemo(() => {
//     if (!order?.subOrder) return [];
//     return order.subOrder.flatMap((sub) =>
//       (sub.items || []).map((item) => ({
//         ...item,
//         fulfillmentStatus: sub.fulfillmentStatus,
//       }))
//     );
//   }, [order]);

//   if (loading) return <FullPageLoader />;
//   if (!order) {
//     return (
//       <DashboardLayout>
//         <div className="text-center py-16 text-gray-500">Order not found.</div>
//       </DashboardLayout>
//     );
//   }

//   const shippingAddress = order.shippingAddress || {};

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h1 className="text-3xl font-bold">Order Details</h1>
//           <Button variant="outline" onClick={() => navigate('/orders')}>Back to Orders</Button>
//         </div>

//         <Card>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <h3 className="font-semibold mb-2">Order Information</h3>
//               <p className="text-sm text-gray-600">Order #: {order.orderNumber}</p>
//               <p className="text-sm text-gray-600">Date: {new Date(order.createdAt).toLocaleString()}</p>
//               <p className="text-sm text-gray-600">Payment: {order.paymentMethod} ({order.paymentStatus})</p>
//             </div>

//             <div>
//               <h3 className="font-semibold mb-2">Order Status</h3>
//               <Badge variant={GLOBAL_STATUS_VARIANTS[order.status] || 'default'}>
//                 {order.status}
//               </Badge>
//             </div>

//             <div>
//               <h3 className="font-semibold mb-2">Shipping Method</h3>
//               <p className="text-sm text-gray-600 capitalize">{order.shippingMethod}</p>
//               <p className="text-sm text-gray-600">Shipping Cost: ${order.shippingCost?.toFixed(2)}</p>
//             </div>
//           </div>
//         </Card>

//         <Card>
//           <h2 className="text-xl font-bold mb-4">Fulfillment</h2>
//           <div className="space-y-2">
//             {(order.subOrder || []).map((sub) => {
//               const sellerId = String(sub.sellerId || 'unknown');
//               return (
//                 <div key={sellerId} className="border rounded-lg p-3 flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-500">Seller #{sellerId.slice(-6)}</p>
//                     <p className="text-xs text-gray-500">Tracking: {sub.trackingNumber || '-'}</p>
//                   </div>
//                   <Badge variant={FULFILLMENT_VARIANTS[sub.fulfillmentStatus] || 'default'}>
//                     {sub.fulfillmentStatus}
//                   </Badge>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>

//         <Card>
//           <h2 className="text-xl font-bold mb-6">Order Items</h2>
//           <div className="space-y-4">
//             {lineItems.map((item, idx) => (
//               <div key={`${item.productId?._id || item.productId}-${idx}`} className="flex items-center justify-between border-b pb-4">
//                 <div className="flex-1">
//                   <h3 className="font-semibold">{item.productId?.name || 'Product'}</h3>
//                   <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
//                   <p className="text-xs text-gray-500">Fulfillment: {item.fulfillmentStatus}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <Card>
//             <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
//             <div className="text-gray-700 text-sm space-y-1">
//               <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
//               <p>{shippingAddress.street}</p>
//               <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
//               <p>{shippingAddress.country}</p>
//               <p>{shippingAddress.phone}</p>
//             </div>
//           </Card>

//           <Card>
//             <h2 className="text-xl font-bold mb-4">Order Summary</h2>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span>Subtotal</span>
//                 <span>${order.subtotal?.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Shipping</span>
//                 <span>${order.shippingCost?.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Tax</span>
//                 <span>${order.tax?.toFixed(2)}</span>
//               </div>
//               <div className="border-t pt-2 flex justify-between font-bold text-base">
//                 <span>Total</span>
//                 <span>${order.total?.toFixed(2)}</span>
//               </div>
//             </div>
//           </Card>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default OrderDetails;


import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import FullPageLoader from '../../components/common/FullPageLoader';
import orderService from '../../services/order.service';
import toast from 'react-hot-toast';

const FULFILLMENT_VARIANTS = {
    unfulfilled: 'warning', packed: 'primary', shipped: 'info',
    delivered: 'success',   cancelled: 'danger', returned: 'danger',
};
const ORDER_STATUS_VARIANTS = {
    created: 'warning', confirmed: 'primary', cancelled: 'danger', refunded: 'default', closed: 'success',
};

// Maps fulfillmentStatus to a user-friendly timeline
const TIMELINE_STEPS = ['unfulfilled', 'packed', 'shipped', 'delivered'];
const TIMELINE_LABELS = { unfulfilled: 'Order Placed', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered' };

const fallbackImage = 'https://via.placeholder.com/80';

const resolveImageUrl = (product) => {
    if (!product) return fallbackImage;
    if (typeof product.mainImage === 'string') return product.mainImage;
    if (product.mainImage?.url) return product.mainImage.url;
    return fallbackImage;
};

const getText = (value) => {
    if (!value) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    return '';
};

const formatVariantOptions = (options) => {
    if (!options) return '';

    if (Array.isArray(options)) {
        return options
            .map((opt) => {
                const optionName =
                    getText(opt?.optionId?.name) ||
                    getText(opt?.optionId?.title) ||
                    getText(opt?.optionId?.label) ||
                    getText(opt?.optionName) ||
                    getText(opt?.name) ||
                    'Option';

                const matchedValueFromOption = opt?.optionId?.values?.find(
                    (entry) => String(entry?._id) === String(opt?.valueId)
                );

                const valueLabel =
                    getText(matchedValueFromOption?.label) ||
                    getText(opt?.selectedValue?.label) ||
                    getText(opt?.value?.label) ||
                    getText(opt?.valueName) ||
                    getText(opt?.valueLabel) ||
                    getText(opt?.valueId?.label) ||
                    getText(opt?.valueId) ||
                    '';

                if (!valueLabel) return optionName;
                return `${optionName}: ${valueLabel}`;
            })
            .filter(Boolean)
            .join(', ');
    }

    if (typeof options === 'object') {
        return Object.entries(options)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return `${key}: ${value.map((item) => getText(item?.label) || getText(item)).filter(Boolean).join('/')}`;
                }
                return `${key}: ${getText(value?.label) || getText(value)}`;
            })
            .filter((line) => !line.endsWith(': '))
            .join(', ');
    }

    return '';
};

export default function OrderDetails() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await orderService.getOrderById(id);
                if (res.success) setOrder(res.data.order);
            } catch { toast.error('Failed to load order'); }
            finally { setLoading(false); }
        })();
    }, [id]);

    if (loading) return <FullPageLoader />;
    if (!order)  return (
        <DashboardLayout>
            <div className="text-center py-20 text-gray-500">Order not found.</div>
        </DashboardLayout>
    );

    // For timeline: find the most advanced fulfillment status across all sub-orders
    const allStatuses = (order.subOrder ?? []).map(s => s.fulfillmentStatus ?? 'unfulfilled');
    const maxIdx = allStatuses.length > 0
        ? Math.max(...allStatuses.map(s => TIMELINE_STEPS.indexOf(s)))
        : 0;

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={() => navigate('/orders')}
                            className="text-sm text-gray-500 hover:text-gray-800 mb-1">← Back to Orders</button>
                        <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge variant={ORDER_STATUS_VARIANTS[order.status] ?? 'default'} className="text-sm px-3 py-1">
                        {order.status}
                    </Badge>
                </div>

                {/* Timeline */}
                <Card>
                    <h2 className="font-semibold text-lg mb-5">Order Tracking</h2>
                    <div className="flex items-center gap-0">
                        {TIMELINE_STEPS.map((step, i) => {
                            const done = i <= maxIdx;
                            return (
                                <div key={step} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                            ${done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                            {done ? '✓' : i + 1}
                                        </div>
                                        <span className={`text-xs mt-1 ${done ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                                            {TIMELINE_LABELS[step]}
                                        </span>
                                    </div>
                                    {i < TIMELINE_STEPS.length - 1 && (
                                        <div className={`flex-1 h-1 mx-2 rounded ${i < maxIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Sub-orders */}
                {(order.subOrder ?? []).map((sub, idx) => (
                    <Card key={sub._id ?? idx}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-lg">
                                {sub.sellerId?.businessName ? `From: ${sub.sellerId.businessName}` : `Shipment ${idx + 1}`}
                            </h2>
                            <Badge variant={FULFILLMENT_VARIANTS[sub.fulfillmentStatus] ?? 'default'}>
                                {sub.fulfillmentStatus}
                            </Badge>
                        </div>

                        {sub.trackingNumber && (
                            <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                                <span className="font-medium text-blue-700">Tracking: </span>
                                <span className="text-blue-600">{sub.trackingNumber}</span>
                                {sub.carrier && <span className="text-gray-500 ml-2">via {sub.carrier}</span>}
                            </div>
                        )}

                        <div className="divide-y">
                            {(sub.items ?? []).map((item, i) => {
                                const variantText = formatVariantOptions(item.variantId?.options);
                                return (
                                <div key={i} className="flex items-center gap-4 py-3">
                                    <img
                                        src={resolveImageUrl(item.productId)}
                                        className="w-16 h-16 rounded-lg object-cover border"
                                        alt={item.productId?.name || 'Product'}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{item.productId?.name ?? 'Product'}</p>
                                        {Boolean(variantText) && (
                                            <p className="text-xs text-gray-500">
                                                {variantText}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                    </div>
                                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}

                {/* Shipping + Summary */}
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
                        <h2 className="font-semibold text-lg mb-3">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${(order.subtotal ?? 0).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Shipping ({order.shippingMethod})</span><span>${(order.shippingCost ?? 0).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>${(order.tax ?? 0).toFixed(2)}</span></div>
                            {(order.discount ?? 0) > 0 && (
                                <div className="flex justify-between text-green-600"><span>Discount</span><span>-${order.discount.toFixed(2)}</span></div>
                            )}
                            <div className="flex justify-between font-bold border-t pt-2 text-base">
                                <span>Total</span>
                                <span>${(order.total ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Payment</span>
                                <span className="uppercase font-bold">{order.paymentMethod} ( {order.paymentStatus} )</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {order.status === 'confirmed' && (
                        <p className="text-sm text-gray-500 italic">
                            To cancel or request a refund, please contact support.
                        </p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
