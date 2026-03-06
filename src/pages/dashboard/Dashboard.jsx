import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import useUserContext from '../../hooks/useUserContext';
import usePlatformSettings from '../../hooks/usePlatformSettings';
import orderService from '../../services/order.service';
import dashboardService from '../../services/dashboard.service';

const statusVariant = {
  created: 'warning',
  confirmed: 'primary',
  closed: 'success',
  cancelled: 'danger',
  refunded: 'default',
};

const Dashboard = () => {
  const { user } = useUserContext();
  const { settings } = usePlatformSettings();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const formatMoney = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: settings.currency || 'USD',
  }).format(value || 0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const [ordersRes, wishlistRes] = await Promise.all([
          orderService.getOrders({ context: 'user', page: 1, limit: 1000 }),
          dashboardService.getWishlist(),
        ]);

        if (ordersRes?.success) {
          setOrders(ordersRes.data.orders || []);
        }

        if (wishlistRes?.success) {
          setWishlistCount((wishlistRes.data.items || []).length);
        }
      } catch (error) {
        toast.error(error?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => ['created', 'confirmed'].includes(order.status)).length;
    const totalSpent = orders
      .filter((order) => order.paymentStatus === 'paid' || order.status === 'closed')
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
      totalOrders,
      pendingOrders,
      wishlistCount,
      totalSpent,
    };
  }, [orders, wishlistCount]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {user?.role !== 'seller' && (
          <Card className="border border-primary-100 bg-primary-50">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Grow with {settings.siteName || 'E-Commerce'}</p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">Start selling your products on {settings.siteName || 'E-Commerce'}</h2>
                <p className="mt-1 text-sm text-gray-600 max-w-xl">
                  You&apos;re already shopping as a customer. Open your seller account to reach more buyers and manage your own online store.
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Current status: <span className="font-semibold text-gray-800">Buyer</span> becoming a seller takes just a few steps.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <Button variant="primary" className="w-full md:w-auto">
                  <a href="/seller/register" className="inline-flex items-center gap-2">
                    <span>{user?.seller?.status ? 'Seller Status' : 'Become a Seller'}</span>
                  </a>
                </Button>
                <p className="text-[11px] text-gray-500">No commitment required. You can complete your seller profile later.</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{loading ? '...' : metrics.totalOrders}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold mt-1">{loading ? '...' : metrics.pendingOrders}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Wishlist Items</p>
                <p className="text-2xl font-bold mt-1">{loading ? '...' : metrics.wishlistCount}</p>
              </div>
              <div className="text-4xl">❤️</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-2xl font-bold mt-1">{loading ? '...' : formatMoney(metrics.totalSpent)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link to="/orders">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 5).map((order) => {
                    const itemCount = (order.subOrder || []).reduce((sum, sub) => sum + (sub.items?.length || 0), 0);
                    return (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.orderNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{itemCount} items</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatMoney(order.total)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={statusVariant[order.status] || 'default'}>{order.status}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Link to={`/orders/${order._id}`}>
                              <Button variant="ghost" className="text-sm">View</Button>
                            </Link>
                            <Link to={`/order-tracking?order=${order.orderNumber}`}>
                              <Button variant="ghost" className="text-sm">Track</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
