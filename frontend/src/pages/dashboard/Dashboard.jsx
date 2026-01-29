import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold mt-1">24</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold mt-1">3</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Wishlist Items</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <div className="text-4xl">❤️</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-2xl font-bold mt-1">$2,450</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Button variant="outline">View All</Button>
          </div>
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
                {[1, 2, 3].map((order) => (
                  <tr key={order}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#ORD-{order}001</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2026-01-{20 + order}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{2 + order} items</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${(99.99 * (2 + order)).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={order === 1 ? 'warning' : 'success'}>
                        {order === 1 ? 'Pending' : 'Delivered'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button variant="ghost" className="text-sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Account Progress */}
        <Card>
          <h2 className="text-xl font-bold mb-6">Account Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm text-gray-600">75%</span>
              </div>
              <ProgressBar progress={75} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Verified Account</span>
                <span className="text-sm text-gray-600">100%</span>
              </div>
              <ProgressBar progress={100} />
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
