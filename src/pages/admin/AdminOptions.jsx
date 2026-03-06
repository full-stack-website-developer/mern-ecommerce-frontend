import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useEffect, useMemo, useState } from 'react';
import FullPageLoader from '../../components/common/FullPageLoader';
import optionService from '../../services/option.service';
import { formatDate } from '../../utils/date';

const AdminOptions = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState('');

  const fetchOptions = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await optionService.getAll();
      if (!res?.success) {
        setError('Failed to fetch options. Please try again.');
        setOptions([]);
        return;
      }

      const normalized = (res.data?.options || []).map((option) => {
        const values = Array.isArray(option.values) ? option.values : [];
        const enabledCount = values.filter((v) => Boolean(v.enabled)).length;
        const hasEnabledValue = enabledCount > 0;

        return {
          id: option._id,
          name: option.name || 'Untitled Option',
          valuesCount: values.length,
          enabledCount,
          disabledCount: values.length - enabledCount,
          status: hasEnabledValue ? 'Enabled' : 'Disabled',
          statusVariant: hasEnabledValue ? 'success' : 'warning',
          updatedAt: option.updatedAt,
        };
      });

      setOptions(normalized);
    } catch (apiError) {
      console.error('Error while fetching options:', apiError);
      setError(apiError?.message || 'Something went wrong while loading options.');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter((option) => {
      const matchesSearch = option.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : option.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [options, search, statusFilter]);

  async function handleOptionDelete(id) {
    if (!window.confirm('Are you sure you want to delete this option group?')) return;

    setDeletingId(id);
    try {
      const res = await optionService.delete(id);
      if (res?.success) {
        setOptions((prevOptions) => prevOptions.filter((option) => option.id !== id));
      } else {
        setError('Unable to delete option group. Please try again.');
      }
    } catch (apiError) {
      console.error('Error while deleting option:', apiError);
      setError(apiError?.message || 'Delete failed. Please try again.');
    } finally {
      setDeletingId('');
    }
  }

  if (loading) {
    return <FullPageLoader />;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Options</h1>
          <Button variant="primary" onClick={() => navigate('/admin/options/add')}>Add Option</Button>
        </div>

        <Card className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Input
                label="Search option groups"
                placeholder="Search by group name (e.g. Color, Size)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              label="Status filter"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'enabled', label: 'Enabled' },
                { value: 'disabled', label: 'Disabled' },
              ]}
            />
          </div>
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredOptions.length}</span> of{' '}
            <span className="font-medium text-gray-900">{options.length}</span> option groups.
          </div>
        </Card>

        {error && (
          <Card className="border border-red-200 bg-red-50">
            <div className="flex items-center justify-between gap-3 text-red-700">
              <p className="text-sm">{error}</p>
              <Button variant="secondary" onClick={fetchOptions}>Retry</Button>
            </div>
          </Card>
        )}

        <Card>
          <Table headers={['Option Group', 'Values', 'Status', 'Last Updated', 'Actions']}>
            {filteredOptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No option groups match your current filters.
                </td>
              </tr>
            ) : (
              filteredOptions.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{row.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {row.valuesCount} total ({row.enabledCount} enabled, {row.disabledCount} disabled)
                  </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={row.statusVariant}>{row.status}</Badge>
                </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(row.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/options/${row.id}/edit`}>
                        <Button variant="ghost" className="text-sm">Edit</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="text-sm text-red-600"
                        disabled={deletingId === row.id}
                        onClick={() => handleOptionDelete(row.id)}
                      >
                        {deletingId === row.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOptions;
