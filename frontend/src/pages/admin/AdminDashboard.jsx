import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">$125,450</p>
                <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold mt-1">1,234</p>
                <p className="text-sm text-green-600 mt-1">+8.2% from last month</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-2xl font-bold mt-1">5,678</p>
                <p className="text-sm text-green-600 mt-1">+15.3% from last month</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-2xl font-bold mt-1">2,456</p>
                <p className="text-sm text-green-600 mt-1">+5.7% from last month</p>
              </div>
              <div className="text-4xl">🛍️</div>
            </div>
          </Card>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-bold mb-4">Revenue Overview</h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart Placeholder</p>
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-bold mb-4">Order Status</h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart Placeholder</p>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((order) => (
                  <tr key={order}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#ORD-{order}001</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Customer {order}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${(99.99 * order).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={order % 2 === 0 ? 'success' : 'warning'}>
                        {order % 2 === 0 ? 'Completed' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2026-01-{25 - order}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
