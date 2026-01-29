import SellerLayout from '../../components/layout/SellerLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const SellerDashboard = () => {
  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sales</p>
                <p className="text-2xl font-bold mt-1">$45,230</p>
                <p className="text-sm text-green-600 mt-1">+15.2% from last month</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold mt-1">342</p>
                <p className="text-sm text-green-600 mt-1">+8.5% from last month</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Products</p>
                <p className="text-2xl font-bold mt-1">156</p>
                <p className="text-sm text-gray-600 mt-1">Active listings</p>
              </div>
              <div className="text-4xl">🛍️</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold mt-1">12</p>
                <p className="text-sm text-warning mt-1">Requires attention</p>
              </div>
              <div className="text-4xl">⏳</div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((order) => (
                  <tr key={order}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#ORD-{order}001</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Customer {order}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Product {order}</td>
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

        {/* Top Products */}
        <Card>
          <h2 className="text-xl font-bold mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((product) => (
              <div key={product} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div>
                    <h3 className="font-semibold">Product {product}</h3>
                    <p className="text-sm text-gray-600">{120 + product * 10} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(99.99 * (120 + product * 10)).toFixed(2)}</p>
                  <p className="text-sm text-green-600">+{5 + product}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </SellerLayout>
  );
};

export default SellerDashboard;
