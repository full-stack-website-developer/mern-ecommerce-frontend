import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import FullPageLoader from '../../components/common/FullPageLoader';
import brandService from '../../services/brand.service';
import { useBrands } from '../../features/common/hooks/useBrands';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { useMemo, useState } from 'react';

const AdminBrands = () => {
  const navigate = useNavigate();
  const { brands, loading, setBrands } = useBrands();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const PER_PAGE = 10;

  async function handleBrandDelete(id) {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    
    try {
      const res = await brandService.delete(id);
      if (res.success) {
        setBrands(prevBrand => prevBrand.filter(brand => brand._id !== id));
      }
    } catch(error) {
      console.error(`Error While Fetching Products: ${error}`);
    }
  }

  const filteredBrands = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return brands;
    return (brands || []).filter((brand) => {
      const fields = [brand?.name, brand?.status].filter(Boolean).map((v) => String(v).toLowerCase());
      return fields.some((v) => v.includes(term));
    });
  }, [brands, query]);

  const totalPages = Math.max(1, Math.ceil(filteredBrands.length / PER_PAGE));
  const paginatedBrands = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredBrands.slice(start, start + PER_PAGE);
  }, [filteredBrands, page]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Brands</h1>
          <Button variant="primary" onClick={() => navigate('/admin/brands/add')}>Add Brand</Button>
        </div>
        <Card>
          {loading ? (
            <div className="py-14">
              <FullPageLoader />
            </div>
          ) : null}
          <div className="mb-4 flex items-center justify-between gap-3">
            <SearchBar
              placeholder="Search brands..."
              className="max-w-md"
              value={query}
              onChange={(e) => {
                setQuery(e?.target?.value || '');
                setPage(1);
              }}
            />
            <div className="text-sm text-gray-500">
              Showing {paginatedBrands.length} of {filteredBrands.length}
            </div>
          </div>
          <Table headers={['Image', 'Name', 'Status', 'Actions']}>
            {paginatedBrands.map((brand) => (
              <tr key={brand._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <img src={brand.logo.url} alt="" className='w-32' />
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{brand.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={brand.status === 'enabled' ? 'success' : 'danger'}>{brand.status}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <Link to={`/admin/brands/${brand._id}/edit`}>
                      <Button variant="ghost">Edit</Button>
                    </Link>
                    <Button variant="ghost" className="text-red-600" onClick={() => handleBrandDelete(brand._id)}>Delete</Button>
                </td>
              </tr>
            ))}

            {paginatedBrands.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                  No brands found.
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

export default AdminBrands;
