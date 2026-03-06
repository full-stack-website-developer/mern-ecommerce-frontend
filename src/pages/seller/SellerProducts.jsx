import { Link, useNavigate } from 'react-router-dom';
import SellerLayout from '../../components/layout/SellerLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { useEffect, useMemo, useState } from 'react';
import FullPageLoader from '../../components/common/FullPageLoader';
import productService from '../../services/product.service';
import toast from 'react-hot-toast';

const SellerProducts = () => {
  const navigate = useNavigate();
  const [ products, setProducts ] = useState([]);
  const [ productsLoading, setProductsLoading ] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const PER_PAGE = 12;

  useEffect(() => {
    const fetchProduct = async () => {
      setProductsLoading(true);
      
      try {
        const res = await productService.getByUserId();
        if (res.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error(`Error fetching products:`, err);
      } finally {
        setProductsLoading(false);
      }
    };
    
    fetchProduct();
  }, []);

  const handleProductDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
      const res = await productService.deleteSellerProduct(id);
      if (res.success) {
        setProducts(prev => prev.filter(product => (product._id || product.id) !== id));
        toast.success('Product deleted successfully');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to delete product');
    }
  };

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return (products || []).filter((product) => {
      const fields = [
        product?.name,
        product?.sku,
        product?.categoryId?.name,
        product?.status,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());
      return fields.some((v) => v.includes(term));
    });
  }, [products, query]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredProducts.slice(start, start + PER_PAGE);
  }, [filteredProducts, page]);
  
  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Products</h1>
          <Button variant="primary" onClick={() => navigate('/seller/products/add')}>
            Add New Product
          </Button>
        </div>

        <Card>
          {productsLoading ? (
            <div className="py-14">
              <FullPageLoader />
            </div>
          ) : null}
          <div className="mb-6 flex items-center justify-between">
            <SearchBar
              placeholder="Search products..."
              className="max-w-md"
              value={query}
              onChange={(e) => {
                setQuery(e?.target?.value || '');
                setPage(1);
              }}
            />
            <div className="flex space-x-2">
              <select className="input-field w-48">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Home</option>
              </select>
              <select className="input-field w-48">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Out of Stock</option>
              </select>
            </div>
          </div>

          <Table
            headers={['ID', 'Name', 'Category', 'Type', 'Status', 'Actions']}
          >
            {paginatedProducts.map((product, i) => (
              <tr key={product._id || product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {(page - 1) * PER_PAGE + i + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.categoryId?.name ?? '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {product.hasVariants ? 'Variants' : 'Simple'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={product.status === 'enabled' ? 'success' : 'danger'}>
                    {product.status === 'enabled' ? 'Enabled' : 'Disabled'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Link to={`/seller/products/${product._id || product.id}/edit`}>
                      <Button variant="ghost" className="text-sm">Edit</Button>
                    </Link>
                    <Button variant="ghost" className="text-sm text-red-600" onClick={() => handleProductDelete(product._id || product.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}

            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                  No products found.
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
    </SellerLayout>
  );
};

export default SellerProducts;
