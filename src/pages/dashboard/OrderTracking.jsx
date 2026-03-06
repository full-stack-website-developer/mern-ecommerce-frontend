import { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import orderService from '../../services/order.service';

const shippingDaysByMethod = {
  standard: 7,
  express: 3,
  overnight: 1,
};

const toDateText = (dateValue) => {
  if (!dateValue) return null;
  return new Date(dateValue).toLocaleString();
};

const statusToBadge = (status) => {
  const map = {
    created: 'warning',
    confirmed: 'primary',
    closed: 'success',
    cancelled: 'danger',
    refunded: 'default',
  };
  return map[status] || 'default';
};

const buildTimeline = (order) => {
  const subOrders = order?.subOrder || [];
  const anyShipped = subOrders.some((s) => ['shipped', 'delivered', 'returned'].includes(s.fulfillmentStatus));
  const anyDelivered = subOrders.some((s) => ['delivered', 'returned'].includes(s.fulfillmentStatus));
  const allDeliveredLike = subOrders.length > 0 && subOrders.every((s) => ['delivered', 'returned', 'cancelled'].includes(s.fulfillmentStatus));

  const placedAt = order.createdAt;
  const shippedAt = subOrders
    .map((s) => s.shippedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0] || null;
  const deliveredAt = subOrders
    .map((s) => s.deliveredAt)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0] || null;

  const paymentConfirmed = order.paymentStatus === 'paid' || (order.paymentMethod === 'cod' && order.status !== 'created');

  const timeline = [
    { status: 'Order Placed', date: toDateText(placedAt), completed: true },
    { status: 'Payment Confirmed', date: paymentConfirmed ? toDateText(placedAt) : null, completed: paymentConfirmed },
    { status: 'Processing', date: order.status !== 'created' ? toDateText(placedAt) : null, completed: order.status !== 'created' },
    { status: 'Shipped', date: toDateText(shippedAt), completed: anyShipped },
    { status: 'Out for Delivery', date: anyDelivered ? toDateText(shippedAt) : null, completed: anyDelivered },
    { status: 'Delivered', date: toDateText(deliveredAt), completed: order.status === 'closed' || allDeliveredLike },
  ];

  if (order.status === 'cancelled') {
    timeline.push({ status: 'Cancelled', date: toDateText(order.updatedAt), completed: true });
  }
  if (order.status === 'refunded') {
    timeline.push({ status: 'Refunded', date: toDateText(order.updatedAt), completed: true });
  }

  return timeline;
};

const resolveTrackingPayload = (order) => {
  const subOrders = order?.subOrder || [];
  const firstTracking = subOrders.find((s) => s.trackingNumber);

  let estimatedDelivery = null;
  if (order.status !== 'closed' && order.status !== 'cancelled') {
    const baseDate = firstTracking?.shippedAt ? new Date(firstTracking.shippedAt) : new Date(order.createdAt);
    const daysToAdd = shippingDaysByMethod[order.shippingMethod] || 7;
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    estimatedDelivery = baseDate.toLocaleDateString();
  }

  return {
    orderId: order.orderNumber,
    trackingNumber: firstTracking?.trackingNumber || 'Not assigned yet',
    status: order.status,
    carrier: firstTracking?.carrier || order.shippingMethod,
    estimatedDelivery,
    timeline: buildTimeline(order),
  };
};

const OrderTracking = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [error, setError] = useState('');

  const suggestedOrders = useMemo(() => orders.slice(0, 5), [orders]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrders({ context: 'user', page: 1, limit: 1000 });
        if (res.success) {
          const fetched = res.data.orders || [];
          setOrders(fetched);

          const orderParam = new URLSearchParams(location.search).get('order');
          if (orderParam) {
            setQuery(orderParam);
            const match = fetched.find((order) =>
              String(order.orderNumber).toLowerCase() === orderParam.toLowerCase() ||
              String(order._id).toLowerCase() === orderParam.toLowerCase() ||
              (order.subOrder || []).some((sub) => String(sub.trackingNumber || '').toLowerCase() === orderParam.toLowerCase())
            );

            if (match) {
              setTrackingResult(resolveTrackingPayload(match));
              setSearched(true);
            }
          }
        }
      } catch (_err) {
        setError('Failed to load your orders for tracking.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [location.search]);

  const handleTrack = () => {
    const needle = query.trim().toLowerCase();
    setSearched(true);
    setError('');

    if (!needle) {
      setTrackingResult(null);
      setError('Please enter an order ID, order number, or tracking number.');
      return;
    }

    const matchedOrder = orders.find((order) => {
      const byId = String(order._id).toLowerCase() === needle;
      const byOrderNumber = String(order.orderNumber).toLowerCase() === needle;
      const byTracking = (order.subOrder || []).some((sub) => String(sub.trackingNumber || '').toLowerCase() === needle);
      return byId || byOrderNumber || byTracking;
    });

    if (!matchedOrder) {
      setTrackingResult(null);
      setError('No matching order found.');
      return;
    }

    setTrackingResult(resolveTrackingPayload(matchedOrder));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Order Tracking</h1>

        <Card>
          <h2 className="text-xl font-bold mb-4">Track Your Order</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <Input
              placeholder="Enter order ID, order number, or tracking number"
              className="flex-1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTrack();
              }}
            />
            <Button variant="primary" onClick={handleTrack} disabled={loading}>
              {loading ? 'Loading...' : 'Track'}
            </Button>
          </div>

          {suggestedOrders.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Recent orders:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedOrders.map((order) => (
                  <button
                    type="button"
                    key={order._id}
                    className="px-3 py-1 rounded-full border border-gray-300 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setQuery(order.orderNumber);
                      setTrackingResult(resolveTrackingPayload(order));
                      setSearched(true);
                      setError('');
                    }}
                  >
                    {order.orderNumber}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {error && (
          <Card>
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {!error && trackingResult && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-semibold">{trackingResult.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="font-semibold">{trackingResult.trackingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={statusToBadge(trackingResult.status)}>{trackingResult.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="font-semibold">{trackingResult.estimatedDelivery || 'Not available'}</p>
              </div>
            </div>

            <div className="mb-4">
              <Link to="/orders">
                <Button variant="outline">Back to Orders</Button>
              </Link>
            </div>

            <h3 className="text-lg font-bold mb-4">Tracking Timeline</h3>
            <div className="space-y-4">
              {trackingResult.timeline.map((step, index) => (
                <div key={`${step.status}-${index}`} className="flex items-start space-x-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.status}
                    </div>
                    {step.date && <div className="text-sm text-gray-600">{step.date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {searched && !error && !trackingResult && (
          <Card>
            <p className="text-gray-600">No tracking details found for this query.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrderTracking;
