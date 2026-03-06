import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SellerLayout from '../../components/layout/SellerLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import dashboardService from '../../services/dashboard.service';
import orderService from '../../services/order.service';
import productService from '../../services/product.service';
import usePlatformSettings from '../../hooks/usePlatformSettings';

const PAYMENT_BADGE = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'default',
};

const FULFILLMENT_BADGE = {
  unfulfilled: 'warning',
  packed: 'primary',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'danger',
};

const SellerDashboard = () => {
  const { settings } = usePlatformSettings();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({
    gross: 0,
    net: 0,
    orders: 0,
    commission: 0,
    avgOrderValue: 0,
    commissionRate: 0,
  });

  const formatMoney = useCallback((value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  }, [settings.currency]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, productsRes, analyticsRes] = await Promise.all([
        orderService.getOrders({ context: 'seller', page: 1, limit: 100 }),
        productService.getByUserId(),
        dashboardService.getSellerAnalytics(30),
      ]);

      if (!ordersRes?.success) throw new Error('Failed to load seller orders');
      if (!productsRes?.success) throw new Error('Failed to load seller products');
      if (!analyticsRes?.success) throw new Error('Failed to load seller analytics');

      setOrders(ordersRes.data?.orders || []);
      setProducts(productsRes.data?.products || []);
      setAnalytics({
        gross: Number(analyticsRes.data?.analytics?.gross || 0),
        net: Number(analyticsRes.data?.analytics?.net || 0),
        orders: Number(analyticsRes.data?.analytics?.orders || 0),
        commission: Number(analyticsRes.data?.analytics?.commission || 0),
        avgOrderValue: Number(analyticsRes.data?.analytics?.avgOrderValue || 0),
        commissionRate: Number(analyticsRes.data?.analytics?.commissionRate || 0),
      });
    } catch (loadError) {
      const message = loadError?.message || 'Failed to load seller dashboard';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const pendingCount = useMemo(() => {
    return orders.filter((order) => {
      const status = order?.subOrder?.fulfillmentStatus;
      return status === 'unfulfilled' || status === 'packed';
    }).length;
  }, [orders]);

  const topProducts = useMemo(() => {
    const salesByProduct = new Map();
    orders.forEach((order) => {
      (order?.subOrder?.items || []).forEach((item) => {
        const productId = item?.productId?._id || item?.productId || 'unknown';
        if (!productId || productId === 'unknown') return;
        const current = salesByProduct.get(productId) || {
          id: productId,
          name: item?.productId?.name || 'Unknown Product',
          quantitySold: 0,
          revenue: 0,
        };
        current.quantitySold += Number(item?.quantity || 0);
        current.revenue += Number(item?.price || 0) * Number(item?.quantity || 0);
        salesByProduct.set(productId, current);
      });
    });

    return Array.from(salesByProduct.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);
  }, [orders]);

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Live overview of your sales, orders, and product performance</p>
          </div>
          <Button variant="outline" onClick={loadDashboard} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {error && (
          <Card className="border border-red-200 bg-red-50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-red-700">{error}</p>
              <Button variant="secondary" onClick={loadDashboard}>Retry</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card>
            <p className="text-gray-600 text-sm">Sales (30d)</p>
            <p className="text-2xl font-bold mt-1">{loading ? '...' : formatMoney(analytics.gross)}</p>
            <p className="text-xs text-gray-500 mt-1">Net: {formatMoney(analytics.net)}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Orders (30d)</p>
            <p className="text-2xl font-bold mt-1">{loading ? '...' : analytics.orders}</p>
            <p className="text-xs text-gray-500 mt-1">Avg order: {formatMoney(analytics.avgOrderValue)}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Products</p>
            <p className="text-2xl font-bold mt-1">{loading ? '...' : products.length}</p>
            <p className="text-xs text-gray-500 mt-1">Current active catalog size</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Pending Fulfillment</p>
            <p className="text-2xl font-bold mt-1">{loading ? '...' : pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">Unfulfilled + packed orders</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link to="/seller/orders">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading recent orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No orders found yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fulfillment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 8).map((order) => {
                    const subOrder = order?.subOrder || {};
                    const customerName = order?.isGuest
                      ? 'Guest'
                      : `${order?.customer?.firstName || ''} ${order?.customer?.lastName || ''}`.trim() || '—';
                    const itemCount = (subOrder.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                    return (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.orderNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{itemCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatMoney(subOrder.total || 0)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={PAYMENT_BADGE[order.paymentStatus] || 'default'}>
                            {order.paymentStatus || 'unknown'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={FULFILLMENT_BADGE[subOrder.fulfillmentStatus] || 'default'}>
                            {subOrder.fulfillmentStatus || 'unfulfilled'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Top Products By Units Sold</h2>
          {loading ? (
            <div className="py-10 text-center text-gray-500">Loading product performance...</div>
          ) : topProducts.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No sold products to rank yet.</div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantitySold} units sold</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatMoney(product.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </SellerLayout>
  );
};

export default SellerDashboard;
