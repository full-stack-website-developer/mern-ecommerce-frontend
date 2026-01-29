import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';

const Orders = () => {
  const orders = [
    { id: 1, orderId: 'ORD-001', date: '2026-01-25', items: 3, total: 299.97, status: 'Pending' },
    { id: 2, orderId: 'ORD-002', date: '2026-01-24', items: 2, total: 199.98, status: 'Processing' },
    { id: 3, orderId: 'ORD-003', date: '2026-01-23', items: 1, total: 99.99, status: 'Shipped' },
    { id: 4, orderId: 'ORD-004', date: '2026-01-22', items: 4, total: 399.96, status: 'Delivered' },
    { id: 5, orderId: 'ORD-005', date: '2026-01-21', items: 2, total: 149.98, status: 'Delivered' },
  ];

  const getStatusVariant = (status) => {
    const variants = {
      Pending: 'warning',
      Processing: 'primary',
      Shipped: 'info',
      Delivered: 'success',
      Cancelled: 'danger',
    };
    return variants[status] || 'default';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Orders</h1>

        <Card>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Order History</h2>
              <div className="flex space-x-2">
                <select className="input-field w-48">
                  <option>All Orders</option>
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                </select>
              </div>
            </div>
          </div>

          <Table
            headers={['Order ID', 'Date', 'Items', 'Total', 'Status', 'Actions']}
          >
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {order.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.items} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button variant="ghost" className="text-sm">
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </Table>

          <Pagination currentPage={1} totalPages={5} />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
