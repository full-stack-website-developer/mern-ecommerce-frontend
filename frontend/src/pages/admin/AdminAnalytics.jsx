import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const AdminAnalytics = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <div className="flex space-x-2">
            <select className="input-field w-48">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <p className="text-gray-600 text-sm mb-2">Total Sales</p>
            <p className="text-3xl font-bold">$125,450</p>
            <p className="text-sm text-green-600 mt-2">+12.5% from last period</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm mb-2">Orders</p>
            <p className="text-3xl font-bold">1,234</p>
            <p className="text-sm text-green-600 mt-2">+8.2% from last period</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm mb-2">Average Order Value</p>
            <p className="text-3xl font-bold">$101.66</p>
            <p className="text-sm text-green-600 mt-2">+4.1% from last period</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm mb-2">Conversion Rate</p>
            <p className="text-3xl font-bold">3.2%</p>
            <p className="text-sm text-red-600 mt-2">-0.5% from last period</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-bold mb-4">Sales Overview</h2>
            <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Sales Chart Placeholder</p>
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-bold mb-4">Revenue by Category</h2>
            <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Category Chart Placeholder</p>
            </div>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <h2 className="text-xl font-bold mb-6">Top Selling Products</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((product) => (
                  <tr key={product}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Product {product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{120 + product * 10} units</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${(99.99 * (120 + product * 10)).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+{5 + product}%</td>
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

export default AdminAnalytics;
