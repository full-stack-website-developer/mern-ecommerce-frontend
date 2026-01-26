import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';

const AdminOrders = () => {
  const orders = [
    { id: 1, orderId: 'ORD-001', customer: 'John Doe', amount: 299.99, status: 'Pending', date: '2026-01-25' },
    { id: 2, orderId: 'ORD-002', customer: 'Jane Smith', amount: 149.99, status: 'Processing', date: '2026-01-24' },
    { id: 3, orderId: 'ORD-003', customer: 'Bob Johnson', amount: 399.99, status: 'Shipped', date: '2026-01-23' },
    { id: 4, orderId: 'ORD-004', customer: 'Alice Brown', amount: 199.99, status: 'Delivered', date: '2026-01-22' },
    { id: 5, orderId: 'ORD-005', customer: 'Charlie Wilson', amount: 249.99, status: 'Cancelled', date: '2026-01-21' },
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
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Orders Management</h1>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <SearchBar placeholder="Search orders..." className="max-w-md" />
            <div className="flex space-x-2">
              <select className="input-field w-48">
                <option>All Status</option>
                <option>Pending</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>
            </div>
          </div>

          <Table
            headers={['Order ID', 'Customer', 'Amount', 'Status', 'Date', 'Actions']}
          >
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.orderId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${order.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button variant="ghost" className="text-sm">View</Button>
                </td>
              </tr>
            ))}
          </Table>

          <Pagination currentPage={1} totalPages={10} />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
