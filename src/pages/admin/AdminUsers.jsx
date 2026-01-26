import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';

const AdminUsers = () => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Customer', status: 'Active', joined: '2025-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Seller', status: 'Active', joined: '2025-02-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Admin', status: 'Active', joined: '2024-12-10' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Customer', status: 'Inactive', joined: '2025-03-05' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Seller', status: 'Active', joined: '2025-01-30' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users Management</h1>
          <Button variant="primary">Add New User</Button>
        </div>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <SearchBar placeholder="Search users..." className="max-w-md" />
            <div className="flex space-x-2">
              <select className="input-field w-48">
                <option>All Roles</option>
                <option>Admin</option>
                <option>Seller</option>
                <option>Customer</option>
              </select>
              <select className="input-field w-48">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <Table
            headers={['ID', 'Name', 'Email', 'Role', 'Status', 'Joined', 'Actions']}
          >
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.role === 'Admin' ? 'danger' : user.role === 'Seller' ? 'primary' : 'default'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.status === 'Active' ? 'success' : 'danger'}>
                    {user.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.joined}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button variant="ghost" className="text-sm">Edit</Button>
                    <Button variant="ghost" className="text-sm text-red-600">Delete</Button>
                  </div>
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

export default AdminUsers;
