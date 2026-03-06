import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import dashboardService from '../../services/dashboard.service';

const STATUS_META = {
  created: { label: 'Created', color: 'bg-gray-500' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500' },
  closed: { label: 'Closed', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
  refunded: { label: 'Refunded', color: 'bg-orange-500' },
};

const statusBadgeVariant = (status) => {
  if (status === 'closed') return 'success';
  if (status === 'confirmed') return 'primary';
  if (status === 'cancelled' || status === 'refunded') return 'danger';
  return 'warning';
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value || 0));

const formatNumber = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(value || 0));

const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

const formatTrend = (value) => {
  const num = Number(value || 0);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
};

const TrendText = ({ value }) => {
  const num = Number(value || 0);
  const color = num > 0 ? 'text-green-600' : num < 0 ? 'text-red-600' : 'text-gray-500';
  return <span className={`text-sm font-medium ${color}`}>{formatTrend(num)}</span>;
};

const RevenueLineChart = ({ series }) => {
  const height = 220;
  const width = 720;
  const pad = 24;
  const chartData = Array.isArray(series) ? series : [];

  if (chartData.length === 0) {
    return <div className="h-56 flex items-center justify-center text-gray-500 text-sm">No revenue data for this period</div>;
  }

  const maxValue = Math.max(...chartData.map((d) => Number(d.revenue || 0)), 1);
  const stepX = chartData.length > 1 ? (width - pad * 2) / (chartData.length - 1) : 0;

  const points = chartData.map((point, index) => {
    const x = pad + stepX * index;
    const y = height - pad - ((Number(point.revenue || 0) / maxValue) * (height - pad * 2));
    return { x, y, label: point.label, value: Number(point.revenue || 0) };
  });

  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`;
  const xTickStep = Math.max(1, Math.floor(chartData.length / 6));

  return (
    <div className="space-y-3">
      <div className="h-56 w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#e5e7eb" strokeWidth="1" />
          <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#e5e7eb" strokeWidth="1" />

          <path d={areaPath} fill="url(#adminRevenueFill)" />
          <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" />

          {points.filter((_, idx) => idx % xTickStep === 0 || idx === points.length - 1).map((point) => (
            <text key={`tick-${point.x}`} x={point.x} y={height - 6} textAnchor="middle" fontSize="11" fill="#6b7280">
              {point.label}
            </text>
          ))}
        </svg>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Lowest: {formatCurrency(Math.min(...chartData.map((d) => Number(d.revenue || 0))))}</span>
        <span>Highest: {formatCurrency(Math.max(...chartData.map((d) => Number(d.revenue || 0))))}</span>
      </div>
    </div>
  );
};

const StatusDistribution = ({ statusItems, totalOrders }) => {
  const safeItems = Array.isArray(statusItems) ? statusItems : [];
  const denominator = Math.max(1, Number(totalOrders || 0));

  return (
    <div className="space-y-4">
      {safeItems.map((item) => {
        const count = Number(item.count || 0);
        const percent = (count / denominator) * 100;
        const meta = STATUS_META[item.status] || { label: item.status, color: 'bg-gray-400' };

        return (
          <div key={item.status}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${meta.color}`} />
                <span className="font-medium text-gray-800">{meta.label}</span>
              </div>
              <span className="text-gray-600">
                {count} ({percent.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full ${meta.color}`} style={{ width: `${Math.min(100, percent)}%` }} />
            </div>
          </div>
        );
      })}
      {safeItems.length === 0 && <div className="h-56 flex items-center justify-center text-gray-500 text-sm">No order status data</div>}
    </div>
  );
};

const AdminDashboard = () => {
  const [days, setDays] = useState(30);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getAdminAnalytics(days);
      if (res?.success) {
        setAnalytics(res?.data?.analytics || null);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, reloadKey]);

  const summaryCards = useMemo(() => {
    const totals = analytics?.totals || {};
    const trends = analytics?.trends || {};

    return [
      {
        key: 'revenue',
        label: `Revenue (${days}d)`,
        value: formatCurrency(analytics?.totalSales),
        trend: trends.revenuePct,
        sub: `All-time ${formatCurrency(totals.allTimeRevenue)}`,
        icon: '💰',
      },
      {
        key: 'orders',
        label: `Orders (${days}d)`,
        value: formatNumber(analytics?.orders),
        trend: trends.ordersPct,
        sub: `All-time ${formatNumber(totals.allTimeOrders)}`,
        icon: '📦',
      },
      {
        key: 'users',
        label: 'Customers',
        value: formatNumber(totals.users),
        trend: null,
        sub: 'Non-admin accounts',
        icon: '👥',
      },
      {
        key: 'products',
        label: 'Products',
        value: formatNumber(totals.products),
        trend: null,
        sub: `${formatNumber(totals.activeProducts)} active`,
        icon: '🛍️',
      },
    ];
  }, [analytics, days]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Live operational snapshot with real order and revenue data</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="input-field w-40"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <Button variant="outline" onClick={() => setReloadKey((prev) => prev + 1)} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.key} className="border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900">{loading ? '...' : card.value}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    {card.trend !== null ? <TrendText value={card.trend} /> : <span className="text-sm text-gray-500">n/a</span>}
                    <span className="text-xs text-gray-500">{card.sub}</span>
                  </div>
                </div>
                <span className="text-3xl">{card.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
              <span className="text-xs text-gray-500">{days} day paid revenue</span>
            </div>
            {loading ? (
              <div className="h-56 rounded-lg bg-gray-100 animate-pulse" />
            ) : (
              <RevenueLineChart series={analytics?.charts?.revenueSeries || []} />
            )}
          </Card>

          <Card className="border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Order Status</h2>
              <span className="text-xs text-gray-500">{formatNumber(analytics?.orders)} orders</span>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-5 rounded bg-gray-100 animate-pulse" />)}
              </div>
            ) : (
              <StatusDistribution
                statusItems={analytics?.charts?.orderStatus || []}
                totalOrders={analytics?.orders || 0}
              />
            )}
          </Card>
        </div>

        <Card className="border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <div className="text-xs text-gray-500">
              Avg order value: {formatCurrency(analytics?.averageOrderValue)} | Payment success: {formatPercent(analytics?.conversionRate)}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  [1, 2, 3, 4, 5].map((row) => (
                    <tr key={row}>
                      <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-36 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-100 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : (analytics?.recentOrders || []).length > 0 ? (
                  analytics.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.customerName || order.customerEmail || 'Guest'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadgeVariant(order.status)} className="text-xs px-2.5 py-1">
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'} className="text-xs px-2.5 py-1">
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
