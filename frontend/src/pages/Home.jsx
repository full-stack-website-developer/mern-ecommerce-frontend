import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductList from '../components/product/ProductList';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const Home = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="success" className="mb-4">New Collection 2026</Badge>
              <h1 className="text-5xl font-bold mb-6">
                Shop the Latest Trends
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Discover amazing products at unbeatable prices. Free shipping on orders over $50.
              </p>
              <div className="flex space-x-4">
                <Link to="/products">
                  <Button variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                    Shop Now
                  </Button>
                </Link>
                <Link to="/flash-sales">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                    Flash Sales
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <img
                src="https://plus.unsplash.com/premium_vector-1727134126399-ee77d346d73a?q=80&w=1022&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?text=Hero+Image"
                alt="Hero"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sales */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Flash Sales</h2>
              <p className="text-gray-600">Limited time offers - Don't miss out!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">03</div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
              <div className="text-2xl">:</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">23</div>
                <div className="text-sm text-gray-600">Hours</div>
              </div>
              <div className="text-2xl">:</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">19</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
            </div>
          </div>
          <ProductList />
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Toys'].map((category) => (
              <Link
                key={category}
                to={`/categories/${category.toLowerCase()}`}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-2">📦</div>
                <div className="font-semibold">{category}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <ProductList />
        </div>
      </section>

      {/* Recommended Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Recommended for You</h2>
            <Link to="/products">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <ProductList />
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Recently Viewed</h2>
          <ProductList />
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-primary-100 mb-8">
            Get the latest updates on new products and upcoming sales
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100 rounded-l-none rounded-r-lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
