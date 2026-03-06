import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductList from '../components/product/ProductList';
import Breadcrumb from '../components/common/Breadcrumb';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import productService from '../services/product.service';
import FullPageLoader from '../components/common/FullPageLoader';
import EmptyState from '../components/common/EmptyState';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const [query, setQuery] = useState(q);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 24;

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    if (query.trim()) params.set('q', query.trim());
    else params.delete('q');
    setSearchParams(params, { replace: true });
  }, [page]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await productService.getAll({
          page,
          limit: LIMIT,
          search: q || undefined,
          sort: 'newest',
        });
        if (res?.success) {
          setProducts(res.data?.products || []);
          setTotalPages(res.data?.totalPages || 1);
          setTotal(res.data?.total || 0);
        }
      } catch {
        setProducts([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, q]);

  const resultLabel = useMemo(() => {
    const term = q.trim();
    if (!term) return 'Search products';
    return `Search results for: "${term}"`;
  }, [q]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Search Results', href: '/search' },
          ]}
        />

        <div className="mb-8 mt-4">
          <SearchBar
            placeholder="Search for products..."
            className="max-w-2xl"
            value={query}
            onChange={(e) => setQuery(e?.target?.value || '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const params = new URLSearchParams(searchParams);
                const nextQ = query.trim();
                if (nextQ) params.set('q', nextQ);
                else params.delete('q');
                params.set('page', '1');
                setSearchParams(params);
                setPage(1);
              }
            }}
          />
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            {resultLabel}
            {q.trim() ? (
              <span className="ml-2 text-gray-500">({total} found)</span>
            ) : null}
          </p>
        </div>

        {loading ? (
          <FullPageLoader />
        ) : products.length === 0 ? (
          <EmptyState
            title={q.trim() ? 'No results found' : 'Type something to search'}
            description={q.trim() ? 'Try a different keyword or browse products.' : 'Search by product name, tags, or brand.'}
          />
        ) : (
          <>
            <ProductList products={products} />
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
      </div>
    </MainLayout>
  );
};

export default Search;
