import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { useEffect, useState } from 'react';
import categoryService from '../../services/category.service';
import FullPageLoader from '../../components/common/FullPageLoader';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';

const AdminCategories = () => {
  const navigate = useNavigate();
  const [ categories, setCategories ] = useState([]);
  const [ search, setSearch ] = useState('');
  const [ typeFilter, setTypeFilter ] = useState('all');
  const [ loading, setLoading ] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      try {
        const [parentsRes, childTreeRes] = await Promise.all([
          categoryService.categories('parent'),
          categoryService.categories('child'),
        ]);

        const parentRows = (parentsRes?.data || []).map((parent) => {
          const match = (childTreeRes?.data || []).find((item) => String(item._id) === String(parent._id));
          const childCount = Array.isArray(match?.children) ? match.children.length : 0;

          return {
            _id: parent._id,
            name: parent.name,
            slug: parent.slug,
            status: parent.status,
            type: 'parent',
            parentName: 'None',
            childCount,
            productCount: 0,
          };
        });

        const childRows = (childTreeRes?.data || []).flatMap((parent) =>
          (parent.children || []).map((child) => ({
            _id: child._id,
            name: child.name,
            slug: child.slug,
            status: child.status,
            type: 'child',
            parentName: parent.name,
            childCount: 0,
            productCount: Number(child.products || 0),
          }))
        );

        setCategories([...parentRows, ...childRows]);
      } catch (error) {
        toast.error(error?.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  async function handleCategoryDelete(id) {
    if (!window.confirm("Are you sure you want to delete this Category?")) return;
    
    try {
      const res = await categoryService.delete(id);
      if (res.success) {
        setCategories(prevCategories => prevCategories.filter(category => category._id !== id));
        toast.success('Category deleted');
      }
    } catch(error) {
      toast.error(error?.message || 'Failed to delete category');
    }
  }

  const filteredCategories = categories
    .filter((category) => (typeFilter === 'all' ? true : category.type === typeFilter))
    .filter((category) => {
      const term = search.trim().toLowerCase();
      if (!term) return true;

      const fields = [
        category.name,
        category.slug,
        category.parentName,
      ].map((value) => String(value || '').toLowerCase());

      return fields.some((value) => value.includes(term));
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PER_PAGE));
  const paginatedCategories = filteredCategories.slice((page - 1) * PER_PAGE, (page - 1) * PER_PAGE + PER_PAGE);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Category Management</h1>
          <Button variant="primary" onClick={() => navigate('/admin/categories/add')}>Add Category</Button>
        </div>

        <Card>
          {loading ? (
            <div className="py-14">
              <FullPageLoader />
            </div>
          ) : null}
          <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm ${typeFilter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => { setTypeFilter('parent'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm ${typeFilter === 'parent' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => { setTypeFilter('child'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm ${typeFilter === 'child' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
              >
                Child
              </button>
            </div>
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search by name, slug, parent"
              className="input-field w-full md:w-80"
            />
          </div>

          <Table headers={['Name', 'Slug', 'Type', 'Parent', 'Linked Items', 'Status', 'Actions']}>
            {paginatedCategories.map(cat => (
              <tr key={cat._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{cat.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{cat.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant={cat.type === 'parent' ? 'primary' : 'default'} className="text-xs px-2.5 py-1">
                    {cat.type}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cat.parentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {cat.type === 'parent' ? `${cat.childCount} children` : `${cat.productCount} products`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={cat.status === 'enabled' ? 'success' : 'warning'}>{cat.status}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/admin/categories/${cat._id}/edit`}>
                    <Button variant="ghost" className="text-sm">Edit</Button>
                  </Link>
                  <Button variant="ghost" className="text-sm text-red-600" onClick={() => handleCategoryDelete(cat._id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {paginatedCategories.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                  No categories found.
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
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
