import MainLayout from '../components/layout/MainLayout';
import ProductList from '../components/product/ProductList';
import ProductFilters from '../components/product/ProductFilters';
import Breadcrumb from '../components/common/Breadcrumb';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';

const Search = () => {
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
          <SearchBar placeholder="Search for products..." className="max-w-2xl" />
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Search results for: <span className="font-semibold">"laptop"</span> (240 results found)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <ProductFilters />
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <ProductList />
            <Pagination currentPage={1} totalPages={20} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Search;
