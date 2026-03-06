import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { useEffect, useState } from 'react';
import adminUserService from '../../features/admin/services/adminUser.service';
import FullPageLoader from '../../components/common/FullPageLoader';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const LIMIT = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await adminUserService.listUsers({
          page,
          limit: LIMIT,
          role: roleFilter,
          status: statusFilter,
          search,
        });
        if (res.success) {
          setUsers(res.data.users || []);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, [page, roleFilter, statusFilter, search]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users Management</h1>
          <Button variant="primary">Add New User</Button>
        </div>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <SearchBar
              placeholder="Search users..."
              className="max-w-md"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <div className="flex space-x-2">
              <select
                className="input-field w-48"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="seller">Seller</option>
                <option value="user">Customer</option>
              </select>
              <select
                className="input-field w-48"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? (
            <FullPageLoader />
          ) : (
            <>
              <Table
                headers={['ID', 'Name', 'Email', 'Role', 'Status', 'Joined', 'Actions']}
              >
                {users.map((user, index) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.fullName || `${user.firstName} ${user.lastName || ''}`.trim()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          user.role === 'admin'
                            ? 'danger'
                            : user.role === 'seller'
                            ? 'primary'
                            : 'default'
                        }
                      >
                        {user.role === 'user' ? 'Customer' : user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button variant="ghost" className="text-sm">Edit</Button>
                        <Button variant="ghost" className="text-sm text-red-600">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && !loading && (
                  <tr>
                    <td
                      className="px-6 py-10 whitespace-nowrap text-sm text-gray-500 text-center"
                      colSpan={7}
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </Table>

              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  scrollToTop
                />
              )}
            </>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
