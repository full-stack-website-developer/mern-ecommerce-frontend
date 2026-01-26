import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductList from '../components/product/ProductList';
import Breadcrumb from '../components/common/Breadcrumb';

const Categories = () => {
  const categories = [
    { id: 1, name: 'Electronics', count: 120, icon: '📱' },
    { id: 2, name: 'Clothing', count: 85, icon: '👕' },
    { id: 3, name: 'Home & Garden', count: 95, icon: '🏠' },
    { id: 4, name: 'Sports', count: 65, icon: '⚽' },
    { id: 5, name: 'Books', count: 150, icon: '📚' },
    { id: 6, name: 'Toys', count: 75, icon: '🧸' },
    { id: 7, name: 'Beauty', count: 110, icon: '💄' },
    { id: 8, name: 'Automotive', count: 45, icon: '🚗' },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Categories', href: '/categories' },
          ]}
        />

        <h1 className="text-3xl font-bold mb-8 mt-4">All Categories</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl mb-4">{category.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.count} products</p>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          <ProductList />
        </div>
      </div>
    </MainLayout>
  );
};

export default Categories;
