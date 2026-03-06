import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import { useCallback, useEffect, useMemo, useState } from 'react';
import sellerService from '../../services/seller.service';
import { formatDate } from '../../utils/date';
import toast from 'react-hot-toast';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingSellerId, setUpdatingSellerId] = useState('');
  const PER_PAGE = 10;

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await sellerService.getAll();
      if (!res?.success) throw new Error('Failed to fetch sellers');
      setSellers(Array.isArray(res.data?.sellers) ? res.data.sellers : []);
    } catch (apiError) {
      const message = apiError?.message || 'Error while fetching sellers';
      setError(message);
      toast.error(message);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const getStatusVariant = (status) => {
    const v = { approved: 'success', pending: 'warning', rejected: 'danger' };
    return v[status] || 'default';
  };

  const stats = useMemo(() => {
    const totals = { total: sellers.length, pending: 0, approved: 0, rejected: 0 };
    sellers.forEach((seller) => {
      const status = String(seller.status || '').toLowerCase();
      if (status === 'pending') totals.pending += 1;
      if (status === 'approved') totals.approved += 1;
      if (status === 'rejected') totals.rejected += 1;
    });
    return totals;
  }, [sellers]);

  const filteredSellers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sellers.filter((seller) => {
      const matchesStatus = statusFilter === 'all' ? true : seller.status === statusFilter;
      const matchesQuery = normalizedQuery
        ? [seller.storeName, seller.userId?.email, seller.userId?.firstName, seller.userId?.lastName]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedQuery))
        : true;
      return matchesStatus && matchesQuery;
    });
  }, [sellers, statusFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filteredSellers.length / PER_PAGE));
  const paginatedSellers = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return filteredSellers.slice(start, start + PER_PAGE);
  }, [filteredSellers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, query]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  async function handleStatus(id, status) {
    if (!window.confirm(`Update seller status to "${status}"?`)) return;
    setUpdatingSellerId(id);
    try {
      const res = await sellerService.updateSellerStatus(id, status);
      if (res.success) {
        setSellers((prev) =>
          prev.map((seller) =>
            seller._id === res.data.id
              ? { ...seller, status: res.data.status, userId: { ...seller.userId, role: 'seller' } }
              : seller
          )
        );
        toast.success('Seller status updated');
      }
    } catch (apiError) {
      toast.error(apiError?.message || 'Failed to update seller status');
    } finally {
      setUpdatingSellerId('');
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Seller Approval & Management</h1>
          <Button variant="outline" onClick={fetchSellers} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <p className="text-sm text-gray-600">Total Sellers</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Pending Approval</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.approved}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</p>
          </Card>
        </div>

        {error && (
          <Card className="border border-red-200 bg-red-50">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-red-700">{error}</p>
              <Button variant="secondary" onClick={fetchSellers}>Retry</Button>
            </div>
          </Card>
        )}

        <Card>
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <Input
              placeholder="Search by store, email, or seller name..."
              className="max-w-xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="input-field w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <Table headers={['Store', 'Seller', 'Email', 'Status', 'Joined', 'Actions']}>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">Loading sellers...</td>
              </tr>
            ) : paginatedSellers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">No sellers found for current filters.</td>
              </tr>
            ) : (
              paginatedSellers.map((seller) => (
                <tr key={seller._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{seller.storeName || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {`${seller.userId?.firstName || ''} ${seller.userId?.lastName || ''}`.trim() || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{seller.userId?.email || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusVariant(seller.status)}>{seller.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(seller.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {seller.status !== 'approved' && (
                        <Button
                          onClick={() => handleStatus(seller._id, 'approved')}
                          variant="secondary"
                          className="text-sm bg-green-500 text-white hover:bg-green-600"
                          disabled={updatingSellerId === seller._id}
                        >
                          Approve
                        </Button>
                      )}
                      {seller.status !== 'rejected' && (
                        <Button
                          onClick={() => handleStatus(seller._id, 'rejected')}
                          variant="danger"
                          className="text-sm"
                          disabled={updatingSellerId === seller._id}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {paginatedSellers.length} of {filteredSellers.length} sellers
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="px-4 py-1.5"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                Prev
              </Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button
                variant="outline"
                className="px-4 py-1.5"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSellers;
